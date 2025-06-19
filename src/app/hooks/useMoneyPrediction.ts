import { useState, useCallback, useEffect } from 'react';
import {
    MoneyPrediction,
    IncomeItem,
    OutgoingItem,
    DailyBreakdown,
    Transaction
} from '../types/recurring';
import { Expense } from '../types';
import { RecurringPayment, PaymentScheduleItem } from '../types/recurring';

const STORAGE_KEYS = {
    BALANCE: 'expense-tracker-bank-balance',
    INCOME: 'expense-tracker-income-items',
    OUTGOING: 'expense-tracker-outgoing-items',
};

// Helper function to get all scheduled payments for a payment
const getScheduledPayments = (payment: RecurringPayment): PaymentScheduleItem[] => {
    if (payment.frequency === 'custom' && payment.customSchedule) {
        return payment.customSchedule;
    }

    // For regular frequencies, generate the schedule dynamically
    const schedule: PaymentScheduleItem[] = [];
    const startDate = new Date(payment.startDate);
    const endDate = new Date(payment.endDate);
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        schedule.push({
            date: currentDate.toISOString().split('T')[0],
            amount: payment.amount,
            processed: false
        });

        // Calculate next payment date based on frequency
        switch (payment.frequency) {
            case 'daily':
                currentDate.setDate(currentDate.getDate() + 1);
                break;
            case 'weekly':
                currentDate.setDate(currentDate.getDate() + 7);
                break;
            case 'monthly':
                currentDate.setMonth(currentDate.getMonth() + 1);
                break;
        }
    }

    return schedule;
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

    const shouldRecurringItemOccur = (itemDate: string, frequency: 'daily' | 'weekly' | 'monthly', checkDate: Date): boolean => {
        const startDate = new Date(itemDate);
        startDate.setHours(0, 0, 0, 0);

        // If the check date is before the start date, the item cannot occur
        if (checkDate < startDate) {
            return false;
        }

        // For daily recurrences, every day after the start date is valid
        if (frequency === 'daily') {
            return true;
        }

        // For weekly recurrences, check if it's the same day of the week
        if (frequency === 'weekly') {
            if (startDate.getTime() === checkDate.getTime()) {
                return true;
            }
            return startDate.getDay() === checkDate.getDay() && checkDate > startDate;
        }

        // For monthly recurrences
        if (frequency === 'monthly') {
            if (startDate.getTime() === checkDate.getTime()) {
                return true;
            }

            const startDay = startDate.getDate();
            const checkDay = checkDate.getDate();

            // Handle last day of month scenarios
            const lastDayOfStartMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
            const lastDayOfCheckMonth = new Date(checkDate.getFullYear(), checkDate.getMonth() + 1, 0).getDate();

            if (startDay === lastDayOfStartMonth) {
                return checkDay === lastDayOfCheckMonth;
            }

            if (startDay > lastDayOfCheckMonth) {
                return checkDay === lastDayOfCheckMonth;
            }

            return checkDay === startDay &&
                ((checkDate.getFullYear() > startDate.getFullYear()) ||
                    (checkDate.getFullYear() === startDate.getFullYear() &&
                        checkDate.getMonth() >= startDate.getMonth()));
        }

        return false;
    };

    // Check if a scheduled payment should occur on a specific date
    const shouldScheduledPaymentOccur = useCallback((scheduledItem: PaymentScheduleItem, checkDate: Date): boolean => {
        const scheduledDate = new Date(scheduledItem.date);
        scheduledDate.setHours(0, 0, 0, 0);

        return scheduledDate.getTime() === checkDate.getTime() && !scheduledItem.processed;
    }, []);

    // Helper function to get all transactions for a specific date
    const getTransactionsForDate = useCallback((date: Date): Transaction[] => {
        const transactions: Transaction[] = [];
        const dateStr = date.toISOString().split('T')[0];

        // Check income items
        incomeItems.forEach(item => {
            if (item.isRecurring && item.frequency) {
                if (shouldRecurringItemOccur(item.date, item.frequency, date)) {
                    transactions.push({
                        name: `${item.name} (Recurring)`,
                        amount: item.amount,
                        type: 'income',
                        date: dateStr,
                    });
                }
            } else if (item.date === dateStr) {
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
                if (shouldRecurringItemOccur(item.date, item.frequency, date)) {
                    transactions.push({
                        name: `${item.name} (Recurring)`,
                        amount: -item.amount,
                        type: 'outgoing',
                        date: dateStr,
                    });
                }
            } else if (item.date === dateStr) {
                transactions.push({
                    name: item.name,
                    amount: -item.amount,
                    type: 'outgoing',
                    date: dateStr,
                });
            }
        });

        // Check recurring payments using the new schedule system
        if (recurringPayments) {
            recurringPayments.forEach(payment => {
                if (payment.isActive) {
                    const schedule = getScheduledPayments(payment);
                    schedule.forEach(scheduledItem => {
                        if (shouldScheduledPaymentOccur(scheduledItem, date)) {
                            transactions.push({
                                name: `${payment.name} (Scheduled Payment)`,
                                amount: -scheduledItem.amount,
                                type: 'outgoing',
                                date: dateStr,
                            });
                        }
                    });
                }
            });
        }

        // Don't include past expenses in predictions - they're already accounted for in the current balance
        // Only include future expenses that might be scheduled
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
    }, [incomeItems, outgoingItems, recurringPayments, expenses, shouldScheduledPaymentOccur]);

    const predictMoneyForDate = useCallback((targetDate: string): MoneyPrediction => {
        const target = new Date(targetDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        target.setHours(23, 59, 59, 999);

        console.log('Money prediction for:', targetDate);
        console.log('Current balance:', currentBalance);
        console.log('Income items:', incomeItems);
        console.log('Outgoing items:', outgoingItems);
        console.log('Recurring payments:', recurringPayments);

        let currentPredictedBalance = currentBalance;
        const dailyBreakdown: DailyBreakdown[] = [];

        // Start from tomorrow for predictions
        let currentDate = new Date(today);
        currentDate.setDate(currentDate.getDate() + 1);

        while (currentDate <= target) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const transactions = getTransactionsForDate(currentDate);

            console.log(`Transactions for ${dateStr}:`, transactions);

            // Calculate the balance change for this day
            const dayChange = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
            currentPredictedBalance += dayChange;

            console.log(`Change for ${dateStr}: ${dayChange}, Predicted balance: ${currentPredictedBalance}`);

            // Add to daily breakdown
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
    }, [currentBalance, getTransactionsForDate]);

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