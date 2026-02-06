import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
    Search,
    MessageSquare,
    Users,
    FileSearch,
    Inbox,
    Wifi,
    WifiOff,
    AlertCircle,
    Lock,
    RefreshCw,
    Plus,
    ArrowRight
} from 'lucide-react';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
        icon?: ReactNode;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
    variant?: 'default' | 'search' | 'messages' | 'requests' | 'error' | 'offline' | 'locked';
}

const iconMap = {
    default: Inbox,
    search: FileSearch,
    messages: MessageSquare,
    requests: Users,
    error: AlertCircle,
    offline: WifiOff,
    locked: Lock,
};

const gradientMap = {
    default: 'from-indigo-500/20 to-cyan-500/20',
    search: 'from-violet-500/20 to-purple-500/20',
    messages: 'from-emerald-500/20 to-teal-500/20',
    requests: 'from-amber-500/20 to-orange-500/20',
    error: 'from-red-500/20 to-rose-500/20',
    offline: 'from-gray-500/20 to-slate-500/20',
    locked: 'from-amber-500/20 to-yellow-500/20',
};

const iconColorMap = {
    default: 'text-indigo-400',
    search: 'text-violet-400',
    messages: 'text-emerald-400',
    requests: 'text-amber-400',
    error: 'text-red-400',
    offline: 'text-gray-400',
    locked: 'text-amber-400',
};

export const EmptyState = ({
    icon,
    title,
    description,
    action,
    secondaryAction,
    variant = 'default'
}: EmptyStateProps) => {
    const IconComponent = iconMap[variant];
    const gradient = gradientMap[variant];
    const iconColor = iconColorMap[variant];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15, delay: 0.1 }}
                className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6`}
            >
                {icon || <IconComponent className={`h-10 w-10 ${iconColor}`} />}
            </motion.div>

            <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-semibold text-gray-100 mb-2"
            >
                {title}
            </motion.h3>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-400 max-w-md mb-6"
            >
                {description}
            </motion.p>

            {(action || secondaryAction) && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row items-center gap-3"
                >
                    {action && (
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                                onClick={action.onClick}
                                className="bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-lg shadow-indigo-500/25"
                            >
                                {action.icon || <Plus className="h-4 w-4 mr-2" />}
                                {action.label}
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </motion.div>
                    )}
                    {secondaryAction && (
                        <Button
                            variant="ghost"
                            onClick={secondaryAction.onClick}
                            className="text-gray-400 hover:text-gray-200"
                        >
                            {secondaryAction.label}
                        </Button>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
};

// Pre-configured empty states
export const NoSearchResults = ({ query, onClear }: { query: string; onClear: () => void }) => (
    <EmptyState
        variant="search"
        title="No results found"
        description={`We couldn't find anything matching "${query}". Try adjusting your search or filters.`}
        action={{ label: 'Clear Search', onClick: onClear, icon: <RefreshCw className="h-4 w-4 mr-2" /> }}
    />
);

export const NoMessages = ({ onStartChat }: { onStartChat?: () => void }) => (
    <EmptyState
        variant="messages"
        title="No messages yet"
        description="Start a conversation to begin collaborating on skill exchanges."
        action={onStartChat ? { label: 'Start Chat', onClick: onStartChat } : undefined}
    />
);

export const NoRequests = ({ onBrowse }: { onBrowse: () => void }) => (
    <EmptyState
        variant="requests"
        title="No requests yet"
        description="Browse skills to find people to exchange knowledge with."
        action={{ label: 'Browse Skills', onClick: onBrowse, icon: <Search className="h-4 w-4 mr-2" /> }}
    />
);

export const NetworkError = ({ onRetry }: { onRetry: () => void }) => (
    <EmptyState
        variant="error"
        title="Something went wrong"
        description="We encountered an error loading this content. Please try again."
        action={{ label: 'Retry', onClick: onRetry, icon: <RefreshCw className="h-4 w-4 mr-2" /> }}
    />
);

export const OfflineError = ({ onRetry }: { onRetry: () => void }) => (
    <EmptyState
        variant="offline"
        title="You're offline"
        description="Check your internet connection and try again."
        action={{ label: 'Retry', onClick: onRetry, icon: <Wifi className="h-4 w-4 mr-2" /> }}
    />
);

export const AccessDenied = ({ onGoBack }: { onGoBack: () => void }) => (
    <EmptyState
        variant="locked"
        title="Access Denied"
        description="You don't have permission to view this content."
        action={{ label: 'Go Back', onClick: onGoBack }}
    />
);

export default EmptyState;
