import { useState, useCallback, useEffect } from 'react';
import {
    MoneyPrediction,
    IncomeItem,
    OutgoingItem,
    DailyBreakdown,
    Transaction
} from '../types/recurring';
import { Expense } from '../types';
import { RecurringPayment } from '../types/recurring';

const STORAGE_KEYS = {
    BALANCE: 'expense-tracker-bank-balance',
    INCOME: 'expense-tracker-income-items',
    OUTGOING: 'expense-tracker-outgoing-items',
};

export const useMoneyPrediction = (expenses: Expense[], recurringPayments?: RecurringPayment[]) => {
    const [currentBalance, setCurrentBalance] = useState<number>(0);
    const [incomeItems, setIncomeItems] = useState<IncomeItem[]>([]);
    const [outgoingItems, setOutgoingItems] = useState<OutgoingItem[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        const savedBalance = localStorage.getItem(STORAGE_KEYS.BALANCE);
        const savedIncome = localStorage.getItem(STORAGE_KEYS.INCOME);
        const savedOutgoing = localStorage.getItem(STORAGE_KEYS.OUTGOING);

        if (savedBalance) {
            setCurrentBalance(parseFloat(savedBalance));
        }

        if (savedIncome) {
            setIncomeItems(JSON.parse(savedIncome));
        }

        if (savedOutgoing) {
            setOutgoingItems(JSON.parse(savedOutgoing));
        }
    }, []);

    // Save to localStorage whenever data changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.BALANCE, currentBalance.toString());
    }, [currentBalance]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.INCOME, JSON.stringify(incomeItems));
    }, [incomeItems]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.OUTGOING, JSON.stringify(outgoingItems));
    }, [outgoingItems]);

    const updateBankBalance = useCallback((balance: number) => {
        setCurrentBalance(balance);
    }, []);

    const addIncomeItem = useCallback((item: Omit<IncomeItem, 'id'>) => {
        const newItem: IncomeItem = {
            ...item,
            id: Date.now().toString(),
        };
        setIncomeItems(prev => [...prev, newItem]);
    }, []);

    const removeIncomeItem = useCallback((id: string) => {
        setIncomeItems(prev => prev.filter(item => item.id !== id));
    }, []);

    const addOutgoingItem = useCallback((item: Omit<OutgoingItem, 'id'>) => {
        const newItem: OutgoingItem = {
            ...item,
            id: Date.now().toString(),
        };
        setOutgoingItems(prev => [...prev, newItem]);
    }, []);

    const removeOutgoingItem = useCallback((id: string) => {
        setOutgoingItems(prev => prev.filter(item => item.id !== id));
    }, []);

    // Helper function to get next occurrence of a recurring item
    const getNextOccurrence = (date: Date, frequency: 'daily' | 'weekly' | 'monthly'): Date => {
        const nextDate = new Date(date);
        switch (frequency) {
            case 'daily':
                nextDate.setDate(nextDate.getDate() + 1);
                break;
            case 'weekly':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
            case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
        }
        return nextDate;
    };

    const shouldRecurringItemOccur = (itemDate: string, frequency: 'daily' | 'weekly' | 'monthly', checkDate: Date): boolean => {
        const startDate = new Date(itemDate);
        startDate.setHours(0, 0, 0, 0);

        // Si la date vérifiée est avant la date de début, l'élément ne peut pas se produire
        if (checkDate < startDate) {
            return false;
        }

        // Pour les récurrences quotidiennes, chaque jour après la date de début est valide
        if (frequency === 'daily') {
            return true;
        }

        // Pour les récurrences hebdomadaires, vérifier si c'est le même jour de la semaine
        if (frequency === 'weekly') {
            // Si c'est la date de début exacte, retourner vrai
            if (startDate.getTime() === checkDate.getTime()) {
                return true;
            }

            // Vérifier si c'est le même jour de la semaine et qu'au moins une semaine s'est écoulée
            return startDate.getDay() === checkDate.getDay() && checkDate > startDate;
        }

        // Pour les récurrences mensuelles
        if (frequency === 'monthly') {
            // Si c'est la date de début exacte, retourner vrai
            if (startDate.getTime() === checkDate.getTime()) {
                return true;
            }

            // Vérifier si le jour du mois correspond
            const startDay = startDate.getDate();
            const checkDay = checkDate.getDate();

            // Si la date de début est le dernier jour de son mois
            const lastDayOfStartMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
            const lastDayOfCheckMonth = new Date(checkDate.getFullYear(), checkDate.getMonth() + 1, 0).getDate();

            if (startDay === lastDayOfStartMonth) {
                return checkDay === lastDayOfCheckMonth;
            }

            // Si le jour de début dépasse le dernier jour du mois vérifié
            if (startDay > lastDayOfCheckMonth) {
                return checkDay === lastDayOfCheckMonth;
            }

            // Sinon, vérifier si les jours correspondent et qu'au moins un mois s'est écoulé
            return checkDay === startDay &&
                ((checkDate.getFullYear() > startDate.getFullYear()) ||
                    (checkDate.getFullYear() === startDate.getFullYear() &&
                        checkDate.getMonth() >= startDate.getMonth()));
        }

        return false;
    };

// Fixed function to properly determine if a recurring payment should occur on a specific date
    const shouldRecurringPaymentOccur = (payment: RecurringPayment, checkDate: Date): boolean => {
        const startDate = new Date(payment.startDate);
        const endDate = new Date(payment.endDate);

        // Check if the date is within the payment period
        if (checkDate < startDate || checkDate > endDate) {
            return false;
        }

        // For daily recurrences, every day within the period is valid
        if (payment.frequency === 'daily') {
            return true;
        }

        // For weekly recurrences, check if the difference in days is a multiple of 7
        if (payment.frequency === 'weekly') {
            const diffTime = checkDate.getTime() - startDate.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            return diffDays % 7 === 0;
        }

        // For monthly recurrences
        if (payment.frequency === 'monthly') {
            // Check if the month difference is a multiple of 1
            const monthDiff = (checkDate.getFullYear() - startDate.getFullYear()) * 12 + (checkDate.getMonth() - startDate.getMonth());
            if (monthDiff % 1 !== 0) {
                return false;
            }

            // Check if the day of the month matches
            const startDay = startDate.getDate();
            const checkDay = checkDate.getDate();

            // If the start day is the last day of its month, check if the check day is the last day of its month
            const lastDayOfStartMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
            const lastDayOfCheckMonth = new Date(checkDate.getFullYear(), checkDate.getMonth() + 1, 0).getDate();

            if (startDay === lastDayOfStartMonth) {
                return checkDay === lastDayOfCheckMonth;
            }

            // If the start day is beyond the last day of the check month, consider the last day of the check month
            if (startDay > lastDayOfCheckMonth) {
                return checkDay === lastDayOfCheckMonth;
            }

            // Otherwise, check if the days match
            return checkDay === startDay;
        }

        return false;
    };

    // Helper function to get all transactions for a specific date
    const getTransactionsForDate = (date: Date): Transaction[] => {
        const transactions: Transaction[] = [];
        const dateStr = date.toISOString().split('T')[0];

        // Check income items
        incomeItems.forEach(item => {
            if (item.isRecurring && item.frequency) {
                // Check if this date matches the recurring pattern
                if (shouldRecurringItemOccur(item.date, item.frequency, date)) {
                    transactions.push({
                        name: `${item.name} (Recurring)`,
                        amount: item.amount,
                        type: 'income',
                        date: dateStr,
                    });
                }
            } else if (item.date === dateStr) {
                // One-time income
                transactions.push({
                    name: item.name,
                    amount: item.amount,
                    type: 'income',
                    date: dateStr,
                });
            }
        });

        // Check outgoing items
        outgoingItems.forEach(item => {
            if (item.isRecurring && item.frequency) {
                // Check if this date matches the recurring pattern
                if (shouldRecurringItemOccur(item.date, item.frequency, date)) {
                    transactions.push({
                        name: `${item.name} (Recurring)`,
                        amount: -item.amount,
                        type: 'outgoing',
                        date: dateStr,
                    });
                }
            } else if (item.date === dateStr) {
                // One-time outgoing
                transactions.push({
                    name: item.name,
                    amount: -item.amount,
                    type: 'outgoing',
                    date: dateStr,
                });
            }
        });

        // Check recurring payments
        if (recurringPayments) {
            recurringPayments.forEach(payment => {
                if (payment.isActive && shouldRecurringPaymentOccur(payment, date)) {
                    transactions.push({
                        name: `${payment.name} (Recurring Payment)`,
                        amount: -payment.amount,
                        type: 'outgoing',
                        date: dateStr,
                    });
                }
            });
        }

        // Don't include actual expenses in prediction - they're already in the past
        // Only include expenses that are in the future (shouldn't happen normally)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (date > today) {
            expenses.forEach(expense => {
                if (expense.date === dateStr) {
                    transactions.push({
                        name: `${expense.note || 'Expense'} (${expense.category})`,
                        amount: -expense.amount,
                        type: 'outgoing',
                        date: dateStr,
                    });
                }
            });
        }

        return transactions;
    };

    const predictMoneyForDate = useCallback((targetDate: string): MoneyPrediction => {
        const target = new Date(targetDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        target.setHours(23, 59, 59, 999);

        // Log des données pour débogage
        console.log('Prédiction pour:', targetDate);
        console.log('Solde actuel:', currentBalance);
        console.log('Revenus:', incomeItems);
        console.log('Dépenses:', outgoingItems);

        let currentPredictedBalance = currentBalance;
        const dailyBreakdown: DailyBreakdown[] = [];

        // Start from tomorrow (not today) for predictions
        let currentDate = new Date(today);
        currentDate.setDate(currentDate.getDate() + 1);

        while (currentDate <= target) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const transactions = getTransactionsForDate(currentDate);

            // Log détaillé pour cette date
            console.log(`Transactions pour ${dateStr}:`, transactions);

            // Calculate the balance change for this day
            const dayChange = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
            currentPredictedBalance += dayChange;

            console.log(`Changement pour ${dateStr}: ${dayChange}, Solde prédit: ${currentPredictedBalance}`);

            // Add to daily breakdown (only add days with transactions or show all days)
            dailyBreakdown.push({
                date: dateStr,
                balance: currentPredictedBalance,
                transactions: transactions,
            });

            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return {
            currentBalance,
            predictedBalance: currentPredictedBalance,
            targetDate,
            dailyBreakdown,
        };
    }, [currentBalance, incomeItems, outgoingItems, expenses, recurringPayments]);

    return {
        currentBalance,
        incomeItems,
        outgoingItems,
        updateBankBalance,
        addIncomeItem,
        removeIncomeItem,
        addOutgoingItem,
        removeOutgoingItem,
        predictMoneyForDate,
    };
};