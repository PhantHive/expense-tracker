'use client';

import { Providers } from './providers';
import './globals.css';

const basePath = process.env.NODE_ENV === 'production' ? '/expense-tracker' : '';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <title>Expense Tracker</title>
                <link rel="icon" href={`${basePath}/favicon.ico`} />
                <meta name="description" content="Track your expenses with this beautiful app" />
            </head>
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}