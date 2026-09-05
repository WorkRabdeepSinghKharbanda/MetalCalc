import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { APP_ROUTES } from '../appRoutes.js'

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  const results = query
    ? APP_ROUTES.filter((r) => r.label.toLowerCase().includes(query.toLowerCase()))
    : APP_ROUTES

  useEffect(() => {
    function onKeyDown(e) {
      const isShortcut = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'
      if (isShortcut) {
        e.preventDefault()
        setOpen((o) => !o)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    function onOpenEvent() {
      setOpen(true)
    }
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('open-command-palette', onOpenEvent)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('open-command-palette', onOpenEvent)
    }
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  function go(path) {
    navigate(path)
    setOpen(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[activeIndex]) {
      go(results[activeIndex].path)
    }
  }

  if (!open) return null

  return (
    <div className="command-palette-overlay" onClick={() => setOpen(false)}>
      <div className="command-palette" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Jump to a page… (e.g. holdings, zakat, crypto)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="command-palette-results">
          {results.length === 0 ? (
            <p className="muted" style={{ padding: '0.75rem' }}>No matches</p>
          ) : (
            results.map((r, i) => (
              <button
                key={r.path}
                className={`command-palette-item ${i === activeIndex ? 'active' : ''}`}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => go(r.path)}
              >
                <span>{r.label}</span>
                <span className="muted">{r.group}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
