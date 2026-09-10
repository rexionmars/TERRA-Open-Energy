import { useState } from "react"
import { account } from "../../lib/account"
import { findCommand, runCommand } from "../../lib/commands"
import { panels } from "../../lib/layout"
import { IS_MAC } from "../../lib/platform"
import { useStore } from "../../lib/store"
import { Avatar } from "../account/Avatar"
import { RIBBON, type RibbonItem } from "./ribbon"

/** The signed-in account at the end of the tab row; opens the Account tab. */
function AccountButton() {
  const { user } = useStore(account)
  return (
    <button
      type="button"
      onClick={() => void runCommand("ACCOUNT")}
      title={user ? `${user.display_name} · ${user.email}` : "Sign in"}
      className="app-no-drag relative mb-1.5 ml-auto flex items-center gap-2 rounded-full py-0.5 pl-0.5 pr-2.5 text-xs text-muted hover:bg-hover hover:text-ink"
    >
      <Avatar user={user} size={22} />
      {user ? user.display_name : "Sign in"}
    </button>
  )
}

function RibbonButton({ item }: { item: RibbonItem }) {
  const shown = useStore(panels)
  const cmd = findCommand(item.command)
  // A ribbon entry naming no command is a mistake in ribbon.ts; say so on
  // screen rather than dropping the button silently.
  if (!cmd) {
    return <span className="self-center px-2 text-[10px] text-fail">{item.command}?</span>
  }
  const pressed = item.pressedWhen ? shown[item.pressedWhen] : undefined
  const IconComponent = cmd.icon

  return (
    <button
      type="button"
      onClick={() => void runCommand(cmd.name)}
      aria-pressed={pressed}
      title={`${cmd.label} (${cmd.name})\n${cmd.description}`}
      className="flex w-[68px] flex-col items-center gap-1 rounded px-1 pb-1 pt-1.5 text-ink/90 hover:bg-hover active:bg-sunken aria-pressed:bg-accent/20 aria-pressed:text-ink"
    >
      <IconComponent size={28} weight="light" aria-hidden="true" />
      <span className="text-center text-[11px] leading-tight">{cmd.label}</span>
    </button>
  )
}

/**
 * Tabs across the top, and the active tab's groups of commands below.
 *
 * The tab row doubles as the window's drag region: on macOS the title bar is
 * hidden and this row sits beside the traffic lights, so empty space in it
 * moves the window.
 */
export function RibbonBar() {
  const [tabId, setTabId] = useState(RIBBON[0].id)
  const tab = RIBBON.find((t) => t.id === tabId) ?? RIBBON[0]

  return (
    <div className="shrink-0 border-b border-line bg-chrome">
      <div
        role="tablist"
        aria-label="Ribbon"
        className={`app-draggable relative flex h-9 items-end gap-0.5 pr-3 ${IS_MAC ? "pl-20" : "pl-2"}`}
      >
        <img src="/terra-logo.png" alt="" className="mb-2 mr-2 h-5 w-5 shrink-0" />
        {RIBBON.map((t) => {
          const active = t.id === tab.id
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTabId(t.id)}
              className={`app-no-drag rounded-t border-x border-t px-4 py-1.5 text-[13px] ${
                active
                  ? "border-line border-t-accent bg-raised text-ink"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          )
        })}
        <span className="pointer-events-none absolute inset-x-0 top-0 flex h-9 items-center justify-center text-xs text-muted">
          TERRA Energy Engine
        </span>
        <AccountButton />
      </div>

      <div role="tabpanel" className="flex h-[94px] items-stretch bg-raised px-1">
        {tab.groups.map((group) => (
          <section key={group.title} className="flex flex-col border-r border-line/70 px-1.5">
            <div className="flex flex-1 items-start gap-0.5 pt-1">
              {group.items.map((item) => (
                <RibbonButton key={item.command} item={item} />
              ))}
            </div>
            <h3 className="pb-1 text-center text-[10px] text-muted">{group.title}</h3>
          </section>
        ))}
      </div>
    </div>
  )
}
