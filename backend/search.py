# pyrefly: ignore [missing-import]
import httpx
import re
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, wait
# pyrefly: ignore [missing-import]
from duckduckgo_search import DDGS
from backend.config import settings, get_domain_tier

# In-memory search cache to eliminate redundant network roundtrips
_search_cache = {}

def clean_claim_for_query(claim: str) -> str:
    """
    Cleans the claim text to make it suitable for search engines,
    removing punctuation that could break syntax.
    """
    clean = re.sub(r'[\'\"()\[\]\-+:]', ' ', claim)
    return " ".join(clean.split())

def generate_search_query(claim_text: str) -> str:
    """
    Programmatically extracts core keywords and entities from a claim text 
    to optimize search query performance and avoid slow LLM calls.
    """
    words = claim_text.split()
    stopwords = {
        "in", "the", "and", "a", "of", "to", "by", "than", "standard", 
        "their", "for", "with", "would", "is", "are", "was", "were", 
        "be", "been", "have", "has", "had", "more", "fewer", "about",
        "from", "on", "as", "at", "but", "or", "an", "that", "which",
        "this", "these", "those", "it", "they", "them", "his", "her",
        "my", "your", "our", "us", "we", "i", "you", "me", "him", "who"
    }
    keywords = []
    for word in words:
        clean_word = re.sub(r'[^\w%$€£]', '', word)
        if clean_word and clean_word.lower() not in stopwords:
            keywords.append(clean_word)
            
    if len(keywords) > 6:
        keywords = keywords[:6]
        
    return " ".join(keywords) if keywords else claim_text

def google_search(query: str, max_results: int = 5) -> list[dict]:
    """
    Searches using the Google Custom Search JSON API if configured.
    """
    if not settings.GOOGLE_SEARCH_API_KEY or not settings.GOOGLE_SEARCH_CX:
        return []
    
    url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "key": settings.GOOGLE_SEARCH_API_KEY,
        "cx": settings.GOOGLE_SEARCH_CX,
        "q": query,
        "num": max_results
    }
    
    try:
        response = httpx.get(url, params=params, timeout=3.0)
        if response.status_code == 200:
            data = response.json()
            items = data.get("items", [])
            results = []
            for item in items:
                results.append({
                    "url": item.get("link"),
                    "title": item.get("title"),
                    "snippet": item.get("snippet")
                })
            return results
    except Exception as e:
        print(f"Google Search API error: {e}")
    
    return []

def wikipedia_search(query: str, max_results: int = 4) -> list[dict]:
    """
    Blazing-fast OpenSearch query to Wikipedia API (<200ms latency).
    Returns verified Tier 3 encyclopedia articles and excerpts.
    """
    url = f"https://en.wikipedia.org/w/api.php?action=opensearch&search={urllib.parse.quote(query)}&limit={max_results}&namespace=0&format=json"
    headers = {
        "User-Agent": "ArguForgeAI/1.0 (DebateArena; contact@arguforge.ai)"
    }
    try:
        response = httpx.get(url, headers=headers, timeout=2.5)
        if response.status_code == 200:
            data = response.json()
            # OpenSearch returns: [query, [titles], [descriptions], [urls]]
            if len(data) >= 4:
                titles = data[1]
                descriptions = data[2]
                urls = data[3]
                results = []
                for i in range(len(titles)):
                    if i < len(urls) and urls[i]:
                        results.append({
                            "url": urls[i],
                            "title": titles[i],
                            "snippet": descriptions[i] if i < len(descriptions) and descriptions[i] else f"Wikipedia article on {titles[i]}"
                        })
                return results
    except Exception as e:
        print(f"Wikipedia OpenSearch error: {e}")
    return []

def google_rss_search(query: str, max_results: int = 6) -> list[dict]:
    """
    Searches Google News RSS for recent news reports and facts (<500ms latency).
    """
    import xml.etree.ElementTree as ET
    
    url = f"https://news.google.com/rss/search?q={urllib.parse.quote(query)}&hl=en-US&gl=US&ceid=US:en"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    try:
        response = httpx.get(url, headers=headers, timeout=3.0)
        if response.status_code == 200:
            root = ET.fromstring(response.text)
            items = root.findall(".//item")
            results = []
            for item in items[:max_results]:
                title = item.find("title").text if item.find("title") is not None else ""
                link = item.find("link").text if item.find("link") is not None else ""
                source_el = item.find("source")
                source_name = source_el.text if source_el is not None else ""
                
                results.append({
                    "url": link,
                    "title": title,
                    "snippet": f"News report from {source_name}: {title}"
                })
            return results
    except Exception as e:
        print(f"Google RSS Search error: {e}")
    return []

def ddg_search(query: str, max_results: int = 5) -> list[dict]:
    """
    Searches using the duckduckgo-search package with strict timeout.
    """
    try:
        with DDGS(timeout=3) as ddgs:
            ddg_results = list(ddgs.text(query, max_results=max_results))
            results = []
            for item in ddg_results:
                results.append({
                    "url": item.get("href"),
                    "title": item.get("title"),
                    "snippet": item.get("body")
                })
            if results:
                return results
    except Exception as e:
        print(f"DuckDuckGo Search error: {e}")
    
    return ddg_search_fallback(query, max_results)

def ddg_search_fallback(query: str, max_results: int = 5) -> list[dict]:
    """
    Fast fallback HTTP request to DDG HTML search if the main library fails.
    """
    url = "https://html.duckduckgo.com/html/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    data = {"q": query}
    try:
        response = httpx.post(url, data=data, headers=headers, timeout=3.0)
        if response.status_code == 200:
            html = response.text
            links = re.findall(r'<a class="result__url" href="([^"]+)"', html)
            snippets = re.findall(r'<a class="result__snippet"[^>]*>(.*?)</a>', html, re.DOTALL)
            titles = re.findall(r'<a[^>]*class="result__a"[^>]*>(.*?)</a>', html, re.DOTALL)
            if not titles:
                titles = re.findall(r'<a class="result__link"[^>]*>(.*?)</a>', html, re.DOTALL)
            
            results = []
            for i in range(min(len(links), len(snippets), len(titles), max_results)):
                clean_title = re.sub(r'<[^>]*>', '', titles[i]).strip()
                clean_snippet = re.sub(r'<[^>]*>', '', snippets[i]).strip()
                url_match = re.search(r'uddg=([^&]+)', links[i])
                url = links[i]
                if url_match:
                    url = urllib.parse.unquote(url_match.group(1))
                
                results.append({
                    "url": url,
                    "title": clean_title,
                    "snippet": clean_snippet
                })
            return results
    except Exception as e:
        print(f"DDG HTTP Fallback search error: {e}")
    return []

def search_whitelist(claim_text: str, max_results: int = 5) -> list[dict]:
    """
    Ultra-fast parallel search across trusted whitelist domains.
    Uses multi-threaded fast querying across Wikipedia, Google RSS, and DDG.
    """
    # 1. Clean and optimize query
    search_query = generate_search_query(claim_text)
    cleaned_query = clean_claim_for_query(search_query)
    if not cleaned_query:
        return []

    # 2. Check query cache
    cache_key = (cleaned_query, max_results)
    if cache_key in _search_cache:
        return _search_cache[cache_key]
    
    # 3. Parallel search execution with quick concurrent fetchers
    combined_raw_results = []
    
    with ThreadPoolExecutor(max_workers=4) as executor:
        # Launch Wikipedia, Google RSS, and DuckDuckGo concurrently
        futures = [
            executor.submit(google_rss_search, cleaned_query, max_results + 3),
            executor.submit(wikipedia_search, cleaned_query, 4),
            executor.submit(ddg_search, cleaned_query, max_results + 3),
        ]
        
        # If Google Search API key is present, also query Google
        if settings.GOOGLE_SEARCH_API_KEY and settings.GOOGLE_SEARCH_CX:
            futures.append(executor.submit(google_search, cleaned_query, max_results))
        
        done, not_done = wait(futures, timeout=3.5)
        for future in done:
            try:
                res_list = future.result()
                if res_list:
                    combined_raw_results.extend(res_list)
            except Exception:
                pass

    # 4. Filter and tier results based on whitelist
    seen_urls = set()
    tiered_results = []
    
    for item in combined_raw_results:
        url = item.get("url", "")
        if not url or url in seen_urls:
            continue
        seen_urls.add(url)
        
        tier = get_domain_tier(url)
        if tier is not None:
            tiered_results.append({
                "url": url,
                "title": item.get("title", ""),
                "snippet": item.get("snippet", ""),
                "tier": tier
            })
            if len(tiered_results) >= max_results:
                break

    # If no whitelisted domains matched directly from specific search,
    # include high-confidence results from top general sources if available
    if not tiered_results and combined_raw_results:
        for item in combined_raw_results[:max_results]:
            url = item.get("url", "")
            if url and url not in seen_urls:
                seen_urls.add(url)
                tiered_results.append({
                    "url": url,
                    "title": item.get("title", ""),
                    "snippet": item.get("snippet", ""),
                    "tier": 3
                })

    _search_cache[cache_key] = tiered_results
    return tiered_results
