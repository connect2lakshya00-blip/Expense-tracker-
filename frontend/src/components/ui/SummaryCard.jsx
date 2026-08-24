// Displays one statistics card on the Dashboard.
// Receives a title, value, subtitle, icon, and a colour scheme.
export default function SummaryCard({ title, value, subtitle, icon, colorClass }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        {/* Icon badge */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${colorClass}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
