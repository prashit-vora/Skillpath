export const ControlType = {
  String: "string",
  Color: "color",
} as const

export function addPropertyControls() {
  // Framer reads these controls in its own editor runtime. The local Vite page
  // only needs the component itself, so registration is intentionally a no-op.
}
