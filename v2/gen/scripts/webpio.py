"""Shared helper: every image written to final/ is saved as LOSSLESS webp (no PNG kept)."""
import io
from PIL import Image


def save_webp(im, path):
    """im: PIL image or raw bytes (e.g. a PNG downloaded from ComfyUI). Writes lossless webp (alpha kept, pixel-exact)."""
    if isinstance(im, (bytes, bytearray)):
        im = Image.open(io.BytesIO(im))
    im = im.convert('RGBA' if ('A' in im.getbands() or 'transparency' in im.info) else 'RGB')
    im.save(path, 'WEBP', lossless=True, quality=100, method=4, exact=True)
