/**
 * SearchBar — text input for filtering expenses by title.
 *
 * Props:
 *   value     — current search string (controlled)
 *   onChange  — called with the new string on every keystroke
 */
export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative">
      {/* Search icon */}
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
        🔍
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search expenses..."
        className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-white"
        aria-label="Search expenses"
      />
      {/* Clear button — only visible when there is text */}
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  )
}
