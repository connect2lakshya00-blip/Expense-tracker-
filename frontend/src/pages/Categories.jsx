import Header from '../components/layout/Header'
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_DOT_COLORS } from '../constants'

export default function Categories() {
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <Header
        title="Categories"
        subtitle="Overview of your expense categories."
      />
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500 mb-6">
            Category management will be available in a future version.
            Here are the currently supported categories:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => {
              const badge = CATEGORY_COLORS[cat] || 'bg-gray-100 text-gray-700'
              const dot = CATEGORY_DOT_COLORS[cat] || 'bg-gray-400'
              return (
                <div
                  key={cat}
                  className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${dot}`} />
                  <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${badge}`}>
                    {cat}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
