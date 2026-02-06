import React, { useState } from 'react';
import { CheckCircle2, Circle, Plus, Calendar, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Milestone {
    _id: string;
    title: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'completed';
    deadline?: string;
    completedAt?: string;
}

interface MilestoneTrackerProps {
    matchId: string;
    milestones: Milestone[];
    onUpdate: () => void;
    readOnly?: boolean;
}

const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({ matchId, milestones, onUpdate, readOnly }) => {
    const { toast } = useToast();
    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newDeadline, setNewDeadline] = useState('');

    const handleAdd = async () => {
        if (!newTitle.trim()) return;
        try {
            await api.sessions.updateMilestone(matchId, {
                title: newTitle,
                description: newDesc,
                deadline: newDeadline ? new Date(newDeadline).toISOString() : undefined
            });
            setNewTitle('');
            setNewDesc('');
            setNewDeadline('');
            setIsAdding(false);
            onUpdate();
            toast({ title: 'Milestone added' });
        } catch (error) {
            toast({ title: 'Failed to add milestone', variant: 'destructive' });
        }
    };

    const handleStatusChange = async (id: string, status: string) => {
        if (readOnly) return;
        try {
            await api.sessions.updateMilestone(matchId, { milestoneId: id, status });
            onUpdate();
        } catch (error) {
            toast({ title: 'Failed to update status', variant: 'destructive' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-200">Session Milestones</h3>
                {!readOnly && (
                    <Button
                        size="sm"
                        onClick={() => setIsAdding(!isAdding)}
                        variant="outline"
                        className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Milestone
                    </Button>
                )}
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-slate-800/50 p-4 rounded-xl border border-white/5 space-y-3 overflow-hidden"
                    >
                        <Input
                            placeholder="Milestone Title"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="bg-slate-900/50 border-white/10"
                        />
                        <Textarea
                            placeholder="Description (optional)"
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                            className="bg-slate-900/50 border-white/10 h-20"
                        />
                        <div className="flex items-center gap-3">
                            <Input
                                type="date"
                                value={newDeadline}
                                onChange={(e) => setNewDeadline(e.target.value)}
                                className="bg-slate-900/50 border-white/10 w-auto"
                            />
                            <div className="flex-1" />
                            <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
                            <Button size="sm" onClick={handleAdd} disabled={!newTitle}>Save Milestone</Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-3">
                {milestones.length === 0 && !isAdding && (
                    <div className="text-center py-8 text-gray-500">
                        No milestones set yet. Define key achievements for your mentorship.
                    </div>
                )}

                {milestones.map((milestone) => (
                    <div
                        key={milestone._id}
                        className={cn(
                            "flex items-start gap-4 p-4 rounded-xl border transition-all",
                            milestone.status === 'completed'
                                ? "bg-emerald-500/5 border-emerald-500/20"
                                : "bg-slate-800/30 border-white/5"
                        )}
                    >
                        <button
                            onClick={() => handleStatusChange(milestone._id, milestone.status === 'completed' ? 'pending' : 'completed')}
                            className={cn(
                                "mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                milestone.status === 'completed'
                                    ? "bg-emerald-500 border-emerald-500 text-slate-900"
                                    : "border-gray-500 text-transparent hover:border-emerald-400"
                            )}
                            disabled={readOnly}
                        >
                            <CheckCircle2 className="h-4 w-4" />
                        </button>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <h4 className={cn(
                                    "font-medium truncate",
                                    milestone.status === 'completed' ? "text-gray-400 line-through" : "text-gray-200"
                                )}>
                                    {milestone.title}
                                </h4>
                                {milestone.deadline && (
                                    <span className={cn(
                                        "text-xs flex items-center gap-1",
                                        new Date(milestone.deadline) < new Date() && milestone.status !== 'completed'
                                            ? "text-red-400"
                                            : "text-gray-500"
                                    )}>
                                        <Calendar className="h-3 w-3" />
                                        {format(new Date(milestone.deadline), 'MMM d')}
                                    </span>
                                )}
                            </div>
                            {milestone.description && (
                                <p className="text-sm text-gray-400 mb-2">{milestone.description}</p>
                            )}
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "text-xs px-2 py-0.5 rounded-full font-medium",
                                    milestone.status === 'completed' ? "bg-emerald-500/20 text-emerald-400" :
                                        milestone.status === 'in_progress' ? "bg-indigo-500/20 text-indigo-400" :
                                            "bg-slate-700 text-gray-400"
                                )}>
                                    {milestone.status.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MilestoneTracker;
