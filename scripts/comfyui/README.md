# ComfyUI Workflows — LearnEasy SVG Logo Generation

Generates SVG logos from text prompts using SD 1.5 + comfyui-tosvg (VTracer).

## Stack

- **Model:** `v1-5-pruned-emaonly.safetensors` (SD 1.5)
- **Custom node:** `comfyui-tosvg` — provides TS_ImageToSVGStringColor_Vtracer, TS_SVGPathSimplify, TS_SaveSVGString
- **Server:** ComfyUI running at `http://127.0.0.1:8000`

## Pipeline

```
CheckpointLoaderSimple
  → CLIPTextEncode (positive + negative)
  → EmptyLatentImage (512x512)
  → KSampler
  → VAEDecode
  → TS_ImageToSVGStringColor_Vtracer  (raster → SVG string)
  → TS_SVGPathSimplify                (optional: reduce path count)
  → TS_SaveSVGString                  (saves .svg to ComfyUI output dir)
  → SaveImage                         (saves reference .png)
```

## Usage

Submit via curl or the Hermes comfyui skill's `run_workflow.py`:

```bash
python3 run_workflow.py \
  --workflow scripts/comfyui/learn_easy_logo_v2.json \
  --args '{"prompt": "your logo prompt here", "seed": 1234}' \
  --host http://127.0.0.1:8000 \
  --output-dir ./comfy_outputs
```

Or submit directly:

```python
import requests
requests.post("http://127.0.0.1:8000/prompt",
  json={"prompt": wf, "client_id": "test"})
```

Output SVGs land in ComfyUI's output directory (`/Users/sarthakpatnaik/Code/ComfyUI/output/`).

## Workflow Files

| File | Description | Params |
|------|-------------|--------|
| `learn_easy_logo_svg_clean.json` | Base pipeline (no path simplify) | filter_speckle=8, color_precision=6 |
| `learn_easy_logo_optimized.json` | Aggressive simplification | filter_speckle=20, color_precision=2, tolerance=5.0 |
| `learn_easy_logo_v2.json` | **Best result** — balanced | filter_speckle=10, color_precision=4, tolerance=1.0, preserve_curves=true |

## VTracer Parameter Tips

- `filter_speckle` (0–100): higher = remove more noise speckles
- `color_precision` (0–10): lower = fewer colors/more simplification
- `tolerance` (0.1–50.0): path simplify tolerance; higher = fewer paths
- `preserve_curves`: true keeps smooth curves during simplification

## Notes

- Remove `_meta` fields from workflow JSON — ComfyUI 0.25.0 rejects them in API format
- Use `TS_SaveSVGString` not `SaveSVGNode` for reliable SVG output
- Output SVGs are absolute path coordinates (512x512 canvas)
