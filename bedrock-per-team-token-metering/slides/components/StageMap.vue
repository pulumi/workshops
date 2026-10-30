<script setup>
import { computed } from 'vue'
import { useNav, useSlideContext } from '@slidev/client'

// Stage strip: click to jump, finished stages struck through, current one lit.
//
// Boundaries come from the `routeAlias: stage-*` on the first slide of each section, so
// inserting or cutting slides never touches this file — only those slides carry
// position. Ported from extending-pulumi-neo (itself adapted from build-your-own-iac's ActNav).
//
//   size="lg"  on the map slide and the demo divider (prominent, names always shown)
//   size="sm"  in global-top.vue (corner strip on every other slide, only the current name shows)
const props = defineProps({
  size: { type: String, default: 'sm' },
  // Which slide to treat as "here". Defaults to the deck's current position, but
  // export renders every slide with nav stuck at 1 — so global-top passes the
  // slide's own $page and the strip stays correct in the PDF too.
  page: { type: Number, default: 0 },
})

const ORDER = ['map', 'who', 'what', 'stop', 'howfast', 'demo', 'wrap']

// Display names. Aliases must stay URL-safe, so multi-word stages get a label here.
const LABEL = { howfast: 'how fast' }
const nameOf = (stage) => LABEL[stage] ?? stage

const nav = useNav()
const { $page } = useSlideContext()

// [{ stage, start }] in deck order, derived from the dividers' routeAlias.
const stages = computed(() => {
  const out = []
  const list = nav.slides?.value ?? []
  list.forEach((s, i) => {
    const alias = s?.meta?.slide?.frontmatter?.routeAlias ?? ''
    const m = /^stage-(.+)$/.exec(alias)
    if (m && ORDER.includes(m[1])) out.push({ stage: m[1], start: i + 1 })
  })
  return out.length ? out : ORDER.map((stage, i) => ({ stage, start: i + 1 }))
})

const here = computed(() => {
  const n = props.page || $page?.value || nav.currentSlideNo?.value || 1
  let cur = null
  for (const s of stages.value) if (n >= s.start) cur = s.stage
  return cur
})

const stateOf = (stage) => {
  const h = here.value
  if (!h) return 'todo'
  return ORDER.indexOf(stage) < ORDER.indexOf(h) ? 'done'
    : stage === h ? 'now'
    : 'todo'
}
</script>

<template>
  <nav v-if="here" class="stage-map" :class="size" aria-label="Sections">
    <template v-for="(s, i) in stages" :key="s.stage">
      <span v-if="i" class="sep" aria-hidden="true">·</span>
      <button
        :class="stateOf(s.stage)"
        :aria-current="stateOf(s.stage) === 'now' ? 'true' : undefined"
        @click="nav.go(s.start)"
      >{{ nameOf(s.stage) }}</button>
    </template>
  </nav>
</template>

<style scoped>
.stage-map {
  display: flex;
  align-items: baseline;
  gap: 0.15rem;
  font-family: var(--slidev-font-mono, ui-monospace, monospace);
  letter-spacing: 0.06em;
}

button {
  background: none;
  border: 1px solid transparent;
  border-radius: 5px;
  padding: 1px 7px;
  cursor: pointer;
  color: var(--p-fg-muted);
  line-height: 1.5;
  transition: opacity .2s, color .2s, border-color .2s;
}
button:hover { border-color: var(--p-primary); color: var(--p-fg); opacity: 1; }
.sep { color: var(--p-fg-subtle); opacity: 0.5; }

/* done — struck through and faded. The strike is the cue, not the colour. */
button.done {
  opacity: 0.34;
  text-decoration: line-through;
  text-decoration-thickness: 1.5px;
}
/* now — lit and outlined */
button.now {
  color: var(--p-primary);
  border-color: var(--p-primary);
  opacity: 1;
  font-weight: 600;
}
/* todo — present but quiet */
button.todo { opacity: 0.55; }

/* prominent: on the section dividers */
.lg {
  position: absolute;
  bottom: 2.4rem;
  left: 0;
  right: 0;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.35rem;
  z-index: 10;
}
.lg button { padding: 3px 12px; }

/* corner: small and quiet. Only the current stage says its name; the others
   collapse to a marker. Shape carries the state, not colour — filled square for
   ground covered, hollow dot for still to come. */
.sm { font-size: 0.72rem; gap: 0.12rem; }
.sm button { padding: 0 4px; }
.sm button.done,
.sm button.todo {
  font-size: 0;
  padding: 0 3px;
  text-decoration: none;
}
.sm button.done::after,
.sm button.todo::after { font-size: 0.62rem; line-height: 1; }
.sm button.done::after { content: '\25AA'; }   /* ▪ covered */
.sm button.todo::after { content: '\25E6'; }   /* ◦ ahead */
.sm button.now { font-size: 0.72rem; }
.sm .sep { display: none; }
</style>
