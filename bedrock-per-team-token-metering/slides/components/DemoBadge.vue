<script setup>
defineProps({
  // 'live' = done in the room. 'recorded' = a clip plays.
  kind: { type: String, default: 'live' },
})
</script>

<template>
  <span class="demo-badge" :class="`demo-badge-${kind}`">
    <span class="demo-badge-glyph">{{ kind === 'live' ? '●' : '▶' }}</span>
    <span class="demo-badge-text">{{ kind === 'live' ? 'LIVE' : 'RECORDED' }}</span>
  </span>
</template>

<style scoped>
/* Live vs recorded is carried by GLYPH + WORD, never by colour alone. */
.demo-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.34rem 0.95rem;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  line-height: 1;
  vertical-align: middle;
}
.demo-badge-glyph { font-size: 0.8rem; }

.demo-badge-live {
  background: var(--p-primary);
  color: #fff;
}
.demo-badge-recorded {
  background: transparent;
  color: var(--p-fg-muted, #666);
  border: 2px solid currentColor;
}
</style>
