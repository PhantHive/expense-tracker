'use client';

import { Providers } from './providers';
import './globals.css';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <title>Expense Tracker</title>
                <meta name="description" content="Track your expenses with this beautiful app" />
            </head>
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}