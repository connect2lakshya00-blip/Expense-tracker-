// Shown while expenses are being fetched from the API.
export default function LoadingState({ message = 'Loading expenses...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* Spinning ring */}
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  )
}
