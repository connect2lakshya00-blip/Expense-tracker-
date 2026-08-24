import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ui/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/*
      ErrorBoundary wraps the entire app.
      If any component throws an unhandled error during rendering,
      the boundary catches it and shows the recovery screen
      instead of a blank white page.
    */}
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
