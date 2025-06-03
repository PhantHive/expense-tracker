import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    Typography,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Card,
    CardContent,
    Chip,
    Stack,
} from '@mui/material';
import { Plus, Trash2, Calendar, Tag, CreditCard, X } from 'lucide-react';
import { RecurringLabel, RecurringPayment } from '../types/recurring';
import { THEME, EXPENSE_CATEGORIES } from '../constants';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`recurring-tabpanel-${index}`}
            aria-labelledby={`recurring-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

interface RecurringManagerProps {
    open: boolean;
    onClose: () => void;
    recurringLabels: RecurringLabel[];
    recurringPayments: RecurringPayment[];
    onAddLabel: (name: string, category: string, amount?: number) => void;
    onRemoveLabel: (id: string) => void;
    onAddPayment: (payment: Omit<RecurringPayment, 'id' | 'isActive'>) => void;
    onRemovePayment: (id: string) => void;
    calculateRemainingPayments?: (payment: RecurringPayment) => number | undefined;
}

const RecurringManager: React.FC<RecurringManagerProps> = ({
                                                               open,
                                                               onClose,
                                                               recurringLabels,
                                                               recurringPayments,
                                                               onAddLabel,
                                                               onRemoveLabel,
                                                               onAddPayment,
                                                               onRemovePayment,
                                                               calculateRemainingPayments,
                                                           }) => {
    const [tabValue, setTabValue] = useState(0);

    // Label form state
    const [labelForm, setLabelForm] = useState({
        name: '',
        category: '',
        amount: '',
    });

    // Payment form state
    const [paymentForm, setPaymentForm] = useState({
        name: '',
        category: '',
        amount: '',
        startDate: '',
        endDate: '',
        frequency: 'monthly' as 'monthly' | 'weekly' | 'daily',
        paymentCount: '',
    });

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleAddLabel = () => {
        if (!labelForm.name || !labelForm.category) return;

        onAddLabel(
            labelForm.name,
            labelForm.category,
            labelForm.amount ? parseFloat(labelForm.amount) : undefined
        );

        setLabelForm({ name: '', category: '', amount: '' });
    };

    const handleAddPayment = () => {
        if (!paymentForm.name || !paymentForm.category || !paymentForm.amount ||
            !paymentForm.startDate || !paymentForm.endDate) return;

        const newPayment: Omit<RecurringPayment, 'id' | 'isActive'> = {
            name: paymentForm.name,
            category: paymentForm.category,
            amount: parseFloat(paymentForm.amount),
            startDate: paymentForm.startDate,
            endDate: paymentForm.endDate,
            frequency: paymentForm.frequency,
            paymentCount: paymentForm.paymentCount ? parseInt(paymentForm.paymentCount) : undefined,
            remainingPayments: paymentForm.paymentCount ? parseInt(paymentForm.paymentCount) : undefined,
        };

        onAddPayment(newPayment);

        setPaymentForm({
            name: '',
            category: '',
            amount: '',
            startDate: '',
            endDate: '',
            frequency: 'monthly',
            paymentCount: '',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const getRemainingPaymentsDisplay = (payment: RecurringPayment) => {
        if (calculateRemainingPayments) {
            const remaining = calculateRemainingPayments(payment);
            return remaining !== undefined ? remaining : '∞';
        }
        return payment.remainingPayments !== undefined ? payment.remainingPayments : '∞';
    };

    const getPaymentStatus = (payment: RecurringPayment) => {
        const today = new Date();
        const startDate = new Date(payment.startDate);
        const endDate = new Date(payment.endDate);

        if (startDate > today) {
            return { text: 'Upcoming', color: 'info' as const };
        } else if (endDate < today) {
            return { text: 'Expired', color: 'error' as const };
        } else {
            const remaining = getRemainingPaymentsDisplay(payment);
            if (remaining === '∞') {
                return { text: 'Active', color: 'success' as const };
            } else if (remaining === 0) {
                return { text: 'Completed', color: 'warning' as const };
            } else {
                return { text: 'Active', color: 'success' as const };
            }
        }
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
                    minHeight: '70vh',
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
                    <Calendar size={24} />
                    🎯 Manage Recurring Items
                </Box>
                <IconButton onClick={onClose} size="small">
                    <X size={20} />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        aria-label="recurring items tabs"
                        sx={{
                            '& .MuiTab-root': {
                                color: THEME.kawaiiAccent,
                                '&.Mui-selected': {
                                    color: THEME.kawaiiAccent,
                                    fontWeight: 'bold',
                                },
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: THEME.kawaiiAccent,
                            },
                        }}
                    >
                        <Tab icon={<Tag />} label="Quick Labels" />
                        <Tab icon={<CreditCard />} label="Recurring Payments" />
                    </Tabs>
                </Box>

                {/* Labels Tab */}
                <TabPanel value={tabValue} index={0}>
                    <Card sx={{ mb: 3, bgcolor: 'rgba(255, 255, 255, 0.8)' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ color: THEME.kawaiiAccent }}>
                                ✨ Add New Label
                            </Typography>
                            <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
                                <TextField
                                    label="Label Name"
                                    value={labelForm.name}
                                    onChange={(e) => setLabelForm(prev => ({ ...prev, name: e.target.value }))}
                                    sx={{ flex: 1, minWidth: '200px' }}
                                />
                                <FormControl sx={{ flex: 1, minWidth: '150px' }}>
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        value={labelForm.category}
                                        onChange={(e) => setLabelForm(prev => ({ ...prev, category: e.target.value }))}
                                        label="Category"
                                    >
                                        {EXPENSE_CATEGORIES.map((category) => (
                                            <MenuItem key={category} value={category}>
                                                {category}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <TextField
                                    label="Default Amount (optional)"
                                    type="number"
                                    value={labelForm.amount}
                                    onChange={(e) => setLabelForm(prev => ({ ...prev, amount: e.target.value }))}
                                    sx={{ flex: 1, minWidth: '150px' }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleAddLabel}
                                    startIcon={<Plus />}
                                    sx={{
                                        bgcolor: THEME.kawaiiAccent,
                                        '&:hover': { bgcolor: THEME.kawaiiSecondary },
                                        minWidth: '120px',
                                    }}
                                >
                                    Add Label
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>

                    <List>
                        {recurringLabels.map((label) => (
                            <ListItem
                                key={label.id}
                                sx={{
                                    bgcolor: 'rgba(255, 255, 255, 0.6)',
                                    borderRadius: 2,
                                    mb: 1,
                                }}
                            >
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography fontWeight="bold">{label.name}</Typography>
                                            <Chip label={label.category} size="small" variant="outlined" />
                                            {label.amount && (
                                                <Chip
                                                    label={formatCurrency(label.amount)}
                                                    size="small"
                                                    color="info"
                                                />
                                            )}
                                        </Box>
                                    }
                                    secondary={`Created: ${new Date(label.createdAt).toLocaleDateString()}`}
                                />
                                <IconButton
                                    edge="end"
                                    onClick={() => onRemoveLabel(label.id)}
                                    sx={{ color: 'error.main' }}
                                >
                                    <Trash2 size={16} />
                                </IconButton>
                            </ListItem>
                        ))}
                        {recurringLabels.length === 0 && (
                            <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                                No labels yet. Add your first label above! 🏷️
                            </Typography>
                        )}
                    </List>
                </TabPanel>

                {/* Payments Tab */}
                <TabPanel value={tabValue} index={1}>
                    <Card sx={{ mb: 3, bgcolor: 'rgba(255, 255, 255, 0.8)' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ color: THEME.kawaiiAccent }}>
                                💳 Add Recurring Payment
                            </Typography>
                            <Stack spacing={2}>
                                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                                    <TextField
                                        label="Payment Name"
                                        value={paymentForm.name}
                                        onChange={(e) => setPaymentForm(prev => ({ ...prev, name: e.target.value }))}
                                        sx={{ flex: 1, minWidth: '200px' }}
                                    />
                                    <FormControl sx={{ flex: 1, minWidth: '150px' }}>
                                        <InputLabel>Category</InputLabel>
                                        <Select
                                            value={paymentForm.category}
                                            onChange={(e) => setPaymentForm(prev => ({ ...prev, category: e.target.value }))}
                                            label="Category"
                                        >
                                            {EXPENSE_CATEGORIES.map((category) => (
                                                <MenuItem key={category} value={category}>
                                                    {category}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <TextField
                                        label="Amount"
                                        type="number"
                                        value={paymentForm.amount}
                                        onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                                        required
                                        sx={{ flex: 1, minWidth: '120px' }}
                                    />
                                </Stack>

                                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                                    <TextField
                                        label="Start Date"
                                        type="date"
                                        value={paymentForm.startDate}
                                        onChange={(e) => setPaymentForm(prev => ({ ...prev, startDate: e.target.value }))}
                                        InputLabelProps={{ shrink: true }}
                                        required
                                        sx={{ flex: 1, minWidth: '180px' }}
                                    />
                                    <TextField
                                        label="End Date"
                                        type="date"
                                        value={paymentForm.endDate}
                                        onChange={(e) => setPaymentForm(prev => ({ ...prev, endDate: e.target.value }))}
                                        InputLabelProps={{ shrink: true }}
                                        required
                                        sx={{ flex: 1, minWidth: '180px' }}
                                    />
                                    <FormControl sx={{ flex: 1, minWidth: '120px' }}>
                                        <InputLabel>Frequency</InputLabel>
                                        <Select
                                            value={paymentForm.frequency}
                                            onChange={(e) => setPaymentForm(prev => ({ ...prev, frequency: e.target.value as any }))}
                                            label="Frequency"
                                        >
                                            <MenuItem value="daily">Daily</MenuItem>
                                            <MenuItem value="weekly">Weekly</MenuItem>
                                            <MenuItem value="monthly">Monthly</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <TextField
                                        label="Payment Count (optional)"
                                        type="number"
                                        value={paymentForm.paymentCount}
                                        onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentCount: e.target.value }))}
                                        helperText="e.g., PayPal x4 payments"
                                        sx={{ flex: 1, minWidth: '180px' }}
                                    />
                                </Stack>

                                <Button
                                    variant="contained"
                                    onClick={handleAddPayment}
                                    startIcon={<Plus />}
                                    sx={{
                                        bgcolor: THEME.kawaiiAccent,
                                        '&:hover': { bgcolor: THEME.kawaiiSecondary },
                                        alignSelf: 'flex-start',
                                    }}
                                >
                                    Add Payment
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>

                    <List>
                        {recurringPayments.filter(p => p.isActive).map((payment) => {
                            const status = getPaymentStatus(payment);
                            const remainingDisplay = getRemainingPaymentsDisplay(payment);

                            return (
                                <ListItem
                                    key={payment.id}
                                    sx={{
                                        bgcolor: 'rgba(255, 255, 255, 0.6)',
                                        borderRadius: 2,
                                        mb: 1,
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                                <Typography fontWeight="bold">{payment.name}</Typography>
                                                <Chip label={formatCurrency(payment.amount)} size="small" color="error" />
                                                <Chip label={payment.category} size="small" variant="outlined" />
                                                <Chip label={payment.frequency} size="small" color="info" />
                                                <Chip
                                                    label={`${remainingDisplay} left`}
                                                    size="small"
                                                    color={status.color}
                                                />
                                                <Chip
                                                    label={status.text}
                                                    size="small"
                                                    color={status.color}
                                                    variant="outlined"
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    {new Date(payment.startDate).toLocaleDateString()} → {new Date(payment.endDate).toLocaleDateString()}
                                                </Typography>
                                                {payment.lastProcessed && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        Last processed: {new Date(payment.lastProcessed).toLocaleDateString()}
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                    />
                                    <IconButton
                                        edge="end"
                                        onClick={() => onRemovePayment(payment.id)}
                                        sx={{ color: 'error.main' }}
                                    >
                                        <Trash2 size={16} />
                                    </IconButton>
                                </ListItem>
                            );
                        })}
                        {recurringPayments.filter(p => p.isActive).length === 0 && (
                            <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                                No recurring payments yet. Add your first payment above! 💳
                            </Typography>
                        )}
                    </List>
                </TabPanel>
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} variant="outlined" sx={{ color: THEME.kawaiiAccent }}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RecurringManager;