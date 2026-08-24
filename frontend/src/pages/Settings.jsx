import Header from '../components/layout/Header'

export default function Settings() {
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <Header
        title="Settings"
        subtitle="Application preferences and configuration."
      />
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center text-center">
          <div className="text-6xl mb-4">⚙️</div>
          <h3 className="text-lg font-semibold text-gray-700">Settings Coming Soon</h3>
          <p className="text-sm text-gray-400 mt-2 max-w-sm">
            Currency preferences, theme options, and data export
            will be available in a future version.
          </p>
        </div>
      </div>
    </div>
  )
}
