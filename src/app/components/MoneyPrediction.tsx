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
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Chip,
    Stack,
    Tabs,
    Tab,
    LinearProgress,
    Divider,
    Alert,
} from '@mui/material';
import {
    TrendingUp,
    TrendingDown,
    Calendar,
    DollarSign,
    Plus,
    Trash2,
    Target,
    X,
    Wallet,
    ArrowUpCircle,
    ArrowDownCircle
} from 'lucide-react';
import { MoneyPrediction as MoneyPredictionType, IncomeItem, OutgoingItem } from '../types/recurring';
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
            id={`prediction-tabpanel-${index}`}
            aria-labelledby={`prediction-tab-${index}`}
            {...other}
        >
            {value === index && <Box>{children}</Box>}
        </div>
    );
}

interface MoneyPredictionProps {
    open: boolean;
    onClose: () => void;
    currentBalance: number;
    incomeItems: IncomeItem[];
    outgoingItems: OutgoingItem[];
    onUpdateBalance: (balance: number) => void;
    onAddIncome: (item: Omit<IncomeItem, 'id'>) => void;
    onRemoveIncome: (id: string) => void;
    onAddOutgoing: (item: Omit<OutgoingItem, 'id'>) => void;
    onRemoveOutgoing: (id: string) => void;
    onPredictMoney: (targetDate: string) => MoneyPredictionType;
}

const MoneyPrediction: React.FC<MoneyPredictionProps> = ({
                                                             open,
                                                             onClose,
                                                             currentBalance,
                                                             incomeItems,
                                                             outgoingItems,
                                                             onUpdateBalance,
                                                             onAddIncome,
                                                             onRemoveIncome,
                                                             onAddOutgoing,
                                                             onRemoveOutgoing,
                                                             onPredictMoney,
                                                         }) => {
    const [tabValue, setTabValue] = useState(0);
    const [balanceInput, setBalanceInput] = useState(currentBalance.toString());
    const [targetDate, setTargetDate] = useState('');
    const [prediction, setPrediction] = useState<MoneyPredictionType | null>(null);

    // Income form state
    const [incomeForm, setIncomeForm] = useState({
        name: '',
        amount: '',
        date: '',
        isRecurring: false,
        frequency: 'monthly' as 'monthly' | 'weekly' | 'daily',
    });

    // Outgoing form state
    const [outgoingForm, setOutgoingForm] = useState({
        name: '',
        amount: '',
        date: '',
        category: '',
        isRecurring: false,
        frequency: 'monthly' as 'monthly' | 'weekly' | 'daily',
    });

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleUpdateBalance = () => {
        const balance = parseFloat(balanceInput);
        if (!isNaN(balance)) {
            onUpdateBalance(balance);
        }
    };

    const handleAddIncome = () => {
        if (!incomeForm.name || !incomeForm.amount || !incomeForm.date) return;

        onAddIncome({
            name: incomeForm.name,
            amount: parseFloat(incomeForm.amount),
            date: incomeForm.date,
            isRecurring: incomeForm.isRecurring,
            frequency: incomeForm.isRecurring ? incomeForm.frequency : undefined,
        });

        setIncomeForm({
            name: '',
            amount: '',
            date: '',
            isRecurring: false,
            frequency: 'monthly',
        });
    };

    const handleAddOutgoing = () => {
        if (!outgoingForm.name || !outgoingForm.amount || !outgoingForm.date || !outgoingForm.category) return;

        onAddOutgoing({
            name: outgoingForm.name,
            amount: parseFloat(outgoingForm.amount),
            date: outgoingForm.date,
            category: outgoingForm.category,
            isRecurring: outgoingForm.isRecurring,
            frequency: outgoingForm.isRecurring ? outgoingForm.frequency : undefined,
        });

        setOutgoingForm({
            name: '',
            amount: '',
            date: '',
            category: '',
            isRecurring: false,
            frequency: 'monthly',
        });
    };

    const handlePredict = () => {
        if (!targetDate) return;
        const result = onPredictMoney(targetDate);
        setPrediction(result);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const getBalanceColor = (balance: number) => {
        if (balance > 0) return 'success.main';
        if (balance === 0) return 'warning.main';
        return 'error.main';
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
                    <Target size={24} />
                    💰 Money Prediction Dashboard
                </Box>
                <IconButton onClick={onClose} size="small">
                    <X size={20} />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                {/* Current Balance Section */}
                <Card sx={{ mb: 3, bgcolor: 'rgba(255, 255, 255, 0.9)' }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ color: THEME.kawaiiAccent, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Wallet size={20} />
                            Current Bank Balance
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <TextField
                                label="Bank Balance"
                                type="number"
                                value={balanceInput}
                                onChange={(e) => setBalanceInput(e.target.value)}
                                InputProps={{
                                    startAdornment: <DollarSign size={16} style={{ marginRight: 8 }} />
                                }}
                                sx={{ flex: 1 }}
                            />
                            <Button
                                variant="contained"
                                onClick={handleUpdateBalance}
                                sx={{
                                    bgcolor: THEME.kawaiiAccent,
                                    '&:hover': { bgcolor: THEME.kawaiiSecondary },
                                }}
                            >
                                Update
                            </Button>
                        </Stack>
                        <Typography variant="h4" sx={{ mt: 2, color: getBalanceColor(currentBalance) }}>
                            {formatCurrency(currentBalance)}
                        </Typography>
                    </CardContent>
                </Card>

                {/* Prediction Section */}
                <Card sx={{ mb: 3, bgcolor: 'rgba(255, 255, 255, 0.9)' }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ color: THEME.kawaiiAccent, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Calendar size={20} />
                            Predict Future Balance
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                            <TextField
                                label="Target Date"
                                type="date"
                                value={targetDate}
                                onChange={(e) => setTargetDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{ flex: 1 }}
                            />
                            <Button
                                variant="contained"
                                onClick={handlePredict}
                                disabled={!targetDate}
                                startIcon={<Target />}
                                sx={{
                                    bgcolor: THEME.kawaiiAccent,
                                    '&:hover': { bgcolor: THEME.kawaiiSecondary },
                                }}
                            >
                                Predict
                            </Button>
                        </Stack>

                        {prediction && (
                            <Box sx={{ mt: 3 }}>
                                <Alert
                                    severity={prediction.predictedBalance >= 0 ? 'success' : 'error'}
                                    sx={{ mb: 2 }}
                                >
                                    <Typography variant="h6">
                                        Predicted Balance on {new Date(prediction.targetDate).toLocaleDateString()}: {' '}
                                        <strong>{formatCurrency(prediction.predictedBalance)}</strong>
                                    </Typography>
                                    <Typography variant="body2">
                                        Change from current: {formatCurrency(prediction.predictedBalance - prediction.currentBalance)}
                                    </Typography>
                                </Alert>

                                {prediction.dailyBreakdown.length > 0 && (
                                    <Card sx={{ bgcolor: 'rgba(0,0,0,0.05)' }}>
                                        <CardContent>
                                            <Typography variant="subtitle1" gutterBottom>
                                                📈 Daily Breakdown (All {prediction.dailyBreakdown.length} days)
                                            </Typography>
                                            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                                                <List dense>
                                                    {prediction.dailyBreakdown.map((day) => (
                                                        <ListItem key={day.date} sx={{ py: 0.5 }}>
                                                            <ListItemText
                                                                primary={
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                        <Typography variant="body2">
                                                                            {new Date(day.date).toLocaleDateString()}
                                                                        </Typography>
                                                                        <Typography
                                                                            variant="body2"
                                                                            fontWeight="bold"
                                                                            color={getBalanceColor(day.balance)}
                                                                        >
                                                                            {formatCurrency(day.balance)}
                                                                        </Typography>
                                                                    </Box>
                                                                }
                                                                secondary={
                                                                    day.transactions.length > 0 && (
                                                                        <Box sx={{ mt: 0.5 }}>
                                                                            {day.transactions.map((transaction, idx) => (
                                                                                <Chip
                                                                                    key={idx}
                                                                                    label={`${transaction.name}: ${formatCurrency(Math.abs(transaction.amount))}`}
                                                                                    size="small"
                                                                                    color={transaction.type === 'income' ? 'success' : 'error'}
                                                                                    sx={{ mr: 0.5, mb: 0.5 }}
                                                                                />
                                                                            ))}
                                                                        </Box>
                                                                    )
                                                                }
                                                            />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                )}
                            </Box>
                        )}
                    </CardContent>
                </Card>

                {/* Tabs for Income and Outgoing */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
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
                        <Tab icon={<ArrowUpCircle />} label="Income" />
                        <Tab icon={<ArrowDownCircle />} label="Outgoing" />
                    </Tabs>
                </Box>

                {/* Income Tab */}
                <TabPanel value={tabValue} index={0}>
                    <Card sx={{ mb: 3, bgcolor: 'rgba(255, 255, 255, 0.8)' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ color: 'success.main' }}>
                                💚 Add Expected Income
                            </Typography>
                            <Stack spacing={2}>
                                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                                    <TextField
                                        label="Income Name"
                                        value={incomeForm.name}
                                        onChange={(e) => setIncomeForm(prev => ({ ...prev, name: e.target.value }))}
                                        sx={{ flex: 1, minWidth: '200px' }}
                                    />
                                    <TextField
                                        label="Amount"
                                        type="number"
                                        value={incomeForm.amount}
                                        onChange={(e) => setIncomeForm(prev => ({ ...prev, amount: e.target.value }))}
                                        sx={{ flex: 1, minWidth: '150px' }}
                                    />
                                    <TextField
                                        label="Date"
                                        type="date"
                                        value={incomeForm.date}
                                        onChange={(e) => setIncomeForm(prev => ({ ...prev, date: e.target.value }))}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{ flex: 1, minWidth: '180px' }}
                                    />
                                </Stack>
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                                    <FormControl sx={{ minWidth: '120px' }}>
                                        <InputLabel>Recurring</InputLabel>
                                        <Select
                                            value={incomeForm.isRecurring ? "true" : "false"}
                                            onChange={(e) => setIncomeForm(prev => ({ ...prev, isRecurring: e.target.value === "true" }))}
                                            label="Recurring"
                                        >
                                            <MenuItem value="false">One-time</MenuItem>
                                            <MenuItem value="true">Recurring</MenuItem>
                                        </Select>
                                    </FormControl>
                                    {incomeForm.isRecurring && (
                                        <FormControl sx={{ minWidth: '120px' }}>
                                            <InputLabel>Frequency</InputLabel>
                                            <Select
                                                value={incomeForm.frequency}
                                                onChange={(e) => setIncomeForm(prev => ({ ...prev, frequency: e.target.value as any }))}
                                                label="Frequency"
                                            >
                                                <MenuItem value="daily">Daily</MenuItem>
                                                <MenuItem value="weekly">Weekly</MenuItem>
                                                <MenuItem value="monthly">Monthly</MenuItem>
                                            </Select>
                                        </FormControl>
                                    )}
                                    <Button
                                        variant="contained"
                                        onClick={handleAddIncome}
                                        startIcon={<Plus />}
                                        sx={{
                                            bgcolor: 'success.main',
                                            '&:hover': { bgcolor: 'success.dark' },
                                            minWidth: '140px',
                                        }}
                                    >
                                        Add Income
                                    </Button>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>

                    <List>
                        {incomeItems.map((item) => (
                            <ListItem
                                key={item.id}
                                sx={{
                                    bgcolor: 'rgba(76, 175, 80, 0.1)',
                                    borderRadius: 2,
                                    mb: 1,
                                    border: '1px solid rgba(76, 175, 80, 0.3)',
                                }}
                            >
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <TrendingUp size={16} color="green" />
                                            <Typography fontWeight="bold">{item.name}</Typography>
                                            <Chip label={formatCurrency(item.amount)} size="small" color="success" />
                                            {item.isRecurring && (
                                                <Chip label={item.frequency} size="small" color="info" />
                                            )}
                                        </Box>
                                    }
                                    secondary={`Date: ${new Date(item.date).toLocaleDateString()}`}
                                />
                                <IconButton
                                    edge="end"
                                    onClick={() => onRemoveIncome(item.id)}
                                    sx={{ color: 'error.main' }}
                                >
                                    <Trash2 size={16} />
                                </IconButton>
                            </ListItem>
                        ))}
                        {incomeItems.length === 0 && (
                            <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                                No income items yet. Add expected income above! 💰
                            </Typography>
                        )}
                    </List>
                </TabPanel>

                {/* Outgoing Tab */}
                <TabPanel value={tabValue} index={1}>
                    <Card sx={{ mb: 3, bgcolor: 'rgba(255, 255, 255, 0.8)' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ color: 'error.main' }}>
                                💸 Add Expected Outgoing
                            </Typography>
                            <Stack spacing={2}>
                                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                                    <TextField
                                        label="Expense Name"
                                        value={outgoingForm.name}
                                        onChange={(e) => setOutgoingForm(prev => ({ ...prev, name: e.target.value }))}
                                        sx={{ flex: 1, minWidth: '200px' }}
                                    />
                                    <TextField
                                        label="Amount"
                                        type="number"
                                        value={outgoingForm.amount}
                                        onChange={(e) => setOutgoingForm(prev => ({ ...prev, amount: e.target.value }))}
                                        sx={{ flex: 1, minWidth: '150px' }}
                                    />
                                    <FormControl sx={{ flex: 1, minWidth: '150px' }}>
                                        <InputLabel>Category</InputLabel>
                                        <Select
                                            value={outgoingForm.category}
                                            onChange={(e) => setOutgoingForm(prev => ({ ...prev, category: e.target.value }))}
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
                                        label="Date"
                                        type="date"
                                        value={outgoingForm.date}
                                        onChange={(e) => setOutgoingForm(prev => ({ ...prev, date: e.target.value }))}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{ flex: 1, minWidth: '180px' }}
                                    />
                                </Stack>
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                                    <FormControl sx={{ minWidth: '120px' }}>
                                        <InputLabel>Recurring</InputLabel>
                                        <Select
                                            value={outgoingForm.isRecurring ? "true" : "false"}
                                            onChange={(e) => setOutgoingForm(prev => ({ ...prev, isRecurring: e.target.value === "true" }))}
                                            label="Recurring"
                                        >
                                            <MenuItem value="false">One-time</MenuItem>
                                            <MenuItem value="true">Recurring</MenuItem>
                                        </Select>
                                    </FormControl>
                                    {outgoingForm.isRecurring && (
                                        <FormControl sx={{ minWidth: '120px' }}>
                                            <InputLabel>Frequency</InputLabel>
                                            <Select
                                                value={outgoingForm.frequency}
                                                onChange={(e) => setOutgoingForm(prev => ({ ...prev, frequency: e.target.value as any }))}
                                                label="Frequency"
                                            >
                                                <MenuItem value="daily">Daily</MenuItem>
                                                <MenuItem value="weekly">Weekly</MenuItem>
                                                <MenuItem value="monthly">Monthly</MenuItem>
                                            </Select>
                                        </FormControl>
                                    )}
                                    <Button
                                        variant="contained"
                                        onClick={handleAddOutgoing}
                                        startIcon={<Plus />}
                                        sx={{
                                            bgcolor: 'error.main',
                                            '&:hover': { bgcolor: 'error.dark' },
                                            minWidth: '140px',
                                        }}
                                    >
                                        Add Outgoing
                                    </Button>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>

                    <List>
                        {outgoingItems.map((item) => (
                            <ListItem
                                key={item.id}
                                sx={{
                                    bgcolor: 'rgba(244, 67, 54, 0.1)',
                                    borderRadius: 2,
                                    mb: 1,
                                    border: '1px solid rgba(244, 67, 54, 0.3)',
                                }}
                            >
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <TrendingDown size={16} color="red" />
                                            <Typography fontWeight="bold">{item.name}</Typography>
                                            <Chip label={formatCurrency(item.amount)} size="small" color="error" />
                                            <Chip label={item.category} size="small" variant="outlined" />
                                            {item.isRecurring && (
                                                <Chip label={item.frequency} size="small" color="info" />
                                            )}
                                        </Box>
                                    }
                                    secondary={`Date: ${new Date(item.date).toLocaleDateString()}`}
                                />
                                <IconButton
                                    edge="end"
                                    onClick={() => onRemoveOutgoing(item.id)}
                                    sx={{ color: 'error.main' }}
                                >
                                    <Trash2 size={16} />
                                </IconButton>
                            </ListItem>
                        ))}
                        {outgoingItems.length === 0 && (
                            <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                                No outgoing items yet. Add expected expenses above! 💸
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

export default MoneyPrediction;