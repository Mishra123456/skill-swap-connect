import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    ArrowRight,
    ArrowLeft,
    Check,
    User,
    MapPin,
    Sparkles,
    Target,
    Shield,
    Rocket
} from 'lucide-react';
import Layout from '@/components/layout/Layout';

const Onboarding = () => {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        bio: user?.bio || '',
        location: user?.location || '',
        skillsOffered: user?.skillsOffered || [],
        skillsWanted: user?.skillsWanted || [],
    });

    const [newSkillOffered, setNewSkillOffered] = useState('');
    const [newSkillWanted, setNewSkillWanted] = useState('');

    const totalSteps = 4;

    const handleNext = async () => {
        if (step === totalSteps) {
            handleComplete();
        } else {
            if (step === 1 && (!formData.bio || !formData.location)) {
                toast({ title: 'Please fill in all fields', variant: 'destructive' });
                return;
            }
            if (step === 2 && formData.skillsOffered.length === 0) {
                toast({ title: 'Please add at least one skill you can teach', variant: 'destructive' });
                return;
            }
            if (step === 3 && formData.skillsWanted.length === 0) {
                toast({ title: 'Please add at least one skill you want to learn', variant: 'destructive' });
                return;
            }
            setStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setStep(prev => Math.max(1, prev - 1));
    };

    const handleComplete = async () => {
        setIsLoading(true);
        try {
            // Update profile
            await api.users.updateProfile({
                bio: formData.bio,
                location: formData.location
            });

            // Update skills (assuming APIs add one by one, but for onboarding we might need a bulk update or just loop)
            // Since existing API is add/remove, we'll just ensure they are saved. 
            // For this implementation, we'll assume the profile update endpoint handles basic fields
            // and we loop for skills if they are new. 
            // Note: A better backend implementation would have a bulk update endpoint.
            // For now, we will just proceed with the profile update and assume skills are handled or we'd ideally
            // call the addSkill endpoints here.

            // Let's loop for new skills just in case (optimization: diff with existing user skills)
            const currentOffered = new Set(user?.skillsOffered || []);
            for (const skill of formData.skillsOffered) {
                if (!currentOffered.has(skill)) {
                    await api.users.addSkillOffered(skill);
                }
            }

            const currentWanted = new Set(user?.skillsWanted || []);
            for (const skill of formData.skillsWanted) {
                if (!currentWanted.has(skill)) {
                    await api.users.addSkillWanted(skill);
                }
            }

            await refreshUser();
            toast({
                title: 'Welcome aboard!',
                description: 'Your profile has been set up successfully.',
            });
            navigate('/dashboard');
        } catch (error) {
            toast({
                title: 'Setup failed',
                description: error instanceof Error ? error.message : 'Please try again',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const addOfferedSkill = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newSkillOffered.trim()) {
            e.preventDefault();
            if (!formData.skillsOffered.includes(newSkillOffered.trim())) {
                setFormData(prev => ({
                    ...prev,
                    skillsOffered: [...prev.skillsOffered, newSkillOffered.trim()]
                }));
            }
            setNewSkillOffered('');
        }
    };

    const addWantedSkill = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newSkillWanted.trim()) {
            e.preventDefault();
            if (!formData.skillsWanted.includes(newSkillWanted.trim())) {
                setFormData(prev => ({
                    ...prev,
                    skillsWanted: [...prev.skillsWanted, newSkillWanted.trim()]
                }));
            }
            setNewSkillWanted('');
        }
    };

    const removeOfferedSkill = (skill: string) => {
        setFormData(prev => ({
            ...prev,
            skillsOffered: prev.skillsOffered.filter(s => s !== skill)
        }));
    };

    const removeWantedSkill = (skill: string) => {
        setFormData(prev => ({
            ...prev,
            skillsWanted: prev.skillsWanted.filter(s => s !== skill)
        }));
    };

    const steps = [
        { title: 'About You', icon: User, description: 'Let\'s start with the basics' },
        { title: 'Skills to Teach', icon: Sparkles, description: 'What can you share?' },
        { title: 'Skills to Learn', icon: Target, description: 'What are your goals?' },
        { title: 'Community', icon: Shield, description: 'Our values' },
    ];

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-neutral-950 flex items-center justify-center p-4">
                {/* Animated background elements */}
                <div className="absolute top-20 left-20 w-72 h-72 blur-circle blur-circle-primary opacity-20 pointer-events-none" />
                <div className="absolute bottom-20 right-20 w-96 h-96 blur-circle blur-circle-accent opacity-20 pointer-events-none" />

                <div className="w-full max-w-2xl relative">
                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex justify-between mb-2">
                            {steps.map((s, i) => (
                                <div
                                    key={i}
                                    className={`flex flex-col items-center gap-2 w-1/4 ${i + 1 <= step ? 'opacity-100' : 'opacity-40'
                                        }`}
                                >
                                    <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500
                    ${i + 1 === step ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/50 scale-110' :
                                            i + 1 < step ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-gray-400'}
                  `}>
                                        {i + 1 < step ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                                    </div>
                                    <span className="text-xs font-medium text-gray-400 hidden sm:block">{s.title}</span>
                                </div>
                            ))}
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500"
                                initial={{ width: '0%' }}
                                animate={{ width: `${(step / totalSteps) * 100}%` }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                            />
                        </div>
                    </div>

                    {/* Card */}
                    <motion.div
                        className="glass rounded-3xl border border-white/10 p-8 shadow-2xl relative overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center mb-8">
                                        <h2 className="text-3xl font-bold text-gray-100 mb-2">Tell us about yourself</h2>
                                        <p className="text-gray-400">Help the community get to know you better</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Bio</Label>
                                            <Textarea
                                                placeholder="I am a software engineer who loves photography..."
                                                value={formData.bio}
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                className="bg-slate-800/50 border-slate-700 min-h-[120px] text-gray-200"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Location</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                                <Input
                                                    placeholder="San Francisco, CA"
                                                    value={formData.location}
                                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                    className="pl-10 bg-slate-800/50 border-slate-700 text-gray-200"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center mb-8">
                                        <h2 className="text-3xl font-bold text-gray-100 mb-2">Share your expertise</h2>
                                        <p className="text-gray-400">What skills can you teach others?</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Type a skill and press Enter (e.g. Guitar, Python)"
                                                value={newSkillOffered}
                                                onChange={(e) => setNewSkillOffered(e.target.value)}
                                                onKeyDown={addOfferedSkill}
                                                className="bg-slate-800/50 border-slate-700 text-gray-200"
                                            />
                                            <Button onClick={() => addOfferedSkill({ key: 'Enter', preventDefault: () => { } } as any)} className="bg-emerald-500 hover:bg-emerald-600">
                                                Add
                                            </Button>
                                        </div>

                                        <div className="flex flex-wrap gap-2 min-h-[100px] p-4 bg-slate-800/30 rounded-xl border border-white/5">
                                            {formData.skillsOffered.length === 0 && (
                                                <p className="text-gray-500 text-sm italic w-full text-center py-8">
                                                    No skills added yet. Add at least one!
                                                </p>
                                            )}
                                            {formData.skillsOffered.map((skill, idx) => (
                                                <motion.div
                                                    key={skill}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                                >
                                                    <span>{skill}</span>
                                                    <button onClick={() => removeOfferedSkill(skill)} className="hover:text-white">
                                                        <ArrowRight className="h-3 w-3 rotate-45" />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center mb-8">
                                        <h2 className="text-3xl font-bold text-gray-100 mb-2">What's your goal?</h2>
                                        <p className="text-gray-400">What skills are you looking to learn?</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Type a skill and press Enter (e.g. Spanish, Cooking)"
                                                value={newSkillWanted}
                                                onChange={(e) => setNewSkillWanted(e.target.value)}
                                                onKeyDown={addWantedSkill}
                                                className="bg-slate-800/50 border-slate-700 text-gray-200"
                                            />
                                            <Button onClick={() => addWantedSkill({ key: 'Enter', preventDefault: () => { } } as any)} className="bg-violet-500 hover:bg-violet-600">
                                                Add
                                            </Button>
                                        </div>

                                        <div className="flex flex-wrap gap-2 min-h-[100px] p-4 bg-slate-800/30 rounded-xl border border-white/5">
                                            {formData.skillsWanted.length === 0 && (
                                                <p className="text-gray-500 text-sm italic w-full text-center py-8">
                                                    No skills added yet. Add at least one!
                                                </p>
                                            )}
                                            {formData.skillsWanted.map((skill, idx) => (
                                                <motion.div
                                                    key={skill}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30"
                                                >
                                                    <span>{skill}</span>
                                                    <button onClick={() => removeWantedSkill(skill)} className="hover:text-white">
                                                        <ArrowRight className="h-3 w-3 rotate-45" />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center mb-8">
                                        <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Shield className="h-10 w-10 text-indigo-400" />
                                        </div>
                                        <h2 className="text-3xl font-bold text-gray-100 mb-2">Community Pledge</h2>
                                        <p className="text-gray-400">Join a community built on trust and respect</p>
                                    </div>

                                    <div className="bg-slate-800/50 rounded-xl p-6 border border-white/5 space-y-4">
                                        <div className="flex gap-4">
                                            <div className="mt-1"><Check className="h-5 w-5 text-emerald-400" /></div>
                                            <div>
                                                <h4 className="font-medium text-gray-200">Respect Everyone</h4>
                                                <p className="text-sm text-gray-400">Treat all members with kindness and patience.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="mt-1"><Check className="h-5 w-5 text-emerald-400" /></div>
                                            <div>
                                                <h4 className="font-medium text-gray-200">Give Your Best</h4>
                                                <p className="text-sm text-gray-400">Put effort into teaching and learning from others.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="mt-1"><Check className="h-5 w-5 text-emerald-400" /></div>
                                            <div>
                                                <h4 className="font-medium text-gray-200">Keep It Safe</h4>
                                                <p className="text-sm text-gray-400">Report any inappropriate behavior and keep conversations friendly.</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
                            <Button
                                variant="ghost"
                                onClick={handleBack}
                                disabled={step === 1 || isLoading}
                                className="text-gray-400 hover:text-white hover:bg-white/10"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <Button
                                onClick={handleNext}
                                disabled={isLoading}
                                className="bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-lg shadow-indigo-500/25 px-8"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : step === totalSteps ? (
                                    <>
                                        Get Started <Rocket className="h-4 w-4 ml-2" />
                                    </>
                                ) : (
                                    <>
                                        Next Step <ArrowRight className="h-4 w-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </Layout>
    );
};

export default Onboarding;
