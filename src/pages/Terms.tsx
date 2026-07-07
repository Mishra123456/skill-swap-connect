import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageTransition from '@/components/layout/PageTransition';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Scale, AlertOctagon, HelpCircle, Heart } from 'lucide-react';

const Terms = () => {
    const terms = [
        {
            icon: Scale,
            title: "1. Acceptance of Terms",
            content: "By accessing or using the SkillSwap platform, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you should not utilize the system.",
            bullets: ["Applies to learners, mentors, and guests", "Usage indicates contract agreement", "Subject to updates with notice"]
        },
        {
            icon: Users,
            title: "2. Peer-to-Peer Agreements",
            content: "Matches made on the platform are educational. Users establish their own mutual learning agreements (e.g. committing '2 hours/week'). We do not intermediate or guarantee quality of tutoring services.",
            bullets: ["Agreements are voluntary commitment compacts", "Ratings reflect peer-based compliance", "No financial exchanges allowed for standard matches"]
        },
        {
            icon: AlertOctagon,
            title: "3. Prohibited Activities",
            content: "To safeguard all participants, we prohibit commercial solicitations, harassment, fake profiles, and any off-platform redirection to collect contact information such as email addresses or phone numbers.",
            bullets: ["No external transaction requests", "Zero tolerance for bullying or harassment", "Chat logging scans for data security"]
        },
        {
            icon: HelpCircle,
            title: "4. Account Disclaimers",
            content: "SkillSwap provides in-app WebRTC calls, chat translation, and task boards. We are not liable for technical drops, connection loss, or interactions that occur during matches.",
            bullets: ["Services are provided 'as is'", "Voice sessions utilize peer-to-peer WebRTC", "Availability depends on regional networks"]
        }
    ];

    return (
        <DashboardLayout>
            <PageTransition>
                <div className="container mx-auto p-6 max-w-5xl">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm mb-4"
                        >
                            <FileText className="h-4 w-4" />
                            <span>Terms & Guidelines</span>
                        </motion.div>
                        <h1 className="text-4xl font-bold text-white mb-3">Terms of Service</h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Please read our terms carefully before launching collaboration rooms, matching, or exchanging skills with the community.
                        </p>
                        <p className="text-xs text-gray-500 mt-2">Last Updated: July 2026</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {terms.map((term, idx) => {
                            const Icon = term.icon;
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                                >
                                    <Card className="bg-slate-800/40 border-white/5 backdrop-blur-md h-full hover:border-indigo-500/30 transition-all duration-300">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <CardTitle className="text-lg text-white">{term.title}</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <p className="text-sm text-gray-400 leading-relaxed">
                                                {term.content}
                                            </p>
                                            <ul className="space-y-2">
                                                {term.bullets.map((bullet, bIdx) => (
                                                    <li key={bIdx} className="flex items-start gap-2 text-xs text-gray-300">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                                        <span>{bullet}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Bottom action alert */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-white/5 rounded-xl p-6 text-center"
                    >
                        <h3 className="text-lg font-semibold text-white mb-2 flex items-center justify-center gap-2">
                            <Heart className="h-5 w-5 text-rose-400" />
                            Community & Safety
                        </h3>
                        <p className="text-sm text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            Violating our guidelines (e.g. attempting to scam, harvest contact info, or harass members) will result in immediate termination of your platform privileges. If you witness a violation, please report the user instantly via chat settings.
                        </p>
                    </motion.div>
                </div>
            </PageTransition>
        </DashboardLayout>
    );
};

export default Terms;
