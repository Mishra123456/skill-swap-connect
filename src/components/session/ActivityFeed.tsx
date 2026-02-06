import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from 'date-fns';
import {
    CheckCircle2,
    Plus,
    FileText,
    Link as LinkIcon,
    MessageSquare,
    Shield,
    Clock,
    User
} from 'lucide-react';

interface ActivityItem {
    _id: string;
    action: string;
    details: string;
    performedBy: {
        _id: string;
        name: string;
    } | string;
    createdAt: string;
}

interface ActivityFeedProps {
    activities: ActivityItem[];
}

const ActivityFeed = ({ activities }: ActivityFeedProps) => {
    const getIcon = (action: string) => {
        switch (action) {
            case 'milestone_complete':
            case 'session_complete':
                return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
            case 'milestone_add':
            case 'task_add':
                return <Plus className="h-4 w-4 text-indigo-400" />;
            case 'agreement_signed':
                return <Shield className="h-4 w-4 text-amber-400" />;
            case 'note_update':
                return <FileText className="h-4 w-4 text-violet-400" />;
            case 'resource_add':
                return <LinkIcon className="h-4 w-4 text-cyan-400" />;
            default:
                return <Clock className="h-4 w-4 text-gray-400" />;
        }
    };

    const sortedActivities = [...activities].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return (
        <div className="h-full flex flex-col glass rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-slate-900/30">
                <h3 className="font-semibold text-gray-100 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-indigo-400" />
                    Session Activity
                </h3>
            </div>

            <ScrollArea className="flex-1 p-4">
                {sortedActivities.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No activity recorded yet
                    </div>
                ) : (
                    <div className="space-y-6 relative ml-2">
                        {/* Vertical Line */}
                        <div className="absolute left-2.5 top-2 bottom-2 w-px bg-white/10" />

                        {sortedActivities.map((activity, index) => {
                            const performerName = typeof activity.performedBy === 'object'
                                ? activity.performedBy?.name
                                : 'Unknown User';

                            return (
                                <div key={activity._id || index} className="relative flex gap-4">
                                    <div className="relative z-10 flex-shrink-0 w-5 h-5 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center mt-0.5">
                                        {getIcon(activity.action)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                                            <p className="text-sm font-medium text-gray-200">
                                                {activity.details}
                                            </p>
                                            <span className="text-xs text-gray-500 whitespace-nowrap">
                                                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <User className="h-3 w-3" />
                                            <span>{performerName}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
};

export default ActivityFeed;
