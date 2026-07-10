import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
    Home,
    Users,
    MessageSquare,
    MessageCircle,
    User,
    Settings,
    LogOut,
    Search,
    Bell,
    Menu,
    X,
    ChevronLeft,
    Repeat,
    Star,
    TrendingUp,
    Shield,
    HelpCircle,
    Sparkles,
    Map
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PageBreadcrumb } from '@/components/shared/PageBreadcrumb';

interface SidebarContextType {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) throw new Error('useSidebar must be used within SidebarProvider');
    return context;
};

interface DashboardLayoutProps {
    children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    const { user, logout, activeRole, toggleRole } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [notifications, setNotifications] = useState(0);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user) return;
            try {
                const response = await api.matches.getMyRequests();
                if (response.success && response.data) {
                    const pendingCount = response.data.matches.filter(
                        (r: any) => r.status === 'pending'
                    ).length;
                    setNotifications(pendingCount);
                }
            } catch (error) {
                console.error('Failed to fetch requests count:', error);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 15000);
        return () => clearInterval(interval);
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    interface NavItem {
        path: string;
        label: string;
        icon: React.ElementType;
        badge?: number | string;
    }

    const navItems: NavItem[] = [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/browse', label: 'Browse Skills', icon: Search },
        { path: '/messages', label: 'Messages', icon: MessageCircle },
        { path: '/requests', label: 'Requests', icon: Users, badge: notifications || undefined },
        { path: '/journey', label: 'Your Journey', icon: Map },
        { path: '/profile', label: 'Profile', icon: User },
    ];

    const secondaryNavItems = [
        { path: '/safety', label: 'Safety Center', icon: Shield },
        { path: '/help', label: 'Help & Support', icon: HelpCircle },
        { path: '/settings', label: 'Settings', icon: Settings },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <SidebarContext.Provider value={{ isOpen, setIsOpen, isCollapsed, setIsCollapsed }}>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-neutral-950">
                {/* Mobile Overlay */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        />
                    )}
                </AnimatePresence>

                {/* Sidebar */}
                <motion.aside
                    initial={false}
                    animate={{
                        width: isCollapsed ? 80 : 280,
                        x: isOpen || window.innerWidth >= 1024 ? 0 : -280
                    }}
                    className={cn(
                        "fixed top-0 left-0 h-full z-50 bg-slate-900/95 backdrop-blur-xl border-r border-white/10",
                        "flex flex-col transition-all duration-300",
                        "lg:translate-x-0"
                    )}
                >
                    {/* Logo */}
                    <div className="p-4 flex items-center justify-between border-b border-white/10">
                        <Link to="/dashboard" className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/25">
                                <Repeat className="h-5 w-5 text-white" />
                            </div>
                            {!isCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400"
                                >
                                    SkillSwap
                                </motion.span>
                            )}
                        </Link>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="hidden lg:flex text-gray-400 hover:text-white hover:bg-white/10"
                        >
                            <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsOpen(false)}
                            className="lg:hidden text-gray-400"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className={cn("p-4 border-b border-white/10", isCollapsed && "px-2")}>
                        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow-lg shadow-violet-500/25">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900" />
                            </div>
                            {!isCollapsed && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex-1 min-w-0"
                                >
                                    <p className="font-medium text-gray-100 truncate">{user?.name || 'User'}</p>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                                        <span>{user?.averageRating?.toFixed(1) || '0.0'}</span>
                                    </div>
                                    <button
                                        onClick={toggleRole}
                                        className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 flex items-center gap-1"
                                    >
                                        <Repeat className="h-3 w-3" />
                                        Switch to {activeRole === 'learner' ? 'Mentor' : 'Learner'}
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                        {navItems.map((item) => (
                            <Link key={item.path} to={item.path}>
                                <motion.div
                                    whileHover={{ x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                                        isActive(item.path)
                                            ? "bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-indigo-400 border border-indigo-500/30"
                                            : "text-gray-400 hover:text-gray-200 hover:bg-white/5",
                                        isCollapsed && "justify-center px-2"
                                    )}
                                >
                                    <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive(item.path) && "text-indigo-400")} />
                                    {!isCollapsed && (
                                        <>
                                            <span className="flex-1 font-medium">{item.label}</span>
                                            {item.badge && (
                                                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-500 text-white">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </motion.div>
                            </Link>
                        ))}

                        <div className="my-4 border-t border-white/10" />

                        {secondaryNavItems.map((item) => (
                            <Link key={item.path} to={item.path}>
                                <motion.div
                                    whileHover={{ x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                                        isActive(item.path)
                                            ? "bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-indigo-400 border border-indigo-500/30"
                                            : "text-gray-500 hover:text-gray-300 hover:bg-white/5",
                                        isCollapsed && "justify-center px-2"
                                    )}
                                >
                                    <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive(item.path) && "text-indigo-400")} />
                                    {!isCollapsed && <span className="font-medium">{item.label}</span>}
                                </motion.div>
                            </Link>
                        ))}
                    </nav>

                    {/* Logout */}
                    <div className="p-3 border-t border-white/10">
                        <motion.button
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleLogout}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl w-full",
                                "text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200",
                                isCollapsed && "justify-center px-2"
                            )}
                        >
                            <LogOut className="h-5 w-5 flex-shrink-0" />
                            {!isCollapsed && <span className="font-medium">Sign Out</span>}
                        </motion.button>
                    </div>
                </motion.aside>

                {/* Main Content */}
                <div className={cn(
                    "transition-all duration-300",
                    isCollapsed ? "lg:ml-20" : "lg:ml-[280px]"
                )}>
                    {/* Top Header */}
                    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
                        <div className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsOpen(true)}
                                    className="lg:hidden text-gray-400"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                                <div className="hidden md:block">
                                    <span className="text-lg font-semibold text-gray-100">
                                        {navItems.find(item => isActive(item.path))?.label ||
                                            secondaryNavItems.find(item => isActive(item.path))?.label ||
                                            'SkillSwap'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Search */}
                                <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/50 border border-white/10">
                                    <Search className="h-4 w-4 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="bg-transparent border-none outline-none text-sm text-gray-300 placeholder:text-gray-600 w-40 lg:w-60"
                                    />
                                    <kbd className="px-1.5 py-0.5 text-xs bg-slate-700 text-gray-400 rounded">⌘K</kbd>
                                </div>

                                {/* Notifications */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="relative text-gray-400 hover:text-gray-200"
                                        >
                                            <Bell className="h-5 w-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-80">
                                        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => navigate('/requests')} className="cursor-pointer">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium">New Connection Request</span>
                                                <span className="text-xs text-gray-500">John needs help with React</span>
                                            </div>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => navigate('/requests')} className="cursor-pointer">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium">Request Accepted</span>
                                                <span className="text-xs text-gray-500">Sarah accepted your help</span>
                                            </div>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => navigate('/requests')} className="cursor-pointer text-indigo-400 justify-center">
                                            View all notifications
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* Quick Actions */}
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button
                                        size="sm"
                                        onClick={() => navigate('/browse')}
                                        className="hidden sm:flex bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-lg shadow-indigo-500/25"
                                    >
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Find Skills
                                    </Button>
                                </motion.div>
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="p-4 lg:p-6">
                        <PageBreadcrumb />
                        {children}
                    </main>
                </div>
            </div>
        </SidebarContext.Provider>
    );
};

export default DashboardLayout;
