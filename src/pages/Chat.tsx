import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { api, Message, Match, CommunicationStatus, VoiceSession } from '@/lib/api';
import {
    Send,
    Image as ImageIcon,
    Video,
    Mic,
    MicOff,
    Phone,
    PhoneOff,
    MoreVertical,
    Flag,
    Trash2,
    ArrowLeft,
    Loader2,
    Lock,
    CheckCheck,
    Check,
    AlertTriangle,
    X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'http://127.0.0.1:5000';

interface ChatProps {
    embedded?: boolean;
    matchIdProp?: string;
}

const Chat: React.FC<ChatProps> = ({ embedded = false, matchIdProp }) => {
    const { matchId: paramMatchId } = useParams<{ matchId: string }>();
    const matchId = matchIdProp || paramMatchId;
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [match, setMatch] = useState<Match | null>(null);
    const [commStatus, setCommStatus] = useState<CommunicationStatus | null>(null);
    const [voiceSession, setVoiceSession] = useState<VoiceSession | null>(null);
    const [voiceStatus, setVoiceStatus] = useState<'idle' | 'connecting' | 'live' | 'ended'>('idle');
    const [isMuted, setIsMuted] = useState(false);
    const [showMenu, setShowMenu] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // Load initial data
    useEffect(() => {
        if (matchId) {
            loadChatData();
            // Poll for new messages every 3 seconds
            pollIntervalRef.current = setInterval(loadMessages, 3000);
        }

        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, [matchId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const loadChatData = async () => {
        if (!matchId) return;

        try {
            setIsLoading(true);
            const statusResponse = await api.chat.getCommunicationStatus(matchId);

            if (statusResponse.success && statusResponse.data) {
                setMatch(statusResponse.data.match);
                setCommStatus(statusResponse.data.communicationStatus);

                if (statusResponse.data.activeVoiceSession) {
                    const voiceResponse = await api.chat.getActiveVoiceSession(matchId);
                    if (voiceResponse.success && voiceResponse.data?.session) {
                        setVoiceSession(voiceResponse.data.session);
                        setVoiceStatus(voiceResponse.data.session.status);
                    }
                }
            }

            await loadMessages();
        } catch (error) {
            toast({
                title: 'Failed to load chat',
                description: error instanceof Error ? error.message : 'Something went wrong',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const loadMessages = async () => {
        if (!matchId) return;

        try {
            const response = await api.chat.getMessages(matchId);
            if (response.success && response.data) {
                setMessages(response.data.messages);
                setCommStatus(response.data.communicationStatus);
            }
        } catch (error) {
            // Silent fail for polling
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!matchId || !newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            const response = await api.chat.sendMessage(matchId, newMessage.trim());
            if (response.success && response.data) {
                setMessages(prev => [...prev, response.data!.message]);
                setNewMessage('');
            }
        } catch (error) {
            toast({
                title: 'Failed to send message',
                description: error instanceof Error ? error.message : 'Something went wrong',
                variant: 'destructive',
            });
        } finally {
            setIsSending(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !matchId) return;

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: 'File too large',
                description: 'Images must be less than 5MB',
                variant: 'destructive',
            });
            return;
        }

        setIsUploading(true);
        try {
            const response = await api.chat.uploadImage(matchId, file);
            if (response.success && response.data) {
                setMessages(prev => [...prev, response.data!.message]);
            }
        } catch (error) {
            toast({
                title: 'Failed to upload image',
                description: error instanceof Error ? error.message : 'Something went wrong',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !matchId) return;

        // Validate file size (50MB max)
        if (file.size > 50 * 1024 * 1024) {
            toast({
                title: 'File too large',
                description: 'Videos must be less than 50MB',
                variant: 'destructive',
            });
            return;
        }

        setIsUploading(true);
        try {
            const response = await api.chat.uploadVideo(matchId, file);
            if (response.success && response.data) {
                setMessages(prev => [...prev, response.data!.message]);
            }
        } catch (error) {
            toast({
                title: 'Failed to upload video',
                description: error instanceof Error ? error.message : 'Something went wrong',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
            if (videoInputRef.current) videoInputRef.current.value = '';
        }
    };

    const handleReportMessage = async (messageId: string) => {
        try {
            await api.chat.reportMessage(messageId, 'Inappropriate content');
            toast({
                title: 'Message reported',
                description: 'Thank you for helping keep our community safe.',
            });
            setShowMenu(null);
        } catch (error) {
            toast({
                title: 'Failed to report',
                description: error instanceof Error ? error.message : 'Something went wrong',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        try {
            await api.chat.deleteMessage(messageId);
            setMessages(prev => prev.map(m =>
                m._id === messageId ? { ...m, deleted: true, content: '[Message deleted]' } : m
            ));
            setShowMenu(null);
        } catch (error) {
            toast({
                title: 'Failed to delete',
                description: error instanceof Error ? error.message : 'Something went wrong',
                variant: 'destructive',
            });
        }
    };

    // Voice Chat Handlers
    const handleStartVoiceChat = async () => {
        if (!matchId) return;

        try {
            setVoiceStatus('connecting');
            const response = await api.chat.createVoiceSession(matchId);

            if (response.success && response.data) {
                setVoiceSession(response.data.session);

                // Join the session
                await api.chat.joinVoiceSession(response.data.session._id);

                // Update to live status
                await api.chat.updateVoiceSession(response.data.session._id, 'live', 'connected');
                setVoiceStatus('live');

                toast({
                    title: 'Voice chat started',
                    description: 'Waiting for the other person to join...',
                });
            }
        } catch (error) {
            setVoiceStatus('idle');
            toast({
                title: 'Failed to start voice chat',
                description: error instanceof Error ? error.message : 'Something went wrong',
                variant: 'destructive',
            });
        }
    };

    const handleEndVoiceChat = async () => {
        if (!voiceSession) return;

        try {
            await api.chat.endVoiceSession(voiceSession._id);
            setVoiceSession(null);
            setVoiceStatus('idle');
            setIsMuted(false);

            toast({
                title: 'Voice chat ended',
            });
        } catch (error) {
            toast({
                title: 'Failed to end voice chat',
                description: error instanceof Error ? error.message : 'Something went wrong',
                variant: 'destructive',
            });
        }
    };

    const handleToggleMute = async () => {
        if (!voiceSession) return;

        const newMutedState = !isMuted;
        setIsMuted(newMutedState);

        try {
            await api.chat.updateVoiceSession(
                voiceSession._id,
                undefined,
                newMutedState ? 'muted' : 'connected'
            );
        } catch (error) {
            setIsMuted(!newMutedState);
        }
    };

    // Get the other user
    const otherUser = match
        ? (match.requester._id === user?._id ? match.provider : match.requester)
        : null;

    const isOwnMessage = (msg: Message) => {
        const senderId = typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;
        return senderId === user?._id;
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (isLoading) {
        return embedded ? (
            <div className="h-full flex items-center justify-center glass rounded-3xl border border-white/10">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
                    <p className="text-gray-400">Loading chat...</p>
                </div>
            </div>
        ) : (
            <DashboardLayout>
                <div className="h-[calc(100vh-140px)] flex items-center justify-center glass rounded-3xl border border-white/10">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
                        <p className="text-gray-400">Loading chat...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!commStatus?.allowed) {
        return embedded ? (
            <div className="h-full flex items-center justify-center glass rounded-3xl border border-white/10">
                <div className="text-center p-8 max-w-md">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                        <Lock className="h-8 w-8 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-100 mb-2">Communication Locked</h2>
                    <p className="text-gray-400 mb-8">
                        Chat is only available for accepted matches. Please wait for the match to be accepted.
                    </p>
                </div>
            </div>
        ) : (
            <DashboardLayout>
                <div className="h-[calc(100vh-140px)] flex items-center justify-center glass rounded-3xl border border-white/10">
                    <div className="text-center p-8 max-w-md">
                        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                            <Lock className="h-8 w-8 text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-100 mb-2">Communication Locked</h2>
                        <p className="text-gray-400 mb-8">
                            Chat is only available for accepted matches. Please wait for the match to be accepted.
                        </p>
                        <Button
                            onClick={() => navigate('/requests')}
                            className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/25"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Requests
                        </Button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const content = (
        <div className={`h-[calc(100vh-140px)] glass rounded-3xl border border-white/10 flex flex-col overflow-hidden relative ${embedded ? 'h-full border-0 rounded-none bg-transparent' : ''}`}>
            {/* Chat Header */}
            <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/requests')}
                                className="text-gray-400 hover:text-gray-200 lg:hidden"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>

                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-semibold shadow-lg">
                                {otherUser?.name.charAt(0)}
                            </div>

                            <div>
                                <h2 className="font-semibold text-gray-100">{otherUser?.name}</h2>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    {match?.skillOffered} ↔ {match?.skillRequested}
                                </p>
                            </div>
                        </div>

                        {/* Voice Chat Controls */}
                        <div className="flex items-center gap-2">
                            {commStatus?.readOnly ? (
                                <span className="text-xs text-amber-400 flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                                    <Lock className="h-3 w-3" />
                                    Read Only
                                </span>
                            ) : (
                                <>
                                    {voiceStatus === 'idle' && (
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button
                                                size="sm"
                                                onClick={handleStartVoiceChat}
                                                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20"
                                            >
                                                <Phone className="h-4 w-4 mr-2" />
                                                <span className="hidden sm:inline">Voice Chat</span>
                                            </Button>
                                        </motion.div>
                                    )}

                                    {(voiceStatus === 'connecting' || voiceStatus === 'live') && (
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium hidden sm:block ${voiceStatus === 'connecting'
                                                ? 'bg-amber-500/20 text-amber-400 animate-pulse'
                                                : 'bg-emerald-500/20 text-emerald-400'
                                                }`}>
                                                {voiceStatus === 'connecting' ? 'Connecting...' : 'Live'}
                                            </span>

                                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={handleToggleMute}
                                                    className={`${isMuted ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-slate-700/50 border-slate-600 text-gray-300'}`}
                                                >
                                                    {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                                </Button>
                                            </motion.div>

                                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                <Button
                                                    size="sm"
                                                    onClick={handleEndVoiceChat}
                                                    className="bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20"
                                                >
                                                    <PhoneOff className="h-4 w-4" />
                                                </Button>
                                            </motion.div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/30">
                <div className="container mx-auto max-w-4xl">
                    {messages.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-6">
                                <Send className="h-10 w-10 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-200 mb-2">Start the conversation</h3>
                            <p className="text-gray-500">Send a message to begin your skill exchange!</p>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <motion.div
                                key={msg._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0 }}
                                className={`flex ${isOwnMessage(msg) ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] sm:max-w-[70%] relative group ${isOwnMessage(msg) ? 'order-1' : ''}`}>
                                    {/* Message Bubble */}
                                    <div className={`rounded-2xl px-4 py-3 shadow-md ${msg.deleted
                                        ? 'bg-slate-800/50 text-gray-500 italic border border-white/5'
                                        : isOwnMessage(msg)
                                            ? 'bg-gradient-to-br from-indigo-600 to-indigo-500 text-white rounded-tr-none'
                                            : 'bg-slate-700/50 text-gray-200 rounded-tl-none border border-white/5'
                                        }`}>
                                        {/* Text Message */}
                                        {msg.type === 'text' && (
                                            <p className="whitespace-pre-wrap break-words text-sm sm:text-base leading-relaxed">{msg.content}</p>
                                        )}

                                        {/* Image Message */}
                                        {msg.type === 'image' && msg.media && (
                                            <div
                                                className="cursor-pointer overflow-hidden rounded-xl mt-1"
                                                onClick={() => setSelectedImage(`${API_BASE}${msg.media!.url}`)}
                                            >
                                                <img
                                                    src={`${API_BASE}${msg.media.url}`}
                                                    alt="Shared image"
                                                    className="max-w-full max-h-64 object-cover transform hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        )}

                                        {/* Video Message */}
                                        {msg.type === 'video' && msg.media && (
                                            <div className="rounded-xl overflow-hidden mt-1 bg-black/20">
                                                <video
                                                    src={`${API_BASE}${msg.media.url}`}
                                                    controls
                                                    className="max-w-full max-h-64"
                                                />
                                            </div>
                                        )}

                                        {/* Timestamp & Status */}
                                        <div className={`flex items-center gap-1 mt-1.5 text-[10px] sm:text-xs opacity-70 ${isOwnMessage(msg) ? 'text-indigo-100 justify-end' : 'text-gray-400'
                                            }`}>
                                            <span>{formatTime(msg.createdAt)}</span>
                                            {isOwnMessage(msg) && (
                                                msg.status === 'read'
                                                    ? <CheckCheck className="h-3 w-3" />
                                                    : <Check className="h-3 w-3" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Message Menu */}
                                    {!msg.deleted && (
                                        <div className={`absolute top-2 ${isOwnMessage(msg) ? '-left-8' : '-right-8'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 text-gray-500 hover:text-gray-300 rounded-full"
                                                onClick={() => setShowMenu(showMenu === msg._id ? null : msg._id)}
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>

                                            <AnimatePresence>
                                                {showMenu === msg._id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                        className={`absolute z-30 ${isOwnMessage(msg) ? 'right-0' : 'left-0'} top-full mt-1 glass rounded-xl border border-white/10 overflow-hidden min-w-[120px] shadow-xl`}
                                                    >
                                                        {isOwnMessage(msg) && (
                                                            <button
                                                                onClick={() => handleDeleteMessage(msg._id)}
                                                                className="w-full px-3 py-2 text-sm text-left text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                                Delete
                                                            </button>
                                                        )}
                                                        {!isOwnMessage(msg) && (
                                                            <button
                                                                onClick={() => handleReportMessage(msg._id)}
                                                                className="w-full px-3 py-2 text-sm text-left text-amber-400 hover:bg-amber-500/10 flex items-center gap-2 transition-colors"
                                                            >
                                                                <Flag className="h-3 w-3" />
                                                                Report
                                                            </button>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            {!commStatus?.readOnly && (
                <div className="border-t border-white/10 bg-slate-900/50 backdrop-blur-md p-4">
                    <div className="container mx-auto max-w-4xl">
                        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                            {/* File Inputs (hidden) */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                            <input
                                ref={videoInputRef}
                                type="file"
                                accept="video/mp4,video/webm,video/quicktime"
                                className="hidden"
                                onChange={handleVideoUpload}
                            />

                            <div className="flex gap-1 pb-1">
                                {/* Upload Buttons */}
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl h-10 w-10 p-0"
                                    >
                                        <ImageIcon className="h-5 w-5" />
                                    </Button>
                                </motion.div>

                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => videoInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="text-gray-400 hover:text-violet-400 hover:bg-violet-500/10 rounded-xl h-10 w-10 p-0"
                                    >
                                        <Video className="h-5 w-5" />
                                    </Button>
                                </motion.div>
                            </div>

                            {/* Message Input */}
                            <div className="flex-1 min-w-0">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    disabled={isSending || isUploading}
                                    className="w-full bg-slate-800/50 border-slate-600 text-gray-200 placeholder:text-gray-500 rounded-2xl focus:border-indigo-500 h-10"
                                />
                                {/* Safety Notice */}
                                <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1 pl-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    Keep communication in-app for safety.
                                </p>
                            </div>

                            {/* Send Button */}
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="pb-1">
                                <Button
                                    type="submit"
                                    disabled={!newMessage.trim() || isSending || isUploading}
                                    className="bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white rounded-xl h-10 w-10 p-0 shadow-lg shadow-indigo-500/25"
                                >
                                    {isSending || isUploading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Send className="h-5 w-5" />
                                    )}
                                </Button>
                            </motion.div>
                        </form>
                    </div>
                </div>
            )}

            {/* Image Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setSelectedImage(null)}
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-4 right-4 text-white hover:bg-white/10"
                            onClick={() => setSelectedImage(null)}
                        >
                            <X className="h-8 w-8" />
                        </Button>
                        <img
                            src={selectedImage}
                            alt="Full size"
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    return embedded ? content : <DashboardLayout>{content}</DashboardLayout>;
};

export default Chat;
