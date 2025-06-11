import requests
from bs4 import BeautifulSoup
import re

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}

def clean_price(text):
    try:
        return float(text.replace("$", "").replace(",", "").strip())
    except:
        return None


def get_mcs_price(title, issue, grade):
    url = f"https://www.mycomicshop.com/search?TID=&TTP=1&IVGroup=1&til={title.replace(' ', '+')}&IID={issue}"
    r = requests.get(url, headers=HEADERS)
    soup = BeautifulSoup(r.text, "html.parser")

    prices = []
    for row in soup.select("tr"):
        row_text = row.get_text().lower()
        if grade.lower() in row_text:
            match = re.search(r"\$\d{1,5}\.\d{2}", row_text)
            if match:
                price = clean_price(match.group())
                if price:
                    prices.append(price)

    return max(prices) if prices else 0


def get_comicconnect_price(title, issue, grade):
    query = f"{title} {issue} {grade}".replace(" ", "+")
    url = f"https://www.comicconnect.com/search?searchType=Title&searchText={query}"

    try:
        r = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(r.text, "html.parser")
    except:
        return 0

    prices = []
    for item in soup.select(".listing-item-info"):
        text = item.get_text().lower()
        if grade.lower() in text and issue in text:
            match = re.search(r"\$\d{2,5}\.\d{2}", text)
            if match:
                price = clean_price(match.group())
                if price:
                    prices.append(price)

    return max(prices) if prices else 0


def get_heritage_price(title, issue, grade):
    query = f"{title} {issue} {grade}".replace(" ", "+")
    url = f"https://comics.ha.com/c/search-results.zx?N=793+794+791+1893&Ntt={query}"

    try:
        r = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(r.text, "html.parser")
    except:
        return 0

    prices = []
    for item in soup.select(".currency-section"):
        text = item.get_text()
        match = re.search(r"\$\d{2,5}\.\d{2}", text)
        if match:
            price = clean_price(match.group())
            if price:
                prices.append(price)

    return max(prices) if prices else 0


def get_market_prices(title, issue, grade):
    results = {
        "MyComicShop": get_mcs_price(title, issue, grade),
        "ComicConnect": get_comicconnect_price(title, issue, grade),
        "Heritage": get_heritage_price(title, issue, grade)
    }

    prices = [p for p in results.values() if p > 0]

    return {
        "grade": grade,
        "highest": max(prices) if prices else 0,
        "sources": results
    }
