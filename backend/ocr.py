import pytesseract

def extract_title_issue(image):
    text = pytesseract.image_to_string(image)
    print("🔵 OCR Text Detected:\n", text)

    title = "Unknown"
    issue = "Unknown"
    lines = text.splitlines()

    for line in lines:
        if "#" in line or "ISSUE" in line.upper():
            issue = line.strip()
        elif len(line.strip()) > 5:
            title = line.strip()
            break

    return title, issue
