import React, { useState, useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import {
    Typography,
    Button,
    Alert,
    Box,
    Container,
    Stack,
    Paper,
} from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { styled } from '@mui/system';
import Image from 'next/image';

import { useExpenses } from '../hooks/useExpenses';
import { useBudget } from '../hooks/useBudget';
import {
    getPieChartData,
    getBarChartData,
    getBudgetChartData,
    getMonthlyData,
    getCurrentMonthData
} from '../utils/dataProcessing';
import { downloadExpensesCSV, downloadBudgetsCSV } from '../utils/fileHandling';
import { THEME, IMAGES, NOTIFICATIONS } from '../constants';
import { Expense } from '../types';

import ExpenseForm from './ExpenseForm';
import BudgetForm from './BudgetForm';
import BudgetSummary from './BudgetSummary';
import ExpenseTable from './ExpenseTable';
import PieChart from './Charts/PieChart';
import BarChart from './Charts/BarChart';
import BudgetChart from './Charts/BudgetChart';
import Notification from './Notification';

// Styled components
const Background = styled(Box)({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: `url(${IMAGES.basePath}${IMAGES.elf})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    zIndex: -1,
    filter: 'brightness(0.7) saturate(1.2)',
    overflow: 'hidden',
    '&::before, &::after, & .bubble-1, & .bubble-2, & .bubble-3, & .bubble-4': {
        content: '""',
        position: 'absolute',
        width: '100px',
        height: '100px',
        background: 'radial-gradient(circle, rgba(0,255,0,0.5) 0%, rgba(0,255,0,0) 70%)',
        borderRadius: '50%',
        animation: 'move 5s infinite alternate',
    },
    '&::before': {
        top: '20%',
        left: '30%',
        animationDelay: '0s',
    },
    '&::after': {
        top: '60%',
        left: '70%',
        animationDelay: '2.5s',
    },
    '& .bubble-1': {
        top: '40%',
        left: '50%',
        animationDelay: '1.25s',
    },
    '& .bubble-2': {
        top: '80%',
        left: '20%',
        animationDelay: '3.75s',
    },
    '& .bubble-3': {
        top: '10%',
        left: '80%',
        animationDelay: '1.75s',
    },
    '& .bubble-4': {
        top: '70%',
        left: '10%',
        animationDelay: '4.25s',
    },
    '@keyframes move': {
        '0%': {
            transform: 'translate(0, 0) scale(1)',
        },
        '100%': {
            transform: 'translate(50px, 50px) scale(1.5)',
        },
    },
});

const GlowingBorder = styled(Box)({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 1,
    '&::before, &::after, & .glow-left, & .glow-right': {
        content: '""',
        position: 'absolute',
        background: 'linear-gradient(to right, rgba(0,255,0,0) 0%, rgba(0,255,0,1) 50%, rgba(0,255,0,0) 100%)',
        animation: 'glow 2s infinite alternate',
    },
    '&::before': {
        top: 0,
        left: 0,
        width: '100%',
        height: '5px',
    },
    '&::after': {
        bottom: 0,
        left: 0,
        width: '100%',
        height: '5px',
    },
    '& .glow-left': {
        top: 0,
        left: 0,
        width: '5px',
        height: '100%',
        background: 'linear-gradient(to bottom, rgba(0,255,0,0) 0%, rgba(0,255,0,1) 50%, rgba(0,255,0,0) 100%)',
    },
    '& .glow-right': {
        top: 0,
        right: 0,
        width: '5px',
        height: '100%',
        background: 'linear-gradient(to bottom, rgba(0,255,0,0) 0%, rgba(0,255,0,1) 50%, rgba(0,255,0,0) 100%)',
    },
    '@keyframes glow': {
        '0%': {
            opacity: 0.5,
        },
        '100%': {
            opacity: 1,
        },
    },
});

const StyledPaper = styled(Paper)({
    borderRadius: 8,
    overflow: 'hidden',
    height: '100%',
});

const ExpenseTracker: React.FC = () => {
    // Custom hooks
    const {
        expenses,
        categoryFilter,
        setCategoryFilter,
        dateOrder,
        priceOrder,
        addExpense,
        updateExpense,
        removeExpense,
        importExpenses,
        getFilteredAndSortedExpenses,
        getUniqueCategories,
        handleDateOrderChange,
        handlePriceOrderChange,
    } = useExpenses();

    const {
        budgets,
        setBudget,
        importBudgets,
    } = useBudget();

    // Local state
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [importError, setImportError] = useState<string>('');
    const [showSuccess, setShowSuccess] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const budgetFileInputRef = useRef<HTMLInputElement>(null);

    // Handle expense form submission
    const handleExpenseSubmit = (expenseData: Omit<Expense, 'id'>) => {
        if (editingExpense) {
            updateExpense(editingExpense.id, expenseData);
            setEditingExpense(null);
            showNotification(NOTIFICATIONS.expenseUpdated);
        } else {
            addExpense(expenseData);
            showNotification(NOTIFICATIONS.expenseAdded);
        }
    };

    // Handle budget form submission
    const handleBudgetSubmit = (month: string, budgetAmount: number) => {
        setBudget(month, budgetAmount);
        showNotification(NOTIFICATIONS.budgetSet);
    };

    // Show notification
    const showNotification = (message: string) => {
        setSuccessMessage(message);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    // File handling
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
            const text = e.target?.result as string;
            const result = importExpenses(text);

            if (result.success) {
                setImportError('');
                showNotification(NOTIFICATIONS.dataImported);
            } else {
                setImportError(result.message);
            }

            if (event.target) event.target.value = '';
        };
        reader.readAsText(file);
    };

    const handleBudgetFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
            const text = e.target?.result as string;
            const result = importBudgets(text);

            if (result.success) {
                setImportError('');
                showNotification(NOTIFICATIONS.dataImported);
            } else {
                setImportError(result.message);
            }

            if (event.target) event.target.value = '';
        };
        reader.readAsText(file);
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const triggerBudgetFileInput = () => {
        budgetFileInputRef.current?.click();
    };

    const handleDownloadExpenses = async () => {
        try {
            await downloadExpensesCSV(expenses);
            showNotification('📥 Expenses downloaded successfully!');
        } catch (error) {
            setImportError('Failed to download expenses file');
        }
    };

    const handleDownloadBudgets = async () => {
        try {
            await downloadBudgetsCSV(budgets);
            showNotification('📥 Budgets downloaded successfully!');
        } catch (error) {
            setImportError('Failed to download budgets file');
        }
    };

    const handleEditExpense = (expense: Expense) => {
        setEditingExpense(expense);
    };

    const handleCancelEdit = () => {
        setEditingExpense(null);
    };

    // Data for charts and components
    const pieChartData = getPieChartData(expenses, categoryFilter);
    const barChartData = getBarChartData(expenses);
    const budgetChartData = getBudgetChartData(expenses, budgets);
    const monthlyData = getMonthlyData(expenses, budgets);
    const currentMonthData = getCurrentMonthData(expenses, budgets);
    const filteredAndSortedExpenses = getFilteredAndSortedExpenses();
    const uniqueCategories = getUniqueCategories();

    return (
        <Container maxWidth="xl" sx={{ py: 3, position: 'relative' }}>
            <Background>
                <Box className="bubble-1" />
                <Box className="bubble-2" />
                <Box className="bubble-3" />
                <Box className="bubble-4" />
            </Background>
            <GlowingBorder>
                <Box className="glow-left" />
                <Box className="glow-right" />
            </GlowingBorder>

            <Paper
                elevation={3}
                sx={{
                    bgcolor: `${THEME.kawaiiBg}CC`,
                    borderRadius: 4,
                    p: 4,
                    position: 'relative',
                    overflow: 'hidden',
                    border: `2px solid ${THEME.kawaiiAccent}`,
                    backdropFilter: 'blur(10px)',
                }}
            >
                {/* Waifu Image */}
                <Box
                    sx={{
                        position: 'absolute',
                        right: 5,
                        top: 10,
                        width: 120,
                        opacity: 1,
                    }}
                >
                    <Image
                        src={`${IMAGES.basePath}${IMAGES.waifu}`}
                        alt="Waifu Assistant"
                        width={100}
                        height={100}
                        style={{
                            borderRadius: '10px',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                        }}
                    />
                </Box>

                <Typography
                    variant="h3"
                    align="center"
                    gutterBottom
                    sx={{
                        color: THEME.kawaiiAccent,
                        fontWeight: 'bold',
                        mb: 4,
                    }}
                >
                    ✨ Zakaria's Expense Tracker ✨
                </Typography>

                {/* Budget Form */}
                <BudgetForm onSubmit={handleBudgetSubmit} />

                {/* Budget Summary */}
                {(monthlyData.length > 0 || currentMonthData.budget > 0) && (
                    <BudgetSummary
                        monthlyData={monthlyData}
                        currentMonthData={currentMonthData}
                    />
                )}

                {/* Expense Form */}
                <ExpenseForm
                    onSubmit={handleExpenseSubmit}
                    editingExpense={editingExpense}
                    onCancelEdit={handleCancelEdit}
                />

                {/* File Operations */}
                <Stack
                    direction="row"
                    spacing={2}
                    justifyContent="center"
                    sx={{ mb: 3 }}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".csv"
                        style={{ display: 'none' }}
                    />
                    <input
                        type="file"
                        ref={budgetFileInputRef}
                        onChange={handleBudgetFileUpload}
                        accept=".csv"
                        style={{ display: 'none' }}
                    />
                    <Button
                        variant="outlined"
                        onClick={triggerFileInput}
                        startIcon={<Upload />}
                        sx={{ color: THEME.kawaiiAccent, borderColor: THEME.kawaiiAccent }}
                    >
                        Load Expenses CSV
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={triggerBudgetFileInput}
                        startIcon={<Upload />}
                        sx={{ color: THEME.kawaiiAccent, borderColor: THEME.kawaiiAccent }}
                    >
                        Load Budgets CSV
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleDownloadExpenses}
                        startIcon={<Download />}
                        sx={{ color: THEME.kawaiiAccent, borderColor: THEME.kawaiiAccent }}
                    >
                        Download Expenses
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleDownloadBudgets}
                        startIcon={<Download />}
                        sx={{ color: THEME.kawaiiAccent, borderColor: THEME.kawaiiAccent }}
                    >
                        Download Budgets
                    </Button>
                </Stack>

                {importError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {importError}
                    </Alert>
                )}

                {/* Charts Section */}
                <Grid2 container spacing={3} justifyContent="center" sx={{ mb: 5 }}>
                    {/* Budget vs Spending Chart */}
                    <Grid2 sx={{ width: { xs: '100%', lg: '100%' } }}>
                        <StyledPaper elevation={2}>
                            <BudgetChart
                                data={budgetChartData}
                                title="💰 Budget vs Spending Overview"
                            />
                        </StyledPaper>
                    </Grid2>

                    {/* Pie Chart */}
                    <Grid2 sx={{ width: { xs: '100%', md: '50%' } }}>
                        <StyledPaper elevation={2}>
                            <PieChart
                                data={pieChartData}
                                title="Expenses by Category"
                                categoryFilter={categoryFilter}
                                setCategoryFilter={setCategoryFilter}
                                categories={uniqueCategories}
                            />
                        </StyledPaper>
                    </Grid2>

                    {/* Bar Chart */}
                    <Grid2 sx={{ width: { xs: '100%', md: '50%' } }}>
                        <StyledPaper elevation={2}>
                            <BarChart
                                data={barChartData}
                                title="Monthly Expenses"
                            />
                        </StyledPaper>
                    </Grid2>
                </Grid2>

                {/* Expense Table */}
                <ExpenseTable
                    expenses={filteredAndSortedExpenses}
                    onRemoveExpense={removeExpense}
                    onEditExpense={handleEditExpense}
                    dateOrder={dateOrder}
                    priceOrder={priceOrder}
                    onDateOrderChange={handleDateOrderChange}
                    onPriceOrderChange={handlePriceOrderChange}
                />
            </Paper>

            {showSuccess && (
                <Notification message={successMessage} />
            )}
        </Container>
    );
};

export default ExpenseTracker;