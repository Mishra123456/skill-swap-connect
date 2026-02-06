import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface SessionCompletionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (feedback: { helpful: boolean; whatWentWell: string; issues: string }) => Promise<void>;
}

const SessionCompletionModal: React.FC<SessionCompletionModalProps> = ({ isOpen, onClose, onComplete }) => {
    const [step, setStep] = useState(1);
    const [feedback, setFeedback] = useState({
        helpful: true,
        whatWentWell: '',
        issues: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onComplete(feedback);
            toast.success('Session completed successfully!');
            onClose();
        } catch (error) {
            toast.error('Failed to complete session');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl">Complete Session</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Great job! Please provide some feedback to close this session.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    <div className="space-y-3">
                        <Label className="text-base font-medium">Was this session helpful?</Label>
                        <RadioGroup
                            value={feedback.helpful ? 'yes' : 'no'}
                            onValueChange={(val) => setFeedback({ ...feedback, helpful: val === 'yes' })}
                            className="flex gap-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="yes" className="border-emerald-400 text-emerald-400" />
                                <Label htmlFor="yes" className="text-gray-300">Yes, it was great</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="no" className="border-red-400 text-red-400" />
                                <Label htmlFor="no" className="text-gray-300">No, not really</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="space-y-2">
                        <Label>What went well?</Label>
                        <Textarea
                            placeholder="Shared good resources, explained clearly..."
                            value={feedback.whatWentWell}
                            onChange={(e) => setFeedback({ ...feedback, whatWentWell: e.target.value })}
                            className="bg-slate-800/50 border-white/10 min-h-[80px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Any issues or challenges?</Label>
                        <Textarea
                            placeholder="Connection issues, topic too advanced..."
                            value={feedback.issues}
                            onChange={(e) => setFeedback({ ...feedback, issues: e.target.value })}
                            className="bg-slate-800/50 border-white/10 min-h-[80px]"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                    >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                        Complete Session
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default SessionCompletionModal;
