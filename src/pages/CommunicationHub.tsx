import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { TrustBadge } from '@/components/ui/TrustScore';
import { api, Match } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    MessageSquare,
    Mic,
    Image,
    Search,
    ChevronRight,
    Circle,
    Clock,
    CheckCheck,
    Phone,
    Video,
    X,
    Filter,
    MoreVertical,
    Sparkles
} from 'lucide-react';

type TabType = 'chats' | 'voice' | 'media';

interface Conversation {
    matchId: string;
    otherUser: {
        _id: string;
        name: string;
        avatar?: string;
        averageRating?: number;
        totalRatings?: number;
    };
    lastMessage?: string;
    lastMessageTime?: string;
    unreadCount?: number;
    status: string;
    hasVoiceHistory?: boolean;
    sharedMediaCount?: number;
}

const CommunicationHub = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<TabType>('chats');
    const [searchQuery, setSearchQuery] = useState('');
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        try {
            const response = await api.matches.getMyRequests();
            if (response.success && response.data) {
                const acceptedMatches = response.data.matches.filter(
                    (m: Match) => m.status === 'accepted' || m.status === 'completed'
                );

                const convos: Conversation[] = acceptedMatches.map((match: Match) => {
                    const otherUser = match.requester._id === user?._id ? match.provider : match.requester;
                    return {
                        matchId: match._id,
                        otherUser: {
                            _id: otherUser._id,
                            name: otherUser.name,
                            avatar: (otherUser as any).avatar,
                            averageRating: otherUser.averageRating,
                            totalRatings: otherUser.totalRatings
                        },
                        lastMessage: 'Start chatting!',
                        lastMessageTime: match.updatedAt,
                        unreadCount: 0,
                        status: match.status,
                        hasVoiceHistory: false,
                        sharedMediaCount: 0
                    };
                });

                setConversations(convos);
            }
        } catch (error) {
            console.error('Failed to load conversations:', error);
            toast({
                title: 'Failed to load conversations',
                description: 'Please try again later',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const filteredConversations = conversations.filter(conv =>
        conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const tabs = [
        { id: 'chats' as const, label: 'Chats', icon: MessageSquare, count: conversations.length },
        { id: 'voice' as const, label: 'Voice', icon: Mic, count: conversations.filter(c => c.hasVoiceHistory).length },
        { id: 'media' as const, label: 'Media', icon: Image, count: conversations.reduce((acc, c) => acc + (c.sharedMediaCount || 0), 0) }
    ];

    const formatTime = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return date.toLocaleDateString([], { weekday: 'short' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    const ConversationCard = ({ conv, index }: { conv: Conversation; index: number }) => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Link to={`/chat/${conv.matchId}`}>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 border border-white/5 hover:border-white/10 transition-all group cursor-pointer">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg">
                            {conv.otherUser.avatar ? (
                                <img src={conv.otherUser.avatar} alt={conv.otherUser.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                conv.otherUser.name.charAt(0).toUpperCase()
                            )}
                        </div>
                        {/* Online indicator */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-100 truncate">{conv.otherUser.name}</h3>
                                {conv.otherUser.averageRating && conv.otherUser.averageRating >= 4.5 && (
                                    <TrustBadge score={Math.round(conv.otherUser.averageRating * 20)} size="sm" />
                                )}
                            </div>
                            <span className="text-xs text-gray-500">{formatTime(conv.lastMessageTime)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-400 truncate flex items-center gap-1">
                                <CheckCheck className="h-3 w-3 text-indigo-400" />
                                {conv.lastMessage}
                            </p>
                            {conv.unreadCount && conv.unreadCount > 0 && (
                                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-indigo-500 text-white text-xs font-bold flex items-center justify-center">
                                    {conv.unreadCount}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-indigo-400 transition-colors" />
                </div>
            </Link>
        </motion.div>
    );

    const VoiceSessionCard = ({ conv, index }: { conv: Conversation; index: number }) => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 border border-white/5">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {conv.otherUser.name.charAt(0).toUpperCase()}
                </div>

                {/* Content */}
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-100">{conv.otherUser.name}</h3>
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        No voice sessions yet
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Link to={`/chat/${conv.matchId}`}>
                        <Button size="sm" variant="outline" className="border-violet-500/30 text-violet-400 hover:bg-violet-500/20">
                            <Phone className="h-4 w-4 mr-1" />
                            Call
                        </Button>
                    </Link>
                </div>
            </div>
        </motion.div>
    );

    const MediaGrid = () => (
        <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <Image className="h-8 w-8 text-cyan-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-200 mb-2">No shared media yet</h3>
            <p className="text-gray-400 text-sm">Photos and videos shared in your chats will appear here</p>
        </div>
    );

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/25">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-indigo-400">Communication Hub</span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-100 mb-2">
                    Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Conversations</span>
                </h1>
                <p className="text-gray-400">
                    Messages, voice calls, and shared media in one place
                </p>
            </motion.div>

            {/* Tabs */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap",
                            activeTab === tab.id
                                ? "bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-indigo-400 border border-indigo-500/30"
                                : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                        )}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                        {tab.count > 0 && (
                            <span className={cn(
                                "min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold flex items-center justify-center",
                                activeTab === tab.id ? "bg-indigo-500 text-white" : "bg-slate-700 text-gray-400"
                            )}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 bg-slate-800/50 border-white/10 text-gray-100 placeholder:text-gray-500"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <CardSkeleton key={i} />
                        ))}
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <EmptyState
                        variant="messages"
                        title="No conversations yet"
                        description="Accept a skill exchange request to start chatting"
                        action={{ label: 'Browse Matches', onClick: () => window.location.href = '/browse' }}
                    />
                ) : (
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-3"
                    >
                        {activeTab === 'chats' && filteredConversations.map((conv, index) => (
                            <ConversationCard key={conv.matchId} conv={conv} index={index} />
                        ))}
                        {activeTab === 'voice' && filteredConversations.map((conv, index) => (
                            <VoiceSessionCard key={conv.matchId} conv={conv} index={index} />
                        ))}
                        {activeTab === 'media' && <MediaGrid />}
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
};

export default CommunicationHub;
