import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
    Shield,
    AlertTriangle,
    UserX,
    Flag,
    MessageCircleWarning,
    Lock,
    Eye,
    HelpCircle,
    ChevronRight,
    CheckCircle2,
    ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const SafetyCenter = () => {
    const safetyTips = [
        {
            icon: Lock,
            title: "Keep Personal Info Private",
            description: "Never share your phone number, email, home address, or financial information with other users."
        },
        {
            icon: Eye,
            title: "Meet Virtually First",
            description: "Start with video calls or chat before any in-person meetings. Get to know someone before meeting."
        },
        {
            icon: MessageCircleWarning,
            title: "Report Suspicious Behavior",
            description: "If someone asks for money, personal details, or makes you uncomfortable, report them immediately."
        },
        {
            icon: UserX,
            title: "Block & Mute",
            description: "You can block or mute any user at any time. Your safety comes first."
        }
    ];

    const reportReasons = [
        "Inappropriate content or language",
        "Harassment or bullying",
        "Spam or scam attempts",
        "Fake profile or impersonation",
        "Requests for personal information",
        "Other safety concerns"
    ];

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto space-y-8"
            >
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 mb-4">
                        <Shield className="h-8 w-8 text-emerald-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-100">Safety Center</h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Your safety is our top priority. Learn how to protect yourself and report any concerns.
                    </p>
                </div>

                {/* Safety Tips */}
                <div className="grid md:grid-cols-2 gap-4">
                    {safetyTips.map((tip, index) => (
                        <motion.div
                            key={tip.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="glass border-white/10 h-full card-hover">
                                <CardContent className="p-6">
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
                                            <tip.icon className="h-6 w-6 text-indigo-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-100 mb-1">{tip.title}</h3>
                                            <p className="text-sm text-gray-400">{tip.description}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* How to Report */}
                <Card className="glass border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-100">
                            <Flag className="h-5 w-5 text-red-400" />
                            How to Report a User
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                            If you encounter any issues, here's how to file a report
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-indigo-400">1</span>
                                </div>
                                <p className="text-gray-300">Go to the user's profile or chat conversation</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-indigo-400">2</span>
                                </div>
                                <p className="text-gray-300">Click the menu icon (⋮) and select "Report User"</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-indigo-400">3</span>
                                </div>
                                <p className="text-gray-300">Choose a reason and provide details about the issue</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-indigo-400">4</span>
                                </div>
                                <p className="text-gray-300">Submit and our team will review within 24 hours</p>
                            </div>
                        </div>

                        <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                            <div className="flex gap-3">
                                <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-amber-200 font-medium">Reasons to Report</p>
                                    <ul className="mt-2 space-y-1">
                                        {reportReasons.map((reason) => (
                                            <li key={reason} className="text-sm text-amber-200/80 flex items-center gap-2">
                                                <CheckCircle2 className="h-3 w-3" />
                                                {reason}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Links */}
                <div className="grid md:grid-cols-2 gap-4">
                    <Link to="/guidelines">
                        <Card className="glass border-white/10 card-hover cursor-pointer group">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                                        <HelpCircle className="h-5 w-5 text-violet-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-100">Community Guidelines</h3>
                                        <p className="text-sm text-gray-400">Read our community rules</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-indigo-400 transition-colors" />
                            </CardContent>
                        </Card>
                    </Link>

                    <Link to="/help">
                        <Card className="glass border-white/10 card-hover cursor-pointer group">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                                        <ExternalLink className="h-5 w-5 text-cyan-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-100">Help & Support</h3>
                                        <p className="text-sm text-gray-400">Get help with any issues</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-indigo-400 transition-colors" />
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* Emergency Contact */}
                <Card className="glass border-red-500/20 bg-red-500/5">
                    <CardContent className="p-6 text-center">
                        <h3 className="font-semibold text-gray-100 mb-2">Need Immediate Help?</h3>
                        <p className="text-gray-400 mb-4">
                            If you're in immediate danger, please contact your local emergency services.
                        </p>
                        <Button variant="destructive" className="bg-red-500 hover:bg-red-600">
                            Contact Support
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </DashboardLayout>
    );
};

export default SafetyCenter;
