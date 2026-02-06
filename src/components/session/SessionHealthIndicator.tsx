import { Activity, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionHealthIndicatorProps {
    status: 'good' | 'attention' | 'risk';
    score: number;
}

const SessionHealthIndicator: React.FC<SessionHealthIndicatorProps> = ({ status, score }) => {
    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-white/5">
            <div className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                status === 'good' ? "bg-emerald-500" :
                    status === 'attention' ? "bg-amber-500" : "bg-red-500"
            )} />
            <div className="flex flex-col">
                <span className={cn(
                    "text-xs font-bold uppercase tracking-wider",
                    status === 'good' ? "text-emerald-400" :
                        status === 'attention' ? "text-amber-400" : "text-red-400"
                )}>
                    {status === 'good' ? 'Healthy' : status === 'attention' ? 'Needs Focus' : 'At Risk'}
                </span>
            </div>
            <div className="h-4 w-px bg-white/10 mx-1" />
            <span className="text-xs font-mono text-gray-400">{score}%</span>
        </div>
    );
};

export default SessionHealthIndicator;
