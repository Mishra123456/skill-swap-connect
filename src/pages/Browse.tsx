import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TrustBadge } from '@/components/ui/TrustScore';
import { CardSkeleton } from '@/components/ui/skeleton';
import { NoSearchResults, EmptyState } from '@/components/ui/EmptyState';
import {
  Search,
  Star,
  Sparkles,
  Users,
  Send,
  Filter,
  SortAsc,
  SortDesc,
  X,
  Zap,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { api, MatchResult } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type SortOption = 'match' | 'rating' | 'reviews' | 'name';
type SortOrder = 'asc' | 'desc';

const Browse = () => {
  const { toast } = useToast();
  const { user, activeRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('match');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);

  // Get all unique skills from matches
  const allSkills = useMemo(() => {
    const skills = new Set<string>();
    matches.forEach(m => m.matchingSkills.forEach(s => skills.add(s)));
    return Array.from(skills).sort();
  }, [matches]);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setIsLoading(true);
        const response = await api.matches.find(activeRole);
        if (response.success && response.data) {
          setMatches(response.data.matches);
        }
      } catch (error) {
        console.error('Failed to load matches:', error);
        toast({
          title: 'Failed to load users',
          description: 'Please try again later',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMatches();
  }, [toast, activeRole]);

  const filteredAndSortedMatches = useMemo(() => {
    let result = [...matches];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((match) => {
        const matchesName = match.user.name.toLowerCase().includes(query);
        const matchesSkills = match.matchingSkills.some(s => s.toLowerCase().includes(query));
        return matchesName || matchesSkills;
      });
    }

    // Apply skill filter
    if (selectedSkills.length > 0) {
      result = result.filter(match =>
        match.matchingSkills.some(s => selectedSkills.includes(s))
      );
    }

    // Apply rating filter
    if (minRating > 0) {
      result = result.filter(match => (match.user.averageRating || 0) >= minRating);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'match':
          comparison = b.matchingSkills.length - a.matchingSkills.length;
          break;
        case 'rating':
          comparison = (b.user.averageRating || 0) - (a.user.averageRating || 0);
          break;
        case 'reviews':
          comparison = (b.user.totalRatings || 0) - (a.user.totalRatings || 0);
          break;
        case 'name':
          comparison = a.user.name.localeCompare(b.user.name);
          break;
      }
      return sortOrder === 'desc' ? comparison : -comparison;
    });

    return result;
  }, [searchQuery, matches, selectedSkills, minRating, sortBy, sortOrder]);

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

  const toggleSkillFilter = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const clearFilters = () => {
    setSelectedSkills([]);
    setMinRating(0);
    setSearchQuery('');
  };

  const hasActiveFilters = selectedSkills.length > 0 || minRating > 0 || searchQuery.trim();

  return (
    <DashboardLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg shadow-violet-500/25">
            <Users className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm font-medium text-violet-400">
            {activeRole === 'mentor' ? 'Find Students' : 'Discover'}
          </span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-100 mb-2">
          {activeRole === 'mentor'
            ? <span>Browse <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">Potential Students</span></span>
            : <span>Browse <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">Skills</span></span>
          }
        </h1>
        <p className="text-gray-400">
          {activeRole === 'mentor'
            ? "Find people who are eager to learn what you teach."
            : "Find people to swap skills with. Search by skill or name."}
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 space-y-4"
      >
        {/* Search Bar */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              placeholder="Search by skill or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-12 pr-4 rounded-xl bg-slate-800/50 border-slate-600 text-gray-200 placeholder:text-gray-500 focus:border-violet-500"
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

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "h-12 px-4 border-slate-600 text-gray-300",
              showFilters && "bg-violet-500/20 border-violet-500/30 text-violet-400"
            )}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 w-5 h-5 rounded-full bg-violet-500 text-white text-xs flex items-center justify-center">
                {selectedSkills.length + (minRating > 0 ? 1 : 0)}
              </span>
            )}
          </Button>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass rounded-2xl p-5 border border-white/10 overflow-hidden"
            >
              <div className="flex flex-wrap gap-6">
                {/* Sort Options */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 font-medium">Sort by</label>
                  <div className="flex gap-2">
                    {(['match', 'rating', 'reviews', 'name'] as SortOption[]).map(option => (
                      <button
                        key={option}
                        onClick={() => {
                          if (sortBy === option) {
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortBy(option);
                            setSortOrder('desc');
                          }
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-all",
                          sortBy === option
                            ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                            : "bg-slate-800 text-gray-400 hover:text-gray-200"
                        )}
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                        {sortBy === option && (
                          sortOrder === 'desc'
                            ? <SortDesc className="h-3 w-3" />
                            : <SortAsc className="h-3 w-3" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 font-medium">Min Rating</label>
                  <div className="flex gap-1">
                    {[0, 3, 3.5, 4, 4.5].map(rating => (
                      <button
                        key={rating}
                        onClick={() => setMinRating(rating)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-all",
                          minRating === rating
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-slate-800 text-gray-400 hover:text-gray-200"
                        )}
                      >
                        {rating === 0 ? 'Any' : (
                          <>
                            {rating}
                            <Star className="h-3 w-3 fill-current" />
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                  </div>
                )}
              </div>

              {/* Skill Filters */}
              {allSkills.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <label className="text-sm text-gray-400 font-medium mb-2 block">Filter by Skill</label>
                  <div className="flex flex-wrap gap-2">
                    {allSkills.map(skill => (
                      <button
                        key={skill}
                        onClick={() => toggleSkillFilter(skill)}
                        className={cn(
                          "px-3 py-1 rounded-full text-sm transition-all",
                          selectedSkills.includes(skill)
                            ? "bg-indigo-500 text-white"
                            : "bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-gray-200"
                        )}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filters Summary */}
        {hasActiveFilters && !showFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-sm"
          >
            <span className="text-gray-500">Active filters:</span>
            {selectedSkills.map(skill => (
              <span key={skill} className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center gap-1">
                {skill}
                <button onClick={() => toggleSkillFilter(skill)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {minRating > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 flex items-center gap-1">
                {minRating}+ <Star className="h-3 w-3 fill-current" />
                <button onClick={() => setMinRating(0)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </motion.div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing <span className="text-gray-300 font-medium">{filteredAndSortedMatches.length}</span> of {matches.length} matches
          </p>
        </div>
      </motion.div>

      {/* Results */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filteredAndSortedMatches.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedMatches.map((match, index) => (
            <motion.div
              key={match.user._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ y: -4 }}
              className={cn(
                "glass rounded-2xl p-5 border transition-all group relative overflow-hidden",
                (match.user.averageRating || 0) >= 4.5 && (match.user.totalRatings || 0) >= 5
                  ? "border-amber-400/30 shadow-[0_0_15px_rgba(251,191,36,0.1)] hover:shadow-[0_0_25px_rgba(251,191,36,0.2)]"
                  : "border-white/10 hover:border-violet-500/30"
              )}
            >
              {(match.user.averageRating || 0) >= 4.5 && (match.user.totalRatings || 0) >= 5 && (
                <div className="absolute top-0 right-0 p-3 bg-gradient-to-bl from-amber-500/20 to-transparent rounded-bl-2xl border-b border-l border-amber-500/10">
                  <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                </div>
              )}
              {/* User Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg shadow-lg shadow-violet-500/25">
                  {match.user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-100 truncate">{match.user.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{(match.user.averageRating || 0).toFixed(1)}</span>
                    </div>
                    <span>·</span>
                    <span>{match.user.totalRatings || 0} reviews</span>
                  </div>
                </div>
                <TrustBadge score={Math.min(100, 50 + (match.user.totalRatings || 0) * 10 + (match.user.averageRating || 0) * 5)} />
              </div>

              {/* Bio */}
              {match.user.bio && (
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{match.user.bio}</p>
              )}

              {/* Matching Skills */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <Zap className="h-3 w-3 text-indigo-400" />
                  {activeRole === 'mentor' ? 'Wants to learn:' : 'Can teach you:'}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {match.matchingSkills.slice(0, 3).map((skill, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {skill}
                    </span>
                  ))}
                  {match.matchingSkills.length > 3 && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-gray-500/10 text-gray-400">
                      +{match.matchingSkills.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Why Matched (Mutual Interest) */}
              {match.mutualInterest.length > 0 && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-xs text-emerald-400 mb-1.5 flex items-center gap-1 font-medium">
                    <Sparkles className="h-3 w-3" />
                    Mutual interest! They want to learn:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {match.mutualInterest.map((skill, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Why They Match - Info */}
              <div className="mb-4 p-2 rounded-lg bg-slate-800/50 border border-white/5">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  <span className="text-gray-400">{match.matchingSkills.length} skill{match.matchingSkills.length > 1 ? 's' : ''}</span> match your interests
                  {match.mutualInterest.length > 0 && (
                    <span className="text-emerald-400 ml-1">+ mutual benefit</span>
                  )}
                </p>
              </div>

              {/* Action Button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  className="w-full bg-slate-700 hover:bg-violet-500 text-gray-300 hover:text-white transition-all group-hover:bg-violet-500"
                  onClick={() => handleRequestSwap(match.user, match.matchingSkills[0])}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Request Swap
                  <ArrowUpRight className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </motion.div>
            </motion.div>
          ))}
        </div>
      ) : searchQuery.trim() ? (
        <NoSearchResults query={searchQuery} onClear={() => setSearchQuery('')} />
      ) : (
        <EmptyState
          variant="search"
          title={activeRole === 'mentor' ? "No students found" : "No matches found"}
          description={activeRole === 'mentor'
            ? "Add more skills you offer to find more students."
            : "Add skills you want to learn to find matches, or try adjusting your filters."}
          action={{
            label: 'Clear Filters',
            onClick: clearFilters,
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default Browse;
