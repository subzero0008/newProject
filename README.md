# ⚙️ File Upload & Processing App

Проект за CV — Full-stack приложение за качване и анализ на файлове.  
Симулира реални бизнес системи (HR, счетоводство, data automation).

---

## 🏗️ Архитектура

```
file-processor/
├── backend/                  # Python Flask API
│   ├── app.py                # Главен сървър, routing
│   ├── requirements.txt      # Python зависимости
│   └── processors/
│       ├── pdf_processor.py  # PyPDF2 — метаданни + текст
│       ├── csv_processor.py  # pandas — статистики + схема
│       └── image_processor.py# Pillow — цветове + EXIF
│
└── frontend/                 # React + Vite
    ├── src/
    │   ├── App.jsx           # Главен компонент
    │   ├── App.css           # Стилове
    │   └── main.jsx          # Entry point
    ├── index.html
    └── package.json
```

---

## 🚀 Стартиране

### Backend (Flask)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Сървърът стартира на **http://localhost:5000**

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Приложението е достъпно на **http://localhost:3000**

---

## 🔌 API Endpoints

### `GET /api/health`
Проверка дали сървърът работи.

```json
{ "status": "ok", "message": "File Processor API is running" }
```

### `POST /api/upload`
Качване и обработка на файл.

**Request:** `multipart/form-data` с поле `file`

**Response — PDF:**
```json
{
  "success": true,
  "filename": "document.pdf",
  "file_type": "PDF",
  "file_size_kb": 142.3,
  "data": {
    "type": "pdf",
    "metadata": { "title": "...", "author": "...", "creation_date": "..." },
    "statistics": {
      "total_pages": 12,
      "total_words": 3420,
      "avg_words_per_page": 285.0
    },
    "content": {
      "page_previews": [
        { "page": 1, "preview": "Текст от първата страница..." }
      ]
    }
  }
}
```

**Response — CSV:**
```json
{
  "data": {
    "type": "csv",
    "statistics": { "total_rows": 5000, "total_columns": 8, "duplicate_rows": 12 },
    "schema": {
      "age": { "dtype": "int64", "category": "numeric", "null_percent": 0 }
    },
    "preview": { "columns": ["name", "age"], "rows": [...] },
    "insights": ["Found 12 duplicate rows", "Dataset has 3 numeric columns"]
  }
}
```

**Response — Image:**
```json
{
  "data": {
    "type": "image",
    "dimensions": { "width": 1920, "height": 1080, "megapixels": 2.07, "orientation": "landscape" },
    "color_analysis": {
      "brightness": 145,
      "dominant_channel": "Blue",
      "top_colors": [{ "hex": "#2a5f8b", "rgb": { "r": 42, "g": 95, "b": 139 } }]
    }
  }
}
```

---

## 🛠️ Технологии

| Слой | Технология | Цел |
|------|-----------|-----|
| Backend | **Flask** | REST API сървър |
| Backend | **PyPDF2** | Четене на PDF |
| Backend | **pandas** | Анализ на CSV |
| Backend | **Pillow** | Обработка на изображения |
| Frontend | **React 18** | UI компоненти |
| Frontend | **Vite** | Build tool / dev server |
| Dev | **flask-cors** | Cross-origin заявки |

---

## 💼 Защо е подходящо за CV

- ✅ **REST API дизайн** — реален endpoint с validation и error handling
- ✅ **File I/O в Python** — четене на бинарни формати
- ✅ **Data engineering** — pandas, статистически анализ
- ✅ **React state management** — drag & drop, async upload, прогрес бар
- ✅ **Full-stack интеграция** — frontend ↔ backend комуникация
- ✅ **Business context** — симулира HR/счетоводни системи

---

## 🔮 Идеи за разширение

- [ ] **LLM интеграция** — изпрати текста на Claude API за обобщение
- [ ] **База данни** — запази резултатите в SQLite / PostgreSQL  
- [ ] **Batch upload** — качване на множество файлове наведнъж
- [ ] **Export** — изтегли резултата като JSON/Excel
- [ ] **Auth** — потребителски акаунти с история на качените файлове
- [ ] **Docker** — контейнеризация за лесен deploy
- [ ] **Heroku / Railway deploy** — публичен URL за портфолио

---

## 📝 Бързо тестване на API с curl

```bash
# Health check
curl http://localhost:5000/api/health

# Качване на PDF
curl -X POST http://localhost:5000/api/upload \
  -F "file=@/path/to/document.pdf"

# Качване на CSV
curl -X POST http://localhost:5000/api/upload \
  -F "file=@/path/to/data.csv"
```
