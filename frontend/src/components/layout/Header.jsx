export default function Header({ title, subtitle, action }) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 md:py-5 mt-14 md:mt-0">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 truncate">{title}</h2>
          {subtitle && (
            <p className="text-xs md:text-sm text-gray-500 mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </header>
  )
}
