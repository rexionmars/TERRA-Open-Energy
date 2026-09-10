import { useEffect, useRef } from "react"
import { print } from "../../lib/commandLog"
import { panels } from "../../lib/layout"
import { checkSidecar } from "../../lib/sidecarStatus"
import { useStore } from "../../lib/store"
import { CommandLine } from "./CommandLine"
import { PropertiesPanel } from "./PropertiesPanel"
import { RibbonBar } from "./RibbonBar"
import { StatusBar } from "./StatusBar"
import { Viewport } from "./Viewport"

// Set once the greeting is printed. StrictMode runs mount effects twice in
// development, and the history would otherwise open with every line doubled.
let greeted = false

// Keys that, typed outside a field, go to the command line. Letters and "?"
// only: MapLibre's keyboard handler uses the arrows, + and -, and the map
// canvas keeps focus for those.
const COMMAND_KEY = /^[a-z?]$/i

/**
 * The main window: ribbon, document tabs, properties beside the viewport,
 * command line, status bar. The arrangement follows desktop CAD, where the
 * drawing stays in the middle and every tool is reachable both from the ribbon
 * and by typing its name.
 */
export function Workbench() {
  const shown = useStore(panels)
  const commandInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!greeted) {
      greeted = true
      print("TERRA Energy Engine ready.")
      print("Type a command or use the ribbon. HELP lists the commands.")
    }
    void checkSidecar()
  }, [])

  // Typing a command name anywhere starts it on the command line, as in CAD.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return
      if (!COMMAND_KEY.test(e.key)) return
      const target = e.target as HTMLElement | null
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return
      // Focused during keydown, the input receives this same keystroke.
      commandInput.current?.focus()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <div className="app-shell-enter flex h-full flex-col bg-surface text-ink">
      <RibbonBar />
      <nav aria-label="Documents" className="flex h-8 shrink-0 items-end border-b border-line bg-chrome px-2">
        <span className="rounded-t border-x border-t border-line border-t-accent bg-surface px-4 py-1 text-xs text-ink">
          Map
        </span>
      </nav>
      <div className="flex min-h-0 flex-1">
        {shown.properties && <PropertiesPanel />}
        <Viewport />
      </div>
      {shown.commandLine && <CommandLine inputRef={commandInput} />}
      <StatusBar />
    </div>
  )
}
