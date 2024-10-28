import React, { useState, useRef } from 'react';
import { Download, Upload, Plus, Trash2, Edit3 } from 'lucide-react';
import {
    Typography,
    TextField,
    Button,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    Container,
    Stack,
    Drawer,
    styled,
    Select,
    MenuItem,
    SelectChangeEvent,
    IconButton,
    Menu
} from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { Sparkles } from 'lucide-react';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import Notification from './Notification';
import { FilterList } from '@mui/icons-material';
import Image from 'next/image';

const basePath = process.env.NODE_ENV === 'production' ? '/expense-tracker' : '';

interface Expense {
    id: number;
    amount: number;
    category: string;
    date: string;
    note?: string;
}

// Styled components
const ChartContainer = styled(Box)({
    height: 300,
    width: '100%',
    '& > div': {
        width: '100% !important',
        height: '100% !important',
    },
});

const StyledPaper = styled(Paper)({
    borderRadius: 8,
    overflow: 'hidden',
    height: '100%',
});

const NoteDrawer = styled(Drawer)({
    '& .MuiDrawer-paper': {
        width: 500,
        backgroundColor: '#FFF0F5',
        border: '2px solid #FF69B4',
        borderRadius: '8px 0 0 8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        padding: 16,
    },
});

const Background = styled(Box)({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: `url(${basePath}/elf.png)`,
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
    '&::before, &::after, & .glow-top, & .glow-bottom, & .glow-left, & .glow-right': {
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

declare global {
    interface Window {
        showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>;
    }
}

interface SaveFilePickerOptions {
    suggestedName?: string;
    types?: Array<{
        description: string;
        accept: Record<string, string[]>;
    }>;
}

const ExpenseTracker: React.FC = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [amount, setAmount] = useState<string>('');
    const [category, setCategory] = useState<string>('');
    const [date, setDate] = useState<string>('');
    const [note, setNote] = useState<string>('');
    const [importError, setImportError] = useState<string>('');
    const [showSuccess, setShowSuccess] = useState<boolean>(false);
    const [expandedNoteId, setExpandedNoteId] = useState<number | null>(null);
    const [editExpenseId, setEditExpenseId] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [categoryFilter, setCategoryFilter] = useState<string>('');
    const [dateOrder, setDateOrder] = useState<'asc' | 'desc' | null>('asc');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [priceOrder, setPriceOrder] = useState<'asc' | 'desc' | null>('asc');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleDateOrderChange = () => {
        setDateOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
        setPriceOrder(null); // Reset price order
        handleClose();
    };

    const handlePriceOrderChange = () => {
        setPriceOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
        setDateOrder(null); // Reset date order
        handleClose();
    };

    const handleCategoryFilterChange = (event: SelectChangeEvent<string>) => {
        setSelectedCategory(event.target.value);
        setCategoryFilter(event.target.value);
    };

    // Kawaii theme colors
    const kawaiiBg = '#FFF0F5';
    const kawaiiAccent = '#FF69B4';
    const kawaiiSecondary = '#FFB6C1';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !category || !date) return;

        const newExpense: Expense = {
            id: editExpenseId ?? Date.now(),
            amount: parseFloat(amount),
            category,
            date,
            note,
        };

        if (editExpenseId) {
            setExpenses((prev) =>
                prev.map((exp) => (exp.id === editExpenseId ? newExpense : exp))
            );
            setEditExpenseId(null);
        } else {
            setExpenses((prev) => [...prev, newExpense]);
        }

        setAmount('');
        setCategory('');
        setDate('');
        setNote('');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    const getPieChartData = () => {
        const filteredExpenses = categoryFilter
            ? expenses.filter((expense) => expense.category === categoryFilter)
            : expenses;

        const categoryTotals = filteredExpenses.reduce(
            (acc: Record<string, number>, expense) => {
                acc[expense.category] =
                    (acc[expense.category] || 0) + expense.amount;
                return acc;
            },
            {}
        );

        return Object.entries(categoryTotals).map(([id, value]) => ({
            id,
            label: id,
            value,
        }));
    };

    const getBarChartData = () => {
        const monthlyTotals = expenses.reduce(
            (acc: Record<string, number>, expense) => {
                const month = expense.date.substring(0, 7);
                acc[month] = (acc[month] || 0) + expense.amount;
                return acc;
            },
            {}
        );

        return Object.entries(monthlyTotals)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([month, value]) => ({
                month,
                value,
            }));
    };

    const downloadExcel = async () => {
        const headers = ['Date', 'Category', 'Amount', 'Note'];
        const csvContent = [
            headers.join(','),
            ...expenses.map(
                (expense) =>
                    `${expense.date},${expense.category},${expense.amount},${expense.note || ''}`
            ),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });

        try {
            if (window.showSaveFilePicker) {
                const fileHandle = await window.showSaveFilePicker({
                    suggestedName: 'expenses.csv',
                    types: [
                        {
                            description: 'CSV Files',
                            accept: { 'text/csv': ['.csv'] },
                        },
                    ],
                });

                const writableStream = await fileHandle.createWritable();
                await writableStream.write(blob);
                await writableStream.close();
            } else {
                console.error('showSaveFilePicker is not supported in this browser.');
            }
        } catch (error) {
            console.error('Error saving the file:', error);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
            try {
                const text = e.target?.result as string;
                const lines = text.split('\n');
                const headers = lines[0].split(',');

                if (
                    headers.length !== 4 ||
                    !headers.includes('Date') ||
                    !headers.includes('Category') ||
                    !headers.includes('Amount') ||
                    !headers.includes('Note')
                ) {
                    throw new Error(
                        'Invalid CSV format. Please use the format: Date,Category,Amount,Note'
                    );
                }

                const newExpenses: Expense[] = lines
                    .slice(1)
                    .filter((line) => line.trim())
                    .map((line) => {
                        const [date, category, amount, note] = line.split(',');
                        return {
                            id: Date.now() + Math.random(),
                            date: date.trim(),
                            category: category.trim(),
                            amount: parseFloat(amount.trim()),
                            note: note.trim(),
                        };
                    });

                setExpenses((prev) => [...prev, ...newExpenses]);
                setImportError('');
                if (event.target) event.target.value = '';
            } catch (error) {
                setImportError((error as Error).message);
            }
        };
        reader.readAsText(file);
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const removeExpense = (id: number) => {
        setExpenses(expenses.filter((expense) => expense.id !== id));
    };

    const editExpense = (expense: Expense) => {
        setAmount(expense.amount.toString());
        setCategory(expense.category);
        setDate(expense.date);
        setNote(expense.note || '');
        setEditExpenseId(expense.id);
    };

    const toggleNote = (id: number) => {
        setExpandedNoteId(expandedNoteId === id ? null : id);
    };

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
        bgcolor: `${kawaiiBg}CC`, // Add transparency
        borderRadius: 4,
        p: 4,
        position: 'relative',
        overflow: 'hidden',
        border: `2px solid ${kawaiiAccent}`,
        backdropFilter: 'blur(10px)', // Add blur effect
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
            src={`${basePath}/waifu.gif`}
            alt="Waifu Assistant"
            width="100"
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
            color: kawaiiAccent,
            fontWeight: 'bold',
            mb: 4,
        }}
    >
        ✨ Zakaria&#39;s Expense Tracker ✨
    </Typography>

    <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: `${kawaiiBg}CC`, backdropFilter: 'blur(10px)' }}>
        <Box component="form" onSubmit={handleSubmit}>
            <Grid2
                container
                spacing={2}
                component="div"
                sx={{ display: 'flex' }}
            >
                <Grid2
                    component="div"
                    sx={{
                        flex: 1,
                        width: { xs: '100%', md: '33%' },
                    }}
                >
                    <TextField
                        fullWidth
                        label="Amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <Sparkles
                                    size={16}
                                    style={{ marginRight: 8 }}
                                />
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                    borderColor: kawaiiAccent,
                                },
                            },
                        }}
                    />
                </Grid2>
                <Grid2
                    component="div"
                    sx={{
                        flex: 1,
                        width: { xs: '100%', md: '33%' },
                    }}
                >
                    <TextField
                        fullWidth
                        label="Category"
                        value={category}
                        onChange={(e) =>
                            setCategory(e.target.value)
                        }
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                    borderColor: kawaiiAccent,
                                },
                            },
                        }}
                    />
                </Grid2>
                <Grid2
                    component="div"
                    sx={{
                        flex: 1,
                        width: { xs: '100%', md: '33%' },
                    }}
                >
                    <TextField
                        fullWidth
                        label="Date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        InputProps={{
                            placeholder: 'jj/mm/aaaa',
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                    borderColor: kawaiiAccent,
                                },
                            },
                        }}
                    />
                </Grid2>
                <Grid2
                    component="div"
                    sx={{
                        flex: 1,
                        width: { xs: '100%', md: '33%' },
                    }}
                >
                    <TextField
                        fullWidth
                        label="Note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                    borderColor: kawaiiAccent,
                                },
                            },
                        }}
                    />
                </Grid2>
                <Grid2
                    component="div"
                    sx={{
                        flex: 1,
                        width: { xs: '100%', md: '33%' },
                    }}
                >
                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        startIcon={<Plus />}
                        sx={{
                            bgcolor: kawaiiAccent,
                            '&:hover': {
                                bgcolor: kawaiiSecondary,
                            },
                            height: '56px',
                        }}
                    >
                        {editExpenseId
                            ? 'Update Expense'
                            : 'Add Expense'}
                    </Button>
                </Grid2>
            </Grid2>
        </Box>
    </Paper>

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
                    <Button
                        variant="outlined"
                        onClick={triggerFileInput}
                        startIcon={<Upload />}
                        sx={{ color: kawaiiAccent, borderColor: kawaiiAccent }}
                    >
                        Load CSV
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={downloadExcel}
                        startIcon={<Download />}
                        sx={{ color: kawaiiAccent, borderColor: kawaiiAccent }}
                    >
                        Download CSV
                    </Button>
                </Stack>

                {importError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {importError}
                    </Alert>
                )}

                <Grid2
                    container
                    spacing={5}
                    justifyContent="center"
                    direction="row"
                    sx={{ mb: 5, width: '100%' }}
                    component="div"
                >
                    <Grid2
                        component="div"
                        sx={{ width: { xs: '100%', md: '40%' } }}
                    >
                        <StyledPaper elevation={2}>
                            <Box sx={{ p: 2 }}>
                                <Typography
                                    variant="h6"
                                    gutterBottom
                                    align="center"
                                >
                                    Expenses by Category
                                </Typography>
                                <ChartContainer>
                                    {getPieChartData().length > 0 ? (
                                        <ResponsivePie
                                            data={getPieChartData()}
                                            margin={{
                                                top: 40,
                                                right: 80,
                                                bottom: 80,
                                                left: 80,
                                            }}
                                            innerRadius={0.5}
                                            padAngle={0.7}
                                            cornerRadius={3}
                                            colors={{ scheme: 'nivo' }}
                                            borderWidth={1}
                                            borderColor={{
                                                from: 'color',
                                                modifiers: [['darker', 0.2]],
                                            }}
                                            arcLabelsSkipAngle={10}
                                            arcLabelsTextColor="#333333"
                                            arcLabel={(d) =>
                                                `${d.value.toFixed(2)}`
                                            }
                                        />
                                    ) : (
                                        <Typography
                                            align="center"
                                            color="textSecondary"
                                            sx={{ mt: 10 }}
                                        >
                                            No data available
                                        </Typography>
                                    )}
                                </ChartContainer>
                            </Box>
                            <Box sx={{ mb: 3 }}>
                                <TextField
                                    label="Filter by Category"
                                    value={categoryFilter}
                                    onChange={(e) =>
                                        setCategoryFilter(e.target.value)
                                    }
                                    fullWidth
                                    sx={{ mb: 2 }}
                                />
                                <Select
                                    value={selectedCategory}
                                    onChange={handleCategoryFilterChange}
                                    displayEmpty
                                    fullWidth
                                    sx={{ mb: 2 }}
                                >
                                    <MenuItem value="">
                                        <em>None</em>
                                    </MenuItem>
                                    {Array.from(
                                        new Set(
                                            expenses.map(
                                                (expense) => expense.category
                                            )
                                        )
                                    ).map((category) => (
                                        <MenuItem
                                            key={category}
                                            value={category}
                                        >
                                            {category}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Box>
                        </StyledPaper>
                    </Grid2>

                    <Grid2
                        component="div"
                        sx={{ width: { xs: '100%', md: '40%' } }}
                    >
                        <StyledPaper elevation={2}>
                            <Box sx={{ p: 2 }}>
                                <Typography
                                    variant="h6"
                                    gutterBottom
                                    align="center"
                                >
                                    Monthly Expenses
                                </Typography>
                                <ChartContainer>
                                    {getBarChartData().length > 0 ? (
                                        <ResponsiveBar
                                            data={getBarChartData()}
                                            keys={['value']}
                                            indexBy="month"
                                            margin={{
                                                top: 50,
                                                right: 130,
                                                bottom: 50,
                                                left: 60,
                                            }}
                                            padding={0.3}
                                            valueScale={{ type: 'linear' }}
                                            indexScale={{
                                                type: 'band',
                                                round: true,
                                            }}
                                            colors={{ scheme: 'nivo' }}
                                            borderColor={{
                                                from: 'color',
                                                modifiers: [['darker', 1.6]],
                                            }}
                                            axisTop={null}
                                            axisRight={null}
                                            axisBottom={{
                                                tickSize: 5,
                                                tickPadding: 5,
                                                tickRotation: 0,
                                                legend: 'Month',
                                                legendPosition: 'middle',
                                                legendOffset: 32,
                                            }}
                                            axisLeft={{
                                                tickSize: 5,
                                                tickPadding: 5,
                                                tickRotation: 0,
                                                legend: 'Amount',
                                                legendPosition: 'middle',
                                                legendOffset: -40,
                                            }}
                                            label={(d) =>
                                                `${d.value?.toFixed(2)}`
                                            }
                                            labelSkipWidth={12}
                                            labelSkipHeight={12}
                                            labelTextColor={{
                                                from: 'color',
                                                modifiers: [['darker', 1.6]],
                                            }}
                                            legends={[
                                                {
                                                    dataFrom: 'keys',
                                                    anchor: 'bottom-right',
                                                    direction: 'column',
                                                    justify: false,
                                                    translateX: 120,
                                                    translateY: 0,
                                                    itemsSpacing: 2,
                                                    itemWidth: 100,
                                                    itemHeight: 20,
                                                    itemDirection:
                                                        'left-to-right',
                                                    itemOpacity: 0.85,
                                                    symbolSize: 20,
                                                    effects: [
                                                        {
                                                            on: 'hover',
                                                            style: {
                                                                itemOpacity: 1,
                                                            },
                                                        },
                                                    ],
                                                },
                                            ]}
                                            role="application"
                                            ariaLabel="Nivo bar chart demo"
                                            barAriaLabel={function (e) {
                                                return (
                                                    e.id +
                                                    ': ' +
                                                    e.formattedValue +
                                                    ' in month: ' +
                                                    e.indexValue
                                                );
                                            }}
                                        />
                                    ) : (
                                        <Typography
                                            align="center"
                                            color="textSecondary"
                                            sx={{ mt: 10 }}
                                        >
                                            No data available
                                        </Typography>
                                    )}
                                </ChartContainer>
                            </Box>
                        </StyledPaper>
                    </Grid2>
                </Grid2>

                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Recent Expenses
                    </Typography>
                    <IconButton onClick={handleClick}>
                        <FilterList />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >
                        <MenuItem onClick={handleDateOrderChange}>
                            Date Order: {dateOrder === 'asc' ? 'Ascending' : 'Descending'}
                        </MenuItem>
                        <MenuItem onClick={handlePriceOrderChange}>
                            Price Order: {priceOrder === 'asc' ? 'Ascending' : 'Descending'}
                        </MenuItem>
                    </Menu>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                    <TableCell align="right">Note</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                          <TableBody>
    {expenses
        .slice()
        .sort((a, b) => {
            if (dateOrder && priceOrder) {
                const dateComparison = dateOrder === 'asc'
                    ? new Date(a.date).getTime() - new Date(b.date).getTime()
                    : new Date(b.date).getTime() - new Date(a.date).getTime();
                if (dateComparison !== 0) return dateComparison;

                return priceOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
            } else if (dateOrder) {
                return dateOrder === 'asc'
                    ? new Date(a.date).getTime() - new Date(b.date).getTime()
                    : new Date(b.date).getTime() - new Date(a.date).getTime();
            } else if (priceOrder) {
                return priceOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
            }
            return 0;
        })
        .map((expense) => (
            <TableRow key={expense.id}>
                <TableCell>{expense.date}</TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell align="right">{expense.amount}</TableCell>
                <TableCell align="right">
                    {expense.note && (
                        <Button
                            variant="text"
                            onClick={() => toggleNote(expense.id)}
                        >
                            View Note
                        </Button>
                    )}
                </TableCell>
                <TableCell align="right">
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => removeExpense(expense.id)}
                    >
                        <Trash2 size={16} />
                    </Button>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => editExpense(expense)}
                    >
                        <Edit3 size={16} />
                    </Button>
                </TableCell>
            </TableRow>
        ))}
</TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Paper>

          {showSuccess && (
                <Notification message="✨ Expense added successfully! ✨" />
            )}

            <NoteDrawer
                anchor="right"
                open={expandedNoteId !== null}
                onClose={() => setExpandedNoteId(null)}
            >
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Note
                    </Typography>
                    <Typography variant="body1">
                        {
                            expenses.find(
                                (expense) => expense.id === expandedNoteId
                            )?.note
                        }
                    </Typography>
                    <Box sx={{ position: 'absolute', bottom: 16, right: 16 }}>
                        <Image
                            src={`${basePath}/note.gif`}
                            alt="Note"
                            width="250"
                            style={{
                                borderRadius: '8px',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                            }}
                        />
                    </Box>
                </Box>
            </NoteDrawer>
        </Container>
    );
};

export default ExpenseTracker;