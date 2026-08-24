// Expense categories — used in forms, filters, and the dashboard
export const CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Entertainment',
  'Bills',
  'Education',
  'Health',
  'Other',
];

// Category filter options — 'All' is prepended for the filter bar
export const CATEGORY_FILTERS = ['All', ...CATEGORIES];

// Sort options for the expense list
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'highest', label: 'Highest Amount' },
  { value: 'lowest', label: 'Lowest Amount' },
];

// A colour for each category — used in the dashboard breakdown
export const CATEGORY_COLORS = {
  Food:          'bg-orange-100 text-orange-700',
  Transport:     'bg-blue-100 text-blue-700',
  Shopping:      'bg-pink-100 text-pink-700',
  Entertainment: 'bg-purple-100 text-purple-700',
  Bills:         'bg-red-100 text-red-700',
  Education:     'bg-green-100 text-green-700',
  Health:        'bg-teal-100 text-teal-700',
  Other:         'bg-gray-100 text-gray-700',
};

// A dot colour for each category — used in list items
export const CATEGORY_DOT_COLORS = {
  Food:          'bg-orange-400',
  Transport:     'bg-blue-400',
  Shopping:      'bg-pink-400',
  Entertainment: 'bg-purple-400',
  Bills:         'bg-red-400',
  Education:     'bg-green-400',
  Health:        'bg-teal-400',
  Other:         'bg-gray-400',
};

// Mock expense data — used in Stage 9 before the real API is connected
export const MOCK_EXPENSES = [
  {
    id: '1',
    title: 'Dinner with friends',
    amount: 850,
    category: 'Food',
    description: 'Dinner at The Bombay Canteen',
    date: '2026-08-23',
    createdAt: '2026-08-23T10:00:00Z',
  },
  {
    id: '2',
    title: 'Monthly electricity bill',
    amount: 1200,
    category: 'Bills',
    description: 'August electricity bill',
    date: '2026-08-20',
    createdAt: '2026-08-20T09:00:00Z',
  },
  {
    id: '3',
    title: 'Metro card recharge',
    amount: 500,
    category: 'Transport',
    description: 'Monthly metro pass',
    date: '2026-08-18',
    createdAt: '2026-08-18T08:30:00Z',
  },
  {
    id: '4',
    title: 'Online course',
    amount: 2499,
    category: 'Education',
    description: 'React and Node.js course',
    date: '2026-08-15',
    createdAt: '2026-08-15T11:00:00Z',
  },
  {
    id: '5',
    title: 'Grocery shopping',
    amount: 1350,
    category: 'Shopping',
    description: 'Weekly groceries',
    date: '2026-08-14',
    createdAt: '2026-08-14T07:00:00Z',
  },
  {
    id: '6',
    title: 'Movie tickets',
    amount: 600,
    category: 'Entertainment',
    description: 'Weekend movie',
    date: '2026-08-10',
    createdAt: '2026-08-10T15:00:00Z',
  },
  {
    id: '7',
    title: 'Doctor consultation',
    amount: 800,
    category: 'Health',
    description: 'General checkup',
    date: '2026-08-08',
    createdAt: '2026-08-08T10:30:00Z',
  },
  {
    id: '8',
    title: 'Lunch',
    amount: 320,
    category: 'Food',
    description: 'Office lunch',
    date: '2026-08-07',
    createdAt: '2026-08-07T13:00:00Z',
  },
];
