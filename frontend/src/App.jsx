import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Categories from './pages/Categories'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Login from './pages/Login'
import { isAuthenticated } from './services/authService'

function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected — all inside the sidebar layout */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <div className="flex h-screen overflow-hidden bg-gray-50">
                <Sidebar />
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
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
