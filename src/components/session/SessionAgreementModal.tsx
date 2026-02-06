import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Handshake, ShieldCheck, Clock, Target } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface SessionAgreementModalProps {
    isOpen: boolean;
    onClose: () => void;
    matchId: string;
    onAgreementAccepted: () => void;
    isProvider: boolean; // false = learner, true = mentor (usually)
}

const SessionAgreementModal: React.FC<SessionAgreementModalProps> = ({ isOpen, matchId, onAgreementAccepted }) => {
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [goals, setGoals] = useState('');
    const [commitment, setCommitment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAccept = async () => {
        setIsSubmitting(true);
        try {
            await api.sessions.acceptAgreement(matchId, {
                goals,
                commitment,
                guidelines: "I agree to be respectful, punctual, and focused on the learning goals."
            });
            toast({
                title: "Agreement Signed",
                description: "You have accepted the session terms.",
            });
            onAgreementAccepted();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to accept agreement. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-md bg-slate-900 border-indigo-500/20 text-gray-100">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Handshake className="h-6 w-6 text-indigo-400" />
                        Session Agreement
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Set clear expectations for a successful skill exchange.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                                <ShieldCheck className="h-5 w-5 text-indigo-400 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-indigo-300">Respect & Safety</h4>
                                    <p className="text-sm text-gray-400">Treat each other with respect. No harassment or inappropriate behavior.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                <Clock className="h-5 w-5 text-purple-400 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-purple-300">Time Commitment</h4>
                                    <p className="text-sm text-gray-400">Honor the scheduled time. Communicate delays in advance.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <div className="space-y-2">
                                <Label className="text-indigo-300 flex items-center gap-2">
                                    <Target className="h-4 w-4" />
                                    Main Goal for this Session
                                </Label>
                                <Textarea
                                    placeholder="e.g., Learn basic React hooks..."
                                    className="bg-slate-800 border-slate-700 text-gray-100 placeholder:text-gray-500"
                                    value={goals}
                                    onChange={(e) => setGoals(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-indigo-300 flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Estimated Duration
                                </Label>
                                <Textarea
                                    placeholder="e.g., 45 minutes..."
                                    className="bg-slate-800 border-slate-700 text-gray-100 placeholder:text-gray-500 h-20"
                                    value={commitment}
                                    onChange={(e) => setCommitment(e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex justify-between sm:justify-between">
                    {step === 2 ? (
                        <Button variant="ghost" onClick={() => setStep(1)} className="text-gray-400 hover:text-white">
                            Back
                        </Button>
                    ) : (
                        <div></div> // Spacer
                    )}

                    {step === 1 ? (
                        <Button onClick={() => setStep(2)} className="bg-indigo-600 hover:bg-indigo-700">
                            Next: Set Goals
                        </Button>
                    ) : (
                        <Button
                            onClick={handleAccept}
                            disabled={!goals || !commitment || isSubmitting}
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                        >
                            {isSubmitting ? 'Signing...' : 'Accept & Start Session'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default SessionAgreementModal;
