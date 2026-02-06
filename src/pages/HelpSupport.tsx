import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HelpCircle,
    MessageSquare,
    Mail,
    FileQuestion,
    AlertTriangle,
    Bug,
    Lightbulb,
    Send,
    ChevronDown,
    ChevronUp,
    Search,
    Shield,
    Sparkles,
    Check,
    ExternalLink
} from 'lucide-react';

type IssueType = 'general' | 'technical' | 'account' | 'bug' | 'feature' | 'billing';

interface SupportFormData {
    issueType: IssueType;
    subject: string;
    message: string;
    email: string;
}

interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category: string;
}

const HelpSupport = () => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState<SupportFormData>({
        issueType: 'general',
        subject: '',
        message: '',
        email: '',
    });

    const [errors, setErrors] = useState<Partial<SupportFormData>>({});

    const issueTypes = [
        { id: 'general' as const, label: 'General Question', icon: HelpCircle, color: 'text-indigo-400 bg-indigo-500/20' },
        { id: 'technical' as const, label: 'Technical Issue', icon: AlertTriangle, color: 'text-amber-400 bg-amber-500/20' },
        { id: 'account' as const, label: 'Account Problem', icon: Shield, color: 'text-violet-400 bg-violet-500/20' },
        { id: 'bug' as const, label: 'Bug Report', icon: Bug, color: 'text-red-400 bg-red-500/20' },
        { id: 'feature' as const, label: 'Feature Request', icon: Lightbulb, color: 'text-emerald-400 bg-emerald-500/20' },
        { id: 'billing' as const, label: 'Billing & Payments', icon: FileQuestion, color: 'text-cyan-400 bg-cyan-500/20' },
    ];

    const faqItems: FAQItem[] = [
        {
            id: '1',
            question: 'How do I find skill swap partners?',
            answer: 'Browse the Skills page to find users with matching interests. You can filter by skill category, location, and experience level. When you find someone interesting, send them a skill swap request explaining what you can offer in exchange.',
            category: 'Getting Started'
        },
        {
            id: '2',
            question: 'How does the matching system work?',
            answer: 'Our matching system analyzes your offered skills and wanted skills to find compatible partners. We prioritize users where both parties have something the other wants to learn, creating mutually beneficial exchanges.',
            category: 'Matching'
        },
        {
            id: '3',
            question: 'Is SkillSwap free to use?',
            answer: 'Yes! SkillSwap is completely free to use. Our mission is to democratize learning by connecting people who want to share their knowledge and skills with each other.',
            category: 'General'
        },
        {
            id: '4',
            question: 'How do I update my skills?',
            answer: 'Go to your Profile or Dashboard page. You can add new skills to your "Skills I Offer" or "Skills I Want" sections. Simply click the + button and type your skill name.',
            category: 'Profile'
        },
        {
            id: '5',
            question: 'What if someone doesn\'t respond to my request?',
            answer: 'Users have different availability and response times. If you don\'t hear back within a week, consider reaching out to other potential partners. You can also update your profile to make it more appealing.',
            category: 'Requests'
        },
        {
            id: '6',
            question: 'How do I report inappropriate behavior?',
            answer: 'If you encounter any inappropriate behavior, you can report it through the chat interface by clicking the report button. Our team reviews all reports within 24-48 hours and takes appropriate action.',
            category: 'Safety'
        },
    ];

    const validateForm = (): boolean => {
        const newErrors: Partial<SupportFormData> = {};

        if (!formData.subject.trim()) {
            newErrors.subject = 'Subject is required';
        } else if (formData.subject.length < 5) {
            newErrors.subject = 'Subject must be at least 5 characters';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        } else if (formData.message.length < 20) {
            newErrors.message = 'Please provide more details (at least 20 characters)';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast({
                title: 'Validation Error',
                description: 'Please fix the errors in the form',
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            setIsSubmitted(true);
            toast({
                title: 'Support Request Submitted!',
                description: 'We\'ll get back to you within 24-48 hours.',
            });

            // Reset form after 3 seconds
            setTimeout(() => {
                setFormData({
                    issueType: 'general',
                    subject: '',
                    message: '',
                    email: '',
                });
                setIsSubmitted(false);
            }, 3000);
        } catch (error) {
            toast({
                title: 'Submission Failed',
                description: 'Something went wrong. Please try again later.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateFormData = <K extends keyof SupportFormData>(key: K, value: SupportFormData[K]) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        if (errors[key]) {
            setErrors(prev => ({ ...prev, [key]: undefined }));
        }
    };

    const filteredFAQs = faqItems.filter(item =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/25">
                        <HelpCircle className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-indigo-400">Help Center</span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-100 mb-2">
                    How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">help you?</span>
                </h1>
                <p className="text-gray-400">
                    Find answers to common questions or reach out to our support team
                </p>
            </motion.div>



            <div className="grid lg:grid-cols-2 gap-8">
                {/* FAQ Section */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                >
                    <motion.div variants={itemVariants} className="glass rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-violet-500/20">
                                <FileQuestion className="h-5 w-5 text-violet-400" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-100">Frequently Asked Questions</h2>
                        </div>

                        {/* Search */}
                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                                type="text"
                                placeholder="Search FAQs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-slate-800/50 border-white/10 text-gray-100 focus:border-indigo-500/50"
                            />
                        </div>

                        {/* FAQ Items */}
                        <div className="space-y-3">
                            <AnimatePresence>
                                {filteredFAQs.map((faq, index) => (
                                    <motion.div
                                        key={faq.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="rounded-xl border border-white/10 overflow-hidden"
                                    >
                                        <button
                                            onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                                            className="w-full flex items-center justify-between p-4 bg-slate-800/30 hover:bg-slate-800/50 transition-colors text-left"
                                        >
                                            <span className="font-medium text-gray-200 pr-4">{faq.question}</span>
                                            <motion.div
                                                animate={{ rotate: expandedFAQ === faq.id ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                            </motion.div>
                                        </button>
                                        <AnimatePresence>
                                            {expandedFAQ === faq.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-4 bg-slate-800/20 border-t border-white/5">
                                                        <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-indigo-500/20 text-indigo-400 mb-2">
                                                            {faq.category}
                                                        </span>
                                                        <p className="text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {filteredFAQs.length === 0 && (
                                <div className="text-center py-8">
                                    <HelpCircle className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-400">No matching FAQs found</p>
                                    <p className="text-sm text-gray-500 mt-1">Try a different search term or contact support</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>

                {/* Support Form */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                >
                    <motion.div variants={itemVariants} className="glass rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-cyan-500/20">
                                <MessageSquare className="h-5 w-5 text-cyan-400" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-100">Contact Support</h2>
                        </div>

                        <AnimatePresence mode="wait">
                            {isSubmitted ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="text-center py-12"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                                        className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25"
                                    >
                                        <Check className="h-10 w-10 text-white" />
                                    </motion.div>
                                    <h3 className="text-xl font-bold text-gray-100 mb-2">Request Submitted!</h3>
                                    <p className="text-gray-400">We'll get back to you within 24-48 hours.</p>
                                </motion.div>
                            ) : (
                                <motion.form
                                    initial={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                >
                                    {/* Issue Type Grid */}
                                    <div className="space-y-2">
                                        <Label className="text-gray-300">Issue Type</Label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {issueTypes.map((type) => (
                                                <motion.button
                                                    key={type.id}
                                                    type="button"
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => updateFormData('issueType', type.id)}
                                                    className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${formData.issueType === type.id
                                                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'
                                                        : 'bg-slate-800/30 border-white/10 text-gray-400 hover:bg-slate-800/50'
                                                        }`}
                                                >
                                                    <div className={`p-2 rounded-lg ${type.color}`}>
                                                        <type.icon className="h-4 w-4" />
                                                    </div>
                                                    <span className="text-xs font-medium text-center">{type.label}</span>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-gray-300">Your Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => updateFormData('email', e.target.value)}
                                                placeholder="your@email.com"
                                                className={`pl-10 bg-slate-800/50 border-white/10 text-gray-100 focus:border-indigo-500/50 ${errors.email ? 'border-red-500/50' : ''
                                                    }`}
                                            />
                                        </div>
                                        {errors.email && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-red-400 text-sm"
                                            >
                                                {errors.email}
                                            </motion.p>
                                        )}
                                    </div>

                                    {/* Subject */}
                                    <div className="space-y-2">
                                        <Label htmlFor="subject" className="text-gray-300">Subject</Label>
                                        <Input
                                            id="subject"
                                            type="text"
                                            value={formData.subject}
                                            onChange={(e) => updateFormData('subject', e.target.value)}
                                            placeholder="Brief description of your issue"
                                            className={`bg-slate-800/50 border-white/10 text-gray-100 focus:border-indigo-500/50 ${errors.subject ? 'border-red-500/50' : ''
                                                }`}
                                        />
                                        {errors.subject && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-red-400 text-sm"
                                            >
                                                {errors.subject}
                                            </motion.p>
                                        )}
                                    </div>

                                    {/* Message */}
                                    <div className="space-y-2">
                                        <Label htmlFor="message" className="text-gray-300">Message</Label>
                                        <Textarea
                                            id="message"
                                            value={formData.message}
                                            onChange={(e) => updateFormData('message', e.target.value)}
                                            placeholder="Please describe your issue in detail. Include any relevant information that might help us assist you better..."
                                            className={`min-h-[150px] bg-slate-800/50 border-white/10 text-gray-100 focus:border-indigo-500/50 ${errors.message ? 'border-red-500/50' : ''
                                                }`}
                                        />
                                        <div className="flex justify-between text-xs">
                                            {errors.message ? (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-red-400"
                                                >
                                                    {errors.message}
                                                </motion.p>
                                            ) : (
                                                <span className="text-gray-500">&nbsp;</span>
                                            )}
                                            <span className="text-gray-500">{formData.message.length}/1000</span>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-lg shadow-indigo-500/25 h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-5 w-5 mr-2" />
                                                    Send Message
                                                </>
                                            )}
                                        </Button>
                                    </motion.div>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Contact Info Card */}
                    <motion.div
                        variants={itemVariants}
                        className="glass rounded-2xl p-6 border border-white/10"
                    >
                        <h3 className="font-semibold text-gray-100 mb-4">Other Ways to Reach Us</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30">
                                <div className="p-2 rounded-lg bg-indigo-500/20">
                                    <Mail className="h-4 w-4 text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Email</p>
                                    <p className="font-medium text-gray-200">support@skillswap.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30">
                                <div className="p-2 rounded-lg bg-emerald-500/20">
                                    <MessageSquare className="h-4 w-4 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Response Time</p>
                                    <p className="font-medium text-gray-200">Within 24-48 hours</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </DashboardLayout>
    );
};

export default HelpSupport;
