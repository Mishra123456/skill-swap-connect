import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Save, Loader2, Lock } from 'lucide-react';
import { api } from '@/lib/api';

interface MentorToolsProps {
    matchId: string;
    initialNotes?: string;
    onUpdate?: () => void;
}

const MentorTools = ({ matchId, initialNotes = '', onUpdate }: MentorToolsProps) => {
    const [notes, setNotes] = useState(initialNotes);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setNotes(initialNotes);
    }, [initialNotes]);

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNotes(e.target.value);
        setHasChanges(true);
    };

    const handleSave = async () => {
        if (!matchId) return;
        setSaving(true);
        try {
            await api.sessions.updateMentorNotes(matchId, notes);
            setHasChanges(false);
            toast({ title: 'Private notes saved' });
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error(error);
            toast({ title: 'Failed to save notes', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="h-full space-y-6">
            <Card className="bg-slate-800/40 border-white/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium text-gray-200 flex items-center gap-2">
                        <Lock className="h-4 w-4 text-indigo-400" />
                        Private Mentor Notes
                    </CardTitle>
                    {hasChanges && (
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <Textarea
                            value={notes}
                            onChange={handleNotesChange}
                            placeholder="Write private notes about the learner's progress, topics to cover, or personal reminders. Only you can see this."
                            className="min-h-[400px] bg-slate-900/50 border-white/10 text-gray-300 resize-none focus:ring-indigo-500/50"
                        />
                        <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                            Visible only to you
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Placeholder for future tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-slate-800/40 border-white/5 opacity-70">
                    <CardHeader>
                        <CardTitle className="text-base text-gray-400">Curriculum (Coming Soon)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500"> structured lesson plans and progress tracking module.</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/40 border-white/5 opacity-70">
                    <CardHeader>
                        <CardTitle className="text-base text-gray-400">Assignment Builder (Coming Soon)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500">Create and assign specific tasks to your learner.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default MentorTools;
