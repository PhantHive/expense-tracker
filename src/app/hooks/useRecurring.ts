import { useState, useCallback, useEffect } from 'react';
import { RecurringLabel, RecurringPayment } from '../types/recurring';

const STORAGE_KEYS = {
    LABELS: 'expense-tracker-recurring-labels',
    PAYMENTS: 'expense-tracker-recurring-payments',
};

export const useRecurring = () => {
    const [recurringLabels, setRecurringLabels] = useState<RecurringLabel[]>([]);
    const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        const savedLabels = localStorage.getItem(STORAGE_KEYS.LABELS);
        const savedPayments = localStorage.getItem(STORAGE_KEYS.PAYMENTS);

        if (savedLabels) {
            setRecurringLabels(JSON.parse(savedLabels));
        }

        if (savedPayments) {
            setRecurringPayments(JSON.parse(savedPayments));
        }
    }, []);

    // Save to localStorage whenever data changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.LABELS, JSON.stringify(recurringLabels));
    }, [recurringLabels]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(recurringPayments));
    }, [recurringPayments]);

    // Calculate how many payments should have been made since start date
    const calculatePaymentsMadeSinceStart = useCallback((payment: RecurringPayment, currentDate: Date = new Date()) => {
        const startDate = new Date(payment.startDate);
        const endDate = new Date(payment.endDate);

        // If current date is before start date, no payments should have been made
        if (currentDate < startDate) {
            return 0;
        }

        // If current date is after end date, calculate based on end date
        const calculationDate = currentDate > endDate ? endDate : currentDate;

        let paymentsMade = 0;
        let nextPaymentDate = new Date(startDate);

        while (nextPaymentDate <= calculationDate) {
            paymentsMade++;

            // Calculate next payment date based on frequency
            switch (payment.frequency) {
                case 'daily':
                    nextPaymentDate.setDate(nextPaymentDate.getDate() + 1);
                    break;
                case 'weekly':
                    nextPaymentDate.setDate(nextPaymentDate.getDate() + 7);
                    break;
                case 'monthly':
                    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
                    break;
            }
        }

        return paymentsMade;
    }, []);

    // Calculate remaining payments based on start date
    const calculateRemainingPayments = useCallback((payment: RecurringPayment) => {
        if (!payment.paymentCount) {
            return undefined; // Unlimited payments
        }

        const paymentsMade = calculatePaymentsMadeSinceStart(payment);
        return Math.max(0, payment.paymentCount - paymentsMade);
    }, [calculatePaymentsMadeSinceStart]);

    const addRecurringLabel = useCallback((name: string, category: string, amount?: number) => {
        const newLabel: RecurringLabel = {
            id: Date.now().toString(),
            name,
            category,
            amount,
            createdAt: new Date().toISOString(),
        };
        setRecurringLabels(prev => [...prev, newLabel]);
    }, []);

    const removeRecurringLabel = useCallback((id: string) => {
        setRecurringLabels(prev => prev.filter(label => label.id !== id));
    }, []);

    const addRecurringPayment = useCallback((payment: Omit<RecurringPayment, 'id' | 'isActive' | 'remainingPayments'>) => {
        const newPayment: RecurringPayment = {
            ...payment,
            id: Date.now().toString(),
            isActive: true,
            remainingPayments: payment.paymentCount ? payment.paymentCount : undefined,
        };
        setRecurringPayments(prev => [...prev, newPayment]);
    }, []);

    const updateRecurringPayment = useCallback((id: string, updates: Partial<RecurringPayment>) => {
        setRecurringPayments(prev =>
            prev.map(payment => {
                if (payment.id === id) {
                    const updatedPayment = { ...payment, ...updates };

                    // Recalculate remaining payments if this update affects the payment count
                    if (updatedPayment.paymentCount !== undefined) {
                        updatedPayment.remainingPayments = calculateRemainingPayments(updatedPayment);
                    }

                    return updatedPayment;
                } else {
                    return payment;
                }
            })
        );
    }, [calculateRemainingPayments]);

    const removeRecurringPayment = useCallback((id: string) => {
        setRecurringPayments(prev => prev.filter(payment => payment.id !== id));
    }, []);

    const getActiveRecurringPayments = useCallback(() => {
        const today = new Date();
        return recurringPayments.filter(payment => {
            const endDate = new Date(payment.endDate);
            const remainingPayments = calculateRemainingPayments(payment);

            return payment.isActive &&
                endDate >= today &&
                (remainingPayments === undefined || remainingPayments > 0);
        });
    }, [recurringPayments, calculateRemainingPayments]);

    const getExpiredRecurringPayments = useCallback(() => {
        const today = new Date();
        return recurringPayments.filter(payment => {
            const endDate = new Date(payment.endDate);
            const remainingPayments = calculateRemainingPayments(payment);

            return payment.isActive &&
                (endDate < today || (remainingPayments !== undefined && remainingPayments <= 0));
        });
    }, [recurringPayments, calculateRemainingPayments]);

    const cleanupExpiredPayments = useCallback(() => {
        const expired = getExpiredRecurringPayments();
        expired.forEach(payment => {
            updateRecurringPayment(payment.id, { isActive: false });
        });
    }, [getExpiredRecurringPayments, updateRecurringPayment]);

    const getMonthlyRecurringExpenses = useCallback((month: string) => {
        const activePayments = getActiveRecurringPayments();
        const monthStart = new Date(month + '-01');
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

        return activePayments.filter(payment => {
            const startDate = new Date(payment.startDate);
            const endDate = new Date(payment.endDate);

            return startDate <= monthEnd && endDate >= monthStart;
        });
    }, [getActiveRecurringPayments]);

    const isPendingForMonth = useCallback((payment: RecurringPayment, month: string) => {
        const monthStart = new Date(month + '-01');
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
        const startDate = new Date(payment.startDate);

        // If payment hasn't started yet this month, it's not pending
        if (startDate > monthEnd) {
            return false;
        }

        // Check if we should have a payment in this month based on frequency and start date
        let currentPaymentDate = new Date(startDate);

        while (currentPaymentDate <= monthEnd) {
            // If this payment date is in the current month and we haven't processed it yet
            if (currentPaymentDate >= monthStart && currentPaymentDate <= monthEnd) {
                const lastProcessed = payment.lastProcessed ? new Date(payment.lastProcessed) : null;

                // If never processed, or last processed was before this payment date
                if (!lastProcessed || lastProcessed < currentPaymentDate) {
                    return true;
                }
            }

            // Calculate next payment date
            switch (payment.frequency) {
                case 'daily':
                    currentPaymentDate.setDate(currentPaymentDate.getDate() + 1);
                    break;
                case 'weekly':
                    currentPaymentDate.setDate(currentPaymentDate.getDate() + 7);
                    break;
                case 'monthly':
                    currentPaymentDate.setMonth(currentPaymentDate.getMonth() + 1);
                    break;
            }
        }

        return false;
    }, []);

    // Function to refresh all payment calculations (useful for periodic updates)
    const refreshPaymentCalculations = useCallback(() => {
        setRecurringPayments(prev =>
            prev.map(payment => ({
                ...payment,
                remainingPayments: calculateRemainingPayments(payment)
            }))
        );
    }, [calculateRemainingPayments]);

    return {
        recurringLabels,
        recurringPayments,
        addRecurringLabel,
        removeRecurringLabel,
        addRecurringPayment,
        updateRecurringPayment,
        removeRecurringPayment,
        getActiveRecurringPayments,
        getExpiredRecurringPayments,
        cleanupExpiredPayments,
        getMonthlyRecurringExpenses,
        isPendingForMonth,
        refreshPaymentCalculations,
        calculateRemainingPayments,
        calculatePaymentsMadeSinceStart,
    };
};