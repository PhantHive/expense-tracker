import { useState, useCallback } from 'react';
import { Budget } from '../types';
import { formatMonth } from '../utils/dataProcessing';
import { parseBudgetsCSV } from '../utils/fileHandling';

export const useBudget = () => {
    const [budgets, setBudgets] = useState<Record<string, Budget>>({});

    const setBudget = useCallback((month: string, budgetAmount: number) => {
        const monthKey = formatMonth(month + '-01'); // Ensure YYYY-MM format
        setBudgets(prev => ({
            ...prev,
            [monthKey]: {
                id: monthKey,
                month: monthKey,
                budgetAmount,
                spent: 0,
                remaining: budgetAmount,
            }
        }));
    }, []);

    const updateBudget = useCallback((monthKey: string, budgetAmount: number) => {
        setBudgets(prev => {
            const existing = prev[monthKey];
            return {
                ...prev,
                [monthKey]: {
                    ...existing,
                    id: monthKey,
                    month: monthKey,
                    budgetAmount,
                    remaining: budgetAmount - (existing?.spent || 0),
                }
            };
        });
    }, []);

    const removeBudget = useCallback((monthKey: string) => {
        setBudgets(prev => {
            const { [monthKey]: removed, ...rest } = prev;
            return rest;
        });
    }, []);

    const getBudgetForMonth = useCallback((month: string): Budget | null => {
        const monthKey = formatMonth(month);
        return budgets[monthKey] || null;
    }, [budgets]);

    const importBudgets = useCallback((csvText: string) => {
        try {
            const newBudgets = parseBudgetsCSV(csvText);
            const budgetMap = newBudgets.reduce((acc, budget) => {
                acc[budget.id] = budget;
                return acc;
            }, {} as Record<string, Budget>);

            setBudgets(prev => ({ ...prev, ...budgetMap }));
            return { success: true, message: 'Budgets imported successfully!' };
        } catch (error) {
            return { success: false, message: (error as Error).message };
        }
    }, []);

    const getCurrentMonthBudget = useCallback(() => {
        const currentMonth = formatMonth(new Date().toISOString().split('T')[0]);
        return budgets[currentMonth] || null;
    }, [budgets]);

    const getAllMonthsWithBudgets = useCallback(() => {
        return Object.keys(budgets).sort((a, b) => b.localeCompare(a)); // Most recent first
    }, [budgets]);

    return {
        budgets,
        setBudget,
        updateBudget,
        removeBudget,
        getBudgetForMonth,
        importBudgets,
        getCurrentMonthBudget,
        getAllMonthsWithBudgets,
    };
};