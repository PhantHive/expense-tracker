import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
    Chip,
    Box,
    Typography,
    IconButton,
    Card,
    CardContent,
    Checkbox,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from '@mui/material';
import { Plus, Clock, Tag, X } from 'lucide-react';
import { RecurringLabel, RecurringPayment, PaymentScheduleItem } from '../types/recurring';
import { Expense } from '../types';
import { THEME } from '../constants';

interface RecurringItemsPopupProps {
    open: boolean;
    onClose: () => void;
    recurringLabels: RecurringLabel[];
    recurringPayments: RecurringPayment[];
    onAddExpense: (expense: Omit<Expense, 'id'>) => void;
    currentMonth: string;
    isPendingForMonth: (payment: RecurringPayment, month: string) => boolean;
    onMarkAsProcessed: (paymentId: string, scheduledDate?: string) => void;
    getPendingPaymentsForMonth: (payment: RecurringPayment, month: string) => PaymentScheduleItem[];
}

const RecurringItemsPopup: React.FC<RecurringItemsPopupProps> = ({
                                                                     open,
                                                                     onClose,
                                                                     recurringLabels,
                                                                     recurringPayments,
                                                                     onAddExpense,
                                                                     currentMonth,
                                                                     isPendingForMonth,
                                                                     onMarkAsProcessed,
                                                                     getPendingPaymentsForMonth,
                                                                 }) => {
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [selectedScheduledPayments, setSelectedScheduledPayments] = useState<Set<string>>(new Set());

    // Get all pending payments with their scheduled items
    const pendingPayments = recurringPayments.filter(payment =>
        payment.isActive && isPendingForMonth(payment, currentMonth)
    ).map(payment => ({
        payment,
        scheduledItems: getPendingPaymentsForMonth(payment, currentMonth)
    }));

    const handleSelectItem = (id: string, type: 'label' | 'payment') => {
        const key = `${type}-${id}`;
        const newSelected = new Set(selectedItems);
        if (newSelected.has(key)) {
            newSelected.delete(key);
        } else {
            newSelected.add(key);
        }
        setSelectedItems(newSelected);
    };

    const handleSelectScheduledPayment = (paymentId: string, scheduledDate: string) => {
        const key = `${paymentId}-${scheduledDate}`;
        const newSelected = new Set(selectedScheduledPayments);
        if (newSelected.has(key)) {
            newSelected.delete(key);
        } else {
            newSelected.add(key);
        }
        setSelectedScheduledPayments(newSelected);
    };

    const handleAddSelected = () => {
        const today = new Date().toISOString().split('T')[0];

        // Add selected labels
        selectedItems.forEach(key => {
            const [type, id] = key.split('-');

            if (type === 'label') {
                const label = recurringLabels.find(l => l.id === id);
                if (label) {
                    onAddExpense({
                        amount: label.amount || 0,
                        category: label.category,
                        date: today,
                        note: label.name,
                    });
                }
            }
        });

        // Add selected scheduled payments
        selectedScheduledPayments.forEach(key => {
            const [paymentId, scheduledDate] = key.split('-', 2);

            const paymentData = pendingPayments.find(p => p.payment.id === paymentId);
            if (paymentData) {
                const scheduledItem = paymentData.scheduledItems.find(item => item.date === scheduledDate);
                if (scheduledItem) {
                    onAddExpense({
                        amount: scheduledItem.amount,
                        category: paymentData.payment.category,
                        date: today,
                        note: `${paymentData.payment.name} (Due: ${new Date(scheduledItem.date).toLocaleDateString()})`,
                    });

                    // Mark this specific scheduled payment as processed
                    onMarkAsProcessed(paymentId, scheduledDate);
                }
            }
        });

        setSelectedItems(new Set());
        setSelectedScheduledPayments(new Set());
        onClose();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const getTotalSelectedAmount = () => {
        let total = 0;

        // Add amounts from selected labels
        selectedItems.forEach(key => {
            const [type, id] = key.split('-');
            if (type === 'label') {
                const label = recurringLabels.find(l => l.id === id);
                if (label && label.amount) {
                    total += label.amount;
                }
            }
        });

        // Add amounts from selected scheduled payments
        selectedScheduledPayments.forEach(key => {
            const [paymentId, scheduledDate] = key.split('-', 2);
            const paymentData = pendingPayments.find(p => p.payment.id === paymentId);
            if (paymentData) {
                const scheduledItem = paymentData.scheduledItems.find(item => item.date === scheduledDate);
                if (scheduledItem) {
                    total += scheduledItem.amount;
                }
            }
        });

        return total;
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: THEME.kawaiiBg,
                    border: `2px solid ${THEME.kawaiiAccent}`,
                    borderRadius: 3,
                }
            }}
        >
            <DialogTitle
                sx={{
                    color: THEME.kawaiiAccent,
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Clock size={24} />
                    ✨ Recurring Items for This Month ✨
                </Box>
                <IconButton onClick={onClose} size="small">
                    <X size={20} />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                {/* Pending Scheduled Payments */}
                {pendingPayments.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ color: THEME.kawaiiAccent }}>
                            💳 Pending Payments
                        </Typography>
                        {pendingPayments.map(({ payment, scheduledItems }) => (
                            <Card key={payment.id} sx={{ mb: 2, bgcolor: 'rgba(255, 255, 255, 0.9)' }}>
                                <CardContent>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                        {payment.name}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                        <Chip label={payment.category} size="small" variant="outlined" />
                                        <Chip
                                            label={payment.frequency === 'custom' ? 'Custom Schedule' : payment.frequency}
                                            size="small"
                                            color="info"
                                        />
                                    </Box>

                                    <TableContainer component={Paper} sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell padding="checkbox">
                                                        <Checkbox
                                                            indeterminate={
                                                                scheduledItems.some(item =>
                                                                    selectedScheduledPayments.has(`${payment.id}-${item.date}`)
                                                                ) && scheduledItems.some(item =>
                                                                    !selectedScheduledPayments.has(`${payment.id}-${item.date}`)
                                                                )
                                                            }
                                                            checked={
                                                                scheduledItems.length > 0 &&
                                                                scheduledItems.every(item =>
                                                                    selectedScheduledPayments.has(`${payment.id}-${item.date}`)
                                                                )
                                                            }
                                                            onChange={(e) => {
                                                                const newSelected = new Set(selectedScheduledPayments);
                                                                if (e.target.checked) {
                                                                    scheduledItems.forEach(item => {
                                                                        newSelected.add(`${payment.id}-${item.date}`);
                                                                    });
                                                                } else {
                                                                    scheduledItems.forEach(item => {
                                                                        newSelected.delete(`${payment.id}-${item.date}`);
                                                                    });
                                                                }
                                                                setSelectedScheduledPayments(newSelected);
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>Due Date</TableCell>
                                                    <TableCell align="right">Amount</TableCell>
                                                    <TableCell>Status</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {scheduledItems.map((item) => {
                                                    const key = `${payment.id}-${item.date}`;
                                                    const isSelected = selectedScheduledPayments.has(key);

                                                    return (
                                                        <TableRow key={key} selected={isSelected}>
                                                            <TableCell padding="checkbox">
                                                                <Checkbox
                                                                    checked={isSelected}
                                                                    onChange={() => handleSelectScheduledPayment(payment.id, item.date)}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                {new Date(item.date).toLocaleDateString()}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <Typography fontWeight="bold" color="error.main">
                                                                    {formatCurrency(item.amount)}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={item.processed ? 'Processed' : 'Pending'}
                                                                    size="small"
                                                                    color={item.processed ? 'success' : 'warning'}
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                )}

                {/* Quick Labels */}
                {recurringLabels.length > 0 && (
                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ color: THEME.kawaiiAccent }}>
                            🏷️ Quick Labels
                        </Typography>
                        <List dense>
                            {recurringLabels.map((label) => {
                                const key = `label-${label.id}`;
                                const isSelected = selectedItems.has(key);

                                return (
                                    <ListItem key={label.id} disablePadding>
                                        <ListItemButton
                                            onClick={() => handleSelectItem(label.id, 'label')}
                                            selected={isSelected}
                                            sx={{
                                                borderRadius: 2,
                                                mb: 1,
                                                bgcolor: isSelected ? `${THEME.kawaiiAccent}20` : 'rgba(255, 255, 255, 0.6)',
                                                '&:hover': {
                                                    bgcolor: `${THEME.kawaiiAccent}10`,
                                                },
                                            }}
                                        >
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Tag size={16} />
                                                        <Typography fontWeight="bold">
                                                            {label.name}
                                                        </Typography>
                                                        {label.amount && (
                                                            <Chip
                                                                label={formatCurrency(label.amount)}
                                                                size="small"
                                                                color="info"
                                                            />
                                                        )}
                                                        <Chip
                                                            label={label.category}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </Box>
                                                }
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Box>
                )}

                {pendingPayments.length === 0 && recurringLabels.length === 0 && (
                    <Typography
                        align="center"
                        color="text.secondary"
                        sx={{ py: 4 }}
                    >
                        No recurring items found. Add some labels or payments to get started! 🌸
                    </Typography>
                )}

                {(selectedItems.size > 0 || selectedScheduledPayments.size > 0) && (
                    <Card sx={{ mt: 3, bgcolor: `${THEME.kawaiiAccent}10`, border: `1px solid ${THEME.kawaiiAccent}` }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                📊 Selection Summary
                            </Typography>
                            <Typography variant="body1">
                                Selected items: {selectedItems.size + selectedScheduledPayments.size}
                            </Typography>
                            <Typography variant="body1" fontWeight="bold">
                                Total amount: {formatCurrency(getTotalSelectedAmount())}
                            </Typography>
                        </CardContent>
                    </Card>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button onClick={onClose} color="inherit">
                    Cancel
                </Button>
                <Button
                    onClick={handleAddSelected}
                    variant="contained"
                    disabled={selectedItems.size === 0 && selectedScheduledPayments.size === 0}
                    startIcon={<Plus />}
                    sx={{
                        bgcolor: THEME.kawaiiAccent,
                        '&:hover': {
                            bgcolor: THEME.kawaiiSecondary,
                        },
                    }}
                >
                    Add Selected ({selectedItems.size + selectedScheduledPayments.size})
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RecurringItemsPopup;