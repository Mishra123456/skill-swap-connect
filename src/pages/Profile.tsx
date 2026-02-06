import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TrustScore, TrustFactors } from '@/components/ui/TrustScore';
import { ProfileSkeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Save,
  X,
  User,
  MapPin,
  Sparkles,
  Star,
  TrendingUp,
  Check,
  Edit2,
  Target,
  Shield,
  Calendar,
  Settings,
  GraduationCap
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Helper for Trust Badge
const TrustBadge = ({ level }: { level: string }) => {
  const colors: Record<string, string> = {
    new: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    reliable: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    verified: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  };
  const labels: Record<string, string> = {
    new: 'New Member',
    reliable: 'Reliable Member',
    verified: 'Verified Expert'
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colors[level] || colors.new}`}>
      {labels[level] || 'Member'}
    </span>
  );
};

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [newOfferedSkill, setNewOfferedSkill] = useState('');
  const [newWantedSkill, setNewWantedSkill] = useState('');
  const [showAddOffered, setShowAddOffered] = useState(false);
  const [showAddWanted, setShowAddWanted] = useState(false);

  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setLocation(user.location || '');
      // If profile is incomplete, start in edit mode
      if (!user.bio || !user.location) {
        setIsEditing(true);
      }
    }
  }, [user]);

  if (!user) return <DashboardLayout><ProfileSkeleton /></DashboardLayout>;

  // Calculate trust factors
  const completedExchanges = 5; // Mock data since not in user object directly yet
  const trustScore = Math.min(100, Math.floor(
    (user.averageRating || 0) * 15 +
    (user.totalRatings || 0) * 5 +
    completedExchanges * 10 +
    20 // Base score
  ));

  const trustFactors = [
    { label: 'Rating Score', score: Math.round((user.averageRating || 0) * 20), max: 100 },
    { label: 'Reputation', score: Math.min(100, (user.totalRatings || 0) * 10), max: 100 },
    { label: 'Activity', score: Math.min(100, completedExchanges * 20), max: 100 },
    { label: 'Profile Completeness', score: (user.bio ? 50 : 0) + (user.location ? 50 : 0), max: 100 },
  ];

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await api.users.updateProfile({ bio, location });
      await refreshUser();
      setIsEditing(false);
      toast({
        title: 'Profile saved!',
        description: 'Your changes have been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Failed to save',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOfferedSkill = async () => {
    if (!newOfferedSkill.trim()) return;

    try {
      await api.users.addSkillOffered(newOfferedSkill.trim());
      await refreshUser();
      setNewOfferedSkill('');
      setShowAddOffered(false);
      toast({ title: 'Skill added', description: `${newOfferedSkill} added to your offered skills.` });
    } catch (error) {
      toast({
        title: 'Failed to add skill',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveOfferedSkill = async (skill: string) => {
    try {
      await api.users.removeSkillOffered(skill);
      await refreshUser();
      toast({ title: 'Skill removed', description: `${skill} removed from your offered skills.` });
    } catch (error) {
      toast({
        title: 'Failed to remove skill',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const handleAddWantedSkill = async () => {
    if (!newWantedSkill.trim()) return;

    try {
      await api.users.addSkillWanted(newWantedSkill.trim());
      await refreshUser();
      setNewWantedSkill('');
      setShowAddWanted(false);
      toast({ title: 'Skill added', description: `${newWantedSkill} added to your wanted skills.` });
    } catch (error) {
      toast({
        title: 'Failed to add skill',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveWantedSkill = async (skill: string) => {
    try {
      await api.users.removeSkillWanted(skill);
      await refreshUser();
      toast({ title: 'Skill removed', description: `${skill} removed from your wanted skills.` });
    } catch (error) {
      toast({
        title: 'Failed to remove skill',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Profile Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-8 relative overflow-hidden border border-white/10"
          >
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative">
              <div className="relative">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-4xl shadow-2xl shadow-indigo-500/30">
                  {user.name.charAt(0)}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-slate-900 p-1.5 rounded-full border border-white/10">
                  <div className="bg-emerald-500 w-4 h-4 rounded-full border-2 border-slate-900" />
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-3">
                      {user.name}
                      <TrustBadge level={user.trustLevel || 'new'} />
                    </h1>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-400 mt-1">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {isEditing ? (
                          <Input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Add location"
                            className="h-7 text-sm w-32 bg-slate-800/50 border-white/10"
                          />
                        ) : (
                          <span>{location || 'Add location'}</span>
                        )}
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Joined {new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="outline" className="h-9 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={() => setIsEditing(false)} variant="ghost" className="h-9 text-gray-400">
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile} disabled={isLoading} className="h-9 bg-indigo-500 hover:bg-indigo-600">
                        {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save
                      </Button>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <Label className="text-gray-500 mb-2 block">About Me</Label>
                  {isEditing ? (
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell the community about yourself..."
                      className="min-h-[100px] bg-slate-800/50 border-white/10 text-gray-200"
                    />
                  ) : (
                    <p className="text-gray-300 leading-relaxed max-w-2xl">
                      {bio || "No bio added yet. Tell others what you're passionate about!"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs for Profile Sections */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6 bg-slate-800/50 border border-white/10 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-500">
                <User className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="mentor" className="data-[state=active]:bg-indigo-500">
                <GraduationCap className="h-4 w-4 mr-2" />
                Mentor Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Skills Grid - Moved inside Overview Tab */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Skills Offered */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass rounded-3xl p-6 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-500/20">
                        <TrendingUp className="h-5 w-5 text-emerald-400" />
                      </div>
                      <h3 className="font-bold text-gray-100">Skills I Offer</h3>
                    </div>
                    {!showAddOffered && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowAddOffered(true)}
                        className="text-emerald-400 hover:bg-emerald-500/10 h-8 w-8 p-0"
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    )}
                  </div>

                  {showAddOffered && (
                    <div className="mb-4 flex gap-2 animate-in fade-in slide-in-from-top-2">
                      <Input
                        value={newOfferedSkill}
                        onChange={(e) => setNewOfferedSkill(e.target.value)}
                        placeholder="E.g., Web Development"
                        className="h-9 bg-slate-800/50 border-emerald-500/30 focus:border-emerald-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddOfferedSkill()}
                        autoFocus
                      />
                      <Button onClick={handleAddOfferedSkill} size="sm" className="bg-emerald-500 hover:bg-emerald-600 h-9">
                        Add
                      </Button>
                      <Button onClick={() => setShowAddOffered(false)} variant="ghost" size="sm" className="h-9 w-9 p-0">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {user.skillsOffered.map((skill, index) => (
                      <motion.div
                        key={skill}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="group flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                      >
                        <span className="font-medium text-sm">{skill}</span>
                        <button
                          onClick={() => handleRemoveOfferedSkill(skill)}
                          className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </motion.div>
                    ))}
                    {user.skillsOffered.length === 0 && !showAddOffered && (
                      <p className="text-gray-500 text-sm">No skills added yet</p>
                    )}
                  </div>
                </motion.div>

                {/* Skills Wanted */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="glass rounded-3xl p-6 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-violet-500/20">
                        <Target className="h-5 w-5 text-violet-400" />
                      </div>
                      <h3 className="font-bold text-gray-100">Skills I Want</h3>
                    </div>
                    {!showAddWanted && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowAddWanted(true)}
                        className="text-violet-400 hover:bg-violet-500/10 h-8 w-8 p-0"
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    )}
                  </div>

                  {showAddWanted && (
                    <div className="mb-4 flex gap-2 animate-in fade-in slide-in-from-top-2">
                      <Input
                        value={newWantedSkill}
                        onChange={(e) => setNewWantedSkill(e.target.value)}
                        placeholder="E.g., Photography"
                        className="h-9 bg-slate-800/50 border-violet-500/30 focus:border-violet-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddWantedSkill()}
                        autoFocus
                      />
                      <Button onClick={handleAddWantedSkill} size="sm" className="bg-violet-500 hover:bg-violet-600 h-9">
                        Add
                      </Button>
                      <Button onClick={() => setShowAddWanted(false)} variant="ghost" size="sm" className="h-9 w-9 p-0">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {user.skillsWanted.map((skill, index) => (
                      <motion.div
                        key={skill}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="group flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 transition-all"
                      >
                        <span className="font-medium text-sm">{skill}</span>
                        <button
                          onClick={() => handleRemoveWantedSkill(skill)}
                          className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </motion.div>
                    ))}
                    {user.skillsWanted.length === 0 && !showAddWanted && (
                      <p className="text-gray-500 text-sm">No skills added yet</p>
                    )}
                  </div>
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="mentor" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-3xl p-8 border border-white/10"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-2xl bg-indigo-500/20">
                    <GraduationCap className="h-8 w-8 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Mentor Profile</h2>
                    <p className="text-gray-400">Manage how you appear to learners when teaching.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Teaching Style</Label>
                    <Input
                      placeholder="e.g. Hands-on, Theory-focused..."
                      className="bg-slate-800/50 border-slate-700 text-gray-200"
                      defaultValue={user.mentorProfile?.teachingStyle}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Years of Experience</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 5"
                      className="bg-slate-800/50 border-slate-700 text-gray-200"
                      defaultValue={user.mentorProfile?.experienceYears}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-gray-300">Availability</Label>
                    <Input
                      placeholder="e.g. Weekends, Evenings EST"
                      className="bg-slate-800/50 border-slate-700 text-gray-200"
                      defaultValue={user.mentorProfile?.availability}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-gray-300">Mentor Bio</Label>
                    <Textarea
                      placeholder="Specific details about your mentorship..."
                      className="bg-slate-800/50 border-slate-700 text-gray-200 min-h-[100px]"
                      defaultValue={user.mentorProfile?.bio}
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button className="bg-indigo-500 hover:bg-indigo-600">
                    <Save className="h-4 w-4 mr-2" />
                    Save Mentor Details
                  </Button>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="glass rounded-3xl p-6 border border-white/10"
          >
            <h3 className="font-bold text-gray-100 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              Contribution
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/50 border border-white/5">
                <span className="text-gray-400 text-sm">Sessions</span>
                <span className="font-bold text-white text-lg">{user.stats?.sessionsCompleted || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/50 border border-white/5">
                <span className="text-gray-400 text-sm">Time Invested</span>
                <span className="font-bold text-white text-lg">
                  {Math.floor(((user.stats?.totalMinutesLearned || 0) + (user.stats?.totalMinutesTaught || 0)) / 60)}h{' '}
                  {((user.stats?.totalMinutesLearned || 0) + (user.stats?.totalMinutesTaught || 0)) % 60}m
                </span>
              </div>
            </div>
          </motion.div>

          {/* Trust Score Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-3xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-5 w-5 text-indigo-400" />
              <h3 className="font-bold text-gray-100">Reputation</h3>
            </div>

            <div className="mb-8">
              <TrustScore
                score={trustScore}
                rating={user.averageRating || 0}
                totalRatings={user.totalRatings || 0}
                completedExchanges={completedExchanges}
                size="lg"
              />
            </div>

            <TrustFactors factors={trustFactors} />
          </motion.div>

          {/* Settings Shortcuts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-3xl p-6 border border-white/10"
          >
            <h3 className="font-bold text-gray-100 mb-4">Account Settings</h3>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-400 hover:text-gray-200 hover:bg-white/5"
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-4 w-4 mr-3" />
                Settings
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={() => navigate('/login')}
              >
                <div className="w-4 mr-3 flex justify-center">
                  <X className="h-4 w-4" />
                </div>
                Sign Out
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
