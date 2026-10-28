import base64
import requests

IMAGE_PATH = "/Users/pushkar/Desktop/Screenshot 2026-10-28 at 7.50.25 PM.png"

with open(IMAGE_PATH, "rb") as image:
    image_base64 = base64.b64encode(image.read()).decode("utf-8")

response = requests.post(
    "http://localhost:11434/api/generate",
    json={
        "model": "llava:13b",
        "prompt": "Describe this image in two sentences.",
        "images": [image_base64],
        "stream": False,
    },
    timeout=180,
)

print("Status:", response.status_code)
print(response.text)