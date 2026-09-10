import type { StyleSpecification } from "maplibre-gl"

/*
  Esri World Imagery, one of the basemaps TERRA offers. The webview requests the
  tiles directly; the attribution is required by the provider's terms of use.
*/
export const BASEMAP_NAME = "Esri World Imagery"
export const BASEMAP_MAX_ZOOM = 19

export const BASEMAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    imagery: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      maxzoom: BASEMAP_MAX_ZOOM,
      attribution: "Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    },
  },
  layers: [{ id: "imagery", type: "raster", source: "imagery" }],
}
