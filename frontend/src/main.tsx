import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "maplibre-gl/dist/maplibre-gl.css"
import "./index.css"
import App from "./App"

/*
  StrictMode is on from the start. In development it mounts every component
  twice, which is what exposes an effect without a cleanup -- a listener, a
  timer, a map left alive. Turning it on later means auditing every effect
  written without it.
*/
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
