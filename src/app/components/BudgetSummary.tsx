import React from 'react';
import {
    Box,
    Typography,
    Paper,
    LinearProgress,
    Card,
    CardContent,
    Grid,
    Chip,
} from '@mui/material';
import { MonthlyData } from '../types';
import { THEME } from '../constants';

interface BudgetSummaryProps {
    monthlyData: MonthlyData[];
    currentMonthData: MonthlyData;
}

const BudgetSummary: React.FC<BudgetSummaryProps> = ({
                                                         monthlyData,
                                                         currentMonthData,
                                                     }) => {
    const getProgressColor = (spent: number, budget: number) => {
        const percentage = budget > 0 ? (spent / budget) * 100 : 0;
        if (percentage <= 50) return 'success';
        if (percentage <= 80) return 'warning';
        return 'error';
    };

    const getProgressValue = (spent: number, budget: number) => {
        return budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const getRemainingStatus = (remaining: number) => {
        if (remaining > 0) {
            return {
                color: 'success' as const,
                label: 'Under Budget',
            };
        } else if (remaining === 0) {
            return {
                color: 'warning' as const,
                label: 'On Budget',
            };
        } else {
            return {
                color: 'error' as const,
                label: 'Over Budget',
            };
        }
    };

    return (
        <Paper
            elevation={2}
            sx={{
                p: 3,
                mb: 3,
                borderRadius: 2,
                bgcolor: `${THEME.kawaiiBg}CC`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${THEME.kawaiiAccent}`,
            }}
        >
            <Typography
                variant="h6"
                gutterBottom
                sx={{ color: THEME.kawaiiAccent, fontWeight: 'bold' }}
            >
                📊 Budget Overview
            </Typography>

            {/* Current Month Summary */}
            <Card
                sx={{
                    mb: 3,
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    border: `2px solid ${THEME.kawaiiAccent}`,
                }}
            >
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Current Month: {currentMonthData.month}
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <Box textAlign="center">
                                <Typography variant="h4" color="primary">
                                    {formatCurrency(currentMonthData.budget)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Budget
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box textAlign="center">
                                <Typography variant="h4" color="warning.main">
                                    {formatCurrency(currentMonthData.spent)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Spent
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box textAlign="center">
                                <Typography
                                    variant="h4"
                                    color={
                                        currentMonthData.remaining >= 0
                                            ? 'success.main'
                                            : 'error.main'
                                    }
                                >
                                    {formatCurrency(Math.abs(currentMonthData.remaining))}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {currentMonthData.remaining >= 0 ? 'Remaining' : 'Over Budget'}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                    {currentMonthData.budget > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">
                                    Progress: {getProgressValue(currentMonthData.spent, currentMonthData.budget).toFixed(1)}%
                                </Typography>
                                <Chip
                                    size="small"
                                    color={getRemainingStatus(currentMonthData.remaining).color}
                                    label={getRemainingStatus(currentMonthData.remaining).label}
                                />
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={getProgressValue(currentMonthData.spent, currentMonthData.budget)}
                                color={getProgressColor(currentMonthData.spent, currentMonthData.budget)}
                                sx={{ height: 8, borderRadius: 4 }}
                            />
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Monthly History */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Monthly History
            </Typography>
            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                {monthlyData.slice(0, 6).map((month, index) => (
                    <Card
                        key={month.month}
                        sx={{
                            mb: 2,
                            bgcolor: 'rgba(255, 255, 255, 0.7)',
                            border: month.month === currentMonthData.month
                                ? `2px solid ${THEME.kawaiiAccent}`
                                : '1px solid rgba(0,0,0,0.1)',
                        }}
                    >
                        <CardContent sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {month.month}
                                </Typography>
                                <Chip
                                    size="small"
                                    color={getRemainingStatus(month.remaining).color}
                                    label={getRemainingStatus(month.remaining).label}
                                />
                            </Box>
                            <Grid container spacing={2}>
                                <Grid item xs={4}>
                                    <Typography variant="body2" color="text.secondary">
                                        Budget
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {formatCurrency(month.budget)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="body2" color="text.secondary">
                                        Spent
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {formatCurrency(month.spent)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="body2" color="text.secondary">
                                        {month.remaining >= 0 ? 'Remaining' : 'Over'}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        fontWeight="bold"
                                        color={
                                            month.remaining >= 0
                                                ? 'success.main'
                                                : 'error.main'
                                        }
                                    >
                                        {formatCurrency(Math.abs(month.remaining))}
                                    </Typography>
                                </Grid>
                            </Grid>
                            {month.budget > 0 && (
                                <LinearProgress
                                    variant="determinate"
                                    value={getProgressValue(month.spent, month.budget)}
                                    color={getProgressColor(month.spent, month.budget)}
                                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                                />
                            )}
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </Paper>
    );
};

export default BudgetSummary;