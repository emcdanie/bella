#!/usr/bin/env python3
"""
BELLA token builder.

Reads the tier-split token sources (primitive.json, semantic.light.json,
semantic.dark.json, component.json) and emits:
  - bella.css         CSS custom properties (light default + [data-theme='dark'])
  - bella.json        Flat rollup for style-dictionary and other tools
  - preview.html      Visual preview of every token + component

Usage:
  python3 tokens/build.py
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REF = re.compile(r"\{([^}]+)\}")

# ---------- load ----------

def load(name: str) -> dict:
    return json.loads((ROOT / name).read_text())

primitive = load("primitive.json")
sem_light = load("semantic.light.json")
sem_dark  = load("semantic.dark.json")
component = load("component.json")

# ---------- flatten ----------
# Walk a token tree and yield (dotted-path, value, type, meta) for each leaf token.
# A leaf is an object with "$value".

def walk(node, path=None):
    path = path or []
    if isinstance(node, dict):
        if "$value" in node:
            yield ".".join(path), node["$value"], node.get("$type"), node
            return
        for k, v in node.items():
            if k.startswith("$"):
                continue
            yield from walk(v, path + [k])

def flatten(tree):
    return {p: (v, t, meta) for p, v, t, meta in walk(tree)}

prim_flat = flatten(primitive)
light_flat = flatten(sem_light)
dark_flat  = flatten(sem_dark)
comp_flat  = flatten(component)

# ---------- resolve references ----------

def make_resolver(lookup):
    def resolve(value, depth=0):
        if depth > 12:
            return value
        if isinstance(value, str):
            def sub(m):
                key = m.group(1)
                if key in lookup:
                    return str(resolve(lookup[key][0], depth + 1))
                return m.group(0)
            return REF.sub(sub, value)
        if isinstance(value, dict):
            return {k: resolve(v, depth + 1) for k, v in value.items()}
        return value
    return resolve

light_lookup = {**prim_flat, **light_flat, **comp_flat}
dark_lookup  = {**prim_flat, **dark_flat,  **comp_flat}

resolve_light = make_resolver(light_lookup)
resolve_dark  = make_resolver(dark_lookup)

# ---------- emit bella.css ----------

def css_var(path: str) -> str:
    return "--" + path.replace(".", "-")

def emit_css_var(path: str) -> str:
    """Return the CSS custom property name for a token path.

    Blur tokens (primitive or semantic) are namespaced --bella-blur-* for
    cross-project portability with elleta.design and other consumers that
    already reference --bella-blur-* in their stylesheets.
    """
    if path.startswith("blur."):
        return "--bella-" + path.replace(".", "-")
    return css_var(path)

def prop_case(camel: str) -> str:
    return re.sub(r"([A-Z])", r"-\1", camel).lower()

css_lines = [
    "/* BELLA — generated from /tokens/{primitive,semantic.{light,dark},component}.json",
    " * Light mode is the default. Dark mode activates via [data-theme=\"dark\"] on <html> or <body>.",
    " * Do not edit by hand. Edit the source JSON and run `python3 tokens/build.py`.",
    " */",
    "",
    ":root {",
    "  /* ---- Primitives ---- */",
]

for path, (v, t, _) in prim_flat.items():
    css_lines.append(f"  {emit_css_var(path)}: {resolve_light(v)};")

css_lines += ["", "  /* ---- Semantic (light) ---- */"]
for path, (v, t, _) in light_flat.items():
    css_lines.append(f"  {emit_css_var(path)}: {resolve_light(v)};")

css_lines += ["", "  /* ---- Component ---- */"]
for path, (v, t, _) in comp_flat.items():
    if isinstance(v, dict):
        continue
    css_lines.append(f"  {emit_css_var(path)}: {resolve_light(v)};")

css_lines += ["}", ""]

css_lines += [
    "[data-theme=\"dark\"] {",
    "  /* ---- Semantic (dark) overrides ---- */",
]
for path, (v, t, _) in dark_flat.items():
    css_lines.append(f"  {emit_css_var(path)}: {resolve_dark(v)};")
css_lines += ["}", ""]

# ---- Glass utility classes ----
# Composed from semantic + primitive tokens so backdrop-filter and its
# -webkit-prefixed pair stay in lock-step.
css_lines += [
    "/* Glass utility classes — surface + blur + shadow + borders, bundled. */",
    "",
    ".bella-card-glass {",
    "  background: var(--color-semantic-surface-glass);",
    "  backdrop-filter: blur(var(--bella-blur-lg));",
    "  -webkit-backdrop-filter: blur(var(--bella-blur-lg));",
    "  box-shadow: var(--shadow-raised);",
    "  border: 1px solid var(--color-semantic-border-glass-edge);",
    "  border-top: 1px solid var(--color-semantic-border-glass-top);",
    "  border-radius: var(--component-card-glass-border-radius);",
    "}",
    "",
    ".bella-card-elevated {",
    "  background: var(--color-semantic-surface-glass-elevated);",
    "  backdrop-filter: blur(var(--bella-blur-md));",
    "  -webkit-backdrop-filter: blur(var(--bella-blur-md));",
    "  box-shadow: var(--shadow-card-elevated);",
    "  border: 1px solid var(--color-semantic-border-glass-edge);",
    "  border-top: 1px solid var(--color-semantic-border-glass-top);",
    "  border-radius: var(--component-card-elevated-border-radius);",
    "}",
    "",
    ".bella-card-default {",
    "  background: var(--color-semantic-surface-glass-light);",
    "  backdrop-filter: blur(var(--bella-blur-sm));",
    "  -webkit-backdrop-filter: blur(var(--bella-blur-sm));",
    "  box-shadow: var(--shadow-card-default);",
    "  border: 1px solid var(--color-semantic-border-glass-edge);",
    "  border-top: 1px solid var(--color-semantic-border-glass-top);",
    "  border-radius: var(--component-card-default-border-radius);",
    "}",
    "",
]

# Composite typography styles as utility classes
css_lines.append("/* Composite typography styles — utility classes */")
type_styles_path = "typography.style"
for p, (v, t, meta) in prim_flat.items():
    if not p.startswith(type_styles_path) or not isinstance(v, dict):
        continue
    class_name = p.replace("typography.style.", "bella-type-")
    css_lines.append("")
    css_lines.append(f".{class_name} {{")
    for k, val in v.items():
        css_lines.append(f"  {prop_case(k)}: {resolve_light(val)};")
    css_lines.append("}")

(ROOT / "bella.css").write_text("\n".join(css_lines) + "\n")

# ---------- emit bella.json (flat rollup, style-dictionary friendly) ----------

rollup = {
    "$metadata": {
        "name": "BELLA",
        "version": "0.2.0",
        "generatedAt": "2026-04-19",
        "note": "Flat rollup of primitive + semantic(light) + component. Dark mode lives in bella.css as [data-theme='dark'] overrides."
    },
    "primitive": primitive,
    "semantic": sem_light["color"]["semantic"],
    "semantic_dark_overrides": sem_dark["color"]["semantic"],
    "component": component["component"]
}

(ROOT / "bella.json").write_text(json.dumps(rollup, indent=2) + "\n")

# ---------- emit preview.html ----------

def swatch_html(name, hex_value, description=""):
    return (
        f'<div class="swatch"><div class="swatch-chip" style="background:{hex_value}"></div>'
        f'<div class="swatch-meta"><div class="swatch-name">{name}</div>'
        f'<div class="swatch-hex">{hex_value}</div>'
        f'<div class="swatch-desc">{description}</div></div></div>'
    )

def primitive_colors():
    blocks = []
    groups = [("brand", "Brand"), ("supporting", "Supporting"), ("neutral", "Neutral scale"), ("alpha", "Alpha variants")]
    for key, title in groups:
        items = []
        for path, (v, t, meta) in prim_flat.items():
            parts = path.split(".")
            if parts[0] == "color" and parts[1] == key:
                desc = meta.get("$description", "") if isinstance(meta, dict) else ""
                items.append(swatch_html(".".join(parts[1:]), v, desc))
        blocks.append(f'<h3>{title}</h3><div class="swatches">' + "".join(items) + "</div>")
    return "\n".join(blocks)

def semantic_table(sem_flat, mode_lookup, resolve_fn):
    rows = []
    for path, (v, t, meta) in sem_flat.items():
        resolved = resolve_fn(v)
        raw = v if isinstance(v, str) else str(v)
        desc = meta.get("$description", "") if isinstance(meta, dict) else ""
        rows.append(
            f'<tr><td class="sem-name">{path}</td>'
            f'<td class="sem-ref"><code>{raw}</code></td>'
            f'<td class="sem-chip"><span style="background:{resolved};border:1px solid #0001"></span> <code>{resolved}</code></td>'
            f'<td class="sem-desc">{desc}</td></tr>'
        )
    return "<table class='sem-table'><thead><tr><th>Token</th><th>Reference</th><th>Resolved</th><th>Description</th></tr></thead><tbody>" + "".join(rows) + "</tbody></table>"

def component_section():
    out = []
    comp_tree = component["component"]
    for comp_name, comp_val in comp_tree.items():
        meta = comp_val.get("$extensions", {}).get("bella", {})
        out.append(f'<h3>{meta.get("name", comp_name)}</h3>')
        out.append(f'<p class="meta-desc">{meta.get("description", "")}</p>')
        variants = meta.get("variants", [])
        states = meta.get("states", [])
        if variants:
            out.append(f'<p class="meta-chips"><strong>Variants:</strong> ' + " · ".join(f'<code>{s}</code>' for s in variants) + "</p>")
        if states:
            out.append(f'<p class="meta-chips"><strong>States:</strong> ' + " · ".join(f'<code>{s}</code>' for s in states) + "</p>")
        if meta.get("usage"):
            out.append("<p class='meta-usage'><strong>Use for:</strong> " + ", ".join(meta["usage"]) + "</p>")
        if meta.get("dont"):
            out.append("<p class='meta-dont'><strong>Don't use for:</strong> " + "; ".join(meta["dont"]) + "</p>")
    return "\n".join(out)

preview = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>BELLA — Token Preview</title>
<link rel="stylesheet" href="bella.css">
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    font-family: var(--typography-font-family-body);
    font-size: var(--typography-font-size-base);
    line-height: var(--typography-line-height-normal);
    background: var(--color-semantic-background);
    color: var(--color-semantic-text-primary);
    padding: var(--spacing-10) var(--spacing-6);
    min-height: 100vh;
  }}
  .wrap {{ max-width: 1100px; margin: 0 auto; }}
  header {{ margin-bottom: var(--spacing-12); }}
  .eyebrow {{ font-family: var(--typography-font-family-mono); font-size: var(--typography-font-size-tag); color: var(--color-semantic-accent); text-transform: uppercase; letter-spacing: var(--typography-letter-spacing-wider); margin-bottom: var(--spacing-2); }}
  h1 {{ font-size: var(--typography-font-size-5xl); font-weight: var(--typography-font-weight-black); line-height: var(--typography-line-height-tight); letter-spacing: var(--typography-letter-spacing-tight); }}
  h1 em {{ color: var(--color-semantic-accent); font-style: normal; }}
  h2 {{ font-size: var(--typography-font-size-3xl); font-weight: var(--typography-font-weight-bold); margin-top: var(--spacing-12); margin-bottom: var(--spacing-5); }}
  h3 {{ font-size: var(--typography-font-size-xl); font-weight: var(--typography-font-weight-bold); margin-top: var(--spacing-8); margin-bottom: var(--spacing-3); }}
  p {{ margin-bottom: var(--spacing-4); }}
  .theme-toggle {{ position: fixed; top: var(--spacing-5); right: var(--spacing-5); z-index: 10;
    background: var(--color-semantic-accent); color: var(--color-brand-ink);
    padding: var(--spacing-3) var(--spacing-5); border: 0; border-radius: var(--radius-md);
    font-family: var(--typography-font-family-mono); font-size: var(--typography-font-size-tag);
    font-weight: var(--typography-font-weight-bold); letter-spacing: var(--typography-letter-spacing-wide);
    text-transform: uppercase; cursor: pointer; }}

  /* Swatches */
  .swatches {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--spacing-3); margin-bottom: var(--spacing-6); }}
  .swatch {{ background: var(--color-semantic-surface); border: 1px solid var(--color-semantic-border); border-radius: var(--radius-lg); overflow: hidden; }}
  .swatch-chip {{ height: 72px; }}
  .swatch-meta {{ padding: var(--spacing-3); }}
  .swatch-name {{ font-family: var(--typography-font-family-mono); font-size: var(--typography-font-size-tag); font-weight: var(--typography-font-weight-medium); margin-bottom: var(--spacing-1); }}
  .swatch-hex {{ font-family: var(--typography-font-family-mono); font-size: var(--typography-font-size-tag); color: var(--color-semantic-text-secondary); }}
  .swatch-desc {{ font-size: var(--typography-font-size-sm); color: var(--color-semantic-text-secondary); margin-top: var(--spacing-2); line-height: var(--typography-line-height-snug); }}

  /* Semantic table */
  .sem-table {{ width: 100%; border-collapse: collapse; background: var(--color-semantic-surface); border-radius: var(--radius-lg); overflow: hidden; }}
  .sem-table th, .sem-table td {{ padding: var(--spacing-3) var(--spacing-4); text-align: left; border-bottom: 1px solid var(--color-semantic-border-subtle); font-size: var(--typography-font-size-sm); }}
  .sem-table th {{ background: var(--color-semantic-surface-elevated, var(--color-semantic-surface)); font-family: var(--typography-font-family-mono); text-transform: uppercase; letter-spacing: var(--typography-letter-spacing-wide); font-size: var(--typography-font-size-tag); color: var(--color-semantic-text-secondary); }}
  .sem-table code {{ font-family: var(--typography-font-family-mono); font-size: var(--typography-font-size-tag); }}
  .sem-name {{ font-family: var(--typography-font-family-mono); }}
  .sem-chip span {{ display: inline-block; width: 18px; height: 18px; border-radius: var(--radius-sm); vertical-align: middle; margin-right: var(--spacing-2); }}

  /* Component previews */
  .demo-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--spacing-5); margin-top: var(--spacing-6); }}
  .meta-desc {{ color: var(--color-semantic-text-secondary); }}
  .meta-chips code {{ font-family: var(--typography-font-family-mono); font-size: var(--typography-font-size-tag); background: var(--color-semantic-accent-subtle); color: var(--color-semantic-accent); padding: 2px var(--spacing-2); border-radius: var(--radius-sm); margin: 0 var(--spacing-1); }}
  .meta-usage {{ color: var(--color-semantic-text-secondary); font-size: var(--typography-font-size-sm); }}
  .meta-dont {{ color: var(--color-semantic-text-secondary); font-size: var(--typography-font-size-sm); border-left: 2px solid var(--color-semantic-accent); padding-left: var(--spacing-3); }}

  /* Live component examples */
  .live-card {{ background: var(--color-semantic-surface); border: 1px solid var(--color-semantic-border); border-radius: var(--radius-lg); padding: var(--spacing-5); transition: all var(--motion-duration-normal) var(--motion-easing-emphasis); }}
  .live-card:hover {{ transform: var(--motion-transform-hover-lift); box-shadow: var(--shadow-hover); }}
  .live-card-eyebrow {{ font-family: var(--typography-font-family-mono); font-size: var(--typography-font-size-tag); color: var(--color-semantic-accent); text-transform: uppercase; letter-spacing: var(--typography-letter-spacing-wider); margin-bottom: var(--spacing-2); }}
  .live-card-title {{ font-size: var(--typography-font-size-xl); font-weight: var(--typography-font-weight-bold); margin-bottom: var(--spacing-2); }}
  .live-card-desc {{ color: var(--color-semantic-text-secondary); font-size: var(--typography-font-size-base); line-height: var(--typography-line-height-normal); }}

  .live-tag {{ display: inline-flex; align-items: center; min-height: var(--spacing-touch-target); padding: var(--spacing-1) var(--spacing-3); border-radius: var(--radius-full); font-family: var(--typography-font-family-mono); font-size: var(--typography-font-size-tag); font-weight: var(--typography-font-weight-medium); letter-spacing: var(--typography-letter-spacing-wide); text-transform: uppercase; border: 1px solid transparent; margin-right: var(--spacing-2); }}
  .live-tag.accent {{ background: var(--color-semantic-accent-subtle); color: var(--color-semantic-accent); border-color: var(--color-semantic-accent-border); }}
  .live-tag.info {{ background: var(--color-semantic-info-subtle); color: var(--color-semantic-info); border-color: var(--color-semantic-info-border); }}
  .live-tag.muted {{ background: var(--color-semantic-surface); color: var(--color-semantic-text-secondary); border-color: var(--color-semantic-border); }}

  .live-btn {{ display: inline-flex; align-items: center; min-height: var(--spacing-touch-target); padding: var(--spacing-3) var(--spacing-5); background: var(--color-semantic-accent); color: var(--color-brand-ink); border: 1px solid var(--color-semantic-accent); border-radius: var(--radius-md); font-family: var(--typography-font-family-mono); font-size: var(--typography-font-size-tag); font-weight: var(--typography-font-weight-bold); letter-spacing: var(--typography-letter-spacing-wide); text-transform: uppercase; cursor: pointer; text-decoration: none; margin-right: var(--spacing-3); transition: background var(--motion-duration-fast); }}
  .live-btn.secondary {{ background: transparent; color: var(--color-semantic-accent); }}
  .live-btn.ghost {{ background: transparent; color: var(--color-semantic-text-primary); border-color: transparent; }}

  .type-specimen {{ background: var(--color-semantic-surface); border: 1px solid var(--color-semantic-border); border-radius: var(--radius-lg); padding: var(--spacing-6); }}
  .type-row {{ display: flex; align-items: baseline; gap: var(--spacing-5); padding: var(--spacing-3) 0; border-bottom: 1px solid var(--color-semantic-border-subtle); }}
  .type-row:last-child {{ border-bottom: 0; }}
  .type-label {{ font-family: var(--typography-font-family-mono); font-size: var(--typography-font-size-tag); color: var(--color-semantic-text-secondary); width: 120px; flex-shrink: 0; text-transform: uppercase; letter-spacing: var(--typography-letter-spacing-wide); }}

  .spacing-scale {{ display: flex; flex-direction: column; gap: var(--spacing-2); background: var(--color-semantic-surface); border: 1px solid var(--color-semantic-border); border-radius: var(--radius-lg); padding: var(--spacing-5); }}
  .spacing-row {{ display: flex; align-items: center; gap: var(--spacing-4); }}
  .spacing-row .label {{ font-family: var(--typography-font-family-mono); font-size: var(--typography-font-size-tag); color: var(--color-semantic-text-secondary); width: 80px; }}
  .spacing-row .bar {{ background: var(--color-semantic-accent); height: 16px; border-radius: var(--radius-sm); }}
  .spacing-row .value {{ font-family: var(--typography-font-family-mono); font-size: var(--typography-font-size-tag); color: var(--color-semantic-text-secondary); }}

  /* Mobile / touch AAA preview */
  .mobile-frame {{ max-width: 640px; margin: 0 auto; background: var(--color-semantic-surface); border: 1px solid var(--color-semantic-border); border-radius: var(--radius-lg); padding: var(--spacing-5); }}
  .mobile-frame > * + * {{ margin-top: var(--spacing-5); }}
  .mobile-nav {{ display: flex; gap: var(--spacing-4); border-bottom: 1px solid var(--color-semantic-border-subtle); padding-bottom: var(--spacing-3); flex-wrap: wrap; }}
  .live-nav-link {{ display: inline-flex; align-items: center; min-height: var(--spacing-touch-target); font-family: var(--typography-font-family-mono); font-size: var(--typography-font-size-tag); letter-spacing: var(--typography-letter-spacing-wide); color: var(--color-semantic-text-secondary); text-transform: uppercase; text-decoration: none; cursor: pointer; padding: 0 var(--spacing-2); }}
  .live-nav-link.active {{ color: var(--color-semantic-text-primary); border-bottom: 2px solid var(--color-semantic-accent); }}
  .live-input {{ display: block; width: 100%; min-height: var(--spacing-touch-target); background: var(--color-semantic-surface); border: 1px solid var(--color-semantic-border); border-radius: var(--radius-md); padding: var(--spacing-3) var(--spacing-4); font-family: var(--typography-font-family-body); font-size: var(--typography-font-size-base); color: var(--color-semantic-text-primary); box-sizing: border-box; }}

  /* Surfaces — glass + shadow + blur preview */
  .glass-stage         {{ background: var(--color-semantic-background); padding: var(--spacing-8) var(--spacing-5); border-radius: var(--radius-lg); border: 1px solid var(--color-semantic-border); margin-top: var(--spacing-3); }}
  .glass-row           {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--spacing-5); }}
  .glass-card          {{ background: var(--color-semantic-surface-glass); backdrop-filter: blur(var(--bella-blur-lg)); -webkit-backdrop-filter: blur(var(--bella-blur-lg)); border: 1px solid var(--color-semantic-border-glass-edge); border-top: 1px solid var(--color-semantic-border-glass-top); border-radius: var(--radius-3xl); padding: var(--spacing-6); box-shadow: var(--shadow-raised); }}
  .glass-card.elevated {{ background: var(--color-semantic-surface-glass-elevated); backdrop-filter: blur(var(--bella-blur-md)); -webkit-backdrop-filter: blur(var(--bella-blur-md)); border-radius: var(--radius-2xl); box-shadow: var(--shadow-card-elevated); }}
  .glass-card.light    {{ background: var(--color-semantic-surface-glass-light);    backdrop-filter: blur(var(--bella-blur-sm)); -webkit-backdrop-filter: blur(var(--bella-blur-sm)); border-radius: var(--radius-xl);  box-shadow: var(--shadow-card-default); }}
  .glass-card h4       {{ font-size: var(--typography-font-size-xl); font-weight: var(--typography-font-weight-bold); margin-bottom: var(--spacing-2); }}
  .glass-card p        {{ font-size: var(--typography-font-size-base); color: var(--color-semantic-text-secondary); line-height: var(--typography-line-height-normal); }}

  .shadow-row                {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--spacing-5); margin-top: var(--spacing-5); }}
  .shadow-chip               {{ background: var(--color-semantic-surface); border-radius: var(--radius-lg); padding: var(--spacing-6) var(--spacing-4); text-align: center; font-family: var(--typography-font-family-mono); font-size: var(--typography-font-size-tag); text-transform: uppercase; letter-spacing: var(--typography-letter-spacing-wide); color: var(--color-semantic-text-secondary); }}
  .shadow-chip.soft          {{ box-shadow: var(--shadow-soft); }}
  .shadow-chip.layered       {{ box-shadow: var(--shadow-layered); }}
  .shadow-chip.card-default  {{ box-shadow: var(--shadow-card-default); }}
  .shadow-chip.card-elevated {{ box-shadow: var(--shadow-card-elevated); }}

  .blur-stage   {{ position: relative; margin-top: var(--spacing-5); border-radius: var(--radius-lg); overflow: hidden; background: linear-gradient(135deg, #C4956A 0%, #6495C5 35%, #4A7C6F 65%, #7B6E8F 100%); padding: var(--spacing-10) var(--spacing-5); }}
  .blur-row     {{ display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--spacing-3); }}
  .blur-tile    {{ aspect-ratio: 1; display: flex; align-items: flex-end; justify-content: center; padding: var(--spacing-3); font-family: var(--typography-font-family-mono); font-size: var(--typography-font-size-tag); color: var(--color-brand-ink); text-transform: uppercase; letter-spacing: var(--typography-letter-spacing-wide); background: rgba(255,255,255,0.40); border-radius: var(--radius-md); }}
  .blur-tile.xs {{ backdrop-filter: blur(var(--bella-blur-xs)); -webkit-backdrop-filter: blur(var(--bella-blur-xs)); }}
  .blur-tile.sm {{ backdrop-filter: blur(var(--bella-blur-sm)); -webkit-backdrop-filter: blur(var(--bella-blur-sm)); }}
  .blur-tile.md {{ backdrop-filter: blur(var(--bella-blur-md)); -webkit-backdrop-filter: blur(var(--bella-blur-md)); }}
  .blur-tile.lg {{ backdrop-filter: blur(var(--bella-blur-lg)); -webkit-backdrop-filter: blur(var(--bella-blur-lg)); }}
  .blur-tile.xl {{ backdrop-filter: blur(var(--bella-blur-xl)); -webkit-backdrop-filter: blur(var(--bella-blur-xl)); }}

  .a11y-note-card        {{ margin-top: var(--spacing-8); background: var(--color-semantic-surface); border-left: 4px solid var(--color-semantic-accent); padding: var(--spacing-5); border-radius: var(--radius-md); }}
  .a11y-note-card strong {{ font-family: var(--typography-font-family-mono); font-size: var(--typography-font-size-tag); text-transform: uppercase; letter-spacing: var(--typography-letter-spacing-wide); color: var(--color-semantic-accent); display: block; margin-bottom: var(--spacing-2); }}
</style>
</head>
<body>
<button class="theme-toggle" onclick="document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'">Toggle Theme</button>

<div class="wrap">
  <header>
    <div class="eyebrow">ctrl_alt_design · BELLA v0.2</div>
    <h1>Token <em>preview</em>.</h1>
    <p style="color: var(--color-semantic-text-secondary); max-width: 60ch; margin-top: var(--spacing-3);">Every token in BELLA, seen at once. Tier 1 primitives at the top, tier 2 semantic mappings in the middle, tier 3 component tokens at the bottom with live examples. Toggle the theme to see light/dark.</p>
  </header>

  <section>
    <div class="eyebrow">Tier 1</div>
    <h2>Primitives</h2>
    <p style="color: var(--color-semantic-text-secondary);">Raw values. Every downstream token references these, never the reverse.</p>
    {primitive_colors()}

    <h3>Spacing scale</h3>
    <div class="spacing-scale">
      {"".join(f'<div class="spacing-row"><span class="label">spacing.{k.split(".")[1]}</span><div class="bar" style="width: {v[0].replace("px","")}px"></div><span class="value">{v[0]}</span></div>' for k, v in prim_flat.items() if k.startswith("spacing."))}
    </div>

    <h3>Typography specimen</h3>
    <div class="type-specimen">
      <div class="type-row"><span class="type-label">display</span><span style="font-size: var(--typography-font-size-5xl); font-weight: var(--typography-font-weight-black); line-height: var(--typography-line-height-tight); letter-spacing: var(--typography-letter-spacing-tight);">Elleta McDaniel</span></div>
      <div class="type-row"><span class="type-label">heading-1</span><span style="font-size: var(--typography-font-size-4xl); font-weight: var(--typography-font-weight-bold); letter-spacing: var(--typography-letter-spacing-tight);">Design Systems &amp; AI</span></div>
      <div class="type-row"><span class="type-label">heading-2</span><span style="font-size: var(--typography-font-size-3xl); font-weight: var(--typography-font-weight-bold);">From Drift to Foundation</span></div>
      <div class="type-row"><span class="type-label">heading-3</span><span style="font-size: var(--typography-font-size-2xl); font-weight: var(--typography-font-weight-bold);">Token architecture</span></div>
      <div class="type-row"><span class="type-label">card-title</span><span style="font-size: var(--typography-font-size-xl); font-weight: var(--typography-font-weight-bold);">Operational Dashboard</span></div>
      <div class="type-row"><span class="type-label">body</span><span style="font-size: var(--typography-font-size-base); line-height: var(--typography-line-height-normal);">Designing clarity for complex digital platforms and scaling teams.</span></div>
      <div class="type-row"><span class="type-label">tag</span><span style="font-family: var(--typography-font-family-mono); font-size: var(--typography-font-size-tag); text-transform: uppercase; letter-spacing: var(--typography-letter-spacing-wider); color: var(--color-semantic-accent);">Design Systems · AI · ctrl_alt_design</span></div>
    </div>
  </section>

  <section>
    <div class="eyebrow" style="margin-top: var(--spacing-12);">Tier 2</div>
    <h2>Semantic</h2>
    <p style="color: var(--color-semantic-text-secondary);">Meaning, not value. Components reference these — the mapping to primitives can change per mode without breaking any component.</p>
    <h3>Light mode resolution</h3>
    {semantic_table(light_flat, light_lookup, resolve_light)}
    <h3>Dark mode resolution</h3>
    {semantic_table(dark_flat, dark_lookup, resolve_dark)}
  </section>

  <section>
    <div class="eyebrow" style="margin-top: var(--spacing-12);">Tier 3</div>
    <h2>Components</h2>
    <p style="color: var(--color-semantic-text-secondary);">Every component reference is resolved through semantic, so flipping dark mode flips the components automatically.</p>

    {component_section()}

    <h3>Live examples</h3>
    <div class="demo-grid">
      <div class="live-card">
        <div class="live-card-eyebrow">Design Systems</div>
        <div class="live-card-title">From Drift to Foundation</div>
        <div class="live-card-desc">Rebuilding design system thinking in a scaling SaaS product.</div>
        <div style="margin-top: var(--spacing-4);">
          <span class="live-tag accent">Tokens</span>
          <span class="live-tag info">Components</span>
          <span class="live-tag muted">2026</span>
        </div>
      </div>
      <div class="live-card">
        <div class="live-card-eyebrow">AI UX</div>
        <div class="live-card-title">Guardian — Design System Monitor</div>
        <div class="live-card-desc">AI-assisted drift detection and token governance.</div>
        <div style="margin-top: var(--spacing-4);">
          <span class="live-tag accent">Claude API</span>
          <span class="live-tag info">Governance</span>
        </div>
      </div>
      <div class="live-card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div class="live-card-eyebrow">Buttons</div>
          <div class="live-card-title">All three variants</div>
          <div class="live-card-desc">Primary, secondary, ghost. Same padding, different emphasis.</div>
        </div>
        <div style="margin-top: var(--spacing-5);">
          <a class="live-btn">View work →</a>
          <a class="live-btn secondary">Secondary</a>
          <a class="live-btn ghost">Ghost</a>
        </div>
      </div>
    </div>
  </section>

  <section>
    <div class="eyebrow" style="margin-top: var(--spacing-12);">Mobile / Touch AAA</div>
    <h2>Mobile preview</h2>
    <p style="color: var(--color-semantic-text-secondary); max-width: 60ch;">Every interactive element declares <code>min-height: 44px</code> — the WCAG 2.5.5 AAA target-size floor. This frame is capped at 640px so chips, buttons, inputs, and nav render at a realistic mobile width.</p>
    <div class="mobile-frame">
      <nav class="mobile-nav">
        <a class="live-nav-link">Work</a>
        <a class="live-nav-link active">Writing</a>
        <a class="live-nav-link">About</a>
        <a class="live-nav-link">Contact</a>
      </nav>
      <div style="display: flex; flex-wrap: wrap; gap: var(--spacing-2);">
        <span class="live-tag accent">Tokens</span>
        <span class="live-tag info">Components</span>
        <span class="live-tag muted">2026</span>
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: var(--spacing-3);">
        <a class="live-btn">Primary →</a>
        <a class="live-btn secondary">Secondary</a>
        <a class="live-btn ghost">Ghost</a>
      </div>
      <input class="live-input" placeholder="Search the archive" />
    </div>
  </section>

  <section>
    <div class="eyebrow" style="margin-top: var(--spacing-12);">Surfaces</div>
    <h2>Shadows &amp; Glass</h2>
    <p style="color: var(--color-semantic-text-secondary); max-width: 60ch;">Three glass tiers, four shadow specimens, five blur steps. Warmth comes from parchment showing through translucent layers — white alpha is an overlay, never a solid fill.</p>

    <h3>Glass tiers</h3>
    <div class="glass-stage">
      <div class="glass-row">
        <div class="glass-card">
          <h4>card.glass</h4>
          <p>Primary. Hero panel, feature card. 18px blur, 24px radius, shadow.raised with a crisp inset glass-90 highlight.</p>
        </div>
        <div class="glass-card elevated">
          <h4>card.elevated</h4>
          <p>Mid-tier. Case-study cards, content panels. 16px blur, 20px radius, shadow.card-elevated with a glass-68 inset.</p>
        </div>
        <div class="glass-card light">
          <h4>card.default</h4>
          <p>Subtle panel. Secondary surface, nested container. 14px blur, 16px radius, shadow.card-default with a glass-55 inset.</p>
        </div>
      </div>
    </div>

    <h3>Shadow specimens</h3>
    <div class="shadow-row">
      <div class="shadow-chip soft">shadow.soft</div>
      <div class="shadow-chip layered">shadow.layered</div>
      <div class="shadow-chip card-default">shadow.card-default</div>
      <div class="shadow-chip card-elevated">shadow.card-elevated</div>
    </div>

    <h3>Blur scale</h3>
    <p style="color: var(--color-semantic-text-secondary); margin-bottom: var(--spacing-3);">Each tile sits on a saturated backdrop so the five blur steps read visually.</p>
    <div class="blur-stage">
      <div class="blur-row">
        <div class="blur-tile xs">xs · 8</div>
        <div class="blur-tile sm">sm · 14</div>
        <div class="blur-tile md">md · 16</div>
        <div class="blur-tile lg">lg · 18</div>
        <div class="blur-tile xl">xl · 20</div>
      </div>
    </div>

    <div class="a11y-note-card">
      <strong>AAA — Text on glass</strong>
      Text on glass surfaces inherits the contrast of the background beneath. On parchment, text is ink only. On slate (dark mode), text is parchment. Never stack glass over amber, steel, dusk, or sage — the composite contrast is unpredictable.
    </div>
  </section>
</div>
</body>
</html>
"""

(ROOT / "preview.html").write_text(preview)

print(f"Wrote bella.css  ({len(css_lines)} lines)")
print(f"Wrote bella.json (flat rollup, {sum(1 for _ in walk(rollup))} leaves)")
print(f"Wrote preview.html")
print(f"")
print(f"Primitive leaves: {len(prim_flat)}")
print(f"Semantic light:   {len(light_flat)}")
print(f"Semantic dark:    {len(dark_flat)}")
print(f"Component leaves: {len(comp_flat)}")
