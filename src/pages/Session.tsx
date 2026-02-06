import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { api, Session as SessionType, Match } from '@/lib/api';
import Chat from '@/pages/Chat';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';

import SessionTimer from '@/components/session/SessionTimer';
import SharedNotes from '@/components/session/SharedNotes';
import ResourceManager from '@/components/session/ResourceManager';
import TaskManager from '@/components/session/TaskManager';
import SessionCompletionModal from '@/components/session/SessionCompletionModal';
import SessionAgreementModal from '@/components/session/SessionAgreementModal';
import MilestoneTracker from '@/components/session/MilestoneTracker';
import WeeklyPlan from '@/components/session/WeeklyPlan';
import CollaborativeWhiteboard from '@/components/session/CollaborativeWhiteboard';
import ActivityFeed from '@/components/session/ActivityFeed';
import SessionHealthIndicator from '@/components/session/SessionHealthIndicator';
import { CheckCircle2, ArrowLeft, Loader2, LayoutDashboard, MessageSquare, FileText, Link as LinkIcon, ListTodo, Handshake, Clock } from 'lucide-react';

const Session = () => {
    const { matchId } = useParams<{ matchId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();

    const [session, setSession] = useState<SessionType | null>(null);
    const [match, setMatch] = useState<Match | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [showAgreementModal, setShowAgreementModal] = useState(false);

    // DEBUG: Temporary state to toggle roles for testing
    const [debugRole, setDebugRole] = useState<string | null>(null);

    useEffect(() => {
        if (matchId) {
            loadSession();
        }
    }, [matchId]);

    const loadSession = async () => {
        try {
            setLoading(true);
            const response = await api.sessions.get(matchId!);
            if (response.data?.session) {
                setSession(response.data.session);
                // Also fetch match details if needed, but session usually has matchId
                // We need match details for roles.
                // Assuming api.matches.get exists or session.matchId is populated
                // If session.matchId is an object (populated), we use it.
                // If not, we might need a separate call.
                // Based on controller, session matchId is NOT populated by default for getSession?
                // Wait, controller: Session.findOne({ matchId })...
                // It doesn't populate matchId.
                const matchResponse = await api.matches.getById(matchId!);
                if (matchResponse.data?.match) {
                    setMatch(matchResponse.data.match);
                } else if (matchResponse.data && !matchResponse.data.match && 'match' in (matchResponse as any)) {
                    // Fallback for different API structure
                    setMatch((matchResponse as any).match);
                } else if (matchResponse.data) {
                    // Try direct access if data IS the match
                    setMatch(matchResponse.data as any);
                }

                // Inspecting api.matches.getById in api.ts:
                // return handleResponse<{ match: Match }>(response);
                // So matchResponse.data.match is correct.

                if (matchResponse.data?.match) {
                    setMatch(matchResponse.data.match);
                }
            }
        } catch (error) {
            console.error('Failed to load session:', error);
            toast({ title: 'Failed to load session', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        loadSession();
    };

    const handleTimerToggle = async () => {
        try {
            const action = session?.status === 'active' ? 'pause' : 'start';
            const response = await api.sessions.toggleTimer(matchId!, action);
            if (response.data?.session) setSession(response.data.session);
        } catch (error) {
            toast({ title: 'Failed to toggle timer', variant: 'destructive' });
        }
    };

    const handleNotesSave = async (notes: string) => {
        try {
            const response = await api.sessions.updateNotes(matchId!, notes);
            if (response.data?.session) {
                setSession(response.data.session);
                toast({ title: 'Notes saved' });
            }
        } catch (error) {
            toast({ title: 'Failed to save notes', variant: 'destructive' });
        }
    };

    const handleAddResource = async (resource: any) => {
        try {
            const response = await api.sessions.addResource(matchId!, resource);
            if (response.data?.session) {
                setSession(response.data.session);
                toast({ title: 'Resource added' });
            }
        } catch (error) {
            toast({ title: 'Failed to add resource', variant: 'destructive' });
        }
    };

    const handleAddTask = async (taskTitle: string) => {
        try {
            const response = await api.sessions.addTask(matchId!, taskTitle);
            if (response.data?.session) {
                setSession(response.data.session);
                toast({ title: 'Task added' });
            }
        } catch (error) {
            toast({ title: 'Failed to add task', variant: 'destructive' });
        }
    };

    const handleToggleTask = async (taskId: string, status: 'pending' | 'completed') => {
        try {
            const response = await api.sessions.updateTask(matchId!, taskId, status);
            if (response.data?.session) setSession(response.data.session);
        } catch (error) {
            toast({ title: 'Failed to update task', variant: 'destructive' });
        }
    };

    const handleCompleteSession = async (feedback: any) => {
        try {
            const response = await api.sessions.completeSession(matchId!, feedback);
            if (response.data?.session) {
                setSession(response.data.session);
                setShowCompletionModal(false);
                toast({ title: 'Session completed!' });
            }
        } catch (error) {
            toast({ title: 'Failed to complete session', variant: 'destructive' });
        }
    };

    const handleProgressUpdate = async (value: number[]) => {
        if (!matchId || !value[0]) return;
        const newProgress = value[0];
        // Optimistic update
        setSession(prev => prev ? { ...prev, progress: newProgress } : null);

        try {
            await api.sessions.updateProgress(matchId, newProgress);
        } catch (error) {
            toast({ title: 'Failed to update progress', variant: 'destructive' });
            handleRefresh();
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                </div>
            </DashboardLayout>
        );
    }

    if (!session || !match) {
        return (
            <DashboardLayout>
                <div className="p-8 text-center text-gray-400">Session not found</div>
            </DashboardLayout>
        );
    }

    const isRequester = match.requester._id === user?._id;
    // Use debugRole if set, otherwise calculate real role
    const realRole = isRequester ? 'Learner' : 'Mentor';
    const role = debugRole || realRole;
    const otherUser = isRequester ? match.provider : match.requester;

    return (
        <DashboardLayout>
            <div className="h-[calc(100vh-100px)] flex flex-col space-y-4">
                {/* Header */}
                <div className="glass rounded-xl p-4 flex flex-col space-y-4 border border-white/10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={() => navigate('/requests')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                    {match.skillOffered} Exchange
                                </h1>
                                <p className="text-sm text-gray-400 flex items-center gap-2">
                                    with <span className="text-indigo-400 font-medium">{otherUser.name}</span> • <span className="text-emerald-400">{role}</span>
                                    {session.health && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-gray-600" />
                                            <SessionHealthIndicator status={session.health.status} score={session.health.score} />
                                        </>
                                    )}
                                    {/* Debug Button */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="ml-4 h-6 text-xs bg-purple-500/10 border-purple-500/20 text-purple-300 hover:bg-purple-500/20"
                                        onClick={() => setDebugRole(r => r === 'Mentor' ? 'Learner' : 'Mentor')}
                                    >
                                        [Debug] Switch to {role === 'Mentor' ? 'Learner' : 'Mentor'}
                                    </Button>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 self-end sm:self-auto">
                            <SessionTimer
                                startTime={session.lastActive}
                                accumulatedTime={session.accumulatedTime}
                                status={session.status}
                                onToggle={handleTimerToggle}
                                readOnly={session.status === 'completed'}
                            />

                            {session.status !== 'completed' && (
                                <Button
                                    onClick={() => setShowCompletionModal(true)}
                                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20"
                                >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Complete
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar in Header */}
                    <div className="w-full flex items-center gap-3">
                        <span className="text-xs font-medium text-gray-400 w-16">Progress</span>
                        <Progress value={session.progress || 0} className="h-2 flex-1" />
                        <span className="text-xs font-medium text-indigo-400 w-10 text-right">{session.progress || 0}%</span>
                    </div>
                </div>

                {/* Tabs & Content */}
                <div className="flex-1 min-h-0">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                        <div className="w-full overflow-x-auto pb-2 mb-2">
                            <TabsList className="bg-slate-900/50 border border-white/10 w-full sm:w-auto justify-start sm:justify-center overflow-x-auto h-auto py-2">
                                <TabsTrigger value="dashboard" className="data-[state=active]:bg-indigo-500">
                                    <LayoutDashboard className="h-4 w-4 mr-2" />
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger value="chat" className="data-[state=active]:bg-indigo-500">
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Chat
                                </TabsTrigger>
                                <TabsTrigger value="tasks" className="data-[state=active]:bg-indigo-500">
                                    <ListTodo className="h-4 w-4 mr-2" />
                                    Tasks
                                </TabsTrigger>
                                <TabsTrigger value="notes" className="data-[state=active]:bg-indigo-500">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Notes
                                </TabsTrigger>
                                <TabsTrigger value="resources" className="data-[state=active]:bg-indigo-500">
                                    <LinkIcon className="h-4 w-4 mr-2" />
                                    Resources
                                </TabsTrigger>
                                <TabsTrigger value="activity" className="data-[state=active]:bg-indigo-500">
                                    <Clock className="h-4 w-4 mr-2" />
                                    Activity
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-hidden relative glass rounded-2xl border border-white/10">
                            <TabsContent value="dashboard" className="h-full p-6 overflow-y-auto m-0">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-6">
                                        {/* Progress Card */}
                                        <div className="bg-slate-800/40 rounded-xl p-6 border border-white/5">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold text-gray-200">Session Progress</h3>
                                                <span className="text-sm font-medium text-indigo-400">{session.progress || 0}%</span>
                                            </div>
                                            <div className="space-y-4">
                                                <Slider
                                                    value={[session.progress || 0]}
                                                    max={100}
                                                    step={5}
                                                    onValueChange={handleProgressUpdate}
                                                    disabled={session.status === 'completed'}
                                                    className="w-full"
                                                />
                                                <p className="text-xs text-gray-500 text-center">
                                                    Drag to update the overall progress of this skill exchange.
                                                </p>
                                            </div>
                                        </div>

                                        <MilestoneTracker
                                            matchId={matchId!}
                                            milestones={session.milestones || []}
                                            onUpdate={handleRefresh}
                                            readOnly={session.status === 'completed'}
                                        />
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-slate-800/40 rounded-xl p-6 border border-white/5">
                                            <h3 className="text-lg font-semibold text-gray-200 mb-4">Weekly Plan</h3>
                                            <WeeklyPlan
                                                matchId={matchId!}
                                                plans={session.weeklyPlan || []}
                                                onUpdate={handleRefresh}
                                                readOnly={session.status === 'completed'}
                                            />
                                        </div>

                                        <div className="bg-slate-800/40 rounded-xl p-6 border border-white/5">
                                            <h3 className="text-lg font-semibold text-gray-200 mb-4">Agreement Status</h3>
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 border border-white/10">
                                                <Handshake className="h-5 w-5 text-indigo-400" />
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-gray-200">
                                                        {session.agreement?.status === 'active' ? 'Active Agreement' : 'Pending Acceptance'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {session.agreement?.acceptedBy.length} participant(s) signed
                                                    </div>
                                                </div>
                                                {session.agreement?.status === 'active' && (
                                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="chat" className="h-full m-0">
                                <Chat embedded matchIdProp={matchId} />
                            </TabsContent>

                            <TabsContent value="tasks" className="h-full m-0 p-0">
                                <TaskManager
                                    tasks={session.tasks}
                                    onAdd={handleAddTask}
                                    onToggle={handleToggleTask}
                                    readOnly={session.status === 'completed'}
                                />
                            </TabsContent>

                            <TabsContent value="notes" className="h-full m-0 p-0">
                                <SharedNotes
                                    notes={session.notes}
                                    onSave={handleNotesSave}
                                    readOnly={session.status === 'completed'}
                                />
                            </TabsContent>

                            <TabsContent value="resources" className="h-full m-0 p-0">
                                <ResourceManager
                                    resources={session.resources}
                                    onAdd={handleAddResource}
                                    readOnly={session.status === 'completed'}
                                />
                            </TabsContent>

                            <TabsContent value="activity" className="h-full m-0 p-0">
                                <ActivityFeed activities={session.history || []} />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                <SessionCompletionModal
                    isOpen={showCompletionModal}
                    onClose={() => setShowCompletionModal(false)}
                    onComplete={handleCompleteSession}
                />

                <SessionAgreementModal
                    isOpen={showAgreementModal}
                    onClose={() => { }}
                    matchId={matchId!}
                    onAgreementAccepted={() => {
                        setShowAgreementModal(false);
                        handleRefresh();
                    }}
                    isProvider={!isRequester}
                />
            </div>
        </DashboardLayout>
    );
};

export default Session;
