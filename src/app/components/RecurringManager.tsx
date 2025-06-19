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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Collapse,
} from '@mui/material';
import {
    Plus,
    Trash2,
    Calendar,
    Tag,
    CreditCard,
    X,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { RecurringLabel, RecurringPayment, PaymentScheduleItem } from '../types/recurring';
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
    getScheduledPayments?: (payment: RecurringPayment) => PaymentScheduleItem[];
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
                                                               getScheduledPayments,
                                                           }) => {
    const [tabValue, setTabValue] = useState(0);
    const [expandedPayment, setExpandedPayment] = useState<string | null>(null);

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
        frequency: 'monthly' as 'monthly' | 'weekly' | 'daily' | 'custom',
        paymentCount: '',
    });

    // Custom schedule state
    const [customSchedule, setCustomSchedule] = useState<PaymentScheduleItem[]>([]);
    const [newScheduleItem, setNewScheduleItem] = useState({
        date: '',
        amount: '',
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

    const handleAddScheduleItem = () => {
        if (!newScheduleItem.date || !newScheduleItem.amount) return;

        const newItem: PaymentScheduleItem = {
            date: newScheduleItem.date,
            amount: parseFloat(newScheduleItem.amount),
            processed: false,
        };

        setCustomSchedule(prev => [...prev, newItem].sort((a, b) => a.date.localeCompare(b.date)));
        setNewScheduleItem({ date: '', amount: '' });
    };

    const handleRemoveScheduleItem = (index: number) => {
        setCustomSchedule(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddPayment = () => {
        if (!paymentForm.name || !paymentForm.category) return;

        // For custom frequency, we need at least one scheduled payment
        if (paymentForm.frequency === 'custom' && customSchedule.length === 0) {
            alert('Please add at least one payment to the schedule for custom payments.');
            return;
        }

        // For regular frequencies, we need amount, start date, and end date
        if (paymentForm.frequency !== 'custom' && (!paymentForm.amount || !paymentForm.startDate || !paymentForm.endDate)) {
            return;
        }

        const newPayment: Omit<RecurringPayment, 'id' | 'isActive'> = {
            name: paymentForm.name,
            category: paymentForm.category,
            amount: paymentForm.frequency === 'custom'
                ? customSchedule.reduce((sum, item) => sum + item.amount, 0) / customSchedule.length // Average amount for display
                : parseFloat(paymentForm.amount),
            startDate: paymentForm.frequency === 'custom'
                ? customSchedule[0]?.date || paymentForm.startDate
                : paymentForm.startDate,
            endDate: paymentForm.frequency === 'custom'
                ? customSchedule[customSchedule.length - 1]?.date || paymentForm.endDate
                : paymentForm.endDate,
            frequency: paymentForm.frequency,
            paymentCount: paymentForm.frequency === 'custom'
                ? customSchedule.length
                : (paymentForm.paymentCount ? parseInt(paymentForm.paymentCount) : undefined),
            remainingPayments: paymentForm.frequency === 'custom'
                ? customSchedule.length
                : (paymentForm.paymentCount ? parseInt(paymentForm.paymentCount) : undefined),
            customSchedule: paymentForm.frequency === 'custom' ? [...customSchedule] : undefined,
        };

        onAddPayment(newPayment);

        // Reset form
        setPaymentForm({
            name: '',
            category: '',
            amount: '',
            startDate: '',
            endDate: '',
            frequency: 'monthly',
            paymentCount: '',
        });
        setCustomSchedule([]);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const getTotalScheduleAmount = () => {
        return customSchedule.reduce((sum, item) => sum + item.amount, 0);
    };

    const getPaymentScheduleDisplay = (payment: RecurringPayment) => {
        if (getScheduledPayments) {
            return getScheduledPayments(payment);
        }

        // Fallback if getScheduledPayments is not provided
        if (payment.frequency === 'custom' && payment.customSchedule) {
            return payment.customSchedule;
        }

        // For regular payments, generate a preview of upcoming payments
        const schedule: PaymentScheduleItem[] = [];
        const startDate = new Date(payment.startDate);
        const endDate = new Date(payment.endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let currentDate = new Date(startDate);
        let count = 0;

        while (currentDate <= endDate && count < 12) { // Show max 12 payments for preview
            const paymentDate = new Date(currentDate);
            paymentDate.setHours(0, 0, 0, 0);

            schedule.push({
                date: currentDate.toISOString().split('T')[0],
                amount: payment.amount,
                processed: paymentDate < today // Mark as processed if the date is in the past
            });

            count++;

            switch (payment.frequency) {
                case 'daily':
                    currentDate.setDate(currentDate.getDate() + 1);
                    break;
                case 'weekly':
                    currentDate.setDate(currentDate.getDate() + 7);
                    break;
                case 'monthly':
                    currentDate.setMonth(currentDate.getMonth() + 1);
                    break;
            }
        }

        return schedule;
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
            maxWidth="xl"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: THEME.kawaiiBg,
                    border: `2px solid ${THEME.kawaiiAccent}`,
                    borderRadius: 3,
                    minHeight: '80vh',
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
                                            <MenuItem value="custom">Custom Schedule</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Stack>

                                {/* Regular payment fields */}
                                {paymentForm.frequency !== 'custom' && (
                                    <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                                        <TextField
                                            label="Amount"
                                            type="number"
                                            value={paymentForm.amount}
                                            onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                                            required
                                            sx={{ flex: 1, minWidth: '120px' }}
                                        />
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
                                        <TextField
                                            label="Payment Count (optional)"
                                            type="number"
                                            value={paymentForm.paymentCount}
                                            onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentCount: e.target.value }))}
                                            sx={{ flex: 1, minWidth: '180px' }}
                                        />
                                    </Stack>
                                )}

                                {/* Custom schedule builder */}
                                {paymentForm.frequency === 'custom' && (
                                    <Card sx={{ bgcolor: 'rgba(0, 0, 0, 0.05)' }}>
                                        <CardContent>
                                            <Typography variant="subtitle1" gutterBottom>
                                                📅 Custom Payment Schedule
                                            </Typography>

                                            {/* Add new schedule item */}
                                            <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'end' }}>
                                                <TextField
                                                    label="Payment Date"
                                                    type="date"
                                                    value={newScheduleItem.date}
                                                    onChange={(e) => setNewScheduleItem(prev => ({ ...prev, date: e.target.value }))}
                                                    InputLabelProps={{ shrink: true }}
                                                    sx={{ flex: 1 }}
                                                />
                                                <TextField
                                                    label="Amount"
                                                    type="number"
                                                    value={newScheduleItem.amount}
                                                    onChange={(e) => setNewScheduleItem(prev => ({ ...prev, amount: e.target.value }))}
                                                    sx={{ flex: 1 }}
                                                />
                                                <Button
                                                    variant="outlined"
                                                    onClick={handleAddScheduleItem}
                                                    startIcon={<Plus />}
                                                    sx={{
                                                        color: THEME.kawaiiAccent,
                                                        borderColor: THEME.kawaiiAccent,
                                                        height: '56px'
                                                    }}
                                                >
                                                    Add Payment
                                                </Button>
                                            </Stack>

                                            {/* Schedule table */}
                                            {customSchedule.length > 0 && (
                                                <TableContainer component={Paper} sx={{ mt: 2 }}>
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell>Date</TableCell>
                                                                <TableCell align="right">Amount</TableCell>
                                                                <TableCell align="center">Actions</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {customSchedule.map((item, index) => (
                                                                <TableRow key={index}>
                                                                    <TableCell>
                                                                        {new Date(item.date).toLocaleDateString()}
                                                                    </TableCell>
                                                                    <TableCell align="right">
                                                                        {formatCurrency(item.amount)}
                                                                    </TableCell>
                                                                    <TableCell align="center">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => handleRemoveScheduleItem(index)}
                                                                            sx={{ color: 'error.main' }}
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </IconButton>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                            <TableRow>
                                                                <TableCell sx={{ fontWeight: 'bold' }}>Total:</TableCell>
                                                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                                                    {formatCurrency(getTotalScheduleAmount())}
                                                                </TableCell>
                                                                <TableCell></TableCell>
                                                            </TableRow>
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

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

                    {/* Existing payments list */}
                    <List>
                        {recurringPayments.filter(p => p.isActive).map((payment) => {
                            const status = getPaymentStatus(payment);
                            const isExpanded = expandedPayment === payment.id;
                            const schedule = getPaymentScheduleDisplay(payment);
                            const remainingDisplay = getRemainingPaymentsDisplay(payment);

                            return (
                                <React.Fragment key={payment.id}>
                                    <ListItem
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
                                                    <Chip
                                                        label={payment.frequency === 'custom' ? 'Custom Schedule' : formatCurrency(payment.amount)}
                                                        size="small"
                                                        color="error"
                                                    />
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
                                                    {payment.frequency === 'custom' && payment.customSchedule && (
                                                        <Typography variant="body2" color="text.secondary">
                                                            Total: {formatCurrency(payment.customSchedule.reduce((sum, item) => sum + item.amount, 0))}
                                                            ({payment.customSchedule.length} payments)
                                                        </Typography>
                                                    )}
                                                    {payment.lastProcessed && (
                                                        <Typography variant="body2" color="text.secondary">
                                                            Last processed: {new Date(payment.lastProcessed).toLocaleDateString()}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                        />
                                        <IconButton
                                            onClick={() => setExpandedPayment(isExpanded ? null : payment.id)}
                                            sx={{ color: THEME.kawaiiAccent }}
                                        >
                                            {isExpanded ? <ChevronUp /> : <ChevronDown />}
                                        </IconButton>
                                        <IconButton
                                            edge="end"
                                            onClick={() => onRemovePayment(payment.id)}
                                            sx={{ color: 'error.main' }}
                                        >
                                            <Trash2 size={16} />
                                        </IconButton>
                                    </ListItem>

                                    {/* Expanded payment schedule */}
                                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                        <Card sx={{ mx: 2, mb: 2, bgcolor: 'rgba(0, 0, 0, 0.05)' }}>
                                            <CardContent>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    Payment Schedule {payment.frequency !== 'custom' && '(Preview)'}:
                                                </Typography>
                                                <TableContainer>
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell>Date</TableCell>
                                                                <TableCell align="right">Amount</TableCell>
                                                                <TableCell align="center">Status</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {schedule.slice(0, 10).map((item, index) => (
                                                                <TableRow key={index}>
                                                                    <TableCell>
                                                                        {new Date(item.date).toLocaleDateString()}
                                                                    </TableCell>
                                                                    <TableCell align="right">
                                                                        {formatCurrency(item.amount)}
                                                                    </TableCell>
                                                                    <TableCell align="center">
                                                                        <Chip
                                                                            label={
                                                                                item.processed
                                                                                    ? (new Date(item.date) < new Date() ? 'Completed' : 'Processed')
                                                                                    : 'Pending'
                                                                            }
                                                                            size="small"
                                                                            color={
                                                                                item.processed
                                                                                    ? 'success'
                                                                                    : (new Date(item.date) < new Date() ? 'warning' : 'info')
                                                                            }
                                                                        />
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                            {schedule.length > 10 && (
                                                                <TableRow>
                                                                    <TableCell colSpan={3} align="center" sx={{ fontStyle: 'italic' }}>
                                                                        ... and {schedule.length - 10} more payments
                                                                    </TableCell>
                                                                </TableRow>
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </CardContent>
                                        </Card>
                                    </Collapse>
                                </React.Fragment>
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