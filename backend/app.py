from flask import Flask, request, jsonify
from grader_engine import grade_comic
from scraper import get_market_prices
from ocr import extract_title_issue
from PIL import Image
import pytesseract
import base64
import io

# Tell pytesseract where the Tesseract-OCR engine is installed (Windows)
pytesseract.pytesseract.tesseract_cmd =  "Program Files\Tesseract-OCR\tesseract.exe"

app = Flask(__name__)

@app.route("/", methods=['POST'])
   
@app.route("/api/grade", methods=["POST"])
def grade():
    data = request.json
    image_data = data.get("image")

    # Convert base64 image to a PIL Image
    image = Image.open(io.BytesIO(base64.b64decode(image_data.split(",")[-1])))

    # Run OCR
     # Simple title/issue parser from OCR output
    title, issue = extract_title_issue(image)

        

    # Grade the comic and estimate price
    grade_result, flaws = grade_comic(image_data)
    pricing = get_market_prices(title, issue, grade_result)

    return jsonify({
        "title": title,
        "issue": issue,
        "grade": grade_result,
        "flaws": flaws,
        "pricing": pricing
    })

if __name__ == "__main__":
    app.run(debug=True)
