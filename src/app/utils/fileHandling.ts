import { Expense, Budget, SaveFilePickerOptions } from '../types';
import { CSV_HEADERS } from '../constants';

export const downloadExpensesCSV = async (expenses: Expense[]): Promise<void> => {
    const csvContent = [
        CSV_HEADERS.join(','),
        ...expenses.map(expense =>
            `${expense.date},${expense.category},${expense.amount},${expense.note || ''}`
        ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });

    try {
        if (window.showSaveFilePicker) {
            const fileHandle = await window.showSaveFilePicker({
                suggestedName: 'expenses.csv',
                types: [
                    {
                        description: 'CSV Files',
                        accept: { 'text/csv': ['.csv'] },
                    },
                ],
            });

            const writableStream = await fileHandle.createWritable();
            await writableStream.write(blob);
            await writableStream.close();
        } else {
            // Fallback for browsers that don't support File System Access API
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'expenses.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    } catch (error) {
        console.error('Error saving the file:', error);
        throw error;
    }
};

export const downloadBudgetsCSV = async (budgets: Record<string, Budget>): Promise<void> => {
    const headers = ['Month', 'Budget Amount'];
    const csvContent = [
        headers.join(','),
        ...Object.values(budgets).map(budget =>
            `${budget.month},${budget.budgetAmount}`
        ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });

    try {
        if (window.showSaveFilePicker) {
            const fileHandle = await window.showSaveFilePicker({
                suggestedName: 'budgets.csv',
                types: [
                    {
                        description: 'CSV Files',
                        accept: { 'text/csv': ['.csv'] },
                    },
                ],
            });

            const writableStream = await fileHandle.createWritable();
            await writableStream.write(blob);
            await writableStream.close();
        } else {
            // Fallback for browsers that don't support File System Access API
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'budgets.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    } catch (error) {
        console.error('Error saving the file:', error);
        throw error;
    }
};

export const parseExpensesCSV = (text: string): Expense[] => {
    const lines = text.split('\n');
    const headers = lines[0].split(',');

    if (
        headers.length !== 4 ||
        !headers.includes('Date') ||
        !headers.includes('Category') ||
        !headers.includes('Amount') ||
        !headers.includes('Note')
    ) {
        throw new Error(
            'Invalid CSV format. Please use the format: Date,Category,Amount,Note'
        );
    }

    return lines
        .slice(1)
        .filter((line) => line.trim())
        .map((line) => {
            const [date, category, amount, note] = line.split(',');
            return {
                id: Date.now() + Math.random(),
                date: date.trim(),
                category: category.trim(),
                amount: parseFloat(amount.trim()),
                note: note?.trim() || undefined,
            };
        });
};

export const parseBudgetsCSV = (text: string): Budget[] => {
    const lines = text.split('\n');
    const headers = lines[0].split(',');

    if (
        headers.length !== 2 ||
        !headers.includes('Month') ||
        !headers.includes('Budget Amount')
    ) {
        throw new Error(
            'Invalid CSV format. Please use the format: Month,Budget Amount'
        );
    }

    return lines
        .slice(1)
        .filter((line) => line.trim())
        .map((line) => {
            const [month, budgetAmount] = line.split(',');
            const monthKey = month.trim();
            return {
                id: monthKey,
                month: monthKey,
                budgetAmount: parseFloat(budgetAmount.trim()),
                spent: 0,
                remaining: parseFloat(budgetAmount.trim()),
            };
        });
};

declare global {
    interface Window {
        showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>;
    }
}