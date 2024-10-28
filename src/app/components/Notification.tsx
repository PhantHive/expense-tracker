import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/system';

const NotificationContainer = styled(Paper)({
    position: 'fixed',
    bottom: 20,
    right: 20,
    padding: '16px',
    borderRadius: '8px',
    backgroundColor: '#FFF0F5',
    border: '2px solid #FF69B4',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
});

const Notification: React.FC<{ message: string }> = ({ message }) => {
    return (
        <NotificationContainer>
            <img
                src="/happy.gif"
                alt="Waifu Happy"
                width="100"
                style={{ marginRight: '16px', borderRadius: '8px' }}
            />
            <Typography variant="body1">{message}</Typography>
        </NotificationContainer>
    );
};

export default Notification;
