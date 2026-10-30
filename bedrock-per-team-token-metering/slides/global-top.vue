<script setup>
import { computed, unref } from 'vue'
import { useNav, useSlideContext } from '@slidev/client'

// Corner stage strip. Hidden on the slides that own the whole canvas: the cover,
// the end, and the two slides that render the big strip themselves (the map slide
// and the demo divider, detected by their routeAlias).
//
// In the live deck the slide context is the current slide. In export (print mode)
// every slide renders at once with nav stuck at 1, so the slide's own context is
// what keeps the strip correct in the PNGs; nav is the fallback only.
const nav = useNav()
let ctx = null
try { ctx = useSlideContext() } catch { ctx = null }

const page = computed(() => unref(ctx?.$page) || nav.currentSlideNo?.value || 1)
// Frontmatter by page number from the slide list; the slide context's own
// $frontmatter does not carry routeAlias.
const fm = computed(() => nav.slides?.value?.[page.value - 1]?.meta?.slide?.frontmatter ?? {})

const hidden = computed(() => {
  const f = fm.value
  return ['stage-map', 'stage-demo'].includes(f.routeAlias ?? '') || ['cover', 'end'].includes(f.layout)
})
</script>

<template>
  <div v-if="!hidden" class="stage-corner">
    <StageMap size="sm" :page="page" />
  </div>
</template>

<style scoped>
.stage-corner {
  position: absolute;
  top: 1.1rem;
  right: 1.6rem;
  z-index: 20;
  opacity: 0.75;
  transition: opacity .2s;
}
.stage-corner:hover { opacity: 1; }
</style>
