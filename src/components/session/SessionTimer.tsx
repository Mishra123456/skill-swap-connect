import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface SessionTimerProps {
    startTime: string;
    accumulatedTime: number;
    status: 'active' | 'paused' | 'completed';
    onToggle: (action: 'start' | 'pause') => void;
    readOnly?: boolean;
}

const SessionTimer: React.FC<SessionTimerProps> = ({ startTime, accumulatedTime, status, onToggle, readOnly = false }) => {
    const [currentTime, setCurrentTime] = useState(accumulatedTime);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (status === 'active') {
            // Calculate initial elapsed time since last start
            const start = new Date(startTime).getTime(); // Re-parsing standard date string
            // Just use accumulated + (now - lastActive) logic if we had lastActive, 
            // but here we are receiving startTime which in the model is `lastActive` for active sessions?
            // Actually, API returns `lastActive`? Let's assume the parent passes the correct "last started point"
            // if status is active.
            // Wait, the model has `lastActive`. The props names it `startTime` (maybe meaningful start of this segment).
            // Let's rely on the parent to pass `lastActive` as `startTime` if active.

            interval = setInterval(() => {
                const now = new Date().getTime();
                const sessionStart = new Date(startTime).getTime();
                const diffInSeconds = Math.floor((now - sessionStart) / 1000);
                setCurrentTime(accumulatedTime + diffInSeconds);
            }, 1000);
        } else {
            setCurrentTime(accumulatedTime);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [status, startTime, accumulatedTime]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-3 bg-slate-800/50 rounded-xl px-4 py-2 border border-white/5">
            <div className="bg-indigo-500/20 p-2 rounded-full">
                <Clock className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="font-mono text-xl font-medium text-gray-200 w-24">
                {formatTime(currentTime)}
            </div>

            {!readOnly && status !== 'completed' && (
                <div className="flex gap-1">
                    {status !== 'active' ? (
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onToggle('start')}
                                className="h-8 w-8 p-0 rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                            >
                                <Play className="h-4 w-4 fill-current" />
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onToggle('pause')}
                                className="h-8 w-8 p-0 rounded-full bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                            >
                                <Pause className="h-4 w-4 fill-current" />
                            </Button>
                        </motion.div>
                    )}
                </div>
            )}

            {status === 'active' && (
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
            )}
        </div>
    );
};

export default SessionTimer;
