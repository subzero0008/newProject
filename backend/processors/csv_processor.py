import os


def process_csv(filepath: str) -> dict:
    """
    Analyze a CSV file using pandas.
    Returns schema, statistics, and data preview.
    """
    try:
        import pandas as pd
        import numpy as np
    except ImportError:
        raise ImportError("pandas is required. Run: pip install pandas")

    result = {
        "type": "csv",
        "processor": "pandas",
        "schema": {},
        "statistics": {},
        "preview": {},
        "insights": [],
    }

    df = pd.read_csv(filepath)

    # Schema
    schema = {}
    for col in df.columns:
        dtype = str(df[col].dtype)
        schema[col] = {
            "dtype": dtype,
            "category": _categorize_dtype(dtype),
            "null_count": int(df[col].isnull().sum()),
            "null_percent": round(df[col].isnull().mean() * 100, 1),
            "unique_count": int(df[col].nunique()),
        }
    result["schema"] = schema

    # Statistics
    result["statistics"] = {
        "total_rows": len(df),
        "total_columns": len(df.columns),
        "total_cells": len(df) * len(df.columns),
        "missing_cells": int(df.isnull().sum().sum()),
        "duplicate_rows": int(df.duplicated().sum()),
        "memory_usage_kb": round(df.memory_usage(deep=True).sum() / 1024, 2),
    }

    # Numeric summaries
    numeric_cols = df.select_dtypes(include=["number"]).columns.tolist()
    numeric_summary = {}
    for col in numeric_cols[:5]:  # Limit to first 5 numeric columns
        col_stats = df[col].describe()
        numeric_summary[col] = {
            "min": round(float(col_stats["min"]), 4),
            "max": round(float(col_stats["max"]), 4),
            "mean": round(float(col_stats["mean"]), 4),
            "std": round(float(col_stats["std"]), 4),
            "median": round(float(df[col].median()), 4),
        }
    result["numeric_summary"] = numeric_summary

    # Preview (first 5 rows)
    preview_rows = df.head(5).fillna("").to_dict(orient="records")
    result["preview"] = {
        "columns": df.columns.tolist(),
        "rows": preview_rows,
    }

    # Auto insights
    insights = []
    missing_pct = result["statistics"]["missing_cells"] / max(result["statistics"]["total_cells"], 1) * 100
    if missing_pct > 10:
        insights.append(f"High missing data rate: {round(missing_pct, 1)}% of cells are empty")
    if result["statistics"]["duplicate_rows"] > 0:
        insights.append(f"Found {result['statistics']['duplicate_rows']} duplicate rows")
    if len(numeric_cols) > 0:
        insights.append(f"Dataset has {len(numeric_cols)} numeric column(s): {', '.join(numeric_cols[:3])}")
    if result["statistics"]["total_rows"] > 10000:
        insights.append("Large dataset — consider pagination for display")
    result["insights"] = insights

    return result


def _categorize_dtype(dtype: str) -> str:
    if "int" in dtype or "float" in dtype:
        return "numeric"
    elif "datetime" in dtype:
        return "datetime"
    elif "bool" in dtype:
        return "boolean"
    else:
        return "text"
