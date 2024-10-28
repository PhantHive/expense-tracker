'use client'; // Add this at the top since we're using client-side features

import { Providers } from './providers';
import Head from 'next/head';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <Head>
                <title>Expense Tracker</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}