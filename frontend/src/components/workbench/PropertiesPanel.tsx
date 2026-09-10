import type { ReactNode } from "react"
import { BASEMAP_MAX_ZOOM, BASEMAP_NAME } from "../../lib/basemap"
import { formatLat, formatLng } from "../../lib/format"
import { mapView } from "../../lib/mapController"
import { sidecar } from "../../lib/sidecarStatus"
import { useStore } from "../../lib/store"

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="border-y border-line bg-raised px-3 py-1 text-xs text-ink/90">{title}</h3>
      <dl className="flex flex-col gap-px py-1">{children}</dl>
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[112px_1fr] items-center gap-2 px-2 py-0.5">
      <dt className="truncate text-xs text-muted">{label}</dt>
      <dd
        className="truncate rounded-sm border border-line bg-sunken px-2 py-1 font-mono text-[11px] text-ink"
        title={value}
      >
        {value}
      </dd>
    </div>
  )
}

function ViewSection() {
  const v = useStore(mapView)
  return (
    <Section title="View">
      <Row label="Center latitude" value={formatLat(v.lat)} />
      <Row label="Center longitude" value={formatLng(v.lng)} />
      <Row label="Zoom" value={v.zoom.toFixed(2)} />
      <Row label="Bearing" value={`${v.bearing.toFixed(1)}°`} />
      <Row label="Pitch" value={`${v.pitch.toFixed(1)}°`} />
    </Section>
  )
}

function SidecarSection() {
  const s = useStore(sidecar)
  const status = s.kind === "ready" ? "Ready" : s.kind === "failed" ? "Unavailable" : "Checking…"
  return (
    <Section title="Sidecar">
      <Row label="Status" value={status} />
      {s.kind === "ready" && <Row label="Python" value={s.version} />}
      {s.kind !== "checking" && s.python && <Row label="Interpreter" value={s.python} />}
      {s.kind === "failed" && <Row label="Reason" value={s.message} />}
    </Section>
  )
}

/**
 * What is selected, and its attributes. Nothing on the map is selectable yet,
 * so it reports the view itself, the basemap and the sidecar -- the three
 * things this build has to describe.
 */
export function PropertiesPanel() {
  return (
    <aside className="flex w-72 shrink-0 flex-col overflow-y-auto border-r border-line bg-panel">
      <h2 className="px-3 py-2 text-sm text-ink">Properties</h2>
      <p className="border-t border-line px-3 py-1.5 text-xs text-muted">No selection</p>
      <ViewSection />
      <Section title="Basemap">
        <Row label="Source" value={BASEMAP_NAME} />
        <Row label="Maximum zoom" value={String(BASEMAP_MAX_ZOOM)} />
      </Section>
      <SidecarSection />
    </aside>
  )
}
