import re

def normalize_company_name(name: str) -> str:
    if not name:
        return ""
    # Trim and title case
    name = name.strip()
    return name.title()

def normalize_url(url: str) -> str:
    if not url:
        return ""
    url = url.strip().lower()
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    return url
