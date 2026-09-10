import type { Panels } from "../../lib/layout"

/**
 * The ribbon's arrangement: tabs, the groups on each tab, and the commands in
 * each group. Items name commands in lib/commands.ts; what a command does and
 * how it is drawn live there.
 */
export type RibbonItem = {
  command: string
  /** Shown pressed while this panel is visible. */
  pressedWhen?: keyof Panels
}

export type RibbonGroup = { title: string; items: RibbonItem[] }

export type RibbonTab = { id: string; label: string; groups: RibbonGroup[] }

export const RIBBON: RibbonTab[] = [
  {
    id: "home",
    label: "Home",
    groups: [
      {
        title: "Navigate",
        items: [
          { command: "ZOOMIN" },
          { command: "ZOOMOUT" },
          { command: "HOME" },
          { command: "NORTH" },
        ],
      },
      { title: "Sidecar", items: [{ command: "PING" }] },
      { title: "Account", items: [{ command: "ACCOUNT" }] },
    ],
  },
  {
    id: "view",
    label: "View",
    groups: [
      {
        title: "Panels",
        items: [
          { command: "PROPERTIES", pressedWhen: "properties" },
          { command: "COMMANDLINE", pressedWhen: "commandLine" },
        ],
      },
      { title: "History", items: [{ command: "CLEAR" }, { command: "HELP" }] },
    ],
  },
]
