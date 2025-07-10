import {
    Expense,
    Budget,
    ChartData,
    BarChartData,
    MonthlyData,
    BudgetChartData,
} from '../types';

export const formatMonth = (date: string): string => {
    return date.substring(0, 7); // YYYY-MM format
};

export const formatMonthDisplay = (monthKey: string): string => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
};

export const calculateMonthlyTotals = (expenses: Expense[]): Record<string, number> => {
    return expenses.reduce((acc: Record<string, number>, expense) => {
        const month = formatMonth(expense.date);
        acc[month] = (acc[month] || 0) + expense.amount;
        return acc;
    }, {});
};

export const calculateCategoryTotals = (expenses: Expense[], categoryFilter?: string): Record<string, number> => {
    const filteredExpenses = categoryFilter
        ? expenses.filter((expense) => expense.category === categoryFilter)
        : expenses;

    return filteredExpenses.reduce((acc: Record<string, number>, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {});
};

export const getPieChartData = (expenses: Expense[], categoryFilter?: string): ChartData[] => {
    const categoryTotals = calculateCategoryTotals(expenses, categoryFilter);

    return Object.entries(categoryTotals).map(([id, value]) => ({
        id,
        label: id,
        value,
    }));
};

export const getBarChartData = (expenses: Expense[]): { month: string; value: number }[] => {
    const monthlyTotals = calculateMonthlyTotals(expenses);

    return Object.entries(monthlyTotals)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([month, value]) => ({
            month: formatMonthDisplay(month),
            value,
        }));
};

export const getBudgetChartData = (expenses: Expense[], budgets: Budget[]): BudgetChartData[] => {
    const monthlyExpenses = expenses.reduce((acc, expense) => {
        const month = expense.date.substring(0, 7); // YYYY-MM format
        acc[month] = (acc[month] || 0) + expense.amount;
        return acc;
    }, {} as Record<string, number>);

    const budgetMap = budgets.reduce((acc, budget) => {
        acc[budget.id] = budget;
        return acc;
    }, {} as Record<string, Budget>);

    // Get all unique months from both expenses and budgets
    const allMonths = new Set([
        ...Object.keys(monthlyExpenses),
        ...budgets.map(b => b.id)
    ]);

    return Array.from(allMonths)
        .sort()
        .map(month => {
            const spent = monthlyExpenses[month] || 0;
            const budget = budgetMap[month]?.budgetAmount || 0;
            const remaining = Math.max(0, budget - spent);

            return {
                month,
                budget,
                spent,
                remaining
            };
        });
};

export const getMonthlyData = (expenses: Expense[], budgets: Record<string, Budget>): MonthlyData[] => {
    const monthlyTotals = calculateMonthlyTotals(expenses);
    const allMonths = new Set([
        ...Object.keys(monthlyTotals),
        ...Object.keys(budgets)
    ]);

    return Array.from(allMonths)
        .sort((a, b) => b.localeCompare(a)) // Most recent first
        .map(month => {
            const spent = monthlyTotals[month] || 0;
            const budget = budgets[month]?.budgetAmount || 0;
            const remaining = budget - spent;
            const monthExpenses = expenses.filter(exp => formatMonth(exp.date) === month);

            return {
                month: formatMonthDisplay(month),
                budget,
                spent,
                remaining,
                expenses: monthExpenses,
            };
        });
};

// export const getTotalBudget = (budgets: Record<string, Budget>): number => {
//     return Object.values(budgets).reduce((total, budget) => total + budget.budgetAmount, 0);
// };
//
// export const getTotalSpent = (expenses: Expense[]): number => {
//     return expenses.reduce((total, expense) => total + expense.amount, 0);
// };

export const getCurrentMonthData = (expenses: Expense[], budgets: Record<string, Budget>) => {
    const currentMonth = formatMonth(new Date().toISOString().split('T')[0]);
    const currentMonthExpenses = expenses.filter(exp => formatMonth(exp.date) === currentMonth);
    const spent = currentMonthExpenses.reduce((total, exp) => total + exp.amount, 0);
    const budget = budgets[currentMonth]?.budgetAmount || 0;

    return {
        month: formatMonthDisplay(currentMonth),
        budget,
        spent,
        remaining: budget - spent,
        expenses: currentMonthExpenses,
    };
};

export const sortExpenses = (
    expenses: Expense[],
    dateOrder: 'asc' | 'desc' | null,
    priceOrder: 'asc' | 'desc' | null
): Expense[] => {
    return expenses.slice().sort((a, b) => {
        if (dateOrder && priceOrder) {
            const dateComparison = dateOrder === 'asc'
                ? new Date(a.date).getTime() - new Date(b.date).getTime()
                : new Date(b.date).getTime() - new Date(a.date).getTime();
            if (dateComparison !== 0) return dateComparison;

            return priceOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
        } else if (dateOrder) {
            return dateOrder === 'asc'
                ? new Date(a.date).getTime() - new Date(b.date).getTime()
                : new Date(b.date).getTime() - new Date(a.date).getTime();
        } else if (priceOrder) {
            return priceOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
        }
        return 0;
    });
};