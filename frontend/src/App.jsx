import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Categories from './pages/Categories'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-gray-50">

        {/* Sidebar — fixed on desktop, drawer on mobile */}
        <Sidebar />

        {/* Main content — full width on mobile (sidebar is overlay), partial on desktop */}
        <main className="flex-1 flex flex-col overflow-hidden w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  )
}
