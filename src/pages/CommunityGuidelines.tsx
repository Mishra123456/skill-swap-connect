import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
    Users,
    Heart,
    Shield,
    Ban,
    MessageSquare,
    Star,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CommunityGuidelines = () => {
    const guidelines = [
        {
            icon: Heart,
            title: "Be Respectful",
            description: "Treat all members with kindness, patience, and respect. Everyone is here to learn and share.",
            color: "rose"
        },
        {
            icon: Users,
            title: "Embrace Diversity",
            description: "Our community welcomes people of all backgrounds, skill levels, and learning styles.",
            color: "violet"
        },
        {
            icon: Star,
            title: "Quality Over Quantity",
            description: "Focus on meaningful skill exchanges. Give your best when teaching and be an engaged learner.",
            color: "amber"
        },
        {
            icon: MessageSquare,
            title: "Communicate Clearly",
            description: "Be clear about your availability, expectations, and feedback. Good communication leads to successful exchanges.",
            color: "cyan"
        },
        {
            icon: Shield,
            title: "Protect Privacy",
            description: "Never share or request personal contact information. Keep all communication within the platform.",
            color: "emerald"
        },
        {
            icon: CheckCircle2,
            title: "Honor Commitments",
            description: "If you agree to an exchange, follow through. If you can't, communicate early and honestly.",
            color: "indigo"
        }
    ];

    const prohibitedBehavior = [
        "Harassment, bullying, or discrimination of any kind",
        "Sharing or requesting phone numbers, emails, or social media handles",
        "Soliciting money, gifts, or services outside the platform",
        "Posting spam, advertisements, or promotional content",
        "Creating fake or misleading profiles",
        "Sharing inappropriate, offensive, or illegal content",
        "Attempting to circumvent platform safety features"
    ];

    const consequences = [
        { severity: "Warning", description: "First minor violation - formal warning issued" },
        { severity: "Temporary Suspension", description: "Repeated violations - 7-30 day account suspension" },
        { severity: "Permanent Ban", description: "Severe or repeated violations - permanent account removal" }
    ];

    const colorMap: Record<string, string> = {
        rose: "from-rose-500/20 to-pink-500/20 text-rose-400",
        violet: "from-violet-500/20 to-purple-500/20 text-violet-400",
        amber: "from-amber-500/20 to-orange-500/20 text-amber-400",
        cyan: "from-cyan-500/20 to-blue-500/20 text-cyan-400",
        emerald: "from-emerald-500/20 to-green-500/20 text-emerald-400",
        indigo: "from-indigo-500/20 to-blue-500/20 text-indigo-400"
    };

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto space-y-8"
            >
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 mb-4">
                        <Users className="h-8 w-8 text-violet-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-100">Community Guidelines</h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        These guidelines help us maintain a safe, welcoming, and productive community for everyone.
                    </p>
                </div>

                {/* Core Values */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {guidelines.map((guideline, index) => (
                        <motion.div
                            key={guideline.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="glass border-white/10 h-full card-hover">
                                <CardContent className="p-6">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[guideline.color]} flex items-center justify-center mb-4`}>
                                        <guideline.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-semibold text-gray-100 mb-2">{guideline.title}</h3>
                                    <p className="text-sm text-gray-400">{guideline.description}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Prohibited Behavior */}
                <Card className="glass border-red-500/20 bg-red-500/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-100">
                            <Ban className="h-5 w-5 text-red-400" />
                            Prohibited Behavior
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {prohibitedBehavior.map((item) => (
                                <li key={item} className="flex items-start gap-3 text-gray-300">
                                    <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Consequences */}
                <Card className="glass border-white/10">
                    <CardHeader>
                        <CardTitle className="text-gray-100">Enforcement Policy</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {consequences.map((item, index) => (
                                <div key={item.severity} className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${index === 0 ? 'bg-amber-500/20 text-amber-400' :
                                            index === 1 ? 'bg-orange-500/20 text-orange-400' :
                                                'bg-red-500/20 text-red-400'
                                        }`}>
                                        <span className="text-sm font-bold">{index + 1}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-100">{item.severity}</h4>
                                        <p className="text-sm text-gray-400">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Note */}
                <div className="text-center text-gray-400 text-sm">
                    <p>
                        By using SkillSwap, you agree to follow these guidelines.
                        For questions or concerns, visit our{' '}
                        <a href="/help" className="text-indigo-400 hover:underline">Help Center</a>.
                    </p>
                </div>
            </motion.div>
        </DashboardLayout>
    );
};

export default CommunityGuidelines;
