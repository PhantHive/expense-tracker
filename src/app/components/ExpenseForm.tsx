import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Paper,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { Plus, Sparkles } from 'lucide-react';
import { Expense, ExpenseFormData } from '../types';
import { THEME, EXPENSE_CATEGORIES } from '../constants';

interface ExpenseFormProps {
    onSubmit: (expense: Omit<Expense, 'id'>) => void;
    editingExpense?: Expense | null;
    onCancelEdit?: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
                                                     onSubmit,
                                                     editingExpense,
                                                     onCancelEdit,
                                                 }) => {
    const [formData, setFormData] = useState<ExpenseFormData>({
        amount: '',
        category: '',
        date: '',
        note: '',
    });

    useEffect(() => {
        if (editingExpense) {
            setFormData({
                amount: editingExpense.amount.toString(),
                category: editingExpense.category,
                date: editingExpense.date,
                note: editingExpense.note || '',
            });
        } else {
            setFormData({
                amount: '',
                category: '',
                date: '',
                note: '',
            });
        }
    }, [editingExpense]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.amount || !formData.category || !formData.date) return;

        onSubmit({
            amount: parseFloat(formData.amount),
            category: formData.category,
            date: formData.date,
            note: formData.note || undefined,
        });

        if (!editingExpense) {
            setFormData({
                amount: '',
                category: '',
                date: '',
                note: '',
            });
        }
    };

    const handleChange = (field: keyof ExpenseFormData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value,
        }));
    };

    const handleCancel = () => {
        setFormData({
            amount: '',
            category: '',
            date: '',
            note: '',
        });
        onCancelEdit?.();
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
            }}
        >
            <Box component="form" onSubmit={handleSubmit}>
                <Grid2 container spacing={2} component="div" sx={{ display: 'flex' }}>
                    <Grid2
                        component="div"
                        sx={{
                            flex: 1,
                            width: { xs: '100%', md: '20%' },
                        }}
                    >
                        <TextField
                            fullWidth
                            label="Amount"
                            type="number"
                            value={formData.amount}
                            onChange={handleChange('amount')}
                            required
                            InputProps={{
                                startAdornment: (
                                    <Sparkles size={16} style={{ marginRight: 8 }} />
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': {
                                        borderColor: THEME.kawaiiAccent,
                                    },
                                },
                            }}
                        />
                    </Grid2>
                    <Grid2
                        component="div"
                        sx={{
                            flex: 1,
                            width: { xs: '100%', md: '20%' },
                        }}
                    >
                        <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={formData.category}
                                onChange={handleChange('category')}
                                label="Category"
                                required
                                sx={{
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: THEME.kawaiiAccent,
                                    },
                                }}
                            >
                                {EXPENSE_CATEGORIES.map((category) => (
                                    <MenuItem key={category} value={category}>
                                        {category}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid2>
                    <Grid2
                        component="div"
                        sx={{
                            flex: 1,
                            width: { xs: '100%', md: '20%' },
                        }}
                    >
                        <TextField
                            fullWidth
                            label="Date"
                            type="date"
                            value={formData.date}
                            onChange={handleChange('date')}
                            required
                            InputLabelProps={{
                                shrink: true,
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': {
                                        borderColor: THEME.kawaiiAccent,
                                    },
                                },
                            }}
                        />
                    </Grid2>
                    <Grid2
                        component="div"
                        sx={{
                            flex: 1,
                            width: { xs: '100%', md: '20%' },
                        }}
                    >
                        <TextField
                            fullWidth
                            label="Note (optional)"
                            value={formData.note}
                            onChange={handleChange('note')}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': {
                                        borderColor: THEME.kawaiiAccent,
                                    },
                                },
                            }}
                        />
                    </Grid2>
                    <Grid2
                        component="div"
                        sx={{
                            flex: 1,
                            width: { xs: '100%', md: '20%' },
                        }}
                    >
                        <Box sx={{ display: 'flex', gap: 1, height: '56px' }}>
                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                startIcon={<Plus />}
                                sx={{
                                    bgcolor: THEME.kawaiiAccent,
                                    '&:hover': {
                                        bgcolor: THEME.kawaiiSecondary,
                                    },
                                }}
                            >
                                {editingExpense ? 'Update' : 'Add'}
                            </Button>
                            {editingExpense && (
                                <Button
                                    variant="outlined"
                                    onClick={handleCancel}
                                    sx={{
                                        color: THEME.kawaiiAccent,
                                        borderColor: THEME.kawaiiAccent,
                                        minWidth: '80px',
                                    }}
                                >
                                    Cancel
                                </Button>
                            )}
                        </Box>
                    </Grid2>
                </Grid2>
            </Box>
        </Paper>
    );
};

export default ExpenseForm;