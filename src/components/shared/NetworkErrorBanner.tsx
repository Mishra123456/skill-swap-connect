import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NetworkErrorBannerProps {
    onRetry?: () => void;
    message?: string;
}

export function NetworkErrorBanner({ onRetry, message = "You're offline" }: NetworkErrorBannerProps) {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <AnimatePresence>
            {!isOnline && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    className="fixed top-0 left-0 right-0 z-[100] bg-red-500/95 backdrop-blur-sm text-white py-3 px-4 shadow-lg"
                >
                    <div className="container mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <WifiOff className="h-5 w-5" />
                            <span className="font-medium">{message}</span>
                            <span className="text-white/80 text-sm">Check your internet connection</span>
                        </div>
                        {onRetry && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onRetry}
                                className="text-white hover:bg-white/20"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Retry
                            </Button>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

interface ErrorBannerProps {
    title?: string;
    message: string;
    onRetry?: () => void;
    onDismiss?: () => void;
}

export function ErrorBanner({ title = "Something went wrong", message, onRetry, onDismiss }: ErrorBannerProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"
        >
            <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <h4 className="font-medium text-red-300">{title}</h4>
                    <p className="text-sm text-red-200/80 mt-1">{message}</p>
                    {(onRetry || onDismiss) && (
                        <div className="flex gap-2 mt-3">
                            {onRetry && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={onRetry}
                                    className="border-red-500/30 text-red-300 hover:bg-red-500/20"
                                >
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    Try Again
                                </Button>
                            )}
                            {onDismiss && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={onDismiss}
                                    className="text-red-300/60 hover:text-red-300"
                                >
                                    Dismiss
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default NetworkErrorBanner;
