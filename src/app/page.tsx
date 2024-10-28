'use client'; // Add this at the top since we're using client-side features

import ExpenseTracker from './components/ExpenseTracker';
import Head from 'next/head';

export default function Home() {
    return (
        <>
            <Head>
                <title>Expense Tracker</title>
            </Head>
            <ExpenseTracker />
        </>
    );
}