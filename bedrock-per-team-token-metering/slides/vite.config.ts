import { defineConfig } from 'vite'

// Slidev merges this into its own Vite config. The dev server is reached from
// phones over the tailnet (go/slides redirects to the MagicDNS name), and Vite
// rejects any Host header it does not know, so allow the machine's tailnet name.
export default defineConfig({
  server: {
    allowedHosts: ['.ts.net', 'localhost'],
  },
})
