import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { TrustScore, TrustBadge } from '@/components/ui/TrustScore';
import { CardSkeleton, StatsSkeleton } from '@/components/ui/skeleton';
import { NoRequests } from '@/components/ui/EmptyState';
import {
  Plus,
  Edit2,
  ArrowRight,
  Star,
  Sparkles,
  TrendingUp,
  Clock,
  X,
  Users,
  MessageSquare,
  CheckCircle,
  ArrowUpRight,
  Zap,
  Target,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { api, MatchResult, Match } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  // Determine which stats to show based on activeRole
  const { user, refreshUser, activeRole } = useAuth();
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [recentRequests, setRecentRequests] = useState<Match[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [stats, setStats] = useState({
    pendingRequests: 0,
    activeExchanges: 0,
    completedExchanges: 0,
    totalConnections: 0
  });

  // State for inline skill adding
  const [showAddOffered, setShowAddOffered] = useState(false);
  const [showAddWanted, setShowAddWanted] = useState(false);
  const [newOfferedSkill, setNewOfferedSkill] = useState('');
  const [newWantedSkill, setNewWantedSkill] = useState('');

  useEffect(() => {
    loadData();
  }, [activeRole]);

  const loadData = async () => {
    try {
      setIsLoadingMatches(true);
      // Load matches based on role
      const matchResponse = await api.matches.find(activeRole);
      if (matchResponse.success && matchResponse.data) {
        setMatches(matchResponse.data.matches.slice(0, 4));
      }

      // Load requests for stats
      const requestResponse = await api.matches.getMyRequests();
      if (requestResponse.success && requestResponse.data) {
        const requests = requestResponse.data.matches;
        setRecentRequests(requests.slice(0, 5));

        setStats({
          pendingRequests: requests.filter((r: Match) => r.status === 'pending').length,
          activeExchanges: requests.filter((r: Match) => r.status === 'accepted').length,
          completedExchanges: requests.filter((r: Match) => r.status === 'completed').length,
          totalConnections: requests.length
        });
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoadingMatches(false);
      setIsLoadingRequests(false);
    }
  };

  const handleAddOfferedSkill = async () => {
    if (!newOfferedSkill.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a skill name',
        variant: 'destructive',
      });
      return;
    }

    try {
      await api.users.addSkillOffered(newOfferedSkill.trim());
      await refreshUser();
      setNewOfferedSkill('');
      setShowAddOffered(false);
      toast({
        title: 'Skill added!',
        description: `${newOfferedSkill} added to your offered skills.`
      });
    } catch (error) {
      toast({
        title: 'Failed to add skill',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const handleAddWantedSkill = async () => {
    if (!newWantedSkill.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a skill name',
        variant: 'destructive',
      });
      return;
    }

    try {
      await api.users.addSkillWanted(newWantedSkill.trim());
      await refreshUser();
      setNewWantedSkill('');
      setShowAddWanted(false);
      toast({
        title: 'Skill added!',
        description: `${newWantedSkill} added to your wanted skills.`
      });
    } catch (error) {
      toast({
        title: 'Failed to add skill',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const handleRequestSwap = async (matchUser: MatchResult['user'], skillRequested: string) => {
    if (!user || user.skillsOffered.length === 0) {
      toast({
        title: 'Cannot send request',
        description: 'You need to add skills you offer first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await api.matches.sendRequest(
        matchUser._id,
        skillRequested,
        user.skillsOffered[0],
        `Hi! I'm interested in learning ${skillRequested} from you.`
      );
      toast({
        title: 'Request Sent!',
        description: `Skill swap request sent to ${matchUser.name}.`,
      });
    } catch (error) {
      toast({
        title: 'Request failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  if (!user) return null;

  // Calculate trust score
  const trustScore = Math.min(100, Math.floor(
    (user.averageRating || 0) * 15 +
    (user.totalRatings || 0) * 5 +
    stats.completedExchanges * 10 +
    20 // Base score
  ));

  // Determine which stats to show based on activeRole

  const learnerStats = [
    {
      label: 'Pending Requests',
      value: stats.pendingRequests,
      icon: Clock,
      color: 'amber',
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      label: 'Active Exchanges',
      value: stats.activeExchanges,
      icon: Activity,
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      label: 'Completed',
      value: stats.completedExchanges,
      icon: CheckCircle,
      color: 'violet',
      gradient: 'from-violet-500 to-purple-500'
    },
    {
      label: 'Total Connections',
      value: stats.totalConnections,
      icon: Users,
      color: 'cyan',
      gradient: 'from-cyan-500 to-blue-500'
    },
  ];

  const mentorStats = [
    {
      label: 'Student Requests',
      value: recentRequests.filter(r => r.provider._id === user._id && r.status === 'pending').length,
      icon: Users,
      color: 'amber',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      label: 'Active Mentees',
      value: recentRequests.filter(r => r.provider._id === user._id && r.status === 'accepted').length,
      icon: Sparkles,
      color: 'emerald',
      gradient: 'from-emerald-500 to-green-500'
    },
    {
      label: 'Hours Taught',
      value: Math.round((user.stats?.totalMinutesTaught || 0) / 60),
      icon: Clock,
      color: 'violet',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      label: 'Rating',
      value: user.averageRating?.toFixed(1) || 'N/A',
      icon: Star,
      color: 'cyan',
      gradient: 'from-blue-500 to-cyan-500'
    },
  ];

  const statsConfig = activeRole === 'mentor' ? mentorStats : learnerStats;

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/25">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm font-medium text-indigo-400">Welcome back!</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-100 mb-2">
          Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{user.name.split(' ')[0]}</span>!
        </h1>
        <p className="text-gray-400">
          {activeRole === 'mentor'
            ? "Ready to inspire others and share your knowledge?"
            : "Ready to learn something new today?"}
        </p>
      </motion.div>

      {/* Stats Grid */}
      {isLoadingRequests ? (
        <StatsSkeleton />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {statsConfig.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="glass rounded-2xl p-4 border border-white/10 cursor-pointer group"
              onClick={() => navigate('/requests')}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-100">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skills Section */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Skills Offered */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`glass rounded-2xl p-5 border border-white/10 ${activeRole === 'mentor' ? 'md:order-1' : 'md:order-2'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-gray-100">Skills I Offer</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddOffered(true)}
                  className="text-emerald-400 hover:bg-emerald-500/10 h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {user.skillsOffered.map((skill, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="px-3 py-1.5 rounded-full text-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  >
                    {skill}
                  </motion.span>
                ))}
                {user.skillsOffered.length === 0 && !showAddOffered && (
                  <p className="text-gray-500 text-sm">No skills added yet</p>
                )}
              </div>

              <AnimatePresence>
                {showAddOffered && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 flex gap-2"
                  >
                    <Input
                      value={newOfferedSkill}
                      onChange={(e) => setNewOfferedSkill(e.target.value)}
                      placeholder="e.g., JavaScript"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddOfferedSkill()}
                      className="bg-slate-800/50 border-emerald-500/30 text-sm h-9"
                    />
                    <Button onClick={handleAddOfferedSkill} size="sm" className="bg-emerald-500 hover:bg-emerald-600 h-9">
                      Add
                    </Button>
                    <Button onClick={() => setShowAddOffered(false)} variant="ghost" size="sm" className="h-9 w-9 p-0">
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Skills Wanted */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className={`glass rounded-2xl p-5 border border-white/10 ${activeRole === 'mentor' ? 'md:order-2' : 'md:order-1'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-violet-500/20">
                    <Target className="h-4 w-4 text-violet-400" />
                  </div>
                  <h3 className="font-semibold text-gray-100">Skills I Want</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddWanted(true)}
                  className="text-violet-400 hover:bg-violet-500/10 h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {user.skillsWanted.map((skill, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="px-3 py-1.5 rounded-full text-sm bg-violet-500/10 text-violet-400 border border-violet-500/20"
                  >
                    {skill}
                  </motion.span>
                ))}
                {user.skillsWanted.length === 0 && !showAddWanted && (
                  <p className="text-gray-500 text-sm">No skills added yet</p>
                )}
              </div>

              <AnimatePresence>
                {showAddWanted && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 flex gap-2"
                  >
                    <Input
                      value={newWantedSkill}
                      onChange={(e) => setNewWantedSkill(e.target.value)}
                      placeholder="e.g., Photography"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddWantedSkill()}
                      className="bg-slate-800/50 border-violet-500/30 text-sm h-9"
                    />
                    <Button onClick={handleAddWantedSkill} size="sm" className="bg-violet-500 hover:bg-violet-600 h-9">
                      Add
                    </Button>
                    <Button onClick={() => setShowAddWanted(false)} variant="ghost" size="sm" className="h-9 w-9 p-0">
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Recommended Matches */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-5 border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/20">
                  <Zap className="h-4 w-4 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-gray-100">
                  {activeRole === 'mentor' ? 'Recommended Students' : 'Recommended Matches'}
                </h3>
              </div>
              <Link to="/browse">
                <Button variant="ghost" size="sm" className="text-indigo-400 hover:bg-indigo-500/10">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>

            {isLoadingMatches ? (
              <div className="grid md:grid-cols-2 gap-4">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : matches.length === 0 ? (
              <NoRequests onBrowse={() => navigate('/browse')} />
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {matches.map((match, index) => (
                  <motion.div
                    key={match.user._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="p-4 rounded-xl bg-slate-800/30 border border-white/5 hover:border-indigo-500/30 transition-all group"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-semibold shadow-lg">
                        {match.user.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-100 truncate">{match.user.name}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                          <span>{match.user.averageRating?.toFixed(1) || '0.0'}</span>
                          <span>·</span>
                          <span>{match.matchingSkills.length} skill match</span>
                        </div>
                      </div>
                      <TrustBadge score={Math.min(100, 50 + (match.user.totalRatings || 0) * 10)} />
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {match.matchingSkills.slice(0, 2).map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-indigo-500/10 text-indigo-400">
                          {skill}
                        </span>
                      ))}
                      {match.matchingSkills.length > 2 && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-gray-500/10 text-gray-400">
                          +{match.matchingSkills.length - 2}
                        </span>
                      )}
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleRequestSwap(match.user, match.matchingSkills[0])}
                      className="w-full bg-slate-700 hover:bg-indigo-500 text-gray-300 hover:text-white transition-all group-hover:bg-indigo-500 text-xs h-8"
                    >
                      Request Swap
                      <ArrowUpRight className="h-3 w-3 ml-1" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass rounded-2xl p-5 border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/20">
                  <MessageSquare className="h-4 w-4 text-cyan-400" />
                </div>
                <h3 className="font-semibold text-gray-100">Recent Activity</h3>
              </div>
              <Link to="/requests">
                <Button variant="ghost" size="sm" className="text-cyan-400 hover:bg-cyan-500/10">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>

            {isLoadingRequests ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 animate-pulse">
                    <div className="w-8 h-8 rounded-lg bg-slate-700" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/3 bg-slate-700 rounded" />
                      <div className="h-2 w-1/2 bg-slate-700 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentRequests.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">No recent activity</p>
            ) : (
              <div className="space-y-2">
                {recentRequests.slice(0, 4).map((request, index) => {
                  const isProvider = request.provider._id === user._id;
                  const otherUser = isProvider ? request.requester : request.provider;

                  return (
                    <motion.div
                      key={request._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => request.status === 'accepted' && navigate(`/session/${request._id}`)}
                      className={`flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-all ${request.status === 'accepted' ? 'cursor-pointer' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium ${request.status === 'pending'
                        ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                        : request.status === 'accepted'
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                          : 'bg-gradient-to-br from-violet-500 to-purple-500'
                        }`}>
                        {otherUser.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-200 truncate">
                          {isProvider ? 'Request from' : 'Request to'} <span className="font-medium">{otherUser.name}</span>
                        </p>
                        <p className="text-xs text-gray-500">{request.skillOffered} ↔ {request.skillRequested}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${request.status === 'pending'
                        ? 'bg-amber-500/20 text-amber-400'
                        : request.status === 'accepted'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-violet-500/20 text-violet-400'
                        }`}>
                        {request.status}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Trust Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6 border border-white/10"
          >
            <h3 className="font-semibold text-gray-100 mb-4 text-center">Your Trust Score</h3>
            <TrustScore
              score={trustScore}
              rating={user.averageRating || 0}
              totalRatings={user.totalRatings || 0}
              completedExchanges={stats.completedExchanges}
              size="lg"
            />
          </motion.div>

          {/* Quick Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="glass rounded-2xl p-5 border border-white/10"
          >
            <h3 className="font-semibold text-gray-100 mb-4">Quick Tips</h3>
            <div className="space-y-3">
              {[
                { text: 'Add more skills to get matched', done: user.skillsOffered.length >= 3 },
                { text: 'Complete your profile bio', done: !!user.bio },
                { text: 'Complete your first exchange', done: stats.completedExchanges > 0 },
                { text: 'Rate your swap partners', done: (user.totalRatings || 0) > 0 },
              ].map((tip, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${tip.done ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                    {tip.done && <CheckCircle className="h-3 w-3 text-white" />}
                  </div>
                  <span className={`text-sm ${tip.done ? 'text-gray-400 line-through' : 'text-gray-300'}`}>
                    {tip.text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl p-5 bg-gradient-to-br from-indigo-600 to-cyan-600 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <h3 className="font-bold text-white mb-2">
                {activeRole === 'mentor' ? 'Find New Students' : 'Find Your Next Match'}
              </h3>
              <p className="text-indigo-100 text-sm mb-4">
                {activeRole === 'mentor'
                  ? "Share your expertise with eager learners!"
                  : "Discover people who want to learn what you know!"}
              </p>
              <Button
                onClick={() => navigate(activeRole === 'mentor' ? '/requests' : '/browse')}
                className="w-full bg-white text-indigo-600 hover:bg-gray-100"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {activeRole === 'mentor' ? 'View Requests' : 'Browse Skills'}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
