import { useEffect, useState, type ReactNode } from "react"
import { GetAppVersion } from "../../../wailsjs/go/main/App"
import { account } from "../../lib/account"
import { runCommand } from "../../lib/commands"
import { formatLat, formatLng } from "../../lib/format"
import { cursor, mapView } from "../../lib/mapController"
import { sidecar } from "../../lib/sidecarStatus"
import { useStore } from "../../lib/store"

function Cell({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <span className="flex h-full items-center gap-1.5 border-l border-line px-2.5" title={title}>
      {children}
    </span>
  )
}

function CursorCell() {
  const c = useStore(cursor)
  return (
    <Cell title="Position under the pointer">
      <span className="min-w-[15rem] text-right font-mono tabular-nums">
        {c ? `${formatLat(c.lat)}  ${formatLng(c.lng)}` : "—"}
      </span>
    </Cell>
  )
}

function ZoomCell() {
  const { zoom } = useStore(mapView)
  return (
    <Cell title="Map zoom level">
      <span className="font-mono tabular-nums">Z {zoom.toFixed(2)}</span>
    </Cell>
  )
}

function SidecarCell() {
  const s = useStore(sidecar)
  const dot = s.kind === "ready" ? "bg-ok" : s.kind === "failed" ? "bg-fail" : "bg-muted animate-pulse"
  const label =
    s.kind === "ready" ? `Python ${s.version}` : s.kind === "failed" ? "Sidecar unavailable" : "Checking"
  const title = s.kind === "ready" ? s.python : s.kind === "failed" ? s.message : undefined
  return (
    <Cell title={title}>
      <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden="true" />
      {label}
    </Cell>
  )
}

function UserCell() {
  const { user } = useStore(account)
  return (
    <button
      type="button"
      onClick={() => void runCommand("ACCOUNT")}
      title={user ? user.email : "Working as the guest. Open the Account tab to sign in."}
      className="flex h-full items-center border-l border-line px-2.5 hover:bg-hover hover:text-ink"
    >
      {user ? user.display_name : "Guest"}
    </button>
  )
}

export function StatusBar() {
  const [version, setVersion] = useState<string | null>(null)

  useEffect(() => {
    let stale = false
    GetAppVersion()
      .then((v) => {
        if (!stale) setVersion(v)
      })
      .catch(() => {})
    return () => {
      stale = true
    }
  }, [])

  return (
    <footer className="flex h-7 shrink-0 items-stretch border-t border-line bg-chrome text-[11px] text-muted">
      <span className="flex items-center border-r border-line bg-raised px-3 text-ink">Map</span>
      <span className="flex-1" />
      <CursorCell />
      <ZoomCell />
      <SidecarCell />
      <UserCell />
      {version && <Cell>v{version}</Cell>}
    </footer>
  )
}
