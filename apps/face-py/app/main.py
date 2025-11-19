from __future__ import annotations

import base64
import os
from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from .face import compare, embed, load_models


class ImageBody(BaseModel):
    image_b64: str = Field(..., description="Base64-encoded image (no data URL prefix)")


class CompareBody(BaseModel):
    a_b64: str
    b_b64: str
    threshold: Optional[float] = 0.4  # cosine distance threshold (~0.4-0.5 typical)


app = FastAPI(title="Face Service", version="0.1.0")


@app.on_event("startup")
def _startup() -> None:
    # Preload models so first request is fast
    try:
        load_models()
    except Exception as e:  # pragma: no cover
        # Model can still be lazy-loaded on first request
        print("[face] model preload failed:", e)


@app.get("/health")
def health() -> Dict[str, Any]:
    try:
        load_models()
        ok = True
    except Exception:
        ok = False
    return {"ok": ok, "service": "face", "modelsLoaded": ok}


@app.post("/embed")
def post_embed(body: ImageBody) -> Dict[str, Any]:
    # Accept both raw base64 and data URL; strip prefix if present
    b64 = body.image_b64
    if b64.startswith("data:"):
        parts = b64.split(",", 1)
        b64 = parts[1] if len(parts) > 1 else ""
    if not b64:
        raise HTTPException(status_code=400, detail="invalid image payload")
    vec, meta = embed(b64)
    if vec is None:
        raise HTTPException(status_code=422, detail="no face found")
    return {"ok": True, "vector": vec.tolist(), "meta": meta}


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

    dist, meta = compare(a, b)
    if dist is None:
        raise HTTPException(status_code=422, detail=meta.get("error", "no face"))
    th = float(body.threshold or 0.4)
    match = bool(dist <= th)
    return {"ok": True, "distance": float(dist), "threshold": th, "match": match, "meta": meta}


