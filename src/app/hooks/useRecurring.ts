import { useState, useCallback, useEffect } from 'react';
import { RecurringLabel, RecurringPayment, PaymentScheduleItem } from '../types/recurring';

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

    // Helper function to get all scheduled payments for a payment
    const getScheduledPayments = useCallback((payment: RecurringPayment): PaymentScheduleItem[] => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (payment.frequency === 'custom' && payment.customSchedule) {
            // For custom schedules, check each payment against today's date
            return payment.customSchedule.map(item => {
                const itemDate = new Date(item.date);
                itemDate.setHours(0, 0, 0, 0);

                return {
                    ...item,
                    processed: item.processed || itemDate < today // Mark as processed if in the past or already processed
                };
            });
        }

        // For regular frequencies, generate the schedule dynamically
        const schedule: PaymentScheduleItem[] = [];
        const startDate = new Date(payment.startDate);
        const endDate = new Date(payment.endDate);
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const paymentDate = new Date(currentDate);
            paymentDate.setHours(0, 0, 0, 0);

            // Check if this payment was already processed based on lastProcessed date
            let isProcessed = false;
            if (payment.lastProcessed) {
                const lastProcessedDate = new Date(payment.lastProcessed);
                lastProcessedDate.setHours(0, 0, 0, 0);
                isProcessed = paymentDate <= lastProcessedDate;
            }

            // Also mark as processed if the date is in the past
            isProcessed = isProcessed || paymentDate < today;

            schedule.push({
                date: currentDate.toISOString().split('T')[0],
                amount: payment.amount,
                processed: isProcessed
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
    }, []);

    // Helper function to get pending payments for a specific month
    const getPendingPaymentsForMonth = useCallback((payment: RecurringPayment, month: string): PaymentScheduleItem[] => {
        const monthStart = new Date(month + '-01');
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

        const allScheduled = getScheduledPayments(payment);

        return allScheduled.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= monthStart &&
                itemDate <= monthEnd &&
                !item.processed;
        });
    }, [getScheduledPayments]);

    // Calculate remaining payments based on schedule
    const calculateRemainingPayments = useCallback((payment: RecurringPayment) => {
        const schedule = getScheduledPayments(payment);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Count unprocessed payments that are still in the future or today
        const remaining = schedule.filter(item => {
            const itemDate = new Date(item.date);
            itemDate.setHours(0, 0, 0, 0);
            return !item.processed && itemDate >= today;
        }).length;

        return remaining;
    }, [getScheduledPayments]);

    // Get the next scheduled payment for a recurring payment
    const getNextScheduledPayment = useCallback((payment: RecurringPayment): PaymentScheduleItem | null => {
        const schedule = getScheduledPayments(payment);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find the next unprocessed payment
        const nextPayment = schedule.find(item => {
            const itemDate = new Date(item.date);
            itemDate.setHours(0, 0, 0, 0);
            return !item.processed && itemDate >= today;
        });

        return nextPayment || null;
    }, [getScheduledPayments]);

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

    const addRecurringPayment = useCallback((payment: Omit<RecurringPayment, 'id' | 'isActive'>) => {
        const newPayment: RecurringPayment = {
            ...payment,
            id: Date.now().toString(),
            isActive: true,
        };
        setRecurringPayments(prev => [...prev, newPayment]);
    }, []);

    const updateRecurringPayment = useCallback((id: string, updates: Partial<RecurringPayment>) => {
        setRecurringPayments(prev =>
            prev.map(payment => {
                if (payment.id === id) {
                    return { ...payment, ...updates };
                }
                return payment;
            })
        );
    }, []);

    // Mark a specific scheduled payment as processed
    const markScheduledPaymentAsProcessed = useCallback((paymentId: string, scheduledDate: string) => {
        setRecurringPayments(prev =>
            prev.map(payment => {
                if (payment.id === paymentId) {
                    if (payment.frequency === 'custom' && payment.customSchedule) {
                        const updatedSchedule = payment.customSchedule.map(item =>
                            item.date === scheduledDate ? { ...item, processed: true } : item
                        );
                        return { ...payment, customSchedule: updatedSchedule };
                    } else {
                        // For regular payments, we'll update the lastProcessed field
                        return { ...payment, lastProcessed: scheduledDate };
                    }
                }
                return payment;
            })
        );
    }, []);

    // Get all pending scheduled payments for a specific month
    const getPendingScheduledPayments = useCallback((month: string) => {
        const result: Array<{ payment: RecurringPayment; scheduledItems: PaymentScheduleItem[] }> = [];

        recurringPayments.forEach(payment => {
            if (payment.isActive) {
                const pendingItems = getPendingPaymentsForMonth(payment, month);
                if (pendingItems.length > 0) {
                    result.push({ payment, scheduledItems: pendingItems });
                }
            }
        });

        return result;
    }, [recurringPayments, getPendingPaymentsForMonth]);

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
                remainingPayments > 0;
        });
    }, [recurringPayments, calculateRemainingPayments]);

    const getExpiredRecurringPayments = useCallback(() => {
        const today = new Date();
        return recurringPayments.filter(payment => {
            const endDate = new Date(payment.endDate);
            const remainingPayments = calculateRemainingPayments(payment);

            return payment.isActive &&
                (endDate < today || remainingPayments <= 0);
        });
    }, [recurringPayments, calculateRemainingPayments]);

    const cleanupExpiredPayments = useCallback(() => {
        const expired = getExpiredRecurringPayments();
        expired.forEach(payment => {
            updateRecurringPayment(payment.id, { isActive: false });
        });
    }, [getExpiredRecurringPayments, updateRecurringPayment]);

    // Check if a payment has pending items for a specific month
    const isPendingForMonth = useCallback((payment: RecurringPayment, month: string) => {
        const pendingItems = getPendingPaymentsForMonth(payment, month);
        return pendingItems.length > 0;
    }, [getPendingPaymentsForMonth]);

    // Function to refresh all payment calculations
    const refreshPaymentCalculations = useCallback(() => {
        // For custom schedules, we don't need to recalculate anything
        // The schedule is explicitly defined
        setRecurringPayments(prev => [...prev]);
    }, []);

    // Get total amount for a payment (sum of all scheduled amounts)
    const getTotalPaymentAmount = useCallback((payment: RecurringPayment): number => {
        const schedule = getScheduledPayments(payment);
        return schedule.reduce((sum, item) => sum + item.amount, 0);
    }, [getScheduledPayments]);

    // Get amount for current month
    const getMonthlyAmount = useCallback((payment: RecurringPayment, month: string): number => {
        const monthlyItems = getPendingPaymentsForMonth(payment, month);
        return monthlyItems.reduce((sum, item) => sum + item.amount, 0);
    }, [getPendingPaymentsForMonth]);

    return {
        recurringLabels,
        recurringPayments,
        addRecurringLabel,
        removeRecurringLabel,
        addRecurringPayment,
        updateRecurringPayment,
        removeRecurringPayment,
        markScheduledPaymentAsProcessed,
        getActiveRecurringPayments,
        getExpiredRecurringPayments,
        cleanupExpiredPayments,
        isPendingForMonth,
        refreshPaymentCalculations,
        calculateRemainingPayments,
        getNextScheduledPayment,
        getPendingScheduledPayments,
        getTotalPaymentAmount,
        getMonthlyAmount,
        getScheduledPayments,
        getPendingPaymentsForMonth, // Make sure this is included in the return
    };
};