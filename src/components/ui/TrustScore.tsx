import { motion } from 'framer-motion';
import { Shield, ShieldCheck, ShieldAlert, Star, Award, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustScoreProps {
    score: number; // 0-100
    rating: number; // 0-5
    totalRatings: number;
    completedExchanges: number;
    size?: 'sm' | 'md' | 'lg';
    showDetails?: boolean;
}

const getTrustLevel = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'emerald', icon: ShieldCheck };
    if (score >= 70) return { label: 'Good', color: 'cyan', icon: Shield };
    if (score >= 50) return { label: 'Building', color: 'amber', icon: Shield };
    return { label: 'New', color: 'gray', icon: ShieldAlert };
};

const colorMap = {
    emerald: {
        bg: 'bg-emerald-500/20',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        fill: 'fill-emerald-500',
        gradient: 'from-emerald-500 to-teal-500',
    },
    cyan: {
        bg: 'bg-cyan-500/20',
        border: 'border-cyan-500/30',
        text: 'text-cyan-400',
        fill: 'fill-cyan-500',
        gradient: 'from-cyan-500 to-blue-500',
    },
    amber: {
        bg: 'bg-amber-500/20',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        fill: 'fill-amber-500',
        gradient: 'from-amber-500 to-orange-500',
    },
    gray: {
        bg: 'bg-gray-500/20',
        border: 'border-gray-500/30',
        text: 'text-gray-400',
        fill: 'fill-gray-500',
        gradient: 'from-gray-500 to-slate-500',
    },
};

export const TrustScore = ({
    score,
    rating,
    totalRatings,
    completedExchanges,
    size = 'md',
    showDetails = true
}: TrustScoreProps) => {
    const trustLevel = getTrustLevel(score);
    const colors = colorMap[trustLevel.color as keyof typeof colorMap];
    const Icon = trustLevel.icon;

    const sizeConfig = {
        sm: { ring: 'w-16 h-16', icon: 'h-6 w-6', text: 'text-xs' },
        md: { ring: 'w-24 h-24', icon: 'h-8 w-8', text: 'text-sm' },
        lg: { ring: 'w-32 h-32', icon: 'h-10 w-10', text: 'text-base' },
    };

    const config = sizeConfig[size];

    // Calculate stroke dashoffset for circular progress
    const radius = size === 'sm' ? 28 : size === 'md' ? 44 : 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            {/* Circular Progress */}
            <div className={cn("relative", config.ring)}>
                <svg className="w-full h-full -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx="50%"
                        cy="50%"
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="text-slate-700"
                    />
                    {/* Progress circle */}
                    <motion.circle
                        cx="50%"
                        cy="50%"
                        r={radius}
                        fill="none"
                        stroke={`url(#gradient-${trustLevel.color})`}
                        strokeWidth="4"
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        style={{ strokeDasharray: circumference }}
                    />
                    <defs>
                        <linearGradient id={`gradient-${trustLevel.color}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" className={colors.text} stopColor="currentColor" />
                            <stop offset="100%" className={colors.text} stopColor="currentColor" stopOpacity="0.6" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Icon className={cn(config.icon, colors.text)} />
                    <span className={cn("font-bold", config.text, colors.text)}>{score}</span>
                </div>
            </div>

            {/* Trust Level Label */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={cn(
                    "mt-3 px-3 py-1 rounded-full text-xs font-medium",
                    colors.bg, colors.border, colors.text, "border"
                )}
            >
                {trustLevel.label} Trust
            </motion.div>

            {/* Details */}
            {showDetails && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 flex items-center gap-4 text-sm"
                >
                    <div className="flex items-center gap-1 text-gray-400">
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        <span className="font-medium text-gray-200">{rating.toFixed(1)}</span>
                        <span className="text-gray-500">({totalRatings})</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span>{completedExchanges} completed</span>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

// Compact version for cards
export const TrustBadge = ({ score, size = 'sm' }: { score: number; size?: 'sm' | 'md' }) => {
    const trustLevel = getTrustLevel(score);
    const colors = colorMap[trustLevel.color as keyof typeof colorMap];
    const Icon = trustLevel.icon;

    return (
        <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-full",
            colors.bg, colors.border, "border",
            size === 'sm' ? 'text-xs' : 'text-sm'
        )}>
            <Icon className={cn("h-3.5 w-3.5", colors.text)} />
            <span className={cn("font-medium", colors.text)}>{score}</span>
        </div>
    );
};

// Trust factors breakdown
export const TrustFactors = ({ factors }: { factors: { label: string; score: number; max: number }[] }) => (
    <div className="space-y-3">
        {factors.map((factor, i) => (
            <div key={i} className="space-y-1">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{factor.label}</span>
                    <span className="text-gray-300">{factor.score}/{factor.max}</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(factor.score / factor.max) * 100}%` }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full"
                    />
                </div>
            </div>
        ))}
    </div>
);

export default TrustScore;
