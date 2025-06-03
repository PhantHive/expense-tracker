import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Paper,
    Typography,
    Stack,
} from '@mui/material';
import { DollarSign } from 'lucide-react';
import { BudgetFormData } from '../types';
import { THEME } from '../constants';

interface BudgetFormProps {
    onSubmit: (month: string, budgetAmount: number) => void;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ onSubmit }) => {
    const [formData, setFormData] = useState<BudgetFormData>({
        month: '',
        budgetAmount: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.month || !formData.budgetAmount) return;

        onSubmit(formData.month, parseFloat(formData.budgetAmount));
        setFormData({
            month: '',
            budgetAmount: '',
        });
    };

    const handleChange = (field: keyof BudgetFormData) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value,
        }));
    };

    // Get current month as default
    const getCurrentMonth = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
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
                💰 Set Monthly Budget
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="end">
                    <TextField
                        label="Month"
                        type="month"
                        value={formData.month || getCurrentMonth()}
                        onChange={handleChange('month')}
                        required
                        InputLabelProps={{
                            shrink: true,
                        }}
                        sx={{
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                    borderColor: THEME.kawaiiAccent,
                                },
                            },
                        }}
                    />
                    <TextField
                        label="Budget Amount"
                        type="number"
                        value={formData.budgetAmount}
                        onChange={handleChange('budgetAmount')}
                        required
                        InputProps={{
                            startAdornment: (
                                <DollarSign size={16} style={{ marginRight: 8 }} />
                            ),
                        }}
                        sx={{
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                    borderColor: THEME.kawaiiAccent,
                                },
                            },
                        }}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        sx={{
                            bgcolor: THEME.kawaiiAccent,
                            '&:hover': {
                                bgcolor: THEME.kawaiiSecondary,
                            },
                            height: '56px',
                            px: 3,
                        }}
                    >
                        Set Budget
                    </Button>
                </Stack>
            </Box>
        </Paper>
    );
};

export default BudgetForm;