import React, { useState } from 'react';
import {
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Menu,
    MenuItem,
    Drawer,
    Box,
} from '@mui/material';
import { Trash2, Edit3, Filter } from 'lucide-react';
import { styled } from '@mui/system';
import Image from 'next/image';
import { Expense, SortOrder } from '../types';
import { THEME, IMAGES } from '../constants';

const NoteDrawer = styled(Drawer)({
    '& .MuiDrawer-paper': {
        width: 500,
        backgroundColor: THEME.kawaiiBg,
        border: `2px solid ${THEME.kawaiiAccent}`,
        borderRadius: '8px 0 0 8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        padding: 16,
    },
});

interface ExpenseTableProps {
    expenses: Expense[];
    onRemoveExpense: (id: number) => void;
    onEditExpense: (expense: Expense) => void;
    dateOrder: SortOrder;
    priceOrder: SortOrder;
    onDateOrderChange: () => void;
    onPriceOrderChange: () => void;
}

const ExpenseTable: React.FC<ExpenseTableProps> = ({
                                                       expenses,
                                                       onRemoveExpense,
                                                       onEditExpense,
                                                       dateOrder,
                                                       priceOrder,
                                                       onDateOrderChange,
                                                       onPriceOrderChange,
                                                   }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [expandedNoteId, setExpandedNoteId] = useState<number | null>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleDateOrderChange = () => {
        onDateOrderChange();
        handleClose();
    };

    const handlePriceOrderChange = () => {
        onPriceOrderChange();
        handleClose();
    };

    const toggleNote = (id: number) => {
        setExpandedNoteId(expandedNoteId === id ? null : id);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Recent Expenses ({expenses.length} items)
                    </Typography>
                    <IconButton onClick={handleClick} sx={{ color: THEME.kawaiiAccent }}>
                        <Filter />
                    </IconButton>
                </Box>

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

                <TableContainer sx={{ maxHeight: 500, overflow: 'auto' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: THEME.kawaiiBg }}>
                                    Date
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: THEME.kawaiiBg }}>
                                    Category
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: THEME.kawaiiBg }}>
                                    Amount
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: THEME.kawaiiBg }}>
                                    Note
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: THEME.kawaiiBg }}>
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {expenses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">
                                            No expenses recorded yet. Add your first expense above!
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                expenses.map((expense) => (
                                    <TableRow
                                        key={expense.id}
                                        sx={{
                                            '&:hover': {
                                                bgcolor: 'rgba(255, 105, 180, 0.1)',
                                            }
                                        }}
                                    >
                                        <TableCell>{formatDate(expense.date)}</TableCell>
                                        <TableCell>
                                            <Typography
                                                sx={{
                                                    px: 1,
                                                    py: 0.5,
                                                    bgcolor: THEME.kawaiiSecondary,
                                                    borderRadius: 1,
                                                    display: 'inline-block',
                                                    fontSize: '0.875rem',
                                                }}
                                            >
                                                {expense.category}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography fontWeight="bold" color="primary">
                                                {formatCurrency(expense.amount)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            {expense.note ? (
                                                <Button
                                                    variant="text"
                                                    size="small"
                                                    onClick={() => toggleNote(expense.id)}
                                                    sx={{ color: THEME.kawaiiAccent }}
                                                >
                                                    View Note
                                                </Button>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    No note
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onEditExpense(expense)}
                                                    sx={{
                                                        color: THEME.kawaiiAccent,
                                                        '&:hover': { bgcolor: `${THEME.kawaiiAccent}20` }
                                                    }}
                                                >
                                                    <Edit3 size={16} />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onRemoveExpense(expense.id)}
                                                    sx={{
                                                        color: 'error.main',
                                                        '&:hover': { bgcolor: 'error.light' }
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <NoteDrawer
                anchor="right"
                open={expandedNoteId !== null}
                onClose={() => setExpandedNoteId(null)}
            >
                <Box>
                    <Typography variant="h6" gutterBottom sx={{ color: THEME.kawaiiAccent }}>
                        💭 Expense Note
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                        {expenses.find((expense) => expense.id === expandedNoteId)?.note}
                    </Typography>
                    <Box sx={{ position: 'absolute', bottom: 16, right: 16 }}>
                        <Image
                            src={`${IMAGES.basePath}${IMAGES.note}`}
                            alt="Note"
                            width={250}
                            height={200}
                            style={{
                                borderRadius: '8px',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                            }}
                        />
                    </Box>
                </Box>
            </NoteDrawer>
        </>
    );
};

export default ExpenseTable;