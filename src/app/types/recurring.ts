// Add these types to your existing types/recurring.ts file or create it if it doesn't exist

export interface IncomeItem {
    id: string;
    name: string;
    amount: number;
    date: string; // YYYY-MM-DD format
    isRecurring: boolean;
    frequency?: 'daily' | 'weekly' | 'monthly';
}

export interface OutgoingItem {
    id: string;
    name: string;
    amount: number;
    date: string; // YYYY-MM-DD format
    category: string;
    isRecurring: boolean;
    frequency?: 'daily' | 'weekly' | 'monthly';
}

export interface Transaction {
    name: string;
    amount: number; // Positive for income, negative for outgoing
    type: 'income' | 'outgoing';
    date: string; // YYYY-MM-DD format
}

export interface DailyBreakdown {
    date: string; // YYYY-MM-DD format
    balance: number;
    transactions: Transaction[];
}

export interface MoneyPrediction {
    currentBalance: number;
    predictedBalance: number;
    targetDate: string;
    dailyBreakdown: DailyBreakdown[];
}

export interface RecurringLabel {
    id: string;
    name: string;
    category: string;
    amount?: number;
    createdAt: string;
}

export interface RecurringPayment {
    id: string;
    name: string;
    category: string;
    amount: number;
    startDate: string; // YYYY-MM-DD format
    endDate: string; // YYYY-MM-DD format
    frequency: 'daily' | 'weekly' | 'monthly';
    isActive: boolean;
    paymentCount?: number; // Total number of payments (e.g., PayPal x4)
    remainingPayments?: number; // How many payments are left
    lastProcessed?: string; // Last date when payment was processed
}