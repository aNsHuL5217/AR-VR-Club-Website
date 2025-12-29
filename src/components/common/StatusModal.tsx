'use client';

import React from 'react';
import {
    CheckCircleIcon,
    WarningCircleIcon,
    InfoIcon
} from '@phosphor-icons/react/dist/ssr';

interface StatusModalProps {
    isOpen: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
    onClose: () => void;
}

export default function StatusModal({ isOpen, type, title, message, onClose }: StatusModalProps) {
    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200,
            }}
            onClick={onClose}
        >
            <div
                className="glass-card"
                style={{ maxWidth: '400px', width: '90%', position: 'relative', textAlign: 'center', padding: '2rem' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                    {type === 'success' && <CheckCircleIcon size={48} color="#4ade80" weight="duotone" />}
                    {type === 'error' && <WarningCircleIcon size={48} color="#f87171" weight="duotone" />}
                    {type === 'info' && <InfoIcon size={48} color="#60a5fa" weight="duotone" />}
                </div>
                <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'white', fontSize: '1.5rem' }}>{title}</h3>
                <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>{message}</p>
                <button className="btn" onClick={onClose}>
                    Okay
                </button>
            </div>
        </div>
    );
}
