import { createStore } from "./store"

/** Which workbench panels are shown. */
export type Panels = { properties: boolean; commandLine: boolean }

export const panels = createStore<Panels>({ properties: true, commandLine: true })

export function togglePanel(name: keyof Panels): void {
  panels.set((p) => ({ ...p, [name]: !p[name] }))
}
