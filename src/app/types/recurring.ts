// Updated types/recurring.ts file

export interface RecurringLabel {
    id: string;
    name: string;
    category: string;
    amount?: number;
    createdAt: string;
}

export interface PaymentScheduleItem {
    date: string; // YYYY-MM-DD format
    amount: number;
    processed?: boolean; // Track if this specific payment has been processed
}

export interface RecurringPayment {
    id: string;
    name: string;
    category: string;
    amount: number; // This becomes the default/base amount for display
    startDate: string;
    endDate: string;
    frequency: 'monthly' | 'weekly' | 'daily' | 'custom'; // Add 'custom' option
    paymentCount?: number;
    remainingPayments?: number;
    lastProcessed?: string;
    isActive: boolean;

    // New field for custom payment schedules
    customSchedule?: PaymentScheduleItem[]; // Only used when frequency is 'custom'
}

// Money prediction types
export interface IncomeItem {
    id: string;
    name: string;
    amount: number;
    date: string;
    isRecurring?: boolean;
    frequency?: 'daily' | 'weekly' | 'monthly';
}

export interface OutgoingItem {
    id: string;
    name: string;
    amount: number;
    date: string;
    category: string;
    isRecurring?: boolean;
    frequency?: 'daily' | 'weekly' | 'monthly';
}

export interface Transaction {
    name: string;
    amount: number;
    type: 'income' | 'outgoing';
    date: string;
}

export interface DailyBreakdown {
    date: string;
    balance: number;
    transactions: Transaction[];
}

export interface MoneyPrediction {
    currentBalance: number;
    predictedBalance: number;
    targetDate: string;
    dailyBreakdown: DailyBreakdown[];
}