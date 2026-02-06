import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save, Loader2, Check } from 'lucide-react';

interface SharedNotesProps {
    notes: string;
    onSave: (notes: string) => Promise<void>;
    readOnly?: boolean;
}

const SharedNotes: React.FC<SharedNotesProps> = ({ notes, onSave, readOnly = false }) => {
    const [content, setContent] = useState(notes);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(true);

    // Update local state when remote notes change (but handle conflict carefully, 
    // for simplicity here we assume overwrite if remote changes significantly 
    // or just initial load. Real-time requires websockets.)
    useEffect(() => {
        if (notes !== content && !isSaving) {
            // Simple approach: Only update if we haven't touched it properly?
            // Actually for this demo, let's just initialize.
        }
    }, [notes]); // Re-enable if we want external updates to override

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        setIsSaved(false);
    };

    const handleSave = async () => {
        if (isSaved) return;
        setIsSaving(true);
        try {
            await onSave(content);
            setIsSaved(true);
        } catch (error) {
            console.error('Failed to save notes', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Auto-save debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isSaved && !readOnly) {
                handleSave();
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [content, isSaved, readOnly]);

    return (
        <div className="h-full flex flex-col bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-white/10 bg-slate-900/50">
                <h3 className="font-semibold text-gray-200">Shared Notes</h3>
                <div className="flex items-center gap-2">
                    {isSaving ? (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Saving...
                        </span>
                    ) : isSaved ? (
                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Saved
                        </span>
                    ) : (
                        <span className="text-xs text-amber-400">Unsaved changes</span>
                    )}

                    {!readOnly && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleSave}
                            disabled={isSaved || isSaving}
                            className="h-7 px-2 text-gray-400 hover:text-white"
                        >
                            <Save className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
            <Textarea
                value={content}
                onChange={handleChange}
                disabled={readOnly}
                className="flex-1 bg-transparent border-0 resize-none focus-visible:ring-0 p-4 text-gray-300 leading-relaxed font-mono text-sm"
                placeholder="Start typing your shared notes here..."
            />
        </div>
    );
};

export default SharedNotes;
