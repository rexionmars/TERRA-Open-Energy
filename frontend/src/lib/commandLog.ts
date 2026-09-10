import { createStore } from "./store"

export type LogKind = "info" | "input" | "error"
export type LogLine = { id: number; kind: LogKind; text: string }

// Older lines are dropped past this, so a long session does not grow the list
// the command history renders without bound.
const MAX_LINES = 500

export const commandLog = createStore<LogLine[]>([])

let nextId = 0

export function print(text: string, kind: LogKind = "info"): void {
  commandLog.set((prev) => [...prev.slice(-(MAX_LINES - 1)), { id: nextId++, kind, text }])
}

export function clearLog(): void {
  commandLog.set([])
}
