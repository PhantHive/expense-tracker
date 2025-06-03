export const THEME = {
    kawaiiBg: '#FFF0F5',
    kawaiiAccent: '#FF69B4',
    kawaiiSecondary: '#FFB6C1',
} as const;

export const IMAGES = {
    basePath: process.env.NODE_ENV === 'production' ? '/expense-tracker' : '',
    waifu: '/waifu.gif',
    happy: '/happy.gif',
    note: '/note.gif',
    elf: '/elf.png',
} as const;

export const EXPENSE_CATEGORIES = [
    'Food',
    'Transportation',
    'Entertainment',
    'Shopping',
    'Bills',
    'Healthcare',
    'Education',
    'Travel',
    'Other',
] as const;

export const CSV_HEADERS = ['Date', 'Category', 'Amount', 'Note'] as const;

export const CHART_MARGINS = {
    pie: { top: 40, right: 80, bottom: 80, left: 80 },
    bar: { top: 50, right: 130, bottom: 50, left: 60 },
    budget: { top: 50, right: 130, bottom: 80, left: 60 },
} as const;

export const NOTIFICATIONS = {
    expenseAdded: '✨ Expense added successfully! ✨',
    expenseUpdated: '✨ Expense updated successfully! ✨',
    budgetSet: '💰 Budget set successfully! 💰',
    dataImported: '📥 Data imported successfully! 📥',
} as const;