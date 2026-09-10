import { useEffect, useRef, useState } from "react"
import { Map as MapLibreMap, NavigationControl, type StyleSpecification } from "maplibre-gl"
import { Ping } from "../wailsjs/go/main/App"

/*
  Esri World Imagery, one of the basemaps TERRA offers. The webview requests the
  tiles directly; the attribution is required by the provider's terms of use.
*/
const BASEMAP: StyleSpecification = {
  version: 8,
  sources: {
    imagery: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: "Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    },
  },
  layers: [{ id: "imagery", type: "raster", source: "imagery" }],
}

// Centroid of Brazil's territory, at a zoom that shows all of it.
const INITIAL_VIEW = { center: [-51.9, -14.2] as [number, number], zoom: 3.5 }

function MapView() {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!container.current) return
    const map = new MapLibreMap({
      container: container.current,
      style: BASEMAP,
      ...INITIAL_VIEW,
      attributionControl: { compact: true },
    })
    map.addControl(new NavigationControl(), "top-right")
    // remove() releases the WebGL context. Without it every remount leaks one,
    // and the webview stops creating contexts after a small fixed number.
    return () => map.remove()
  }, [])

  return <div ref={container} className="absolute inset-0" />
}

type SidecarState =
  | { kind: "checking" }
  | { kind: "ready"; python: string; version: string }
  | { kind: "failed"; python: string; message: string }

function SidecarIndicator() {
  const [state, setState] = useState<SidecarState>({ kind: "checking" })

  useEffect(() => {
    // Set on cleanup so a reply arriving after unmount is dropped rather than
    // written into a component that no longer exists.
    let stale = false
    Ping()
      .then((s) => {
        if (stale) return
        setState(
          s.ok
            ? { kind: "ready", python: s.python, version: s.version ?? "" }
            : { kind: "failed", python: s.python, message: s.error ?? "unknown error" }
        )
      })
      .catch((e: unknown) => {
        if (!stale) setState({ kind: "failed", python: "", message: String(e) })
      })
    return () => {
      stale = true
    }
  }, [])

  const dot =
    state.kind === "ready" ? "bg-ok" : state.kind === "failed" ? "bg-fail" : "bg-muted animate-pulse"
  const label =
    state.kind === "ready"
      ? `Python ${state.version}`
      : state.kind === "failed"
        ? "Sidecar unavailable"
        : "Checking sidecar"
  const detail =
    state.kind === "ready" ? state.python : state.kind === "failed" ? state.message : undefined

  return (
    <div className="flex items-center gap-2 text-xs text-muted" title={detail}>
      <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export default function App() {
  return (
    <div className="flex h-full flex-col">
      <header className="flex h-10 shrink-0 items-center justify-between border-b border-line bg-raised px-4">
        <span className="text-xs font-semibold tracking-[0.18em]">TERRA ENERGY ENGINE</span>
        <SidecarIndicator />
      </header>
      <main className="relative flex-1">
        <MapView />
      </main>
    </div>
  )
}
