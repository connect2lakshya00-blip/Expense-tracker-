import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Categories from './pages/Categories'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

/**
 * App is the root component.
 *
 * It sets up:
 *   - BrowserRouter  — enables client-side routing
 *   - A two-column layout: fixed Sidebar on the left, scrollable page content on the right
 *   - Routes mapped to each page component
 */
export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-gray-50">

        {/* Fixed sidebar — always visible */}
        <Sidebar />

        {/* Main content area — takes remaining width, scrolls independently */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            {/* Redirect any unknown path back to Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  )
}
