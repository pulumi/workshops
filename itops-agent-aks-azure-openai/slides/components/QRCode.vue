<script setup>
import { ref, watchEffect } from 'vue'
import QRCode from 'qrcode'

const props = defineProps({
  data: { type: String, required: true },
  // Module colour. Defaults to the deck's primary; pass a hex to override
  // (the closing slide uses black on white, like the reference workshop).
  dark: { type: String, default: '' },
})

const svg = ref('')

watchEffect(async () => {
  const root = getComputedStyle(document.documentElement)
  const dark = props.dark || root.getPropertyValue('--p-primary').trim() || '#5a30c5'
  svg.value = await QRCode.toString(props.data, {
    type: 'svg',
    margin: 1,
    color: { dark, light: '#ffffff' },
  })
})
</script>

<template>
  <div class="qr-code" v-html="svg" />
</template>

<style scoped>
.qr-code {
  width: 100%;
  height: 100%;
  display: flex;
}
.qr-code :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
