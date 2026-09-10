import {
  Compass,
  Eraser,
  Heartbeat,
  House,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  Question,
  SidebarSimple,
  TerminalWindow,
  type Icon,
} from "@phosphor-icons/react"
import { clearLog, print } from "./commandLog"
import { togglePanel } from "./layout"
import { flyHome, resetNorth, zoomIn, zoomOut } from "./mapController"
import { checkSidecar } from "./sidecarStatus"

/**
 * Every action the workbench can perform, in one registry.
 *
 * The ribbon, the command line and the viewport toolbar all start commands by
 * name from here, as a CAD program does: a button is a shortcut for typing the
 * command, and the history shows the same line whichever was used. A tool
 * added to the ribbon is therefore also available to type, with no second
 * implementation to keep in step.
 */
export type Command = {
  /** Upper case, as typed on the command line. */
  name: string
  aliases: string[]
  /** Label under the ribbon button. */
  label: string
  description: string
  icon: Icon
  run: () => void | Promise<void>
}

function requireMap(action: () => boolean): void {
  if (!action()) print("No map is open.", "error")
}

export const COMMANDS: Command[] = [
  {
    name: "ZOOMIN",
    aliases: ["ZI"],
    label: "Zoom In",
    description: "Zoom the map in by one level",
    icon: MagnifyingGlassPlus,
    run: () => requireMap(zoomIn),
  },
  {
    name: "ZOOMOUT",
    aliases: ["ZO"],
    label: "Zoom Out",
    description: "Zoom the map out by one level",
    icon: MagnifyingGlassMinus,
    run: () => requireMap(zoomOut),
  },
  {
    name: "HOME",
    aliases: ["ZE", "EXTENTS"],
    label: "Home",
    description: "Return to the view of the whole of Brazil",
    icon: House,
    run: () => requireMap(flyHome),
  },
  {
    name: "NORTH",
    aliases: ["N"],
    label: "North Up",
    description: "Reset the map's bearing and pitch",
    icon: Compass,
    run: () => requireMap(resetNorth),
  },
  {
    name: "PING",
    aliases: [],
    label: "Check",
    description: "Start the Python sidecar and report its version",
    icon: Heartbeat,
    run: async () => {
      print("Checking the sidecar…")
      const s = await checkSidecar()
      if (s.kind === "ready") print(`Sidecar ready · Python ${s.version} · ${s.python}`)
      else if (s.kind === "failed") print(`Sidecar unavailable: ${s.message}`, "error")
    },
  },
  {
    name: "PROPERTIES",
    aliases: ["PR"],
    label: "Properties",
    description: "Show or hide the properties panel",
    icon: SidebarSimple,
    run: () => togglePanel("properties"),
  },
  {
    name: "COMMANDLINE",
    aliases: ["CL"],
    label: "Command Line",
    description: "Show or hide the command line",
    icon: TerminalWindow,
    run: () => togglePanel("commandLine"),
  },
  {
    name: "HELP",
    aliases: ["?"],
    label: "Help",
    description: "List the commands",
    icon: Question,
    run: () => {
      for (const c of COMMANDS) {
        const aliases = c.aliases.length ? ` (${c.aliases.join(", ")})` : ""
        print(`${(c.name + aliases).padEnd(24)} ${c.description}`)
      }
    },
  },
  {
    name: "CLEAR",
    aliases: ["CLS"],
    label: "Clear",
    description: "Clear the command history",
    icon: Eraser,
    run: clearLog,
  },
]

const BY_NAME = new Map<string, Command>()
for (const c of COMMANDS) {
  for (const key of [c.name, ...c.aliases]) BY_NAME.set(key, c)
}

export function findCommand(name: string): Command | undefined {
  return BY_NAME.get(name.trim().toUpperCase())
}

/** Command names that start with `prefix`, for completion on the command line. */
export function completions(prefix: string): string[] {
  const p = prefix.trim().toUpperCase()
  if (!p) return []
  return COMMANDS.map((c) => c.name).filter((n) => n.startsWith(p))
}

/**
 * Run a command by name and echo it to the history. Typed input is echoed as
 * typed, so a mistyped name is visible beside the error it produced.
 */
export async function runCommand(name: string): Promise<void> {
  const typed = name.trim()
  if (!typed) return
  const cmd = findCommand(typed)
  print(`Command: ${cmd ? cmd.name : typed.toUpperCase()}`, "input")
  if (!cmd) {
    print(`Unknown command "${typed.toUpperCase()}". Type HELP for the list.`, "error")
    return
  }
  try {
    await cmd.run()
  } catch (e) {
    print(`${cmd.name}: ${String(e)}`, "error")
  }
}
