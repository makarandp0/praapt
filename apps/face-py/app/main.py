from __future__ import annotations

import base64
import os
from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from .face import clear_cache, compare, embed, get_cache_info, get_model_info, load_models


class ImageBody(BaseModel):
    image_b64: str = Field(..., description="Base64-encoded image (no data URL prefix)")


class CompareBody(BaseModel):
    a_b64: str
    b_b64: str
    threshold: Optional[float] = 0.4  # cosine distance threshold (~0.4-0.5 typical)


class LoadModelBody(BaseModel):
    model: str = Field(..., description="Model name: buffalo_l or buffalo_s")


app = FastAPI(title="Face Service", version="0.1.0")


@app.on_event("startup")
def _startup() -> None:
    # Models must be explicitly loaded via /load-model endpoint
    print("[face] service started - use /load-model to load a model")


@app.get("/health")
def health() -> Dict[str, Any]:
    # Report current model loading status
    model_info = get_model_info()
    cache_info = get_cache_info()
    return {
        "ok": True,
        "service": "face",
        "modelsLoaded": model_info["loaded"],
        "model": model_info["model"],
        "cache": {
            "enabled": cache_info["enabled"],
            "cached_embeddings": cache_info["cached_embeddings"],
            "hit_rate_percent": cache_info["stats"]["hit_rate_percent"],
        },
    }


@app.post("/load-model")
def post_load_model(body: LoadModelBody) -> Dict[str, Any]:
    """
    Load a face recognition model. Unloads any previously loaded model.

    Args:
        model: Either "buffalo_l" (large, accurate) or "buffalo_s" (small, fast)
    """
    model = body.model
    if model not in ("buffalo_l", "buffalo_s"):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid model '{model}'. Must be 'buffalo_l' or 'buffalo_s'",
        )
    try:
        load_models(model)
        return {
            "ok": True,
            "message": f"Model '{model}' loaded successfully",
            "model": model,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load model: {str(e)}")


@app.post("/embed")
def post_embed(body: ImageBody) -> Dict[str, Any]:
    # Accept both raw base64 and data URL; strip prefix if present
    b64 = body.image_b64
    if b64.startswith("data:"):
        parts = b64.split(",", 1)
        b64 = parts[1] if len(parts) > 1 else ""
    if not b64:
        raise HTTPException(status_code=400, detail="invalid image payload")
    try:
        vec, meta = embed(b64)
        if vec is None:
            raise HTTPException(status_code=422, detail="no face found")
        return {"ok": True, "vector": vec.tolist(), "meta": meta}
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.post("/compare")
def post_compare(body: CompareBody) -> Dict[str, Any]:
    a = body.a_b64
    b = body.b_b64
    for name, v in ("a", a), ("b", b):
        if v.startswith("data:"):
            parts = v.split(",", 1)
            v = parts[1] if len(parts) > 1 else ""
        if not v:
            raise HTTPException(status_code=400, detail=f"invalid image payload for {name}")
        if name == "a":
            a = v
        else:
            b = v

    try:
        dist, meta = compare(a, b)
        if dist is None:
            raise HTTPException(status_code=422, detail=meta.get("error", "no face"))
        th = float(body.threshold or 0.4)
        match = bool(dist <= th)
        return {"ok": True, "distance": float(dist), "threshold": th, "match": match, "meta": meta}
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.get("/cache/info")
def get_cache_info_endpoint() -> Dict[str, Any]:
    """
    Get cache statistics and information.

    Returns cache hit rate, number of cached embeddings, and cache size.
    """
    info = get_cache_info()
    return {"ok": True, **info}


@app.post("/cache/clear")
def post_clear_cache() -> Dict[str, Any]:
    """
    Clear all cached embeddings.

    This will delete all cached face embeddings and reset cache statistics.
    """
    result = clear_cache()
    return {"ok": True, "message": "Cache cleared", **result}


