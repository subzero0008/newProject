import os
from datetime import datetime


def process_pdf(filepath: str) -> dict:
    """
    Extract metadata and text from a PDF file.
    Returns structured information about the document.
    """
    try:
        import PyPDF2
    except ImportError:
        raise ImportError("PyPDF2 is required. Run: pip install PyPDF2")

    result = {
        "type": "pdf",
        "processor": "PyPDF2",
        "metadata": {},
        "content": {},
        "statistics": {},
    }

    with open(filepath, "rb") as f:
        reader = PyPDF2.PdfReader(f)

        # Metadata
        info = reader.metadata or {}
        result["metadata"] = {
            "title": str(info.get("/Title", "Unknown")),
            "author": str(info.get("/Author", "Unknown")),
            "subject": str(info.get("/Subject", "")),
            "creator": str(info.get("/Creator", "")),
            "producer": str(info.get("/Producer", "")),
            "creation_date": str(info.get("/CreationDate", "")),
        }

        # Page count and text extraction
        num_pages = len(reader.pages)
        all_text = []
        page_previews = []

        for i, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            all_text.append(text)
            if i < 3:  # Preview first 3 pages
                preview = text[:300].strip()
                if preview:
                    page_previews.append({
                        "page": i + 1,
                        "preview": preview + ("..." if len(text) > 300 else ""),
                    })

        full_text = "\n".join(all_text)
        words = full_text.split()
        sentences = [s.strip() for s in full_text.replace("!", ".").replace("?", ".").split(".") if s.strip()]

        result["content"] = {
            "page_previews": page_previews,
            "full_text_snippet": full_text[:500].strip() + ("..." if len(full_text) > 500 else ""),
        }

        result["statistics"] = {
            "total_pages": num_pages,
            "total_words": len(words),
            "total_characters": len(full_text),
            "total_sentences": len(sentences),
            "avg_words_per_page": round(len(words) / max(num_pages, 1), 1),
            "has_text": len(full_text.strip()) > 0,
        }

    return result
