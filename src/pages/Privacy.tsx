import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageTransition from '@/components/layout/PageTransition';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Lock, FileText, Settings, Heart } from 'lucide-react';

const Privacy = () => {
    const sections = [
        {
            icon: Eye,
            title: "1. Information We Collect",
            content: "We collect information you provide directly to us when creating an account, setting up your profile, or matching with other users. This includes your name, email address, password, bio, location preferences, skills offered, and skills wanted.",
            details: ["Account registration metadata", "Learning & teaching portfolio logs", "Peer-to-peer review feedback scores"]
        },
        {
            icon: Lock,
            title: "2. How We Secure Your Data",
            content: "We implement robust security measures to safeguard your personal data. Passwords are cryptographically salted and hashed using bcrypt, and communication between your browser and our servers is secured using TLS/SSL encryption.",
            details: ["JWT-based authorization tokens", "Automated contact info sanitizers to prevent data leaks", "Protected audio/video signaling sessions"]
        },
        {
            icon: Shield,
            title: "3. Chat & Video Moderation",
            content: "To maintain community safety, chat logs are analyzed dynamically by our contact sanitizer to detect unauthorized sharing of personal emails or phone numbers. Users can flag inappropriate messages, which are reviewed by system administrators.",
            details: ["Auto-moderation of spam and contact info sharing", "Admin-level user report analysis", "P2P WebRTC connection protection"]
        },
        {
            icon: Settings,
            title: "4. User Privacy & Settings Controls",
            content: "We believe in giving you absolute control over your digital footprint. In your Settings panel, you can adjust several privacy features to configure your comfort level on the network.",
            details: ["Incognito Mode to hide search visibility", "Allow matching requests filter (Everyone, Verified, None)", "Toggle active online status indicator"]
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
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm mb-4"
                        >
                            <Shield className="h-4 w-4" />
                            <span>Privacy Center</span>
                        </motion.div>
                        <h1 className="text-4xl font-bold text-white mb-3">Privacy Policy</h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            At SkillSwap, we are committed to protecting your privacy and ensuring you have a safe environment to share knowledge.
                        </p>
                        <p className="text-xs text-gray-500 mt-2">Last Updated: July 2026</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {sections.map((section, idx) => {
                            const Icon = section.icon;
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                                >
                                    <Card className="bg-slate-800/40 border-white/5 backdrop-blur-md h-full hover:border-violet-500/30 transition-all duration-300">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <CardTitle className="text-lg text-white">{section.title}</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <p className="text-sm text-gray-400 leading-relaxed">
                                                {section.content}
                                            </p>
                                            <ul className="space-y-2">
                                                {section.details.map((detail, dIdx) => (
                                                    <li key={dIdx} className="flex items-start gap-2 text-xs text-gray-300">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                                                        <span>{detail}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Bottom disclaimer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-white/5 rounded-xl p-6 text-center"
                    >
                        <h3 className="text-lg font-semibold text-white mb-2 flex items-center justify-center gap-2">
                            <FileText className="h-5 w-5 text-indigo-400" />
                            Data Rights & Retention
                        </h3>
                        <p className="text-sm text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            You have the right to request deletion of your account and related information at any time. Session records, collaborative whiteboard files, and chat records associated with deleted accounts are scrubbed from our systems or anonymized within 30 days of closure.
                        </p>
                    </motion.div>
                </div>
            </PageTransition>
        </DashboardLayout>
    );
};

export default Privacy;
