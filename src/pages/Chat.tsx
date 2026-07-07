import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { api, Message, Match, CommunicationStatus, VoiceSession } from '@/lib/api';
import { io, Socket } from 'socket.io-client';
import {
    Send,
    Image as ImageIcon,
    Video,
    VideoOff,
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

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001';

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
    const [showMenu, setShowMenu] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Call state: 'idle' | 'calling' | 'incoming' | 'live'
    const [callState, setCallState] = useState<'idle' | 'calling' | 'incoming' | 'live'>('idle');
    const [callType, setCallType] = useState<'voice' | 'video'>('voice');
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [incomingCallData, setIncomingCallData] = useState<{ offer: RTCSessionDescriptionInit; socketId: string } | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const socketRef = useRef<Socket | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteStreamRef = useRef<MediaStream | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // Set up Socket.io connection and listeners
    useEffect(() => {
        if (!matchId) return;

        loadChatData();

        // Connect to Socket.io Server
        const socket = io(API_BASE);
        socketRef.current = socket;

        socket.emit('join-room', matchId);

        // Real-time chat events
        socket.on('receive-message', (message: Message) => {
            setMessages(prev => {
                if (prev.some(m => m._id === message._id)) return prev;
                return [...prev, message];
            });
        });

        // WebRTC signaling events
        socket.on('call-made', async ({ offer, socketId, type }) => {
            console.log('Incoming call received of type:', type);
            setIncomingCallData({ offer, socketId });
            setCallType(type);
            setCallState('incoming');
        });

        socket.on('answer-made', async ({ answer }) => {
            console.log('Call answered');
            if (peerConnectionRef.current) {
                await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
                setCallState('live');
            }
        });

        socket.on('ice-candidate-received', async ({ candidate }) => {
            if (peerConnectionRef.current) {
                try {
                    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) {
                    console.error('Error adding ICE candidate:', e);
                }
            }
        });

        socket.on('call-rejected', () => {
            cleanupCall();
            toast({
                title: 'Call Declined',
                description: 'The other participant declined your call.',
                variant: 'destructive',
            });
        });

        socket.on('call-ended', () => {
            cleanupCall();
            toast({
                title: 'Call Ended',
                description: 'The call has been ended by the other participant.',
            });
        });

        socket.on('user-left', () => {
            cleanupCall();
            toast({
                title: 'Peer Disconnected',
                description: 'The other participant left the call.',
            });
        });

        return () => {
            socket.off('receive-message');
            socket.off('call-made');
            socket.off('answer-made');
            socket.off('ice-candidate-received');
            socket.off('call-rejected');
            socket.off('call-ended');
            socket.off('user-left');
            socket.disconnect();
            cleanupCall();
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
            // Polling fallback logs
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

    // --- WebRTC Peer Connection Core Logic ---

    const createPeerConnection = () => {
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' }
            ]
        });

        pc.onicecandidate = (event) => {
            if (event.candidate && socketRef.current && matchId) {
                socketRef.current.emit('ice-candidate', { roomId: matchId, candidate: event.candidate });
            }
        };

        pc.ontrack = (event) => {
            console.log(' ontack event fired');
            if (event.streams && event.streams[0]) {
                remoteStreamRef.current = event.streams[0];
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            }
        };

        peerConnectionRef.current = pc;
        return pc;
    };

    // Caller initiates Voice or Video call
    const startCall = async (type: 'voice' | 'video') => {
        if (!matchId || !socketRef.current) return;

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            toast({
                title: 'Hardware Access Denied',
                description: 'Your browser or device does not support WebRTC media capture.',
                variant: 'destructive',
            });
            return;
        }

        try {
            setCallState('calling');
            setCallType(type);

            // Capture Audio & optional Video
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: type === 'video'
            });

            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            const pc = createPeerConnection();

            // Add local tracks to peer connection
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            // Create Offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            // Send Signaling Offer
            socketRef.current.emit('call-user', { roomId: matchId, offer, type });

            // Create DB session entry (for logging/statistics)
            const response = await api.chat.createVoiceSession(matchId);
            if (response.success && response.data) {
                setVoiceSession(response.data.session);
                await api.chat.joinVoiceSession(response.data.session._id);
            }
        } catch (error) {
            console.error('Call initialization failed:', error);
            cleanupCall();
            toast({
                title: 'Device Access Blocked',
                description: 'Could not access microphone/camera. Please check permissions.',
                variant: 'destructive',
            });
        }
    };

    // Receiver accepts incoming call
    const acceptCall = async () => {
        if (!matchId || !socketRef.current || !incomingCallData) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: callType === 'video'
            });

            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            const pc = createPeerConnection();

            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            await pc.setRemoteDescription(new RTCSessionDescription(incomingCallData.offer));

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socketRef.current.emit('make-answer', { roomId: matchId, answer });

            setCallState('live');

            // Find and register connection to active session in database
            const activeSessionRes = await api.chat.getActiveVoiceSession(matchId);
            if (activeSessionRes.success && activeSessionRes.data?.session) {
                setVoiceSession(activeSessionRes.data.session);
                await api.chat.joinVoiceSession(activeSessionRes.data.session._id);
                await api.chat.updateVoiceSession(activeSessionRes.data.session._id, 'live', 'connected');
            }

            setIncomingCallData(null);
        } catch (error) {
            console.error('Accepting call failed:', error);
            cleanupCall();
            toast({
                title: 'Failed to Connect',
                description: 'An error occurred while linking audio/video streams.',
                variant: 'destructive',
            });
        }
    };

    // Receiver rejects incoming call
    const rejectCall = () => {
        if (socketRef.current && matchId) {
            socketRef.current.emit('reject-call', { roomId: matchId });
        }
        cleanupCall();
    };

    // Either user terminates active call
    const endCall = async () => {
        if (socketRef.current && matchId) {
            socketRef.current.emit('end-call', { roomId: matchId });
        }

        if (voiceSession) {
            try {
                await api.chat.endVoiceSession(voiceSession._id);
            } catch (e) {
                console.error('Failed to update DB voice session termination:', e);
            }
        }

        cleanupCall();
    };

    // Release local hardware & peer connection resources
    const cleanupCall = () => {
        setCallState('idle');
        setIncomingCallData(null);
        setVoiceSession(null);
        setIsMuted(false);
        setIsVideoEnabled(true);

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        if (remoteStreamRef.current) {
            remoteStreamRef.current.getTracks().forEach(track => track.stop());
            remoteStreamRef.current = null;
        }
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
            }
        }
    };

    // --- UI Render Helpers ---

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
            
            {/* --- CALL SCREEN OVERLAYS --- */}
            
            {/* Incoming Call Screen Overlay */}
            <AnimatePresence>
                {callState === 'incoming' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
                    >
                        <div className="relative mb-6">
                            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-2xl relative">
                                {otherUser?.name.charAt(0)}
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-100 mb-2">{otherUser?.name}</h3>
                        <p className="text-gray-400 mb-8 text-sm animate-pulse">
                            Incoming {callType === 'video' ? 'Video' : 'Voice'} Call...
                        </p>

                        <div className="flex gap-4">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    onClick={acceptCall}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-6 rounded-full shadow-lg shadow-emerald-500/20 flex items-center gap-2 text-lg"
                                >
                                    <Phone className="h-6 w-6" /> Accept
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    onClick={rejectCall}
                                    variant="destructive"
                                    className="px-8 py-6 rounded-full shadow-lg flex items-center gap-2 text-lg"
                                >
                                    <PhoneOff className="h-6 w-6" /> Decline
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Outgoing Dialing Screen Overlay */}
            <AnimatePresence>
                {callState === 'calling' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
                    >
                        <div className="relative mb-6">
                            <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-pulse" />
                            <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center text-white text-3xl font-bold shadow-2xl">
                                {otherUser?.name.charAt(0)}
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-100 mb-2">{otherUser?.name}</h3>
                        <p className="text-gray-400 mb-8 text-sm flex items-center gap-2">
                            Calling ({callType === 'video' ? 'Video' : 'Voice'})...
                            <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                        </p>

                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                onClick={endCall}
                                variant="destructive"
                                className="px-8 py-6 rounded-full shadow-lg flex items-center gap-2 text-lg"
                            >
                                <PhoneOff className="h-6 w-6" /> Cancel
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Live WebRTC Call Screen Overlay */}
            <AnimatePresence>
                {callState === 'live' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-40 bg-slate-950 flex flex-col justify-between"
                    >
                        {/* Video Panel */}
                        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                            {callType === 'video' ? (
                                <>
                                    {/* Remote Stream Video */}
                                    <video
                                        ref={remoteVideoRef}
                                        autoPlay
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                    
                                    {/* Local Stream PIP Video */}
                                    <div className="absolute top-4 right-4 w-32 sm:w-44 aspect-[3/4] rounded-2xl overflow-hidden border border-white/20 shadow-2xl z-50 bg-slate-900">
                                        {isVideoEnabled ? (
                                            <video
                                                ref={localVideoRef}
                                                autoPlay
                                                playsInline
                                                muted
                                                className="w-full h-full object-cover scale-x-[-1]"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                                                Camera Off
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                /* Voice Call UI Block (audio Wave) */
                                <div className="text-center py-20">
                                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold shadow-2xl mx-auto mb-8">
                                        {otherUser?.name.charAt(0)}
                                    </div>
                                    <h3 className="text-2xl font-semibold text-gray-100 mb-2">{otherUser?.name}</h3>
                                    
                                    {/* Animated audio waves */}
                                    <div className="flex items-center justify-center gap-1.5 h-10 mt-6">
                                        {[1, 2, 3, 4, 5, 6].map((i) => (
                                            <motion.div
                                                key={i}
                                                animate={{ scaleY: [0.3, 1, 0.3] }}
                                                transition={{
                                                    duration: 0.8,
                                                    repeat: Infinity,
                                                    delay: i * 0.1,
                                                    ease: "easeInOut"
                                                }}
                                                className="w-1.5 bg-indigo-400 rounded-full origin-center"
                                                style={{ height: '32px' }}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-4">Active Voice Call</p>
                                </div>
                            )}

                            {/* Hidden element for audio-only track rendering */}
                            {callType === 'voice' && (
                                <audio ref={remoteVideoRef as any} autoPlay />
                            )}
                        </div>

                        {/* In-Call Glassmorphic Control Bar */}
                        <div className="bg-slate-900/80 backdrop-blur-md p-6 border-t border-white/5 flex items-center justify-center gap-4">
                            {/* Mute Mic */}
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                    onClick={toggleMute}
                                    variant="outline"
                                    className={`w-14 h-14 rounded-full border-0 p-0 ${isMuted ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'}`}
                                >
                                    {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                                </Button>
                            </motion.div>

                            {/* Toggle Camera (Video Only) */}
                            {callType === 'video' && (
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <Button
                                        onClick={toggleVideo}
                                        variant="outline"
                                        className={`w-14 h-14 rounded-full border-0 p-0 ${!isVideoEnabled ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'}`}
                                    >
                                        {!isVideoEnabled ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                                    </Button>
                                </motion.div>
                            )}

                            {/* End Call */}
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                    onClick={endCall}
                                    className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg p-0"
                                >
                                    <PhoneOff className="h-6 w-6" />
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- STANDARD CHAT INTERFACE --- */}

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

                        {/* Call Buttons in Chat Header */}
                        <div className="flex items-center gap-2">
                            {commStatus?.readOnly ? (
                                <span className="text-xs text-amber-400 flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                                    <Lock className="h-3 w-3" />
                                    Read Only
                                </span>
                            ) : (
                                <>
                                    {/* Voice Call Button */}
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                            size="sm"
                                            onClick={() => startCall('voice')}
                                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg"
                                        >
                                            <Phone className="h-4 w-4 mr-1.5" />
                                            <span className="hidden sm:inline">Voice Chat</span>
                                        </Button>
                                    </motion.div>

                                    {/* Video Call Button */}
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                            size="sm"
                                            onClick={() => startCall('video')}
                                            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg"
                                        >
                                            <Video className="h-4 w-4 mr-1.5" />
                                            <span className="hidden sm:inline">Video Call</span>
                                        </Button>
                                    </motion.div>
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
                        messages.map((msg) => (
                            <motion.div
                                key={msg._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
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
                                        
                                        {msg.type === 'text' && (
                                            <p className="whitespace-pre-wrap break-words text-sm sm:text-base leading-relaxed">{msg.content}</p>
                                        )}

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

                                        {msg.type === 'video' && msg.media && (
                                            <div className="rounded-xl overflow-hidden mt-1 bg-black/20">
                                                <video
                                                    src={`${API_BASE}${msg.media.url}`}
                                                    controls
                                                    className="max-w-full max-h-64"
                                                />
                                            </div>
                                        )}

                                        <div className={`flex items-center gap-1 mt-1.5 text-[10px] sm:text-xs opacity-70 ${isOwnMessage(msg) ? 'text-indigo-100 justify-end' : 'text-gray-400'}`}>
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

                            <div className="flex-1 min-w-0">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    disabled={isSending || isUploading}
                                    className="w-full bg-slate-800/50 border-slate-600 text-gray-200 placeholder:text-gray-500 rounded-2xl focus:border-indigo-500 h-10"
                                />
                                <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1 pl-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    Keep communication in-app for safety.
                                </p>
                            </div>

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

