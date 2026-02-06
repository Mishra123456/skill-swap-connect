import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { api, Match } from '@/lib/api';
import { motion } from 'framer-motion';
import {
    Trophy,
    Calendar,
    Star,
    Zap,
    Users,
    Map,
    Flag,
    Rocket,
    Medal
} from 'lucide-react';
import { CardSkeleton } from '@/components/ui/skeleton';

interface Milestone {
    id: string;
    date: Date;
    title: string;
    description: string;
    icon: any;
    color: string;
}

const Journey = () => {
    const { user } = useAuth();
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            // Get all matches (sent and received)
            const [sentRes, receivedRes] = await Promise.all([
                api.matches.getMyRequests(undefined, 'sent'),
                api.matches.getMyRequests(undefined, 'received')
            ]);

            let allMatches: Match[] = [];
            if (sentRes.success && sentRes.data) allMatches = [...allMatches, ...sentRes.data.matches];
            if (receivedRes.success && receivedRes.data) allMatches = [...allMatches, ...receivedRes.data.matches];

            // Sort by date (oldest first)
            allMatches.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            setMatches(allMatches);
        } catch (error) {
            console.error('Failed to load journey:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !user) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <CardSkeleton />
                    <CardSkeleton />
                </div>
            </DashboardLayout>
        );
    }

    // Calculate Milestones
    const milestones: Milestone[] = [];

    // 1. Join Date
    milestones.push({
        id: 'joined',
        date: new Date(user.createdAt),
        title: 'Joined SkillSwap',
        description: 'You started your journey to share and learn.',
        icon: Rocket,
        color: 'indigo'
    });

    // 2. First Match
    const firstMatch = matches.find(m => m.status === 'accepted' || m.status === 'completed');
    if (firstMatch) {
        milestones.push({
            id: 'first-match',
            date: new Date(firstMatch.updatedAt), // using update time as acceptance time approx
            title: 'First Connection',
            description: `You connected with ${firstMatch.requester._id === user._id ? firstMatch.provider.name : firstMatch.requester.name} for a skill swap!`,
            icon: Users,
            color: 'emerald'
        });
    }

    // 3. First Completion
    const firstCompletion = matches.find(m => m.status === 'completed');
    if (firstCompletion) {
        milestones.push({
            id: 'first-complete',
            date: new Date(firstCompletion.completedAt || firstCompletion.updatedAt),
            title: 'First Exchange Completed',
            description: 'You successfully completed your first skill exchange.',
            icon: Trophy,
            color: 'amber'
        });
    }

    // 4. Rating Milestones
    if (user.averageRating >= 4.5 && user.totalRatings >= 5) {
        milestones.push({
            id: 'top-rated',
            date: new Date(), // Just show at end
            title: 'Top Rated Member',
            description: 'You have maintained a stellar 4.5+ rating!',
            icon: Star,
            color: 'orange'
        });
    }

    // Sort milestones by date (newest first for timeline)
    milestones.sort((a, b) => b.date.getTime() - a.date.getTime());

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 text-center max-w-2xl mx-auto"
            >
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 mb-4 ring-1 ring-white/20">
                    <Map className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-gray-100 mb-3">
                    Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Journey</span>
                </h1>
                <p className="text-gray-400 text-lg mb-8">
                    A timeline of your growth, connections, and achievements on SkillSwap.
                </p>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                    <div className="glass p-4 rounded-2xl border border-white/10">
                        <div className="text-2xl font-bold text-white mb-1">{user.stats?.sessionsCompleted || 0}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Sessions</div>
                    </div>
                    <div className="glass p-4 rounded-2xl border border-white/10">
                        <div className="text-2xl font-bold text-white mb-1">
                            {Math.floor(((user.stats?.totalMinutesLearned || 0) + (user.stats?.totalMinutesTaught || 0)) / 60)}h
                        </div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Hours</div>
                    </div>
                    <div className="glass p-4 rounded-2xl border border-white/10">
                        <div className="text-2xl font-bold text-white mb-1">{user.skillsOffered.length}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Skills Shared</div>
                    </div>
                    <div className="glass p-4 rounded-2xl border border-white/10">
                        <div className="text-2xl font-bold text-white mb-1">{user.skillsWanted.length}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Skills Learning</div>
                    </div>
                </div>
            </motion.div>

            <div className="max-w-3xl mx-auto relative px-4">
                {/* Vertical Line */}
                <div className="absolute left-8 lg:left-1/2 top-4 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 via-purple-500/30 to-transparent" />

                <div className="space-y-12">
                    {milestones.map((milestone, index) => {
                        const Icon = milestone.icon;
                        const isEven = index % 2 === 0;

                        return (
                            <motion.div
                                key={milestone.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative flex items-center lg:justify-between ${isEven ? 'flex-row' : 'flex-row-reverse'} gap-8 group`}
                            >
                                {/* Date Marker (Desktop) */}
                                <div className={`hidden lg:block w-5/12 text-sm text-gray-500 font-medium tracking-wider ${isEven ? 'text-right' : 'text-left'}`}>
                                    {milestone.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </div>

                                {/* Center Icon */}
                                <div className="absolute left-8 lg:left-1/2 -translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 border-4 border-slate-950 z-10 shadow-xl group-hover:scale-110 transition-transform duration-300">
                                    <div className={`w-full h-full rounded-full bg-gradient-to-br from-${milestone.color}-400 to-${milestone.color}-600 flex items-center justify-center ring-2 ring-${milestone.color}-500/30`}>
                                        <Icon className="h-4 w-4 text-white" />
                                    </div>
                                </div>

                                {/* Content Card */}
                                <div className="ml-16 lg:ml-0 w-full lg:w-5/12">
                                    <div className="glass p-6 rounded-2xl border border-white/10 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 group-hover:-translate-y-1">
                                        <div className="lg:hidden text-xs text-indigo-400 font-semibold mb-2">
                                            {milestone.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <h3 className={`text-lg font-bold text-gray-100 flex items-center gap-2 mb-2`}>
                                            {milestone.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            {milestone.description}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Future Teaser */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-20 text-center pb-12"
                >
                    <div className="inline-flex flex-col items-center">
                        <div className="w-px h-16 bg-gradient-to-b from-transparent to-indigo-500/50 mb-4" />
                        <div className="p-4 rounded-2xl glass border border-dashed border-white/20 text-gray-500 text-sm">
                            <p>Your journey is just beginning...</p>
                            <p className="mt-1 text-xs">Keep swapping skills to unlock more milestones!</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </DashboardLayout>
    );
};

export default Journey;
