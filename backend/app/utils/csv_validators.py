import re
from datetime import datetime

COMPANY_REQUIRED_COLUMNS = ["Company Name", "Segment Name"]
CONTACT_REQUIRED_COLUMNS = ["First Name", "Last Name", "Company Name", "Email"]

def is_valid_email(email: str) -> bool:
    if not email: return False
    return bool(re.match(r"[^@]+@[^@]+\.[^@]+", email))

def is_valid_url(url: str) -> bool:
    if not url: return True # Optional
    return bool(re.match(r"https?://", url)) or bool(re.match(r"[a-z0-9]+\.[a-z]{2,}", url))

def validate_founded_year(year: any) -> bool:
    if not year: return True
    try:
        y = int(year)
        return 1800 <= y <= datetime.now().year
    except:
        return False
