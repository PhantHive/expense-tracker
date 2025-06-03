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
    Divider,
} from '@mui/material';
import { Plus, Clock, Tag, X } from 'lucide-react';
import { RecurringLabel, RecurringPayment } from '../types/recurring';
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
    onMarkAsProcessed: (paymentId: string) => void;
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
                                                                 }) => {
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    const pendingPayments = recurringPayments.filter(payment =>
        payment.isActive && isPendingForMonth(payment, currentMonth)
    );

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

    const handleAddSelected = () => {
        const today = new Date().toISOString().split('T')[0];

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
            } else if (type === 'payment') {
                const payment = recurringPayments.find(p => p.id === id);
                if (payment) {
                    onAddExpense({
                        amount: payment.amount,
                        category: payment.category,
                        date: today,
                        note: payment.name,
                    });
                    onMarkAsProcessed(payment.id);
                }
            }
        });

        setSelectedItems(new Set());
        onClose();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
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
                {/* Pending Recurring Payments */}
                {pendingPayments.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ color: THEME.kawaiiAccent }}>
                            💳 Pending Payments
                        </Typography>
                        <List dense>
                            {pendingPayments.map((payment) => {
                                const key = `payment-${payment.id}`;
                                const isSelected = selectedItems.has(key);

                                return (
                                    <ListItem key={payment.id} disablePadding>
                                        <ListItemButton
                                            onClick={() => handleSelectItem(payment.id, 'payment')}
                                            selected={isSelected}
                                            sx={{
                                                borderRadius: 2,
                                                mb: 1,
                                                bgcolor: isSelected ? `${THEME.kawaiiAccent}20` : 'transparent',
                                                '&:hover': {
                                                    bgcolor: `${THEME.kawaiiAccent}10`,
                                                },
                                            }}
                                        >
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography fontWeight="bold">
                                                            {payment.name}
                                                        </Typography>
                                                        <Chip
                                                            label={formatCurrency(payment.amount)}
                                                            size="small"
                                                            color="error"
                                                        />
                                                        <Chip
                                                            label={payment.category}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </Box>
                                                }
                                                secondary={
                                                    <Typography variant="body2" color="text.secondary">
                                                        Expires: {new Date(payment.endDate).toLocaleDateString()}
                                                        {payment.remainingPayments &&
                                                            ` • ${payment.remainingPayments} payments left`
                                                        }
                                                    </Typography>
                                                }
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Box>
                )}

                {/* Recurring Labels */}
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
                                                bgcolor: isSelected ? `${THEME.kawaiiAccent}20` : 'transparent',
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
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button onClick={onClose} color="inherit">
                    Cancel
                </Button>
                <Button
                    onClick={handleAddSelected}
                    variant="contained"
                    disabled={selectedItems.size === 0}
                    startIcon={<Plus />}
                    sx={{
                        bgcolor: THEME.kawaiiAccent,
                        '&:hover': {
                            bgcolor: THEME.kawaiiSecondary,
                        },
                    }}
                >
                    Add Selected ({selectedItems.size})
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RecurringItemsPopup;