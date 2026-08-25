import { useState, useEffect } from 'react'
import Header from '../components/layout/Header'
import { getExpenses, getErrorMessage } from '../services/expenseService'

const STORAGE_KEY_SETTINGS = 'expenseflow_settings'

const DEFAULT_SETTINGS = {
  currency: 'INR',
  darkMode: false,
  defaultSort: 'newest',
  defaultCategory: 'All',
}

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
]

const loadSettings = () => {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(STORAGE_KEY_SETTINGS)) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export default function Settings() {
  const [settings, setSettings] = useState(loadSettings)
  const [saved, setSaved] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [clearConfirm, setClearConfirm] = useState(false)

  // Apply dark mode to root
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode)
  }, [settings.darkMode])

  const updateSetting = (key, value) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value }
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated))
      return updated
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const exportJSON = async () => {
    setExporting(true)
    try {
      const expenses = await getExpenses()
      const blob = new Blob([JSON.stringify(expenses, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `expenseflow-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(getErrorMessage(err))
    } finally {
      setExporting(false)
    }
  }

  const exportCSV = async () => {
    setExporting(true)
    try {
      const expenses = await getExpenses()
      const rows = [
        ['Title', 'Amount', 'Currency', 'Category', 'Date', 'Description'],
        ...expenses.map((e) => [
          `"${e.title}"`,
          e.amount,
          settings.currency,
          e.category,
          new Date(e.date).toLocaleDateString('en-IN'),
          `"${e.description || ''}"`,
        ]),
      ]
      const csv = rows.map((r) => r.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `expenseflow-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(getErrorMessage(err))
    } finally {
      setExporting(false)
    }
  }

  const clearLocalData = () => {
    localStorage.removeItem('expenseflow_budgets')
    localStorage.removeItem(STORAGE_KEY_SETTINGS)
    setSettings(DEFAULT_SETTINGS)
    setClearConfirm(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const selectedCurrency = CURRENCIES.find((c) => c.code === settings.currency) || CURRENCIES[0]

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <Header
        title="Settings"
        subtitle="Application preferences and data management."
      />

      <div className="p-4 md:p-8 space-y-5 md:space-y-6 max-w-2xl">

        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
            ✅ Settings saved!
          </div>
        )}

        {/* Preferences */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h3 className="text-base font-semibold text-gray-800">⚙️ Preferences</h3>

          {/* Currency */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Currency</p>
              <p className="text-xs text-gray-400 mt-0.5">Display currency for all amounts</p>
            </div>
            <select
              value={settings.currency}
              onChange={(e) => updateSetting('currency', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Currency preview */}
          <div className="bg-indigo-50 rounded-lg px-4 py-3">
            <p className="text-xs text-indigo-600 font-medium">Preview</p>
            <p className="text-sm text-indigo-800 mt-1">
              Sample expense: <strong>{selectedCurrency.symbol}1,250</strong> ({selectedCurrency.name})
            </p>
          </div>

          {/* Default Sort */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Default Sort</p>
              <p className="text-xs text-gray-400 mt-0.5">Sort order on Expenses page</p>
            </div>
            <select
              value={settings.defaultSort}
              onChange={(e) => updateSetting('defaultSort', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>

          {/* Dark mode toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Dark Mode</p>
              <p className="text-xs text-gray-400 mt-0.5">Toggle dark appearance (experimental)</p>
            </div>
            <button
              onClick={() => updateSetting('darkMode', !settings.darkMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${settings.darkMode ? 'bg-indigo-600' : 'bg-gray-200'}`}
              role="switch"
              aria-checked={settings.darkMode}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${settings.darkMode ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
        </div>

        {/* Data Export */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="text-base font-semibold text-gray-800">📦 Data Export</h3>
          <p className="text-sm text-gray-500">Download all your expense data.</p>

          <div className="flex gap-3">
            <button
              onClick={exportCSV}
              disabled={exporting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors"
            >
              📄 Export CSV
            </button>
            <button
              onClick={exportJSON}
              disabled={exporting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              🗂️ Export JSON
            </button>
          </div>
          {exporting && <p className="text-xs text-gray-400 text-center">Preparing export...</p>}
        </div>

        {/* App Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-3">
          <h3 className="text-base font-semibold text-gray-800">ℹ️ App Info</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between"><span className="text-gray-400">Version</span><span>v2.0.0</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Frontend</span><span>React 18 + Vite + Tailwind</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Backend</span><span>Node.js + Express</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Database</span><span>MongoDB Atlas</span></div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6 space-y-4">
          <h3 className="text-base font-semibold text-red-600">⚠️ Danger Zone</h3>
          <p className="text-sm text-gray-500">
            Clear all locally stored settings and budgets. This does <strong>not</strong> delete your expenses from the database.
          </p>
          {clearConfirm ? (
            <div className="flex gap-3">
              <button
                onClick={clearLocalData}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
              >
                Yes, clear all local data
              </button>
              <button
                onClick={() => setClearConfirm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setClearConfirm(true)}
              className="px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50"
            >
              Clear Local Settings & Budgets
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
