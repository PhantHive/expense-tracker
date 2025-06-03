import React from 'react';
import { Typography, Paper } from '@mui/material';
import { styled } from '@mui/system';
import Image from 'next/image';
import { THEME, IMAGES } from '../constants';

const NotificationContainer = styled(Paper)({
    position: 'fixed',
    bottom: 20,
    right: 20,
    padding: '16px',
    borderRadius: '8px',
    backgroundColor: THEME.kawaiiBg,
    border: `2px solid ${THEME.kawaiiAccent}`,
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    zIndex: 1000,
    animation: 'slideIn 0.3s ease-out',
    '@keyframes slideIn': {
        from: {
            transform: 'translateX(100%)',
            opacity: 0,
        },
        to: {
            transform: 'translateX(0)',
            opacity: 1,
        },
    },
});

interface NotificationProps {
    message: string;
}

const Notification: React.FC<NotificationProps> = ({ message }) => {
    return (
        <NotificationContainer>
            <Image
                src={`${IMAGES.basePath}${IMAGES.happy}`}
                alt="Happy notification"
                width={60}
                height={60}
                style={{
                    marginRight: '16px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                }}
            />
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {message}
            </Typography>
        </NotificationContainer>
    );
};

export default Notification;