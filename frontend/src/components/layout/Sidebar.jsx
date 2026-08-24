import { NavLink } from 'react-router-dom'

// Navigation items — path maps to the route, icon is an emoji for simplicity
const NAV_ITEMS = [
  { path: '/',            label: 'Dashboard',  icon: '📊' },
  { path: '/expenses',    label: 'Expenses',   icon: '💸' },
  { path: '/categories',  label: 'Categories', icon: '🏷️' },
  { path: '/reports',     label: 'Reports',    icon: '📈' },
  { path: '/settings',    label: 'Settings',   icon: '⚙️' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-indigo-900 text-white flex flex-col">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-indigo-800">
        <h1 className="text-2xl font-bold tracking-tight">ExpenseFlow</h1>
        <p className="text-indigo-300 text-xs mt-1">Personal Finance Tracker</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {NAV_ITEMS.map(({ path, label, icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-700 text-white'
                  : 'text-indigo-300 hover:bg-indigo-800 hover:text-white'
              }`
            }
          >
            <span className="text-lg">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-indigo-800">
        <p className="text-indigo-400 text-xs">ExpenseFlow v1.0</p>
      </div>
    </aside>
  )
}
