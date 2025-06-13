import base64
import os
import sys
from io import BytesIO
import pytest

pytest.importorskip('PIL')
pytest.importorskip('cv2')

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from grader import grade_comic
from PIL import Image

def test_grade_comic_returns_grade_and_flaws():
    # create a simple white image
    img = Image.new('RGB', (50, 50), color='white')
    buf = BytesIO()
    img.save(buf, format='PNG')
    img_b64 = 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()

    grade, flaws = grade_comic(img_b64)
    assert isinstance(grade, str)
    assert isinstance(flaws, list)
