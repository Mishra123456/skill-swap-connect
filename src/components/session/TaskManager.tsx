import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Circle, Plus, Trash2, X } from 'lucide-react';

interface Task {
    _id: string;
    title: string;
    status: 'pending' | 'completed';
    createdBy: { _id: string; name: string } | string;
    createdAt: string;
}

interface TaskManagerProps {
    tasks: Task[];
    onAdd: (title: string) => Promise<void>;
    onToggle: (taskId: string, status: 'pending' | 'completed') => Promise<void>;
    readOnly?: boolean;
}

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, onAdd, onToggle, readOnly = false }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newTask, setNewTask] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        setIsSubmitting(true);
        try {
            await onAdd(newTask);
            setNewTask('');
            setIsAdding(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/50">
                <h3 className="font-semibold text-gray-200">Session Tasks</h3>
                {!readOnly && !isAdding && (
                    <Button
                        size="sm"
                        onClick={() => setIsAdding(true)}
                        className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20"
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Task
                    </Button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {isAdding && (
                    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                        <Input
                            placeholder="New task..."
                            value={newTask}
                            onChange={e => setNewTask(e.target.value)}
                            className="bg-slate-900/50 border-slate-700"
                            autoFocus
                        />
                        <Button type="submit" disabled={isSubmitting} size="icon" className="bg-indigo-500 hover:bg-indigo-600 shrink-0">
                            <Plus className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" onClick={() => setIsAdding(false)} className="shrink-0">
                            <X className="h-4 w-4" />
                        </Button>
                    </form>
                )}

                {tasks.length === 0 && !isAdding ? (
                    <div className="text-center py-10 text-gray-500">
                        <CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        <p>No tasks created yet</p>
                    </div>
                ) : (
                    tasks.map(task => (
                        <div
                            key={task._id}
                            className={`group flex items-center gap-3 p-3 rounded-xl border transition-all ${task.status === 'completed'
                                    ? 'bg-emerald-500/5 border-emerald-500/20'
                                    : 'bg-slate-800/30 border-white/5 hover:border-white/10'
                                }`}
                        >
                            <button
                                onClick={() => !readOnly && onToggle(task._id, task.status === 'completed' ? 'pending' : 'completed')}
                                disabled={readOnly}
                                className={`shrink-0 rounded-full transition-colors ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                            >
                                {task.status === 'completed' ? (
                                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                                ) : (
                                    <Circle className="h-6 w-6 text-gray-500 group-hover:text-indigo-400" />
                                )}
                            </button>

                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium transition-all ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-200'
                                    }`}>
                                    {task.title}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TaskManager;
