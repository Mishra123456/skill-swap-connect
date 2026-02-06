import React, { useState } from 'react';
import { Calendar, CheckSquare, ChevronRight, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface WeeklyPlanItem {
    _id: string;
    weekNumber: number;
    goals: string[];
    outcomes?: string;
    status: 'planned' | 'active' | 'completed';
}

interface WeeklyPlanProps {
    matchId: string;
    plans: WeeklyPlanItem[];
    onUpdate: () => void;
    readOnly?: boolean;
}

const WeeklyPlan: React.FC<WeeklyPlanProps> = ({ matchId, plans, onUpdate, readOnly }) => {
    const { toast } = useToast();
    const [editingWeek, setEditingWeek] = useState<number | null>(null);
    const [goals, setGoals] = useState('');
    const [outcomes, setOutcomes] = useState('');

    const handleSave = async (week: number) => {
        try {
            await api.sessions.updatePlan(matchId, {
                weekNumber: week,
                goals: goals.split('\n').filter(g => g.trim()),
                outcomes,
                status: 'planned'
            });
            setEditingWeek(null);
            onUpdate();
            toast({ title: 'Plan updated' });
        } catch (error) {
            toast({ title: 'Failed to update plan', variant: 'destructive' });
        }
    };

    const sortedPlans = [...plans].sort((a, b) => a.weekNumber - b.weekNumber);
    const nextWeek = (sortedPlans[sortedPlans.length - 1]?.weekNumber || 0) + 1;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-200">Weekly Implementation Plan</h3>
                {!readOnly && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            setEditingWeek(nextWeek);
                            setGoals('');
                            setOutcomes('');
                        }}
                        disabled={editingWeek !== null}
                    >
                        Plan Week {nextWeek}
                    </Button>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {editingWeek !== null && (
                    <Card className="bg-slate-800/50 border-indigo-500/30">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-indigo-400">Planning Week {editingWeek}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">Goals (one per line)</label>
                                <Textarea
                                    value={goals}
                                    onChange={(e) => setGoals(e.target.value)}
                                    className="bg-slate-900/50 border-white/10 min-h-[100px]"
                                    placeholder="- Build Component X&#10;- Setup Database"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">Expected Outcome</label>
                                <Input
                                    value={outcomes}
                                    onChange={(e) => setOutcomes(e.target.value)}
                                    className="bg-slate-900/50 border-white/10"
                                    placeholder="e.g. Working prototype"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" onClick={() => setEditingWeek(null)}>Cancel</Button>
                                <Button size="sm" onClick={() => handleSave(editingWeek)}>Save Plan</Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {sortedPlans.map((plan) => (
                    <Card key={plan._id} className={cn(
                        "bg-slate-800/30 border-white/5 hover:border-white/10 transition-colors",
                        plan.status === 'active' && "border-indigo-500/50 bg-indigo-500/5"
                    )}>
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-gray-200 text-base">Week {plan.weekNumber}</CardTitle>
                            <span className={cn(
                                "text-xs px-2 py-0.5 rounded-full font-medium capitalize",
                                plan.status === 'completed' ? "bg-emerald-500/20 text-emerald-400" :
                                    plan.status === 'active' ? "bg-indigo-500/20 text-indigo-400" :
                                        "bg-slate-700 text-gray-400"
                            )}>
                                {plan.status}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div>
                                    <h5 className="text-sm font-medium text-gray-400 flex items-center gap-2 mb-1.5">
                                        <Target className="h-3 w-3" /> Goals
                                    </h5>
                                    <ul className="space-y-1">
                                        {plan.goals.map((goal, i) => (
                                            <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                                <span className="w-1 h-1 rounded-full bg-gray-500 mt-2" />
                                                {goal}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                {plan.outcomes && (
                                    <div className="pt-2 border-t border-white/5">
                                        <h5 className="text-sm font-medium text-gray-400 mb-1">Outcome</h5>
                                        <p className="text-sm text-gray-300">{plan.outcomes}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default WeeklyPlan;
