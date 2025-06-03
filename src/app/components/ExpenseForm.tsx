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
    Typography,
    Stack,
} from '@mui/material';
import { Plus, Sparkles, Clock } from 'lucide-react';
import { Expense, ExpenseFormData } from '../types';
import { THEME, EXPENSE_CATEGORIES } from '../constants';

interface ExpenseFormProps {
    onSubmit: (expense: Omit<Expense, 'id'>) => void;
    editingExpense?: Expense | null;
    onCancelEdit?: () => void;
    onShowRecurring?: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
                                                     onSubmit,
                                                     editingExpense,
                                                     onCancelEdit,
                                                     onShowRecurring,
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
            <Typography
                variant="h6"
                gutterBottom
                sx={{ color: THEME.kawaiiAccent, fontWeight: 'bold', mb: 2 }}
            >
                ✨ Add New Expense
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
                <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                        flexWrap: 'wrap',
                        alignItems: 'end'
                    }}
                >
                    <TextField
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
                            flex: 1,
                            minWidth: '150px',
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                    borderColor: THEME.kawaiiAccent,
                                },
                            },
                        }}
                    />

                    <FormControl sx={{ flex: 1, minWidth: '150px' }}>
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

                    <TextField
                        label="Date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange('date')}
                        required
                        InputLabelProps={{
                            shrink: true,
                        }}
                        sx={{
                            flex: 1,
                            minWidth: '180px',
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                    borderColor: THEME.kawaiiAccent,
                                },
                            },
                        }}
                    />

                    <TextField
                        label="Note (optional)"
                        value={formData.note}
                        onChange={handleChange('note')}
                        sx={{
                            flex: 1,
                            minWidth: '200px',
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                    borderColor: THEME.kawaiiAccent,
                                },
                            },
                        }}
                    />

                    <Box sx={{ display: 'flex', gap: 1, minWidth: '200px' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={<Plus />}
                            sx={{
                                bgcolor: THEME.kawaiiAccent,
                                '&:hover': {
                                    bgcolor: THEME.kawaiiSecondary,
                                },
                                flex: 2,
                                height: '56px',
                            }}
                        >
                            {editingExpense ? 'Update' : 'Add'}
                        </Button>
                        {!editingExpense && onShowRecurring && (
                            <Button
                                variant="outlined"
                                onClick={onShowRecurring}
                                sx={{
                                    color: THEME.kawaiiAccent,
                                    borderColor: THEME.kawaiiAccent,
                                    minWidth: '48px',
                                    height: '56px',
                                    flex: 1,
                                }}
                                title="Show recurring items"
                            >
                                <Clock size={16} />
                            </Button>
                        )}
                        {editingExpense && (
                            <Button
                                variant="outlined"
                                onClick={handleCancel}
                                sx={{
                                    color: THEME.kawaiiAccent,
                                    borderColor: THEME.kawaiiAccent,
                                    minWidth: '80px',
                                    height: '56px',
                                    flex: 1,
                                }}
                            >
                                Cancel
                            </Button>
                        )}
                    </Box>
                </Stack>
            </Box>
        </Paper>
    );
}

export default ExpenseForm;