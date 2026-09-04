import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'

export default function DropdownMenu({ label, items }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="dropdown" ref={ref}>
      <button className="btn btn-ghost" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {label}
      </button>
      {open && (
        <div className="dropdown-menu">
          {items.map((item) =>
            item.heading ? (
              <div key={item.heading} className="dropdown-heading">{item.heading}</div>
            ) : item.to ? (
              <NavLink key={item.label} to={item.to} className="dropdown-item" onClick={() => setOpen(false)}>
                {item.label}
              </NavLink>
            ) : (
              <button
                key={item.label}
                className="dropdown-item"
                disabled={item.disabled}
                onClick={() => {
                  item.onClick()
                  setOpen(false)
                }}
              >
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}
