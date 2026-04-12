import { useState, useRef, useCallback } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function formatBytes(kb) {
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function getExt(name) {
  return name?.split(".").pop()?.toLowerCase() || "";
}

function isImageExt(ext) {
  return ["png", "jpg", "jpeg", "webp"].includes(ext);
}

function SectionTitle({ children }) {
  return (
    <h3 className="section-title">
      <span className="section-title-dot" />
      {children}
    </h3>
  );
}

function StatGrid({ children }) {
  return <div className="stat-grid">{children}</div>;
}

function Stat({ label, value, accent }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${accent || ""}`}>{value}</div>
    </div>
  );
}

function MetaTable({ rows }) {
  return (
    <table className="meta-table">
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k}>
            <td className="meta-key">{k}</td>
            <td className="meta-val">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── PDF Result ─────────────────────────────────────────────────────────────
function PDFResult({ data }) {
  const { metadata, statistics, content } = data;
  return (
    <div className="result-sections">
      <div className="result-section">
        <SectionTitle>Document Info</SectionTitle>
        <StatGrid>
          <Stat label="Pages" value={statistics.total_pages} />
          <Stat label="Words" value={statistics.total_words.toLocaleString()} />
          <Stat label="Characters" value={statistics.total_characters.toLocaleString()} />
          <Stat label="Words / Page" value={statistics.avg_words_per_page} />
        </StatGrid>
      </div>

      {metadata.author !== "Unknown" && (
        <div className="result-section">
          <SectionTitle>Metadata</SectionTitle>
          <MetaTable rows={[
            ["Title", metadata.title],
            ["Author", metadata.author],
            ["Subject", metadata.subject],
            ["Creator", metadata.creator],
          ].filter(([, v]) => v && v !== "Unknown" && v !== "")} />
        </div>
      )}

      {content.page_previews?.length > 0 && (
        <div className="result-section">
          <SectionTitle>Content Preview</SectionTitle>
          {content.page_previews.map((p) => (
            <div key={p.page} className="page-preview">
              <div className="page-badge">Page {p.page}</div>
              <p className="preview-text">{p.preview}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CSV Result ──────────────────────────────────────────────────────────────
function CSVResult({ data }) {
  const { statistics, schema, preview, insights } = data;
  return (
    <div className="result-sections">
      <div className="result-section">
        <SectionTitle>Overview</SectionTitle>
        <StatGrid>
          <Stat label="Rows" value={statistics.total_rows.toLocaleString()} />
          <Stat label="Columns" value={statistics.total_columns} />
          <Stat label="Missing Cells" value={statistics.missing_cells} accent={statistics.missing_cells > 0 ? "warn" : "ok"} />
          <Stat label="Duplicates" value={statistics.duplicate_rows} accent={statistics.duplicate_rows > 0 ? "warn" : "ok"} />
        </StatGrid>
      </div>

      {insights?.length > 0 && (
        <div className="result-section">
          <SectionTitle>Insights</SectionTitle>
          {insights.map((ins, i) => (
            <div key={i} className="insight-item">{ins}</div>
          ))}
        </div>
      )}

      <div className="result-section">
        <SectionTitle>Column Schema</SectionTitle>
        <div className="schema-table-wrap">
          <table className="schema-table">
            <thead>
              <tr>
                <th>Column</th>
                <th>Type</th>
                <th>Unique</th>
                <th>Null %</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(schema).map(([col, info]) => (
                <tr key={col}>
                  <td className="col-name">{col}</td>
                  <td><span className={`dtype-badge ${info.category}`}>{info.category}</span></td>
                  <td style={{ fontFamily: "var(--mono)", fontSize: "12px" }}>{info.unique_count}</td>
                  <td className={info.null_percent > 10 ? "warn-text" : ""} style={{ fontFamily: "var(--mono)", fontSize: "12px" }}>{info.null_percent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {preview?.rows?.length > 0 && (
        <div className="result-section">
          <SectionTitle>Data Preview — first {preview.rows.length} rows</SectionTitle>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>{preview.columns.map((c) => <th key={c}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {preview.rows.map((row, i) => (
                  <tr key={i}>{preview.columns.map((c) => <td key={c}>{String(row[c] ?? "")}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Image Result ─────────────────────────────────────────────────────────────
function ImageResult({ data }) {
  const { metadata, dimensions, color_analysis, exif } = data;
  return (
    <div className="result-sections">
      <div className="result-section">
        <SectionTitle>Dimensions</SectionTitle>
        <StatGrid>
          <Stat label="Width" value={`${dimensions.width}px`} />
          <Stat label="Height" value={`${dimensions.height}px`} />
          <Stat label="Megapixels" value={`${dimensions.megapixels} MP`} />
          <Stat label="Orientation" value={dimensions.orientation} />
        </StatGrid>
      </div>

      <div className="result-section">
        <SectionTitle>Color Analysis</SectionTitle>
        <StatGrid>
          <Stat label="Brightness" value={color_analysis.brightness} />
          <Stat label="Quality" value={color_analysis.brightness_label} />
          <Stat label="Dominant" value={color_analysis.dominant_channel} />
          <Stat label="Color Mode" value={metadata.mode} />
        </StatGrid>

        {color_analysis.top_colors?.length > 0 && (
          <>
            <p className="swatches-label">Top Colors</p>
            <div className="swatches-row">
              {color_analysis.top_colors.map((c, i) => (
                <div key={i} className="swatch">
                  <div className="swatch-block" style={{ background: c.hex }} />
                  <span className="swatch-hex">{c.hex}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {exif && Object.keys(exif).length > 0 && !exif.note && (
        <div className="result-section">
          <SectionTitle>EXIF Data</SectionTitle>
          <MetaTable rows={Object.entries(exif).slice(0, 8)} />
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const fileInputRef = useRef();

  const processFile = useCallback(async (file) => {
    if (!file) return;
    setError(null);
    setResult(null);
    setCurrentFile(file);
    setUploading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => (p < 85 ? p + Math.random() * 15 : p));
    }, 200);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);
      setProgress(100);

      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Upload failed");

      setTimeout(() => {
        setResult(json);
        setUploading(false);
      }, 400);
    } catch (err) {
      clearInterval(interval);
      setError(err.message);
      setUploading(false);
      setProgress(0);
    }
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const renderResult = () => {
    if (!result) return null;
    const ext = getExt(result.filename);
    const isImg = isImageExt(ext);
    const iconClass = ext === "pdf" ? "pdf" : ext === "csv" ? "csv" : "image";
    const icon = ext === "pdf" ? "📄" : ext === "csv" ? "📊" : "🖼️";

    return (
      <div className="result-container">
        <div className="result-header">
          <div className={`result-file-icon ${iconClass}`}>{icon}</div>
          <div className="result-file-info">
            <h2 className="result-filename">{result.filename}</h2>
            <div className="result-meta">
              <span className={`type-badge ${result.file_type}`}>{result.file_type}</span>
              <span className="result-size">{formatBytes(result.file_size_kb)}</span>
            </div>
          </div>
          <button className="reset-btn" onClick={() => { setResult(null); setCurrentFile(null); }}>
            ↩ New File
          </button>
        </div>

        {ext === "pdf" && <PDFResult data={result.data} />}
        {ext === "csv" && <CSVResult data={result.data} />}
        {isImg && <ImageResult data={result.data} />}

        <div className="json-section">
          <details>
            <summary>View raw JSON response</summary>
            <pre className="json-pre">{JSON.stringify(result, null, 2)}</pre>
          </details>
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-mark">⚙</div>
            <span className="logo-text">FileProcessor</span>
          </div>
          <div className="header-right">
            <span className="header-tagline">Upload · Analyze · Export</span>
            <div className="header-status">
              <div className="status-dot" />
              API Online
            </div>
          </div>
        </div>
      </header>

      <main className="main">
        {!result && (
          <>
            <div className="hero">
              <div className="hero-eyebrow">
                <span className="hero-eyebrow-dot" />
                Demo Project
              </div>
              <h1 className="hero-title">
                Upload. Analyze.<br />
                <span className="gradient-text">Get Insights.</span>
              </h1>
              <p className="hero-sub">
                Drop any PDF, CSV, or image — get back structured data, statistics, and metadata instantly.
              </p>
            </div>

            <div className="drop-zone-wrap">
              <div
                className={`drop-zone ${dragOver ? "drag-over" : ""} ${uploading ? "uploading" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => !uploading && fileInputRef.current.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.csv,.png,.jpg,.jpeg,.webp"
                  style={{ display: "none" }}
                  onChange={(e) => processFile(e.target.files[0])}
                />

                {uploading ? (
                  <div className="upload-state">
                    <div className="upload-spinner" />
                    <p className="upload-filename">Processing <strong>{currentFile?.name}</strong></p>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="progress-pct">{Math.round(progress)}%</span>
                  </div>
                ) : (
                  <div className="drop-state">
                    <div className="drop-icon-wrap">
                      <svg className="drop-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </div>
                    <p className="drop-heading">
                      Drop your file here or <span>browse</span>
                    </p>
                    <p className="drop-sub">Maximum file size: 10 MB</p>
                    <div className="file-pills">
                      <span className="file-pill pdf">PDF</span>
                      <span className="file-pill csv">CSV</span>
                      <span className="file-pill img">PNG</span>
                      <span className="file-pill img">JPG</span>
                      <span className="file-pill img">WebP</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="error-box">
                <span>⚠</span> {error}
              </div>
            )}

            <div className="features-row">
              {[
                { icon: "📄", title: "PDF Analysis", desc: "Extract metadata, word count, page previews and document structure", cls: "pdf" },
                { icon: "📊", title: "CSV Processing", desc: "Schema detection, statistics, duplicate rows, and data previews", cls: "csv" },
                { icon: "🖼️", title: "Image Inspection", desc: "Dimensions, color palette, dominant tones and EXIF metadata", cls: "img" },
              ].map((f) => (
                <div key={f.title} className="feature-card">
                  <div className="feature-icon-wrap">{f.icon}</div>
                  <strong className="feature-title">{f.title}</strong>
                  <p className="feature-desc">{f.desc}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {renderResult()}
      </main>

      <footer className="footer">
        <span>All rights are reserved © 2026 Yulian Yuriev</span>
      </footer>
    </div>
  );
}
