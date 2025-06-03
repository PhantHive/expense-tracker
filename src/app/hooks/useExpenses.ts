import { useState, useCallback } from 'react';
import { Expense, SortOrder } from '../types';
import { sortExpenses } from '../utils/dataProcessing';
import { parseExpensesCSV } from '../utils/fileHandling';

export const useExpenses = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [categoryFilter, setCategoryFilter] = useState<string>('');
    const [dateOrder, setDateOrder] = useState<SortOrder>('asc');
    const [priceOrder, setPriceOrder] = useState<SortOrder>('asc');

    const addExpense = useCallback((expense: Omit<Expense, 'id'>) => {
        const newExpense: Expense = {
            ...expense,
            id: Date.now(),
        };
        setExpenses(prev => [...prev, newExpense]);
    }, []);

    const updateExpense = useCallback((id: number, updatedExpense: Omit<Expense, 'id'>) => {
        setExpenses(prev =>
            prev.map(exp => (exp.id === id ? { ...updatedExpense, id } : exp))
        );
    }, []);

    const removeExpense = useCallback((id: number) => {
        setExpenses(prev => prev.filter(expense => expense.id !== id));
    }, []);

    const importExpenses = useCallback((csvText: string) => {
        try {
            const newExpenses = parseExpensesCSV(csvText);
            setExpenses(prev => [...prev, ...newExpenses]);
            return { success: true, message: 'Expenses imported successfully!' };
        } catch (error) {
            return { success: false, message: (error as Error).message };
        }
    }, []);

    const getFilteredAndSortedExpenses = useCallback(() => {
        const filtered = categoryFilter
            ? expenses.filter(expense => expense.category === categoryFilter)
            : expenses;

        return sortExpenses(filtered, dateOrder, priceOrder);
    }, [expenses, categoryFilter, dateOrder, priceOrder]);

    const getUniqueCategories = useCallback(() => {
        return Array.from(new Set(expenses.map(expense => expense.category)));
    }, [expenses]);

    const handleDateOrderChange = useCallback(() => {
        setDateOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
        setPriceOrder(null);
    }, []);

    const handlePriceOrderChange = useCallback(() => {
        setPriceOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
        setDateOrder(null);
    }, []);

    return {
        expenses,
        categoryFilter,
        setCategoryFilter,
        dateOrder,
        priceOrder,
        addExpense,
        updateExpense,
        removeExpense,
        importExpenses,
        getFilteredAndSortedExpenses,
        getUniqueCategories,
        handleDateOrderChange,
        handlePriceOrderChange,
    };
};