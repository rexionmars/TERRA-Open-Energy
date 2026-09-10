import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from "react"
import { commandLog } from "../../lib/commandLog"
import { completions, runCommand } from "../../lib/commands"
import { useStore } from "../../lib/store"

const LINE_COLOUR = {
  info: "text-info",
  input: "text-muted",
  error: "text-fail",
} as const

/**
 * The command history and the input under it.
 *
 * Keys follow CAD convention: Enter runs what was typed, and Enter on an empty
 * line repeats the last command; Tab accepts the completion shown in grey; the
 * arrows walk back through what was typed before; Escape clears the line.
 */
export function CommandLine({ inputRef }: { inputRef: RefObject<HTMLInputElement | null> }) {
  const lines = useStore(commandLog)
  const [value, setValue] = useState("")
  const past = useRef<string[]>([])
  // Position while walking back through `past`; null when not walking.
  const recall = useRef<number | null>(null)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  const completion = completions(value)[0]
  const ghost = completion && completion.length > value.trim().length ? completion : undefined

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "Enter": {
        const typed = value.trim() || past.current.at(-1)
        if (!typed) return
        if (value.trim()) past.current.push(typed)
        recall.current = null
        setValue("")
        void runCommand(typed)
        return
      }
      case "Tab":
        if (ghost) {
          e.preventDefault()
          setValue(ghost)
        }
        return
      case "ArrowUp":
      case "ArrowDown": {
        e.preventDefault()
        const n = past.current.length
        if (n === 0) return
        const at = recall.current ?? n
        const next = e.key === "ArrowUp" ? Math.max(0, at - 1) : at + 1
        if (next >= n) {
          recall.current = null
          setValue("")
        } else {
          recall.current = next
          setValue(past.current[next])
        }
        return
      }
      case "Escape":
        recall.current = null
        setValue("")
        return
    }
  }

  return (
    <div className="shrink-0 border-t border-line bg-sunken">
      <div
        ref={scroller}
        role="log"
        aria-live="polite"
        className="h-[5.5rem] overflow-y-auto whitespace-pre px-3 py-1 font-mono text-xs leading-5"
      >
        {lines.map((l) => (
          <div key={l.id} className={LINE_COLOUR[l.kind]}>
            {l.text}
          </div>
        ))}
      </div>
      <label className="flex h-8 items-center gap-2 border-t border-line px-3">
        <span className="text-xs text-accent">Command:</span>
        <span className="relative flex-1">
          {ghost && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center font-mono text-xs text-muted/60"
            >
              <span className="invisible whitespace-pre">{value}</span>
              {ghost.slice(value.length)}
            </span>
          )}
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => {
              recall.current = null
              setValue(e.target.value.toUpperCase())
            }}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoComplete="off"
            aria-label="Command"
            className="relative w-full bg-transparent font-mono text-xs text-ink outline-none"
          />
        </span>
      </label>
    </div>
  )
}
