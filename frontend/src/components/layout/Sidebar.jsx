import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/',           label: 'Dashboard',  icon: '📊' },
  { path: '/expenses',   label: 'Expenses',   icon: '💸' },
  { path: '/categories', label: 'Categories', icon: '🏷️' },
  { path: '/reports',    label: 'Reports',    icon: '📈' },
  { path: '/settings',   label: 'Settings',   icon: '⚙️' },
]

export default function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* ── Mobile top bar ─────────────────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-indigo-900 text-white flex items-center justify-between px-4 py-3 shadow-lg">
        <div>
          <h1 className="text-lg font-bold tracking-tight">ExpenseFlow</h1>
          <p className="text-indigo-300 text-xs">Personal Finance Tracker</p>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-lg hover:bg-indigo-800 transition-colors"
          aria-label="Toggle menu"
        >
          {open ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* ── Mobile drawer overlay ───────────────────────────────────── */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile drawer ──────────────────────────────────────────── */}
      <div className={`md:hidden fixed top-0 left-0 h-full w-64 z-40 bg-indigo-900 text-white flex flex-col transform transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-6 py-6 border-b border-indigo-800 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">ExpenseFlow</h1>
            <p className="text-indigo-300 text-xs mt-0.5">Personal Finance Tracker</p>
          </div>
          <button onClick={() => setOpen(false)} className="p-1 hover:bg-indigo-800 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {NAV_ITEMS.map(({ path, label, icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-indigo-700 text-white' : 'text-indigo-300 hover:bg-indigo-800 hover:text-white'
                }`
              }
            >
              <span className="text-lg">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-indigo-800">
          <p className="text-indigo-400 text-xs">ExpenseFlow v2.0</p>
        </div>
      </div>

      {/* ── Desktop sidebar ─────────────────────────────────────────── */}
      <aside className="hidden md:flex w-64 min-h-screen bg-indigo-900 text-white flex-col flex-shrink-0">
        <div className="px-6 py-6 border-b border-indigo-800">
          <h1 className="text-2xl font-bold tracking-tight">ExpenseFlow</h1>
          <p className="text-indigo-300 text-xs mt-1">Personal Finance Tracker</p>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {NAV_ITEMS.map(({ path, label, icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-indigo-700 text-white' : 'text-indigo-300 hover:bg-indigo-800 hover:text-white'
                }`
              }
            >
              <span className="text-lg">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-indigo-800">
          <p className="text-indigo-400 text-xs">ExpenseFlow v2.0</p>
        </div>
      </aside>
    </>
  )
}
