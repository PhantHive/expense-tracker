import React from 'react';
import { Typography, Paper } from '@mui/material';
import { styled } from '@mui/system';
import Image from 'next/image';

const basePath = process.env.NODE_ENV === 'production' ? '/expense-tracker' : '';

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
            <Image
                src={`${basePath}/happy.gif`}
                alt="Waifu Happy"
                width="150"
                style={{ marginRight: '16px', borderRadius: '8px' }}
            />
            <Typography variant="body1">{message}</Typography>
        </NotificationContainer>
    );
};

export default Notification;
