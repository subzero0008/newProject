from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from processors.pdf_processor import process_pdf
from processors.csv_processor import process_csv
from processors.image_processor import process_image

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {
    "pdf": "application/pdf",
    "csv": "text/csv",
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "webp": "image/webp",
}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "File Processor API is running"})


@app.route("/api/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": f"File type not supported. Allowed: {', '.join(ALLOWED_EXTENSIONS.keys())}"}), 400

    file.seek(0, 2)
    file_size = file.tell()
    file.seek(0)

    if file_size > MAX_FILE_SIZE:
        return jsonify({"error": "File too large. Max size is 10MB"}), 400

    filename = file.filename
    ext = filename.rsplit(".", 1)[1].lower()
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    try:
        if ext == "pdf":
            result = process_pdf(filepath)
        elif ext == "csv":
            result = process_csv(filepath)
        elif ext in ("png", "jpg", "jpeg", "webp"):
            result = process_image(filepath)
        else:
            return jsonify({"error": "Unsupported file type"}), 400

        os.remove(filepath)

        return jsonify({
            "success": True,
            "filename": filename,
            "file_type": ext.upper(),
            "file_size_kb": round(file_size / 1024, 2),
            "data": result,
        })

    except Exception as e:
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({"error": f"Processing failed: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
