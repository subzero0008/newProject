import os


def process_image(filepath: str) -> dict:
    """
    Analyze an image file using Pillow.
    Returns metadata, color analysis, and statistics.
    """
    try:
        from PIL import Image, ImageStat, ExifTags
    except ImportError:
        raise ImportError("Pillow is required. Run: pip install Pillow")

    result = {
        "type": "image",
        "processor": "Pillow",
        "metadata": {},
        "dimensions": {},
        "color_analysis": {},
        "exif": {},
    }

    with Image.open(filepath) as img:
        # Basic metadata
        result["metadata"] = {
            "format": img.format or "Unknown",
            "mode": img.mode,
            "mode_description": _describe_mode(img.mode),
        }

        # Dimensions
        width, height = img.size
        result["dimensions"] = {
            "width": width,
            "height": height,
            "megapixels": round((width * height) / 1_000_000, 2),
            "aspect_ratio": _calc_aspect_ratio(width, height),
            "orientation": "landscape" if width > height else ("portrait" if height > width else "square"),
        }

        # Color analysis
        rgb_img = img.convert("RGB")
        stat = ImageStat.Stat(rgb_img)

        result["color_analysis"] = {
            "mean_rgb": {
                "r": round(stat.mean[0]),
                "g": round(stat.mean[1]),
                "b": round(stat.mean[2]),
            },
            "dominant_channel": _dominant_channel(stat.mean),
            "brightness": round(sum(stat.mean) / 3),
            "brightness_label": _brightness_label(sum(stat.mean) / 3),
            "contrast_std": round(sum(stat.stddev) / 3, 1),
        }

        # Top colors (using quantize)
        try:
            quantized = rgb_img.resize((100, 100)).quantize(colors=5)
            palette = quantized.getpalette()
            top_colors = []
            if palette:
                for i in range(5):
                    r, g, b = palette[i*3], palette[i*3+1], palette[i*3+2]
                    hex_color = "#{:02x}{:02x}{:02x}".format(r, g, b)
                    top_colors.append({"hex": hex_color, "rgb": {"r": r, "g": g, "b": b}})
            result["color_analysis"]["top_colors"] = top_colors
        except Exception:
            result["color_analysis"]["top_colors"] = []

        # EXIF data
        try:
            exif_data = img._getexif()
            if exif_data:
                readable_exif = {}
                for tag_id, value in exif_data.items():
                    tag = ExifTags.TAGS.get(tag_id, str(tag_id))
                    if isinstance(value, (str, int, float)):
                        readable_exif[tag] = str(value)
                result["exif"] = {k: v for k, v in list(readable_exif.items())[:10]}
            else:
                result["exif"] = {"note": "No EXIF data found"}
        except Exception:
            result["exif"] = {"note": "Could not read EXIF data"}

    return result


def _describe_mode(mode: str) -> str:
    modes = {
        "RGB": "True color (Red, Green, Blue)",
        "RGBA": "True color with transparency",
        "L": "Grayscale",
        "CMYK": "Print color (Cyan, Magenta, Yellow, Black)",
        "P": "Palette / indexed color",
        "1": "Black and white (1-bit)",
    }
    return modes.get(mode, mode)


def _dominant_channel(means: list) -> str:
    channels = ["Red", "Green", "Blue"]
    return channels[means.index(max(means))]


def _brightness_label(brightness: float) -> str:
    if brightness < 64:
        return "Very dark"
    elif brightness < 128:
        return "Dark"
    elif brightness < 192:
        return "Bright"
    else:
        return "Very bright"


def _calc_aspect_ratio(w: int, h: int) -> str:
    from math import gcd
    divisor = gcd(w, h)
    return f"{w // divisor}:{h // divisor}"
