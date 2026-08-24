import { useEffect } from 'react'

/**
 * DeleteModal — confirmation dialog before deleting an expense.
 *
 * Shown as an overlay. The user must explicitly confirm before
 * the delete action is triggered. Pressing Escape also cancels.
 *
 * Props:
 *   expense     — the expense to be deleted (used to show its title)
 *   onConfirm   — called when the user confirms deletion
 *   onCancel    — called when the user cancels
 *   isDeleting  — disables buttons while the API call is in progress
 */
export default function DeleteModal({ expense, onConfirm, onCancel, isDeleting }) {
  // Close the modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  if (!expense) return null

  return (
    // Backdrop — clicking it cancels the modal
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      {/* Modal panel — stop clicks from bubbling to the backdrop */}
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center text-3xl">
            🗑️
          </div>
        </div>

        {/* Title */}
        <h3
          id="delete-modal-title"
          className="text-lg font-bold text-gray-800 text-center"
        >
          Delete Expense
        </h3>

        {/* Message */}
        <p className="text-sm text-gray-500 text-center mt-2">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-gray-700">"{expense.title}"</span>?
          This action cannot be undone.
        </p>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
