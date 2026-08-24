import { useState, useEffect } from 'react'

/**
 * useDebounce — delays updating the returned value until the user
 * has stopped changing the input for `delay` milliseconds.
 *
 * How it works:
 *   1. Every time `value` changes, a setTimeout is scheduled.
 *   2. If `value` changes again before the timer fires, the previous
 *      timer is cleared (cleanup) and a new one starts.
 *   3. Only when the user stops typing for `delay` ms does
 *      `debouncedValue` update.
 *
 * Example:
 *   const debouncedSearch = useDebounce(search, 350)
 *   // debouncedSearch only updates 350ms after the user stops typing
 *
 * @param {*}      value  - The value to debounce (any type)
 * @param {number} delay  - Milliseconds to wait (default 350ms)
 * @returns {*} The debounced value
 */
export default function useDebounce(value, delay = 350) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Schedule an update after `delay` ms
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup: if value changes before the timer fires, cancel it
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
