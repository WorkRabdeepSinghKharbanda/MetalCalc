import { useState } from 'react'

// Generic tab strip — only the active tab's content mounts, so an expensive
// section (a rankings table still fetching) doesn't render until picked.
export default function Tabs({ tabs, defaultKey }) {
  const [active, setActive] = useState(defaultKey ?? tabs[0]?.key)
  const activeTab = tabs.find((t) => t.key === active) ?? tabs[0]

  return (
    <div className="tabs">
      <div className="tabs-strip" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={t.key === active}
            className={`tabs-tab ${t.key === active ? 'active' : ''}`}
            onClick={() => setActive(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="tabs-panel">{activeTab?.content}</div>
    </div>
  )
}
