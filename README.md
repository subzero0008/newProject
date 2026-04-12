# ⚙️ File Upload & Processing App

A full-stack application for uploading and analyzing files.  
Simulates real-world business systems (HR, accounting, data automation).

---

## 🏗️ Architecture

```
file-processor/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── processors/
│       ├── pdf_processor.py
│       ├── csv_processor.py
│       └── image_processor.py
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── App.css
    │   └── main.jsx
    ├── index.html
    └── package.json
```

---

## 🚀 Getting Started

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

Runs on http://localhost:5000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on http://localhost:3000

---

## 🔌 API

### GET /api/health
Check server status

### POST /api/upload
Upload file (PDF, CSV, Image)

---

## 🛠️ Tech Stack
- Flask
- PyPDF2
- pandas
- Pillow
- React
- Vite

---

## 💼 Why this project matters
- REST API design
- File processing in Python
- Data analysis
- Full-stack integration
