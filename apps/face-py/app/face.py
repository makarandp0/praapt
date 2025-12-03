from __future__ import annotations

import base64
import io
from typing import List, Optional, Tuple

import cv2
import numpy as np
from PIL import Image

_fa = None  # lazy-loaded global FaceAnalysis


def load_models() -> None:
    global _fa
    if _fa is not None:
        return
    # Lazy import to speed cold starts and allow dependency-less tooling
    from insightface.app import FaceAnalysis

    # Use the default 'buffalo_l' model pack (retinaface + arcface)
    # buffalo_s is smaller and uses less memory (~500MB vs ~1.5GB)
    fa = FaceAnalysis(name="buffalo_s")
    # ctx_id = 0 means CPU on onnxruntime; set to -1 for pure CPU in some envs
    fa.prepare(ctx_id=0, det_size=(640, 640))
    _fa = fa


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
    """
    load_models()
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
    ea, meta_a = embed(a_b64)
    if ea is None:
        return None, {"error": "no face in A", **meta_a}
    eb, meta_b = embed(b_b64)
    if eb is None:
        return None, {"error": "no face in B", **meta_b}
    dist = cosine_distance(ea, eb)
    return dist, {"a": meta_a, "b": meta_b}


