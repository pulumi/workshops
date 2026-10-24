#!/usr/bin/env python3
"""Build and verify the fixed frame and the look of a Pulumi workshop deck.

The reference is pulumi/workshops/neo-in-a-docker-sandbox/slides/slides.md. Its frame (title,
speakers, housekeeping, agenda, demo divider, Resources, Continue your Pulumi journey!, Thank
you) is generated from frame.json, and its story and demo slides are built from its patterns.

  deck_frame.py example                          print an example frame.json
  deck_frame.py init <slides-dir> <frame.json>   write slides.md, style.css, package.json,
                                                 components/ and public/ [--frame-only]
  deck_frame.py check <slides-dir>               verify the frame and the look; exit 1 on failure
  deck_frame.py patterns [<name>]                list the reference slide patterns, or print one
                                                 (reads deck_patterns.json next to this script)

Python 3.8+, standard library only. The workshop-deck skill explains the rules.
"""
import argparse
import difflib
import json
import re
import shutil
import sys
from pathlib import Path

REPO = "https://github.com/pulumi/workshops/tree/main/{slug}"
STORY_MARKER = "<!-- STORY: replace this slide with the story slides (Act 1, Act 2, the solution) -->"
DEMO_MARKER = "<!-- DEMO: replace this slide with the demo slides (What we are going to do, one slide per step) -->"
MIN_STORY_SLIDES = 8

PLACEHOLDER_SPEAKER = {
    "name": "Speaker Name",
    "role": "Role",
    "company": "Pulumi",
    "avatar": "/img/speaker-placeholder.svg",
    "x": "@handle",
    "linkedin": "handle",
    "github": "handle",
    "bio": ["One line on what they build.", "One line on why this topic matters to them."],
    "qr": {"url": "https://www.linkedin.com/company/pulumi/", "label": "pulumi", "icon": "linkedin"},
    "placeholder": True,
}

EXAMPLE = {
    "slug": "my-workshop-slug",
    "title": "Workshop title",
    "subtitle": "One line that says what participants will be able to do",
    "demo_title": "Short workshop title",
    "speakers": [
        {
            "name": "Engin Diri",
            "role": "Principal Solutions Architect",
            "company": "Pulumi",
            "avatar": "/img/engin-diri.png",
            "x": "@_ediri",
            "linkedin": "engin-diri",
            "github": "dirien",
            "bio": ["Building platform tooling and infrastructure-as-code.",
                    "Helping teams ship cloud infrastructure faster."],
            "qr": {"url": "https://www.linkedin.com/in/engin-diri/", "label": "engin-diri", "icon": "linkedin"},
        },
        {"placeholder": True},
    ],
    "agenda": ["Why this is hard", "The tech that changes it", "What we build", "The demo", "Wrap-up and Q&A"],
    "resources": [
        {"title": "Pulumi docs for the topic", "url": "https://www.pulumi.com/docs/", "label": "pulumi.com/docs"},
        {"title": "Project docs", "url": "https://example.com/docs", "label": "example.com/docs"},
    ],
}

# ----------------------------------------
# Frame slides. Markup taken verbatim from the reference deck; sizes made identical across
# speaker slides, and Housekeeping and Today's Agenda share one font size.
# ----------------------------------------

HEADMATTER = """theme: "@pulumi/slidev-theme"
title: "{title}"
info: |
  {title}: {subtitle}.
  {speaker_names}.

  Repo: {repo}
transition: slide-left
mdc: true
canvasWidth: 1920
aspectRatio: 16/9
highlighter: shiki
lineNumbers: false
layout: cover
defaults:
  layout: default
"""

TITLE = """<div class="absolute inset-0 flex flex-col justify-center items-start px-20">
  <h1 class="!text-[5.4rem] !leading-[1.02] !font-semibold !tracking-tight !mb-6 !max-w-[95%]">
    {title}
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    {subtitle}
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
{speaker_lines}
  </p>
</div>"""

SPEAKER = """<div class="absolute inset-0 flex items-center px-24 gap-20">
  <div class="flex-shrink-0">
    <img src="{avatar}" class="w-[28rem] rounded-2xl shadow-xl border-4" style="border-color: rgba(126,107,255,0.45)" alt="{name}" />
  </div>
  <div class="flex-1">
    <h1 class="!text-[7rem] !leading-[1.02] !font-semibold !tracking-tight !mb-4 !text-[var(--p-primary)]">{name}</h1>
    <p class="!text-[2.2rem] !leading-relaxed !m-0 opacity-90">
      {role} at <strong class="!text-[var(--p-primary)]">{company}</strong>
    </p>
    <div class="!mt-8 flex items-center gap-8 !text-[1.5rem] opacity-70">
{socials}
    </div>
    <p class="!mt-10 !text-[1.75rem] !leading-relaxed opacity-70 !m-0">
{bio}
    </p>
  </div>
</div>"""

HOUSEKEEPING_AND_AGENDA = """<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>"""

LIST_SLIDE = """# {heading}

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
{items}
</ul>

</div>

<style scoped>
.zoom-content {{ zoom: 1.8; }}
</style>"""

HOUSEKEEPING_ITEMS = [
    "Be chatty in the chat tab",
    "Ask questions in the Q&amp;A tab",
    "The handouts tab has slides and scripts",
    "The recording link comes by email",
]

DEMO_DIVIDER = """<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: {demo_title}.</h1>
  </div>
</div>

<style scoped>
.sec { position: absolute; inset: 0; overflow: hidden; }
.sec__lines { position: absolute; width: 30rem; height: auto; opacity: 0.55; pointer-events: none; }
.sec__lines--tr { top: 0; right: 0; }
.sec__lines--bl { bottom: 0; left: 0; }
.sec__inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 0 5rem; }
.sec__inner h1 { text-wrap: balance; }
</style>"""

RESOURCES = """# Resources

<div class="zoom-content">

<div class="grid grid-cols-{cols} gap-5 mt-4">
{cards}
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
.res-card { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.4rem; }
.res-card .qr-code { width: 9rem; height: 9rem; background: #ffffff; padding: 0.45rem; border-radius: 10px; box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18); }
.res-card__title { font-size: 1.15rem; font-weight: 600; color: var(--p-fg); margin-top: 0.4rem; }
.res-card__body { font-family: var(--slidev-font-mono); font-size: 0.8rem; color: var(--p-fg-muted); line-height: 1.4; word-break: break-all; }
</style>"""

RESOURCE_CARD = """  <div class="res-card">
    <QRCode data="{url}" dark="#000000" />
    <div class="res-card__title">{title}</div>
    <div class="res-card__body">{label}</div>
  </div>"""

CONTINUE_JOURNEY = """# Continue your Pulumi journey!

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-6">
  <div class="gpu-card gpu-card--primary journey-card" v-click>
    <div class="journey-card__title">Join the Pulumi Community Slack!</div>
    <p class="journey-card__body">
      <a class="text-[var(--p-primary)]" href="https://slack.pulumi.com/">slack.pulumi.com</a>
    </p>
  </div>
  <div class="gpu-card gpu-card--primary journey-card" v-click>
    <div class="journey-card__title">Sign up for a Pulumi Cloud account!</div>
    <p class="journey-card__body">
      Sign up to follow along
    </p>
  </div>
  <div class="gpu-card gpu-card--accent journey-card" v-click>
    <div class="journey-card__title">Join us for our next workshops!</div>
    <p class="journey-card__body">
      Link in the <strong>Handouts</strong> tab
    </p>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.45; }
.journey-card { display: flex; flex-direction: column; }
.journey-card__title { font-size: 1.5rem; font-weight: 600; line-height: 1.25; margin-bottom: 0.9rem; color: var(--p-fg); }
.journey-card__body { font-size: 1.15rem; line-height: 1.55; margin: 0 !important; color: var(--p-fg); }
</style>"""

THANKS = """<div class="absolute inset-0 flex flex-col justify-center items-center px-16">
  <div class="thanks__kicker">Thank you</div>
  <h1 class="!text-[4.5rem] !leading-[1.02] !font-semibold !tracking-tight !mt-3 !mb-12 text-center">Questions?</h1>
  <div class="thanks">
{people}
    <div class="thanks__person">
      <div class="thanks__avatar thanks__avatar--icon"><carbon-logo-github /></div>
      <div class="thanks__name">Workshop repo</div>
      <div class="thanks__org">slides · demo</div>
      <div class="thanks__handles">
        <span>pulumi/workshops</span>
      </div>
      <div class="thanks__qr"><QRCode data="{repo}" dark="#000000" /></div>
      <div class="thanks__qr-label">{slug}</div>
    </div>
  </div>
</div>

<style scoped>
.thanks__kicker { font-family: var(--slidev-font-mono); font-size: 1.15rem; font-weight: 700; letter-spacing: 0.6em; text-transform: uppercase; color: var(--p-fg-muted); }
.thanks { display: grid; grid-template-columns: repeat({cols}, 1fr); gap: 2.5rem; justify-items: center; }
.thanks__person { display: flex; flex-direction: column; align-items: center; text-align: center; height: 100%; }
.thanks__avatar { width: 7rem; height: 7rem; border-radius: 9999px; object-fit: cover; border: 3px solid color-mix(in srgb, var(--p-primary) 45%, transparent); }
.thanks__avatar--icon { display: flex; align-items: center; justify-content: center; font-size: 3.6rem; color: var(--p-fg); background: var(--p-bg-elevated); }
.thanks__name { margin-top: 0.9rem; font-size: 1.45rem; font-weight: 700; color: var(--p-fg); }
.thanks__org { font-size: 1.1rem; color: var(--p-fg-muted); }
.thanks__handles { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 0.15rem; margin-top: 0.5rem; min-height: 3rem; font-size: 1rem; color: var(--p-fg-muted); }
.thanks__handles span { display: inline-flex; align-items: center; gap: 0.35rem; }
.thanks__qr { width: 8rem; height: 8rem; margin-top: 1.1rem; padding: 0.45rem; background: #ffffff; border-radius: 10px; box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18); }
.thanks__qr-label { display: inline-flex; align-items: center; gap: 0.35rem; margin-top: 0.55rem; font-family: var(--slidev-font-mono); font-size: 0.85rem; color: var(--p-fg-muted); }
</style>"""

THANKS_PERSON = """    <div class="thanks__person">
      <img class="thanks__avatar" src="{avatar}" alt="{name}" />
      <div class="thanks__name">{name}</div>
      <div class="thanks__org">{company}</div>
      <div class="thanks__handles">
{handles}
      </div>
      <div class="thanks__qr"><QRCode data="{qr_url}" dark="#000000" /></div>
      <div class="thanks__qr-label"><carbon-logo-{qr_icon} />{qr_label}</div>
    </div>"""

PACKAGE_JSON = {
    "name": "{slug}-slides",
    "version": "0.1.0",
    "description": "{title}: {subtitle}",
    "type": "module",
    "private": True,
    "scripts": {
        "dev": "slidev slides.md --open",
        "build": "slidev build slides.md",
        "export": "slidev export slides.md",
    },
    "devDependencies": {
        "@pulumi/slidev-theme": "latest",
        "@slidev/cli": "^0.50.0",
        "@slidev/client": "^0.50.0",
        "@slidev/types": "^0.50.0",
        "mermaid": "^11.4.0",
        "playwright-chromium": "^1.63.0",
        "qrcode": "^1.5.4",
        "vue": "^3.5.13",
    },
}
REQUIRED_DEPS = ["@pulumi/slidev-theme", "@slidev/cli", "qrcode", "playwright-chromium", "mermaid"]
ASSET_FILES = ["style.css", "components/QRCode.vue", "public/lines/bg-top-right-1.svg",
               "public/lines/bg-bottom-left-1.svg"]


# The standard files a deck needs, embedded so this script is the only file to deliver.
# style.css, QRCode.vue and the line graphics are copied verbatim from the reference deck
# (pulumi/workshops@1e5db0257b, neo-in-a-docker-sandbox/slides/).
ASSET_TEXT = {
    'style.css': "/*\n * GKE workshop — global style overlay on top of @pulumi/slidev-theme.\n *   - Global +40% font-size bump (1rem becomes 1.4x via 22.4px html base).\n *   - Pulumi `default` layout reflowed so h1 pins top, body centers vertically.\n *   - Code blocks restyled as rounded card frames.\n *   - Reusable .gpu-card / .gpu-caption primitives.\n *   - Shared callout primitives: .big-code, .info-card, .wi-mermaid.\n */\n\n/* ── Global scale +40% over default 16px ──────────────────────────── */\nhtml {\n  font-size: 22.4px;\n}\n\n/* ── Pulumi default layout: h1 pinned top, body centered ──────────── */\n/* Mirrors theme-foundry's positioning so titles sit at the same vertical\n * spot across both decks:\n *   - h1: 56px from top of slide, 80px from each side\n *   - body: ~150px top / 80px bottom padding so content sits visually centered\n * The Pulumi default.vue already adds an 8px accent bar on top, and the\n * inner .pulumi-slide-body has `padding: 2.5rem 3.5rem 0` (≈ 56/78px).\n * We push the inner body's padding to reserve room for the absolute h1. */\n.slidev-layout .pulumi-slide-body {\n  display: flex !important;\n  flex-direction: column !important;\n  justify-content: center !important;\n  padding-top: 6.7rem !important;   /* ≈ 150px @ 22.4px base */\n  padding-bottom: 3.6rem !important; /* ≈ 80px */\n  position: relative !important;\n}\n\n.slidev-layout.default .pulumi-slide-body > h1:first-child,\n.pulumi-slide-body > h1:first-child {\n  position: absolute;\n  top: 2.15rem;   /* ≈ 48px from top of body = 56px from slide top (8px accent bar) */\n  left: 3.5rem;   /* matches body's horizontal padding so title aligns with content */\n  right: 3.5rem;\n  margin: 0 0 0.55rem; /* ≈ 12px below — matches foundry */\n}\n\n/* ── Headings (Pulumi spec: Inter Semibold, -5% letter, 110% line) ── */\n.slidev-layout h1 {\n  font-weight: 600;\n  font-size: 3.1rem;\n  letter-spacing: -0.05em;\n  line-height: 1.1;\n  margin: 0 0 0.5rem;\n}\n\n.slidev-layout h2 {\n  color: var(--p-primary);\n  font-weight: 600;\n  font-size: 1.45rem;\n  letter-spacing: 0.04em;\n  line-height: 1.1;\n  text-transform: uppercase;\n  margin: 0 0 1rem;\n}\n\n.slidev-layout h3 {\n  font-weight: 600;\n  font-size: 1.75rem;\n  letter-spacing: -0.05em;\n  line-height: 1.1;\n  margin: 0 0 0.5rem;\n}\n\n/* ── Body text ────────────────────────────────────────────────────── */\n.slidev-layout p,\n.slidev-layout li {\n  font-size: 1.35rem;\n  line-height: 1.3;\n  letter-spacing: 0;\n  color: var(--p-fg);\n}\n\n.slidev-layout li { margin: 0 0 0.4rem; }\n\n/* ── Inline code (in body copy) ───────────────────────────────────── */\n.slidev-layout code:not(pre code) {\n  font-family: var(--slidev-font-mono);\n  font-size: 0.9em;\n  background-color: var(--p-bg-elevated);\n  color: var(--p-primary);\n  padding: 0.1em 0.4em;\n  border-radius: 5px;\n}\n\n/* ── Code blocks (Foundry-style rounded card frame) ───────────────── */\n.slidev-layout pre,\n.slidev-layout pre.shiki,\n.slidev-layout .shiki {\n  font-family: var(--slidev-font-mono) !important;\n  background-color: var(--p-bg-elevated) !important;\n  border: 1px solid var(--p-border);\n  border-radius: 12px;\n  padding: 1.05rem 1.35rem;\n  font-size: 0.95rem;\n  line-height: 1.55;\n  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.18);\n  overflow: auto;\n}\n\n/* ── Reusable card primitives (Pulumi-toned .foundry-card) ────────── */\n.gpu-card {\n  background: var(--p-bg-elevated);\n  border: 1.5px solid var(--p-border);\n  border-radius: 16px;\n  padding: 1.5rem 1.75rem;\n  min-width: 0;\n  overflow: hidden;\n}\n\n.gpu-card--accent  { border-color: color-mix(in srgb, var(--p-accent)  60%, var(--p-border)); }\n.gpu-card--primary { border-color: color-mix(in srgb, var(--p-primary) 60%, var(--p-border)); }\n.gpu-card--muted   { border-color: var(--p-border); background: transparent; }\n\n/* Foundry-style overline caption — mono, uppercase, tracked */\n.gpu-caption {\n  font-family: var(--slidev-font-mono);\n  font-size: 1rem;\n  font-weight: 700;\n  color: var(--p-fg-muted);\n  text-transform: uppercase;\n  letter-spacing: 0.06em;\n  line-height: 1;\n}\n.gpu-caption--accent  { color: var(--p-primary); }\n.gpu-caption--muted   { color: var(--p-fg-muted); }\n\n/* ── Larger code blocks (used on slides where the snippet is the centerpiece) ── */\n.big-code pre,\n.big-code .shiki,\n.big-code pre.shiki,\n.big-code code {\n  font-size: 1.05rem !important;\n  line-height: 1.55 !important;\n}\n.big-code pre,\n.big-code pre.shiki {\n  padding: 1.1rem 1.3rem !important;\n}\n\n/* ── Info-card callout (Pulumi-purple left border + uppercase label) ── */\n.info-card {\n  margin-top: 1.4rem;\n  padding: 0.9rem 1.25rem;\n  background: rgba(126, 107, 255, 0.08);\n  border-left: 4px solid var(--p-primary);\n  border-radius: 6px;\n  font-size: 1.15rem;\n  line-height: 1.55;\n}\n.info-card__label {\n  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;\n  font-weight: 600;\n  font-size: 0.95rem;\n  color: var(--p-primary);\n  letter-spacing: 0.04em;\n  margin-bottom: 0.35rem;\n  text-transform: uppercase;\n}\n.info-card p,\n.info-card ul {\n  margin: 0 !important;\n  color: var(--p-fg);\n}\n.info-card ul { padding-left: 1.1rem; }\n.info-card li { margin: 0.25rem 0; }\n.info-card strong { color: var(--p-primary); }\n\n/* ── Mermaid container — clip overflow + soft drop-shadow ──────────── */\n.wi-mermaid {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-width: 0;\n  overflow: hidden;\n}\n.wi-mermaid svg {\n  width: 100% !important;\n  max-width: 100% !important;\n  height: auto !important;\n  filter: drop-shadow(0 6px 18px rgba(126, 107, 255, 0.18));\n}\n\n/* ── Denser code blocks for slides whose snippet must fit half a column ── */\n.code-sm pre, .code-sm .shiki, .code-sm pre.shiki, .code-sm code {\n  font-size: 0.85rem !important;\n  line-height: 1.45 !important;\n}\n.code-xs pre, .code-xs .shiki, .code-xs pre.shiki, .code-xs code {\n  font-size: 0.72rem !important;\n  line-height: 1.4 !important;\n}\n.code-sm pre, .code-sm pre.shiki, .code-xs pre, .code-xs pre.shiki {\n  padding: 0.9rem 1.1rem !important;\n}\n",
    'components/QRCode.vue': '<script setup>\nimport { ref, watchEffect } from \'vue\'\nimport QRCode from \'qrcode\'\n\nconst props = defineProps({\n  data: { type: String, required: true },\n  // Module colour. Defaults to the deck\'s primary; pass a hex to override\n  // (the closing slide uses black on white, like the DevOps skills deck).\n  dark: { type: String, default: \'\' },\n})\n\nconst svg = ref(\'\')\n\nwatchEffect(async () => {\n  const root = getComputedStyle(document.documentElement)\n  const dark = props.dark || root.getPropertyValue(\'--p-primary\').trim() || \'#5a30c5\'\n  svg.value = await QRCode.toString(props.data, {\n    type: \'svg\',\n    margin: 1,\n    color: { dark, light: \'#ffffff\' },\n  })\n})\n</script>\n\n<template>\n  <div class="qr-code" v-html="svg" />\n</template>\n\n<style scoped>\n.qr-code {\n  width: 100%;\n  height: 100%;\n  display: flex;\n}\n.qr-code :deep(svg) {\n  width: 100%;\n  height: 100%;\n  display: block;\n}\n</style>\n',
    'public/lines/bg-top-right-1.svg': '<svg width="250" height="200" viewBox="0 0 250 200" fill="none" xmlns="http://www.w3.org/2000/svg">\n<g clip-path="url(#clip0_15_1124)">\n<mask id="mask0_15_1124" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="-10" width="358" height="199">\n<rect x="358" y="188.5" width="358" height="198" transform="rotate(180 358 188.5)" fill="url(#paint0_linear_15_1124)"/>\n</mask>\n<g mask="url(#mask0_15_1124)">\n<path d="M509.784 78.0689L110.712 78.0689C103.969 78.0689 98.4999 83.5417 98.4999 90.2935L98.5 438.315" stroke="#9077F3" stroke-miterlimit="10"/>\n<path d="M510.357 87.6117L117.911 87.6117C112.705 87.6117 108.471 91.8452 108.471 97.0602L108.471 442.327" stroke="#9077F3" stroke-miterlimit="10"/>\n<path d="M508.638 97.1642L125.101 97.1643C121.417 97.1643 118.437 100.149 118.437 103.837L118.437 435.449" stroke="#9077F3" stroke-miterlimit="10"/>\n<path d="M522.969 106.702L132.3 106.702C130.153 106.702 128.408 108.447 128.408 110.598L128.408 440.607" stroke="#9077F3" stroke-miterlimit="10"/>\n<path d="M551.632 68.0901L89.9256 68.0901C84.4021 68.0901 79.1067 65.8941 75.1996 61.9927L-43.9615 -57.145" stroke="#9077F3" stroke-miterlimit="10"/>\n<path d="M552.779 58.1755L92.2907 58.1756C87.7936 58.1756 83.48 56.391 80.3017 53.2084L-39.9899 -67.0596" stroke="#9077F3" stroke-miterlimit="10"/>\n<path d="M554.499 48.261L94.6508 48.2611C91.1801 48.2611 87.8482 46.883 85.3938 44.4291L-36.0332 -76.9741" stroke="#9077F3" stroke-miterlimit="10"/>\n<path d="M555.072 38.3465L97.0159 38.3465C94.5715 38.3465 92.2263 37.3749 90.4959 35.6448L-32.0616 -86.8886" stroke="#9077F3" stroke-miterlimit="10"/>\n</g>\n</g>\n<defs>\n<linearGradient id="paint0_linear_15_1124" x1="537" y1="188.5" x2="537" y2="220.104" gradientUnits="userSpaceOnUse">\n<stop stop-opacity="0"/>\n<stop offset="1"/>\n</linearGradient>\n<clipPath id="clip0_15_1124">\n<rect width="250" height="200" fill="white" transform="translate(250 200) rotate(180)"/>\n</clipPath>\n</defs>\n</svg>\n',
    'public/lines/bg-bottom-left-1.svg': '<svg width="250" height="200" viewBox="0 0 250 200" fill="none" xmlns="http://www.w3.org/2000/svg">\n<g clip-path="url(#clip0_15_1085)">\n<mask id="mask0_15_1085" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="-108" y="11" width="358" height="199">\n<rect x="-108" y="11.4999" width="358" height="198" fill="url(#paint0_linear_15_1085)"/>\n</mask>\n<g mask="url(#mask0_15_1085)">\n<path d="M-259.784 121.931L139.288 121.931C146.031 121.931 151.5 116.458 151.5 109.707L151.5 -238.315" stroke="#9077F3" stroke-miterlimit="10"/>\n<path d="M-260.357 112.388L132.089 112.388C137.295 112.388 141.529 108.155 141.529 102.94L141.529 -242.327" stroke="#9077F3" stroke-miterlimit="10"/>\n<path d="M-258.638 102.836L124.899 102.836C128.583 102.836 131.563 99.8515 131.563 96.1633L131.563 -235.449" stroke="#9077F3" stroke-miterlimit="10"/>\n<path d="M-272.969 93.2981L117.7 93.298C119.847 93.298 121.592 91.5531 121.592 89.4016L121.592 -240.607" stroke="#9077F3" stroke-miterlimit="10"/>\n<path d="M-301.632 131.91L160.075 131.91C165.598 131.91 170.893 134.106 174.8 138.007L293.962 257.145" stroke="#9077F3" stroke-miterlimit="10"/>\n<path d="M-302.779 141.825L157.709 141.824C162.207 141.824 166.52 143.609 169.698 146.792L289.99 267.06" stroke="#9077F3" stroke-miterlimit="10"/>\n<path d="M-304.499 151.739L155.349 151.739C158.82 151.739 162.152 153.117 164.606 155.571L286.033 276.974" stroke="#9077F3" stroke-miterlimit="10"/>\n<path d="M-305.072 161.654L152.984 161.654C155.429 161.654 157.774 162.625 159.504 164.355L282.062 286.889" stroke="#9077F3" stroke-miterlimit="10"/>\n</g>\n</g>\n<defs>\n<linearGradient id="paint0_linear_15_1085" x1="71" y1="11.4999" x2="71" y2="43.1038" gradientUnits="userSpaceOnUse">\n<stop stop-opacity="0"/>\n<stop offset="1"/>\n</linearGradient>\n<clipPath id="clip0_15_1085">\n<rect width="250" height="200" fill="white"/>\n</clipPath>\n</defs>\n</svg>\n',
    'public/img/speaker-placeholder.svg': '<svg xmlns="http://www.w3.org/2000/svg" width="560" height="560" viewBox="0 0 560 560">\n  <rect width="560" height="560" fill="#ecebf7"/>\n  <circle cx="280" cy="215" r="105" fill="#b9b3e6"/>\n  <path d="M90 520c18-120 98-180 190-180s172 60 190 180z" fill="#b9b3e6"/>\n</svg>\n',
}


class ConfigError(Exception):
    pass


def load_config(path):
    cfg = json.loads(Path(path).read_text())
    for key in ("slug", "title", "subtitle", "demo_title", "speakers", "agenda", "resources"):
        if not cfg.get(key):
            raise ConfigError(f"frame.json: '{key}' is missing or empty")
    if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", cfg["slug"]):
        raise ConfigError("frame.json: 'slug' must be kebab-case (the workshop folder name)")
    speakers = []
    for i, s in enumerate(cfg["speakers"]):
        if s.get("placeholder"):
            s = dict(PLACEHOLDER_SPEAKER)
        for key in ("name", "role", "company", "avatar", "bio", "qr"):
            if not s.get(key):
                raise ConfigError(f"frame.json: speaker {i + 1} has no '{key}' (or set \"placeholder\": true)")
        if not any(s.get(k) for k in ("x", "linkedin", "github")):
            raise ConfigError(f"frame.json: speaker {i + 1} needs at least one of x, linkedin, github")
        for key in ("url", "label", "icon"):
            if not s["qr"].get(key):
                raise ConfigError(f"frame.json: speaker {i + 1} qr needs '{key}'")
        if s["qr"]["icon"] not in ("linkedin", "github", "x"):
            raise ConfigError(f"frame.json: speaker {i + 1} qr icon must be linkedin, github or x")
        if isinstance(s["bio"], str):
            s["bio"] = [s["bio"]]
        speakers.append(s)
    if not 1 <= len(speakers) <= 4:
        raise ConfigError("frame.json: 1 to 4 speakers")
    if not 4 <= len(cfg["agenda"]) <= 6:
        raise ConfigError("frame.json: the agenda has 4 to 6 items")
    if not 2 <= len(cfg["resources"]) <= 4:
        raise ConfigError("frame.json: 2 to 4 resources (the workshop repo is added as the first card)")
    for i, r in enumerate(cfg["resources"]):
        for key in ("title", "url", "label"):
            if not r.get(key):
                raise ConfigError(f"frame.json: resource {i + 1} has no '{key}'")
        if not r["url"].startswith("https://"):
            raise ConfigError(f"frame.json: resource {i + 1} url must start with https://")
        if r["url"].rstrip("/") in (REPO.format(slug=cfg["slug"]).rstrip("/"),
                                     "https://github.com/pulumi/workshops",
                                     "https://github.com/pulumi/workshops/tree/main"):
            raise ConfigError(f"frame.json: resource {i + 1} is the workshop repo; leave it out, "
                              "the tool adds the repo card first")
    cfg["speakers"] = speakers
    cfg["repo"] = REPO.format(slug=cfg["slug"])
    return cfg


def render(cfg):
    """Return the frame as (opening, demo_divider, closing) lists of slide bodies, plus the headmatter."""
    sp = cfg["speakers"]
    headmatter = HEADMATTER.format(
        title=cfg["title"], subtitle=cfg["subtitle"], repo=cfg["repo"],
        speaker_names=", ".join(s["name"] for s in sp))
    lines = [f"    {s['name']} · {s['role']}, {s['company']}" for s in sp]
    title = TITLE.format(title=cfg["title"], subtitle=cfg["subtitle"],
                         speaker_lines="<br/>\n".join(lines))
    speakers = []
    for s in sp:
        socials = []
        for key, icon in (("x", "x"), ("linkedin", "linkedin"), ("github", "github")):
            if s.get(key):
                socials.append(f'      <span class="flex items-center gap-2"><carbon-logo-{icon} /> {s[key]}</span>')
        bio = "<br/>\n".join(f"      {b}" for b in s["bio"])
        speakers.append(SPEAKER.format(avatar=s["avatar"], name=s["name"], role=s["role"],
                                       company=s["company"], socials="\n".join(socials), bio=bio))
    housekeeping = LIST_SLIDE.format(heading="Housekeeping",
                                     items="\n".join(f"  <li>{i}</li>" for i in HOUSEKEEPING_ITEMS))
    agenda = LIST_SLIDE.format(heading="Today's Agenda",
                               items="\n".join(f"  <li>{i}</li>" for i in cfg["agenda"]))
    opening = [title] + speakers + [HOUSEKEEPING_AND_AGENDA, housekeeping, agenda]
    divider = DEMO_DIVIDER.replace("{demo_title}", cfg["demo_title"])
    cards = [RESOURCE_CARD.format(url=cfg["repo"], title="Workshop repo",
                                  label=f"pulumi/workshops → {cfg['slug']}")]
    cards += [RESOURCE_CARD.format(**r) for r in cfg["resources"]]
    resources = RESOURCES.replace("{cols}", str(len(cards))).replace("{cards}", "\n".join(cards))
    people = []
    for s in sp:
        handles = []
        if s.get("x"):
            handles.append(f"        <span><carbon-logo-x />{s['x']}</span>")
        if s.get("github"):
            handles.append(f"        <span><carbon-logo-github />{s['github']}</span>")
        if not handles and s.get("linkedin"):
            handles.append(f"        <span><carbon-logo-linkedin />{s['linkedin']}</span>")
        people.append(THANKS_PERSON.format(avatar=s["avatar"], name=s["name"], company=s["company"],
                                           handles="\n".join(handles), qr_url=s["qr"]["url"],
                                           qr_icon=s["qr"]["icon"], qr_label=s["qr"]["label"]))
    thanks = (THANKS.replace("{people}", "\n".join(people)).replace("{repo}", cfg["repo"])
              .replace("{slug}", cfg["slug"]).replace("{cols}", str(len(sp) + 1)))
    closing = [resources, CONTINUE_JOURNEY, thanks]
    return headmatter, opening, divider, closing


def assemble(headmatter, opening, divider, closing, story=None, demo=None):
    """Join slides into a Slidev file. story and demo are lists of (frontmatter, body)."""
    story = story or [("", f"# Story slides go here\n\n{STORY_MARKER}")]
    demo = demo or [("", f"# Demo slides go here\n\n{DEMO_MARKER}")]
    frame = lambda bodies: [("", b) for b in bodies]
    slides = frame(opening) + list(story) + frame([divider]) + list(demo) + frame(closing)
    out = f"---\n{headmatter.strip()}\n---\n\n{slides[0][1].strip()}\n"
    for fm, body in slides[1:]:
        if fm.strip():
            out += f"\n---\n{fm.strip()}\n---\n\n{body.strip()}\n"
        else:
            out += f"\n---\n\n{body.strip()}\n"
    return out


# ----------------------------------------
# Parsing slides.md
# ----------------------------------------

YAML_LINE = re.compile(r"^([A-Za-z_][\w-]*\s*:.*|\s+.*|-\s.*|)$")


def split_slides(text):
    """Split a Slidev file into (headmatter, [slide, ...]); a slide is (frontmatter, body)."""
    chunks, cur, fence = [], [], None
    for line in text.split("\n"):
        m = re.match(r"^\s*(`{3,}|~{3,})", line)
        if m:
            fence = None if fence and m.group(1)[0] == fence[0] else (fence or m.group(1))
        if fence is None and re.fullmatch(r"---\s*", line):
            chunks.append("\n".join(cur))
            cur = []
        else:
            cur.append(line)
    chunks.append("\n".join(cur))
    headmatter = ""
    if chunks and chunks[0].strip() == "" and len(chunks) > 2:
        headmatter = chunks[1]
        chunks = chunks[2:]
    slides, i = [], 0
    while i < len(chunks):
        c = chunks[i]
        is_yaml = c.strip() != "" and all(YAML_LINE.match(l) for l in c.strip("\n").split("\n")) \
            and re.search(r"^[A-Za-z_][\w-]*\s*:", c.strip(), re.M)
        if is_yaml and i + 1 < len(chunks) and not c.lstrip().startswith(("#", "<")):
            slides.append((c, chunks[i + 1]))
            i += 2
        else:
            slides.append(("", c))
            i += 1
    if slides and slides[-1] == ("", "") or (slides and not slides[-1][0] and not slides[-1][1].strip()):
        slides.pop()
    return headmatter, slides


def norm(text):
    text = re.sub(r"<!--.*?-->", "", text, flags=re.S)
    lines = [l.rstrip() for l in text.strip("\n").split("\n")]
    out = []
    for l in lines:
        if l == "" and out and out[-1] == "":
            continue
        out.append(l)
    return "\n".join(out).strip("\n")


def diff(expected, actual, name):
    d = difflib.unified_diff(norm(expected).split("\n"), norm(actual).split("\n"),
                             fromfile=f"{name} (expected)", tofile=f"{name} (slides.md)", lineterm="", n=1)
    return "\n".join(list(d)[:24])


# ----------------------------------------
# The look of the story and demo slides: patterns in deck_patterns.json, rules below.
# ----------------------------------------

PATTERNS_FILE = "deck_patterns.json"  # next to this script; a byte-identical copy is in the knowledge base


def load_patterns():
    path = Path(__file__).with_name(PATTERNS_FILE)
    if not path.exists():
        raise ConfigError(f"{path} is missing: copy tools/{PATTERNS_FILE} from the knowledge base next to "
                          "deck_frame.py, byte for byte, and check its SHA-256 as workshop-deck says")
    return json.loads(path.read_text())


STYLE_LAYOUTS = ("", "default", "image", "image-left", "image-right")
# Theme layout -> the pattern that replaces it.
LAYOUT_PATTERN = {
    "statement": "big-statement", "fact": "big-statement", "center": "big-statement",
    "quote": "big-quote", "section": "section-opener", "intro": "section-opener",
    "two-cols": "compare", "two-cols-header": "compare",
    "diagram": "flow", "diagram-left": "flow", "diagram-right": "flow",
    "code": "terminal or demo-step", "cover": "section-opener", "end": "big-statement",
}
STYLE_VOCAB = re.compile(r'gpu-card|info-card|res-card|class="term|big-code|<ph-[a-z0-9-]+')
STYLE_STATEMENT = re.compile(r'class="absolute inset-0 flex[^"]*justify-center|class="sec"')
STYLE_SIZED = re.compile(r"zoom-content|zoom:\s*[\d.]+|!text-\[\d")


def style_problems(fm, body):
    """Return what keeps a story or demo slide from looking like the reference deck."""
    m = re.search(r"^\s*layout:\s*(\S+)", fm, re.M)
    layout = m.group(1) if m else ""
    text = re.sub(r"<!--.*?-->", "", body, flags=re.S)
    problems = []
    if layout not in STYLE_LAYOUTS:
        instead = LAYOUT_PATTERN.get(layout, "a pattern from deck_frame.py patterns")
        problems.append(f"layout: {layout} is a theme layout, not a pattern; copy the markup of {instead} instead")
    if "```mermaid" in text:
        problems.append("mermaid diagram (use the flow or chain pattern)")
    if layout.startswith("image") or STYLE_STATEMENT.search(text):
        return problems
    if not STYLE_VOCAB.search(text):
        problems.append("plain slide: no pattern (cards, icons, terminal or big-code)")
    if re.search(r"^#\s", text, re.M) and not STYLE_SIZED.search(text):
        problems.append("not scaled: wrap the body in zoom-content")
    if re.search(r"^\s*```", text, re.M) and not re.search(r"big-code|zoom-content|zoom:", text):
        problems.append("code outside big-code or zoom-content")
    # Icon lists are flex rows: inline code or bold after the icon must sit inside one <span>.
    if re.search(r"<li>\s*<ph-[a-z0-9-]+[^>]*/>\s*(?!<span)[^<]*<(code|strong|em|b|a|kbd)\b", text):
        problems.append("icon list item with inline markup: wrap the text after the icon in <span>...</span>")
    return problems


# ----------------------------------------
# Commands
# ----------------------------------------

def cmd_init(slides_dir, config, frame_only=False):
    slides_dir = Path(slides_dir)
    cfg = load_config(config)
    slides_dir.mkdir(parents=True, exist_ok=True)
    if Path(config).resolve() != (slides_dir / "frame.json").resolve():
        shutil.copyfile(config, slides_dir / "frame.json")
    head, opening, divider, closing = render(cfg)
    target = slides_dir / "slides.md"
    story = demo = None
    if frame_only and target.exists():
        # keep the story and demo slides that are already there
        _, slides = split_slides(target.read_text())
        bodies = [(fm, b) for fm, b in slides]
        n_open = len(opening)
        idx = next((i for i, (_, b) in enumerate(bodies) if re.search(r'class="sec__inner"', b)
                    and re.search(r">Demo[: ]", b)), None)
        if idx is None or len(bodies) < n_open + 4:
            raise ConfigError("--frame-only: cannot find the demo divider in the existing slides.md")
        story = bodies[n_open:idx]
        demo = bodies[idx + 1:len(bodies) - 3]
    target.write_text(assemble(head, opening, divider, closing, story, demo))
    for rel, text in ASSET_TEXT.items():
        dst = slides_dir / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_text(text)
    pkg = json.loads(json.dumps(PACKAGE_JSON).replace("{slug}", cfg["slug"])
                     .replace("{title}", cfg["title"].replace('"', "'"))
                     .replace("{subtitle}", cfg["subtitle"].replace('"', "'")))
    pj = slides_dir / "package.json"
    if pj.exists():
        old = json.loads(pj.read_text())
        old.setdefault("devDependencies", {}).update(
            {k: v for k, v in pkg["devDependencies"].items() if k not in old["devDependencies"]})
        old["scripts"] = pkg["scripts"]
        pkg = old
    pj.write_text(json.dumps(pkg, indent=2) + "\n")
    print(f"wrote {target} ({len(opening)} opening slides, demo divider, {len(closing)} closing slides)")
    print("assets: " + ", ".join(ASSET_FILES + ["public/img/speaker-placeholder.svg", "package.json"]))
    missing = [s["avatar"] for s in cfg["speakers"] if not (slides_dir / "public" / s["avatar"].lstrip("/")).exists()]
    if missing:
        print("put these speaker photos under public/: " + ", ".join(missing))
    print("next: replace the STORY and DEMO marker slides, then run: deck_frame.py check " + str(slides_dir))


def cmd_check(slides_dir, as_json=False):
    slides_dir = Path(slides_dir)
    results, warnings = [], []

    def ok(name, passed, detail=""):
        results.append({"check": name, "passed": bool(passed), "detail": detail})

    cfg_path = slides_dir / "frame.json"
    md_path = slides_dir / "slides.md"
    if not cfg_path.exists() or not md_path.exists():
        ok("frame.json and slides.md exist", False,
           "run deck_frame.py init first; the frame is generated, never written by hand")
        return report(results, warnings, as_json)
    try:
        cfg = load_config(cfg_path)
    except (ConfigError, json.JSONDecodeError) as e:
        ok("frame.json is valid", False, str(e))
        return report(results, warnings, as_json)
    ok("frame.json is valid", True)
    head, opening, divider, closing = render(cfg)
    actual_head, slides = split_slides(md_path.read_text())

    ok("headmatter matches the standard (theme, 1920 canvas, 16/9, info)",
       norm(actual_head) == norm(head), diff(head, actual_head, "headmatter"))

    names = (["title slide"] + [f"speaker slide {i + 1} ({s['name']})" for i, s in enumerate(cfg["speakers"])]
             + ["Housekeeping and Agenda divider", "Housekeeping", "Today's Agenda"])
    for i, (name, exp) in enumerate(zip(names, opening)):
        act = slides[i][1] if i < len(slides) else ""
        fm = slides[i][0] if i < len(slides) else ""
        ok(f"slide {i + 1} is the {name}, exactly as the standard",
           norm(exp) == norm(act) and not fm.strip(), diff(exp, act, name))

    idx = [i for i, (_, b) in enumerate(slides) if norm(b) == norm(divider)]
    ok('one "Demo: …" divider slide, exactly as the standard', len(idx) == 1,
       f"found {len(idx)}" + ("" if idx else "\n" + diff(divider, "", "demo divider")))
    d = idx[0] if idx else None
    n_open = len(opening)
    if d is not None:
        story = slides[n_open:d]
        demo = slides[d + 1:len(slides) - 3]
        ok(f"at least {MIN_STORY_SLIDES} story slides between the agenda and the demo divider",
           len(story) >= MIN_STORY_SLIDES, f"found {len(story)}")
        ok("at least 2 demo slides between the divider and Resources", len(demo) >= 2, f"found {len(demo)}")
        leftovers = [m for m in (STORY_MARKER, DEMO_MARKER) if any(m in b for _, b in slides)]
        ok("no STORY or DEMO marker slides left", not leftovers, "; ".join(leftovers))
        total = len(slides)
        ok("the demo is at most a quarter of the deck", (len(demo) + 1) * 4 <= total,
           f"{len(demo) + 1} demo slides (divider included) of {total}")
        positions = list(range(n_open, d)) + list(range(d + 1, len(slides) - 3))
        bad = [(i + 1, style_problems(*slides[i])) for i in positions]
        bad = [(i, probs) for i, probs in bad if probs]
        detail = "\n".join(f"slide {i}: " + "; ".join(probs) for i, probs in bad[:15])
        if len(bad) > 15:
            detail += f"\n... and {len(bad) - 15} more"
        ok("every story and demo slide looks like the reference (built from deck_frame.py patterns)",
           not bad, detail)
    # A stray "---" makes a blank page; an image- or iframe-only slide may have no body.
    empty = [i + 1 for i, (fm, b) in enumerate(slides)
             if not norm(b) and not re.search(r"^\s*(image|src|url)\s*:", fm, re.M)]
    ok("no empty slides (a stray --- makes a blank page)", not empty,
       "empty slide at position " + ", ".join(map(str, empty)) if empty else "")
    for j, (name, exp) in enumerate(zip(["Resources", "Continue your Pulumi journey!", "Thank you / Questions?"], closing)):
        k = len(slides) - 3 + j
        act = slides[k][1] if 0 <= k < len(slides) else ""
        ok(f"slide {k + 1} is {name}, exactly as the standard"
           + (" (and it is the last slide)" if j == 2 else ""), norm(exp) == norm(act), diff(exp, act, name))

    for rel in ASSET_FILES:
        f = slides_dir / rel
        ok(f"{rel} is the standard file", f.exists() and f.read_text() == ASSET_TEXT[rel],
           "missing" if not f.exists() else "differs from the standard: run deck_frame.py init --frame-only")
    for s in cfg["speakers"]:
        ok(f"photo {s['avatar']} exists under public/", (slides_dir / "public" / s["avatar"].lstrip("/")).exists())
    # One missing file puts a Vite error overlay on every page.
    refs = sorted({r for fm, b in slides for r in re.findall(r'(?:src="|image:\s*)(/[^"\s]+)', fm + "\n" + b)})
    missing = [r for r in refs if not (slides_dir / "public" / r.lstrip("/")).exists()]
    ok("every image the slides reference exists under public/", not missing, "missing: " + ", ".join(missing))
    try:
        deps = json.loads((slides_dir / "package.json").read_text()).get("devDependencies", {})
        deps.update(json.loads((slides_dir / "package.json").read_text()).get("dependencies", {}))
        ok("package.json has " + ", ".join(REQUIRED_DEPS), all(d in deps for d in REQUIRED_DEPS),
           "missing: " + ", ".join(d for d in REQUIRED_DEPS if d not in deps))
    except (OSError, json.JSONDecodeError) as e:
        ok("package.json is readable", False, str(e))

    placeholders = [s for s in cfg["speakers"] if s.get("placeholder")]
    if placeholders:
        warnings.append(f"{len(placeholders)} speaker(s) are placeholders: say so in the pull request")
    return report(results, warnings, as_json)


def report(results, warnings, as_json):
    failed = [r for r in results if not r["passed"]]
    if as_json:
        print(json.dumps({"passed": not failed, "results": results, "warnings": warnings}, indent=2))
    else:
        for r in results:
            print(("PASS " if r["passed"] else "FAIL ") + r["check"])
            if not r["passed"] and r["detail"]:
                print("\n".join("     " + l for l in r["detail"].split("\n")))
        for w in warnings:
            print("WARN " + w)
        print(f"\n{len(results) - len(failed)}/{len(results)} checks passed"
              + ("" if not failed else ". The deck does not ship until every check passes."))
    return 0 if not failed else 1


def cmd_patterns(name=None):
    data = load_patterns()
    PATTERNS, KNOWN_ICONS = data["patterns"], data["icons"]
    if name is None:
        print("Slide patterns from the reference deck (neo-in-a-docker-sandbox). Print one with:")
        print("  deck_frame.py patterns <name>\n")
        for key, pat in PATTERNS.items():
            print(f"  {key:<16} (reference slide {pat['slide']:>2})  {pat['description']}")
        print("\nIcons are Phosphor components, <ph-name />. These render in the reference deck:")
        print("  " + " ".join(i[3:] for i in KNOWN_ICONS))
        return 0
    if name not in PATTERNS:
        raise ConfigError(f"no pattern '{name}'. Patterns: " + ", ".join(PATTERNS))
    pat = PATTERNS[name]
    print(f"<!-- pattern: {name}, reference slide {pat['slide']}. {pat['description']} -->")
    print("---")
    if pat["frontmatter"]:
        print(pat["frontmatter"])
        print("---")
    print()
    print(pat["body"])
    return 0


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("example", help="print an example frame.json")
    pi = sub.add_parser("init", help="write the frame and its assets")
    pi.add_argument("slides_dir")
    pi.add_argument("config")
    pi.add_argument("--frame-only", action="store_true",
                    help="regenerate the frame slides and assets, keep the story and demo slides")
    pc = sub.add_parser("check", help="verify slides.md against frame.json")
    pc.add_argument("slides_dir")
    pc.add_argument("--json", action="store_true")
    pp = sub.add_parser("patterns", help="list the reference slide patterns, or print one")
    pp.add_argument("name", nargs="?")
    a = p.parse_args()
    try:
        if a.cmd == "example":
            print(json.dumps(EXAMPLE, indent=2, ensure_ascii=False))
            return 0
        if a.cmd == "init":
            cmd_init(a.slides_dir, a.config, a.frame_only)
            return 0
        if a.cmd == "patterns":
            return cmd_patterns(a.name)
        return cmd_check(a.slides_dir, a.json)
    except ConfigError as e:
        print(f"ERROR {e}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
