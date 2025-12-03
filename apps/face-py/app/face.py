from __future__ import annotations

import base64
import io
import time
from typing import List, Optional, Tuple

import cv2
import numpy as np
from PIL import Image

_fa = None  # lazy-loaded global FaceAnalysis
_model_name = None  # track which model is loaded


def load_models(model: str) -> None:
    """
    Load face analysis models. Unloads any previously loaded model.

    Args:
        model: Model pack to use. Options:
            - "buffalo_l" (large, ~1.5GB, more accurate)
            - "buffalo_s" (small, ~500MB, faster)
    """
    global _fa, _model_name
    # If already loaded with the same model, skip
    if _fa is not None and _model_name == model:
        return

    # Unload existing model if switching
    if _fa is not None:
        _fa = None
        _model_name = None

    # Load new model
    from insightface.app import FaceAnalysis

    fa = FaceAnalysis(name=model)
    # ctx_id = 0 means CPU on onnxruntime; set to -1 for pure CPU in some envs
    fa.prepare(ctx_id=0, det_size=(640, 640))
    _fa = fa
    _model_name = model


def get_model_info() -> dict:
    """Return current model loading status and model name."""
    return {
        "loaded": _fa is not None,
        "model": _model_name,
    }


def _to_bgr(image_b64: str) -> np.ndarray:
    raw = base64.b64decode(image_b64)
    img = Image.open(io.BytesIO(raw)).convert("RGB")
    arr = np.array(img)  # RGB
    bgr = cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)
    return bgr


def embed(image_b64: str) -> Tuple[Optional[np.ndarray], dict]:
    """
    Returns (embedding, meta). If no face found, embedding is None.
    Picks the largest detected face if multiple present.

    Args:
        image_b64: Base64-encoded image

    Raises:
        RuntimeError: If no model is loaded
    """
    if _fa is None:
        raise RuntimeError("No model loaded. Call load_models() first.")
    assert _fa is not None
    bgr = _to_bgr(image_b64)
    faces = _fa.get(bgr)
    if not faces:
        return None, {"faces": 0}
    # Choose the largest face by bounding box area
    def _area(face) -> float:
        x1, y1, x2, y2 = face.bbox.astype(int)
        return float((x2 - x1) * (y2 - y1))

    best = max(faces, key=_area)
    vec = np.array(best.normed_embedding, dtype=np.float32)
    meta = {
        "faces": len(faces),
        "bbox": best.bbox.astype(float).tolist(),
        "det_score": float(getattr(best, "det_score", 0.0)),
    }
    return vec, meta


def cosine_distance(a: np.ndarray, b: np.ndarray) -> float:
    # a and b expected normalized (insightface provides normed_embedding)
    sim = float(np.dot(a, b))  # cosine similarity in [-1, 1]
    # Convert to distance-like (0 is same; 2 is opposite)
    return 1.0 - sim


def compare(a_b64: str, b_b64: str) -> Tuple[Optional[float], dict]:
    """
    Compare two face images and return cosine distance.

    Args:
        a_b64: Base64-encoded first image
        b_b64: Base64-encoded second image

    Returns:
        Tuple of (distance, metadata) where metadata includes timing and model info

    Raises:
        RuntimeError: If no model is loaded
    """
    if _fa is None:
        raise RuntimeError("No model loaded. Call load_models() first.")

    start_time = time.time()

    ea, meta_a = embed(a_b64)
    if ea is None:
        return None, {"error": "no face in A", **meta_a}
    eb, meta_b = embed(b_b64)
    if eb is None:
        return None, {"error": "no face in B", **meta_b}
    dist = cosine_distance(ea, eb)

    elapsed_ms = (time.time() - start_time) * 1000

    return dist, {
        "a": meta_a,
        "b": meta_b,
        "timing_ms": round(elapsed_ms, 2),
        "model": _model_name,
    }
