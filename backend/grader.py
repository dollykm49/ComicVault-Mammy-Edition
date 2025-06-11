import cv2
import numpy as np
from PIL import Image
import io
import base64

def grade_comic(base64_image):
    flaws = []
    score = 100

    # Convert base64 to image
    image_data = base64.b64decode(base64_image.split(",")[-1])
    image = Image.open(io.BytesIO(image_data)).convert("RGB")
    image_np = np.array(image)

    # Check blur (sharpness)
    gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
    laplacian = cv2.Laplacian(gray, cv2.CV_64F).var()
    if laplacian < 50:
        flaws.append("blurred cover")
        score -= 20

    # Check contrast (fading)
    contrast = gray.std()
    if contrast < 30:
        flaws.append("faded/low contrast")
        score -= 15

    # Detect edge wear (corners)
    edges = cv2.Canny(gray, 50, 150)
    edge_density = np.mean(edges)
    if edge_density < 2.5:
        flaws.append("corner wear or rounded edges")
        score -= 10

    # Determine grade
    if score >= 95:
        grade = "9.8"
    elif score >= 90:
        grade = "9.4"
    elif score >= 85:
        grade = "9.0"
    elif score >= 80:
        grade = "8.5"
    elif score >= 70:
        grade = "7.0"
    else:
        grade = "6.0"

    return grade, flaws
