// Header receives the page title and an optional action button from the parent page
export default function Header({ title, subtitle, action }) {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-5">
      <div className="flex items-center justify-between">
        {/* Page title and subtitle */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Optional action button — e.g. "Add Expense" on the Expenses page */}
        {action && <div>{action}</div>}
      </div>
    </header>
  )
}
