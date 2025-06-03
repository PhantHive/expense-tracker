export interface Expense {
    id: number;
    amount: number;
    category: string;
    date: string;
    note?: string;
}

export interface Budget {
    id: string; // YYYY-MM format
    month: string;
    budgetAmount: number;
    spent: number;
    remaining: number;
}

export interface MonthlyData {
    month: string;
    budget: number;
    spent: number;
    remaining: number;
    expenses: Expense[];
}

export interface ChartData {
    id: string;
    label: string;
    value: number;
}

export interface BudgetChartData {
    month: string;
    budget: number;
    spent: number;
    remaining: number;
    [key: string]: string | number;
}

export interface MonthlyBarChartData {
    month: string;
    value: number;
    [key: string]: string | number;
}

export interface ExpenseFormData {
    amount: string;
    category: string;
    date: string;
    note: string;
}

export interface BudgetFormData {
    month: string;
    budgetAmount: string;
}

export type SortOrder = 'asc' | 'desc' | null;

export interface SaveFilePickerOptions {
    suggestedName?: string;
    types?: Array<{
        description: string;
        accept: Record<string, string[]>;
    }>;
}