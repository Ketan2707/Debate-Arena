# pyrefly: ignore [missing-import]
import httpx
import re
from urllib.parse import urlparse
# pyrefly: ignore [missing-import]
from duckduckgo_search import DDGS
from backend.config import settings, get_domain_tier

def clean_claim_for_query(claim: str) -> str:
    """
    Cleans the claim text to make it suitable for search engines,
    removing punctuation that could break syntax.
    """
    clean = re.sub(r'[\'\"()\[\]\-+:]', ' ', claim)
    return " ".join(clean.split())

def google_search(query: str, max_results: int = 5) -> list[dict]:
    """
    Searches using the Google Custom Search JSON API.
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
        response = httpx.get(url, params=params, timeout=5.0)
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

def ddg_search(query: str, max_results: int = 5) -> list[dict]:
    """
    Searches using the duckduckgo-search package.
    """
    try:
        with DDGS(timeout=10) as ddgs:
            ddg_results = list(ddgs.text(query, max_results=max_results))
            results = []
            for item in ddg_results:
                results.append({
                    "url": item.get("href"),
                    "title": item.get("title"),
                    "snippet": item.get("body")
                })
            if not results:
                return ddg_search_fallback(query, max_results)
            return results
    except Exception as e:
        print(f"DuckDuckGo Search error: {e}")
        # As a extreme fallback, try a direct HTTP call if package has issues
        return ddg_search_fallback(query, max_results)

def ddg_search_fallback(query: str, max_results: int = 5) -> list[dict]:
    """
    Fallback HTTP request to DDG HTML search if the main library fails.
    """
    url = "https://html.duckduckgo.com/html/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    data = {"q": query}
    try:
        response = httpx.post(url, data=data, headers=headers, timeout=10.0)
        if response.status_code == 200:
            from xml.etree import ElementTree
            # We can parse the HTML results using simple regex since it is simple HTML
            # duckduckgo html returns class 'result__snippet' and 'result__url'
            # Let's use simple pattern matching to extract results safely.
            html = response.text
            matches = re.findall(
                r'<a class="result__snippet"[^>]*href="([^"]+)"[^>]*>(.*?)</a>', 
                html, 
                re.DOTALL
            )
            # Find URLs, titles, and snippets
            # Actually, regex parsing HTML can be brittle, let's write a simple fallback regex:
            results = []
            # We look for result blocks: <td class="result-snippet">...</td>
            # and URLs: <a class="result__url" href="...">
            # Let's extract with a simple regex for links and snippets
            links = re.findall(r'<a class="result__url" href="([^"]+)"', html)
            snippets = re.findall(r'<a class="result__snippet"[^>]*>(.*?)</a>', html, re.DOTALL)
            titles = re.findall(r'<a[^>]*class="result__a"[^>]*>(.*?)</a>', html, re.DOTALL)
            if not titles:
                titles = re.findall(r'<a class="result__link"[^>]*>(.*?)</a>', html, re.DOTALL)
            
            for i in range(min(len(links), len(snippets), len(titles), max_results)):
                # Clean html tags from snippet/title
                clean_title = re.sub(r'<[^>]*>', '', titles[i]).strip()
                clean_snippet = re.sub(r'<[^>]*>', '', snippets[i]).strip()
                # DDG internal redirects can be cleaned
                url_match = re.search(r'uddg=([^&]+)', links[i])
                url = links[i]
                if url_match:
                    import urllib.parse
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

def generate_search_query(claim_text: str) -> str:
    """
    Uses Groq LLM to extract core keywords and entities from a claim text 
    to optimize the search query.
    """
    if not settings.GROQ_API_KEY:
        # Programmatic keyword extraction fallback for mock mode
        # Remove common stopwords and keep years, percentages, nouns, numbers
        words = claim_text.split()
        stopwords = {
            "in", "the", "and", "a", "of", "to", "by", "than", "standard", 
            "their", "for", "with", "would", "is", "are", "was", "were", 
            "be", "been", "have", "has", "had", "more", "fewer", "about",
            "from", "on", "as", "at", "but", "or", "an", "that", "which"
        }
        keywords = []
        for word in words:
            # Strip punctuation except percentages
            clean_word = re.sub(r'[^\w%]', '', word)
            if clean_word and clean_word.lower() not in stopwords:
                keywords.append(clean_word)
        return " ".join(keywords)
        
    prompt = f"""
    You are a search query optimizer.
    Convert this factual claim sentence into a concise keyword search query for Google/DuckDuckGo.
    Focus on key terms, numbers, dates, and names. Exclude conversational words, assertions, or descriptors.
    
    Factual Claim: "{claim_text}"
    
    Output ONLY the search query keywords. Do not include quotes, reasoning, or formatting.
    """
    try:
        from backend.agents import generate_content_with_retry
        response_text = generate_content_with_retry("llama-3.1-8b-instant", prompt, temperature=0.1)
        query = response_text.strip().strip('"').strip("'")
        return query if query else claim_text
    except Exception as e:
        print(f"Failed to optimize search query: {e}")
        return claim_text

def google_rss_search(query: str, max_results: int = 5) -> list[dict]:
    """
    Searches Google News RSS for a given query and returns a list of results.
    """
    import xml.etree.ElementTree as ET
    import urllib.parse
    
    url = f"https://news.google.com/rss/search?q={urllib.parse.quote(query)}&hl=en-US&gl=US&ceid=US:en"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    try:
        response = httpx.get(url, headers=headers, timeout=5.0)
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

def search_whitelist(claim_text: str, max_results: int = 5) -> list[dict]:
    """
    Searches ONLY within the whitelisted domains.
    Returns a list of search result dicts with URL, Title, Snippet, and Tier.
    """
    # 1. Optimize query using LLM keyword extraction
    search_query = generate_search_query(claim_text)
    
    # Clean the query
    cleaned_query = clean_claim_for_query(search_query)
    if not cleaned_query:
        return []
    
    # Collect whitelist domains
    whitelist = settings.TIER_1_DOMAINS + settings.TIER_2_DOMAINS + settings.TIER_3_DOMAINS
    
    # Try Google Search first if configured
    results = []
    if settings.GOOGLE_SEARCH_API_KEY and settings.GOOGLE_SEARCH_CX:
        # Google search handles site: OR logic extremely well
        query_domains = ["gov", "edu", "org"]
        for domain in whitelist:
            if domain.endswith(".gov") or domain.endswith(".edu") or domain.endswith(".org") or domain in ["gov", "edu", "org"]:
                continue
            if ".gov." in domain or ".edu." in domain or ".org." in domain:
                continue
            query_domains.append(domain)
            
        site_query = " OR ".join([f"site:{domain}" for domain in query_domains])
        query = f"{cleaned_query} ({site_query})"
        results = google_search(query, max_results)
    
    # Fallback to Google News RSS + DuckDuckGo Search (which fails/blocks on complex site: OR operators)
    if not results:
        from concurrent.futures import ThreadPoolExecutor
        with ThreadPoolExecutor(max_workers=2) as executor:
            future_rss = executor.submit(google_rss_search, cleaned_query, 10)
            future_ddg = executor.submit(ddg_search, cleaned_query, 15)
            rss_results = future_rss.result()
            general_results = future_ddg.result()
        
        # Combine results
        combined_results = rss_results + general_results
        
        results = []
        seen_urls = set()
        for res in combined_results:
            url = res["url"]
            if url in seen_urls:
                continue
            seen_urls.add(url)
            
            tier = get_domain_tier(url)
            if tier is not None:
                results.append(res)
                if len(results) >= max_results:
                    break
        
    # Filter and tier the results based on their parsed domain
    tiered_results = []
    for result in results:
        tier = get_domain_tier(result["url"])
        if tier is not None:
            tiered_results.append({
                "url": result["url"],
                "title": result["title"],
                "snippet": result["snippet"],
                "tier": tier
            })
            
    return tiered_results
