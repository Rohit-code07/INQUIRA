from langchain.tools import tool
import requests
from bs4 import BeautifulSoup
from tavily import TavilyClient
from dotenv import load_dotenv
import os
from rich import print
load_dotenv()

tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

@tool
def web_search(query:str) -> str:
	"""Search the web from the recent and realiable information on a topic.Returns URL,title, relevent information."""
	out = []
	result = tavily.search(query=query, max_results=5)
	for r in result['results']:
		out.append(
			f"Title:{r['title']}\n URL:{r['url']}\n Snippet: {r['content']}\n"
		)
	return "\n------\n".join(out)

@tool
def web_scraper(url:str) -> str:
    """Scrape the web page and return the text content."""
    try:
        response = requests.get(url,timeout=8, headers={'User-Agent': 'Mozilla/5.0'})
        soup = BeautifulSoup(response.content, 'html.parser')     
        for script in soup([ "script","style","noscript","nav","header", "footer", "aside", "form","iframe", "svg"]):
            script.decompose()  # Remove JavaScript and CSS
        text = soup.get_text(separator='\n', strip=True)[:3000]
        return text
    except Exception as e:
        return f"Error scraping the web page: {e}"  
