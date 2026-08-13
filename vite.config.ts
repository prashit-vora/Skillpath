import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Framer provides this runtime inside its editor. The npm package contains
    // types only, so local previewing uses a no-op implementation.
    alias: {
      framer: new URL("./src/framer-shim.ts", import.meta.url).pathname,
    },
  },
})
