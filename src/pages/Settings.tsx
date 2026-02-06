import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import {
    User,
    Save,
    Globe,
    Sparkles,
    Calendar,
    Star,
    ArrowRightLeft,
    ChevronRight,
    Shield,
    HelpCircle,
    FileText,
    LogOut,
    AlertTriangle,
    Lock,
    Eye,
    EyeOff,
    Users
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Settings = () => {
    const { toast } = useToast();
    const { user, logout, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    const [settings, setSettings] = useState({
        name: '',
        bio: '',
        email: '',
        location: '',
    });

    const [privacySettings, setPrivacySettings] = useState({
        isIncognito: false,
        allowRequestsFrom: 'everyone',
        showOnlineStatus: true,
    });

    useEffect(() => {
        if (user) {
            setSettings({
                name: user.name || '',
                bio: user.bio || '',
                email: user.email || '',
                location: user.location || '',
            });

            if (user.privacySettings) {
                setPrivacySettings({
                    isIncognito: user.privacySettings.isIncognito ?? false,
                    allowRequestsFrom: user.privacySettings.allowRequestsFrom ?? 'everyone',
                    showOnlineStatus: user.privacySettings.showOnlineStatus ?? true,
                });
            }
        }
    }, [user]);

    const updateSetting = (key: keyof typeof settings, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const updatePrivacySetting = (key: keyof typeof privacySettings, value: any) => {
        setPrivacySettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await api.users.updateProfile({
                bio: settings.bio,
                location: settings.location,
                privacySettings: activeTab === 'privacy' ? privacySettings : undefined
            });
            await refreshUser();
            setHasChanges(false);
            toast({
                title: 'Settings saved!',
                description: 'Your settings have been updated successfully.',
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

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { priority: 1, opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    const quickLinks = [
        { path: '/safety', label: 'Safety Center', icon: Shield, description: 'Stay safe on SkillSwap', color: 'emerald' },
        { path: '/guidelines', label: 'Community Guidelines', icon: FileText, description: 'Our community rules', color: 'violet' },
        { path: '/help', label: 'Help & Support', icon: HelpCircle, description: 'Get help with any issues', color: 'cyan' },
    ];

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });
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
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-indigo-400">Settings</span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-100 mb-2">
                    Account <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Settings</span>
                </h1>
                <p className="text-gray-400">
                    Manage your profile, privacy, and preferences
                </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content - Left */}
                <div className="lg:col-span-2 space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 p-1 rounded-xl mb-6">
                            <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
                                <User className="h-4 w-4 mr-2" />
                                Profile
                            </TabsTrigger>
                            <TabsTrigger value="privacy" className="rounded-lg data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
                                <Shield className="h-4 w-4 mr-2" />
                                Privacy
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile" className="space-y-6 mt-0">
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-6"
                            >
                                {/* Profile Section */}
                                <motion.div variants={itemVariants} className="glass rounded-2xl p-6 border border-white/10">
                                    <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                                        <User className="h-5 w-5 text-indigo-400" />
                                        Profile Information
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                                                <Input
                                                    id="name"
                                                    value={settings.name}
                                                    className="bg-slate-800/30 border-white/5 text-gray-400 cursor-not-allowed"
                                                    placeholder="Enter your name"
                                                    disabled
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={settings.email}
                                                    disabled
                                                    className="bg-slate-800/30 border-white/5 text-gray-400 cursor-not-allowed"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="location" className="text-gray-300">Location</Label>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                                <Input
                                                    id="location"
                                                    value={settings.location}
                                                    onChange={(e) => updateSetting('location', e.target.value)}
                                                    className="bg-slate-800/50 border-white/10 text-gray-100 pl-10 focus:border-indigo-500/50"
                                                    placeholder="City, Country"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                                            <Textarea
                                                id="bio"
                                                value={settings.bio}
                                                onChange={(e) => updateSetting('bio', e.target.value)}
                                                className="bg-slate-800/50 border-white/10 text-gray-100 min-h-[100px] focus:border-indigo-500/50"
                                                placeholder="Tell others about yourself..."
                                            />
                                            <p className="text-xs text-gray-500">{settings.bio.length}/500 characters</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end mt-4">
                                        <Button
                                            onClick={handleSave}
                                            disabled={isLoading || !hasChanges}
                                            className="bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-lg shadow-indigo-500/25 disabled:opacity-50"
                                        >
                                            {isLoading ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                            ) : (
                                                <Save className="h-4 w-4 mr-2" />
                                            )}
                                            Save Profile
                                        </Button>
                                    </div>
                                </motion.div>

                                {/* Skills Section - Keep simplified */}
                                <motion.div variants={itemVariants} className="glass rounded-2xl p-6 border border-white/10">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-amber-400" />
                                            Your Skills
                                        </h3>
                                        <Link to="/profile">
                                            <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300">
                                                Manage
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </Link>
                                    </div>
                                    {/* Skills display logic... reuse from previous step if needed or keep simple */}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {/* Summarized view */}
                                        <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5">
                                            <p className="text-gray-400 text-sm mb-2">Offered Skills</p>
                                            <p className="text-gray-200 font-medium">{user?.skillsOffered?.length || 0} skills added</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5">
                                            <p className="text-gray-400 text-sm mb-2">Wanted Skills</p>
                                            <p className="text-gray-200 font-medium">{user?.skillsWanted?.length || 0} skills added</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="privacy" className="space-y-6 mt-0">
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-6"
                            >
                                <motion.div variants={itemVariants} className="glass rounded-2xl p-6 border border-white/10">
                                    <h3 className="text-lg font-semibold text-gray-100 mb-6 flex items-center gap-2">
                                        <Lock className="h-5 w-5 text-emerald-400" />
                                        Privacy Controls
                                    </h3>

                                    <div className="space-y-8">
                                        {/* Incognito Mode */}
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <Label className="text-base text-gray-100 flex items-center gap-2">
                                                    {privacySettings.isIncognito ? (
                                                        <EyeOff className="h-4 w-4 text-indigo-400" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 text-gray-400" />
                                                    )}
                                                    Incognito Mode
                                                </Label>
                                                <p className="text-sm text-gray-400">
                                                    Hide your profile from search results and browsing. You can still send requests.
                                                </p>
                                            </div>
                                            <Switch
                                                checked={privacySettings.isIncognito}
                                                onCheckedChange={(checked) => updatePrivacySetting('isIncognito', checked)}
                                                className="data-[state=checked]:bg-indigo-500"
                                            />
                                        </div>

                                        <div className="h-px bg-white/5" />

                                        {/* Request Controls */}
                                        <div className="space-y-3">
                                            <Label className="text-base text-gray-100 flex items-center gap-2">
                                                <Users className="h-4 w-4 text-gray-400" />
                                                Who can send you requests?
                                            </Label>
                                            <Select
                                                value={privacySettings.allowRequestsFrom}
                                                onValueChange={(value) => updatePrivacySetting('allowRequestsFrom', value)}
                                            >
                                                <SelectTrigger className="w-full bg-slate-800/50 border-white/10 text-gray-100">
                                                    <SelectValue placeholder="Select who can request" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-800 border-white/10 text-gray-100">
                                                    <SelectItem value="everyone">Everyone</SelectItem>
                                                    <SelectItem value="verified">Verified Users Only</SelectItem>
                                                    <SelectItem value="none">No One (Pause Requests)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <p className="text-sm text-gray-400">
                                                Control who can initiate a skill exchange with you.
                                            </p>
                                        </div>

                                        <div className="h-px bg-white/5" />

                                        {/* Online Status */}
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <Label className="text-base text-gray-100">Show Online Status</Label>
                                                <p className="text-sm text-gray-400">
                                                    Let others see when you are currently active.
                                                </p>
                                            </div>
                                            <Switch
                                                checked={privacySettings.showOnlineStatus}
                                                onCheckedChange={(checked) => updatePrivacySetting('showOnlineStatus', checked)}
                                                className="data-[state=checked]:bg-emerald-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end mt-8">
                                        <Button
                                            onClick={handleSave}
                                            disabled={isLoading || !hasChanges}
                                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 disabled:opacity-50"
                                        >
                                            {isLoading ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                            ) : (
                                                <Save className="h-4 w-4 mr-2" />
                                            )}
                                            Save Privacy Settings
                                        </Button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar - Right */}
                <div className="space-y-6">
                    {/* Account Stats */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass rounded-2xl p-6 border border-white/10"
                    >
                        <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-cyan-400" />
                            Account Info
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-2 border-b border-white/5">
                                <span className="text-gray-400 text-sm">Member since</span>
                                <span className="text-gray-200 text-sm font-medium">{formatDate(user?.createdAt)}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-white/5">
                                <span className="text-gray-400 text-sm flex items-center gap-1">
                                    <Star className="h-3 w-3 text-amber-400" />
                                    Rating
                                </span>
                                <span className="text-gray-200 text-sm font-medium">
                                    {user?.averageRating ? `${user.averageRating.toFixed(1)} / 5.0` : 'No ratings yet'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-gray-400 text-sm flex items-center gap-1">
                                    <ArrowRightLeft className="h-3 w-3 text-indigo-400" />
                                    Exchanges
                                </span>
                                <span className="text-gray-200 text-sm font-medium">
                                    {user?.totalRatings || 0} completed
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass rounded-2xl p-6 border border-white/10"
                    >
                        <h3 className="text-lg font-semibold text-gray-100 mb-4">Quick Links</h3>
                        <div className="space-y-2">
                            {quickLinks.map((link) => (
                                <Link key={link.path} to={link.path}>
                                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                                        <div className={`p-2 rounded-lg bg-${link.color}-500/20`}>
                                            <link.icon className={`h-4 w-4 text-${link.color}-400`} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-gray-200 text-sm font-medium">{link.label}</p>
                                            <p className="text-gray-500 text-xs">{link.description}</p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </motion.div>

                    {/* Danger Zone */}
                    <motion.div variants={itemVariants} className="glass rounded-2xl p-6 border border-red-500/20 bg-red-500/5">
                        <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                            Account Actions
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Sign out of your account on this device.
                        </p>
                        <Button
                            variant="destructive"
                            onClick={handleLogout}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 w-full"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                        </Button>
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Settings;
