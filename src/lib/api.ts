const API_BASE_URL = 'http://localhost:5001/api';

interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: Array<{ msg: string; path: string }>;
}

const getAuthToken = (): string | null => {
    return localStorage.getItem('token');
};

const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Request failed');
    }
    return data;
};

const authHeaders = (): HeadersInit => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

export const api = {
    auth: {
        register: async (name: string, email: string, password: string, defaultRole: 'learner' | 'mentor' = 'learner') => {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, defaultRole }),
            });
            return handleResponse<{ user: User; token: string }>(response);
        },

        login: async (email: string, password: string) => {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            return handleResponse<{ user: User; token: string }>(response);
        },

        getMe: async () => {
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: authHeaders(),
            });
            return handleResponse<{ user: User }>(response);
        },
    },

    users: {
        getProfile: async () => {
            const response = await fetch(`${API_BASE_URL}/users/profile`, {
                headers: authHeaders(),
            });
            return handleResponse<{ user: User }>(response);
        },

        updateProfile: async (data: { name?: string; bio?: string; location?: string; privacySettings?: { isIncognito?: boolean; allowRequestsFrom?: string; showOnlineStatus?: boolean } }) => {
            const response = await fetch(`${API_BASE_URL}/users/profile`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify(data),
            });
            return handleResponse<{ user: User }>(response);
        },

        addSkillOffered: async (skill: string) => {
            const response = await fetch(`${API_BASE_URL}/users/skills/offered`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ skill }),
            });
            return handleResponse<{ skillsOffered: string[] }>(response);
        },

        removeSkillOffered: async (skill: string) => {
            const response = await fetch(`${API_BASE_URL}/users/skills/offered/${encodeURIComponent(skill)}`, {
                method: 'DELETE',
                headers: authHeaders(),
            });
            return handleResponse<{ skillsOffered: string[] }>(response);
        },

        addSkillWanted: async (skill: string) => {
            const response = await fetch(`${API_BASE_URL}/users/skills/wanted`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ skill }),
            });
            return handleResponse<{ skillsWanted: string[] }>(response);
        },

        removeSkillWanted: async (skill: string) => {
            const response = await fetch(`${API_BASE_URL}/users/skills/wanted/${encodeURIComponent(skill)}`, {
                method: 'DELETE',
                headers: authHeaders(),
            });
            return handleResponse<{ skillsWanted: string[] }>(response);
        },

        getAll: async (page = 1, limit = 10) => {
            const response = await fetch(`${API_BASE_URL}/users?page=${page}&limit=${limit}`, {
                headers: authHeaders(),
            });
            return handleResponse<{ users: User[]; pagination: Pagination }>(response);
        },

        getById: async (id: string) => {
            const response = await fetch(`${API_BASE_URL}/users/${id}`, {
                headers: authHeaders(),
            });
            return handleResponse<{ user: User }>(response);
        },
    },

    matches: {
        find: async (mode?: 'mentor' | 'learner') => {
            const params = new URLSearchParams();
            if (mode) params.append('mode', mode);

            const response = await fetch(`${API_BASE_URL}/matches/find?${params}`, {
                headers: authHeaders(),
            });
            return handleResponse<{ matches: MatchResult[] }>(response);
        },

        sendRequest: async (providerId: string, skillRequested: string, skillOffered: string, message?: string) => {
            const response = await fetch(`${API_BASE_URL}/matches/request`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ providerId, skillRequested, skillOffered, message }),
            });
            return handleResponse<{ match: Match }>(response);
        },

        getMyRequests: async (status?: string, type?: 'sent' | 'received') => {
            const params = new URLSearchParams();
            if (status) params.append('status', status);
            if (type) params.append('type', type);
            const response = await fetch(`${API_BASE_URL}/matches/requests?${params}`, {
                headers: authHeaders(),
            });
            return handleResponse<{ matches: Match[] }>(response);
        },

        getById: async (id: string) => {
            const response = await fetch(`${API_BASE_URL}/matches/requests/${id}`, {
                headers: authHeaders(),
            });
            return handleResponse<{ match: Match }>(response);
        },

        accept: async (id: string) => {
            const response = await fetch(`${API_BASE_URL}/matches/requests/${id}/accept`, {
                method: 'PATCH',
                headers: authHeaders(),
            });
            return handleResponse<{ match: Match }>(response);
        },

        reject: async (id: string) => {
            const response = await fetch(`${API_BASE_URL}/matches/requests/${id}/reject`, {
                method: 'PATCH',
                headers: authHeaders(),
            });
            return handleResponse(response);
        },

        complete: async (id: string) => {
            const response = await fetch(`${API_BASE_URL}/matches/requests/${id}/complete`, {
                method: 'PATCH',
                headers: authHeaders(),
            });
            return handleResponse<{ match: Match }>(response);
        },

        rate: async (id: string, score: number, comment?: string) => {
            const response = await fetch(`${API_BASE_URL}/matches/requests/${id}/rate`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ score, comment }),
            });
            return handleResponse<{ match: Match }>(response);
        },

        cancel: async (id: string) => {
            const response = await fetch(`${API_BASE_URL}/matches/requests/${id}`, {
                method: 'DELETE',
                headers: authHeaders(),
            });
            return handleResponse(response);
        },
    },

    chat: {
        getCommunicationStatus: async (matchId: string) => {
            const response = await fetch(`${API_BASE_URL}/chat/match/${matchId}/status`, {
                headers: authHeaders(),
            });
            return handleResponse<{
                match: Match;
                communicationStatus: CommunicationStatus;
                activeVoiceSession?: VoiceSessionInfo | null;
            }>(response);
        },

        getMessages: async (matchId: string) => {
            const response = await fetch(`${API_BASE_URL}/chat/match/${matchId}/messages`, {
                headers: authHeaders(),
            });
            return handleResponse<{ messages: Message[], communicationStatus: CommunicationStatus }>(response);
        },

        sendMessage: async (matchId: string, content: string) => {
            const response = await fetch(`${API_BASE_URL}/chat/match/${matchId}/messages`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ content })
            });
            return handleResponse<{ message: Message }>(response);
        },

        uploadImage: async (matchId: string, file: File) => {
            const formData = new FormData();
            formData.append('image', file);

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/chat/match/${matchId}/upload/image`, {
                method: 'POST',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData,
            });
            return handleResponse<{ message: Message }>(response);
        },

        uploadVideo: async (matchId: string, file: File) => {
            const formData = new FormData();
            formData.append('video', file);

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/chat/match/${matchId}/upload/video`, {
                method: 'POST',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData,
            });
            return handleResponse<{ message: Message }>(response);
        },

        reportMessage: async (messageId: string, reason: string) => {
            const response = await fetch(`${API_BASE_URL}/chat/message/${messageId}/report`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ reason }),
            });
            return handleResponse(response);
        },

        deleteMessage: async (messageId: string) => {
            const response = await fetch(`${API_BASE_URL}/chat/message/${messageId}`, {
                method: 'DELETE',
                headers: authHeaders(),
            });
            return handleResponse(response);
        },

        getActiveVoiceSession: async (matchId: string) => {
            const response = await fetch(`${API_BASE_URL}/chat/match/${matchId}/voice`, {
                headers: authHeaders(),
            });
            return handleResponse<{ session: VoiceSession | null }>(response);
        },

        createVoiceSession: async (matchId: string) => {
            const response = await fetch(`${API_BASE_URL}/chat/match/${matchId}/voice`, {
                method: 'POST',
                headers: authHeaders(),
            });
            return handleResponse<{ session: VoiceSession }>(response);
        },

        joinVoiceSession: async (sessionId: string) => {
            const response = await fetch(`${API_BASE_URL}/chat/voice/session/${sessionId}/join`, {
                method: 'POST',
                headers: authHeaders(),
            });
            return handleResponse<{ session: VoiceSession, token: string }>(response);
        },

        updateVoiceSession: async (sessionId: string, status?: string, connectionState?: string) => {
            const response = await fetch(`${API_BASE_URL}/chat/voice/session/${sessionId}`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ status, connectionState }),
            });
            return handleResponse<{ session: VoiceSession }>(response);
        },

        endVoiceSession: async (sessionId: string) => {
            const response = await fetch(`${API_BASE_URL}/chat/voice/session/${sessionId}/end`, {
                method: 'POST',
                headers: authHeaders(),
            });
            return handleResponse<{ session: VoiceSession }>(response);
        },
    },

    sessions: {
        get: async (matchId: string) => {
            const response = await fetch(`${API_BASE_URL}/sessions/${matchId}`, {
                headers: authHeaders()
            });
            return handleResponse<{ session: Session }>(response);
        },
        toggleTimer: async (matchId: string, action: 'start' | 'pause') => {
            const response = await fetch(`${API_BASE_URL}/sessions/${matchId}/timer`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ action })
            });
            return handleResponse<{ session: Session }>(response);
        },
        updateNotes: async (matchId: string, notes: string) => {
            const response = await fetch(`${API_BASE_URL}/sessions/${matchId}/notes`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ notes })
            });
            return handleResponse<{ session: Session }>(response);
        },
        addResource: async (matchId: string, data: { title: string; type: string; url: string }) => {
            const response = await fetch(`${API_BASE_URL}/sessions/${matchId}/resources`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(data)
            });
            return handleResponse<{ session: Session }>(response);
        },
        updateMilestone: async (matchId: string, data: any) => {
            const response = await fetch(`${API_BASE_URL}/sessions/${matchId}/milestones`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(data)
            });
            return handleResponse<{ session: Session }>(response);
        },
        updatePlan: async (matchId: string, data: any) => {
            const response = await fetch(`${API_BASE_URL}/sessions/${matchId}/plan`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(data)
            });
            return handleResponse<{ session: Session }>(response);
        },
        updateWhiteboard: async (matchId: string, snapshot: string) => {
            const response = await fetch(`${API_BASE_URL}/sessions/${matchId}/whiteboard`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ snapshot })
            });
            return handleResponse<{ session: Session }>(response);
        },
        acceptAgreement: async (matchId: string, data: any) => {
            const response = await fetch(`${API_BASE_URL}/sessions/${matchId}/agreement`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(data)
            });
            return handleResponse<{ session: Session }>(response);
        },
        getHistory: async (matchId: string) => {
            const response = await fetch(`${API_BASE_URL}/sessions/${matchId}/history`, {
                headers: authHeaders()
            });
            return handleResponse<{ history: any[] }>(response);
        },
        addTask: async (matchId: string, title: string) => {
            const response = await fetch(`${API_BASE_URL}/sessions/${matchId}/tasks`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ title })
            });
            return handleResponse<{ session: Session }>(response);
        },
        updateTask: async (matchId: string, taskId: string, status: 'pending' | 'completed') => {
            const response = await fetch(`${API_BASE_URL}/sessions/${matchId}/tasks/${taskId}`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ status })
            });
            return handleResponse<{ session: Session }>(response);
        },
        complete: async (matchId: string, feedback: any) => {
            const response = await fetch(`${API_BASE_URL}/sessions/${matchId}/complete`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ feedback })
            });
            return handleResponse<{ session: Session }>(response);
        },
        updateProgress: async (matchId: string, progress: number) => {
            const response = await fetch(`${API_BASE_URL}/sessions/${matchId}/progress`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ progress })
            });
            return handleResponse<{ session: Session }>(response);
        },
        updateMentorNotes: async (matchId: string, notes: string) => {
            const response = await fetch(`${API_BASE_URL}/sessions/${matchId}/mentor-notes`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ notes })
            });
            return handleResponse<{ session: Session }>(response);
        }
    },



    health: {
        check: async () => {
            const response = await fetch(`${API_BASE_URL}/health`);
            return handleResponse<{ status: string; timestamp: string }>(response);
        },
    },
};

export interface Feedback {
    helpful: boolean;
    whatWentWell: string;
    issues: string;
    submittedAt: string;
}

export interface Session {
    _id: string;
    matchId: string;
    status: 'active' | 'paused' | 'completed';
    startTime: string;
    accumulatedTime: number;
    progress: number;
    lastActive: string;
    notes: string;
    mentorNotes?: string;
    resources: {
        _id: string;
        title: string;
        type: 'link' | 'file' | 'video' | 'other';
        url: string;
        addedBy: { _id: string; name: string } | string;
        createdAt: string;
    }[];
    tasks: {
        _id: string;
        title: string;
        status: 'pending' | 'completed';
        createdBy: { _id: string; name: string } | string;
        createdAt: string;
    }[];
    milestones: {
        _id: string;
        title: string;
        description?: string;
        status: 'pending' | 'in_progress' | 'completed';
        deadline?: string;
        completedAt?: string;
    }[];
    weeklyPlan: {
        _id: string;
        weekNumber: number;
        goals: string[];
        outcomes?: string;
        status: 'planned' | 'active' | 'completed';
    }[];
    whiteboard?: {
        snapshot: string;
        updatedAt: string;
    };
    agreement: {
        goals?: string;
        commitment?: string;
        guidelines?: string;
        acceptedBy: string[]; // User IDs
        status: 'pending' | 'active';
    };
    health: {
        status: 'good' | 'attention' | 'risk';
        score: number;
        lastUpdated: string;
    };
    history: {
        action: string;
        details: string;
        performedBy: { _id: string; name: string } | string;
        createdAt: string;
    }[];
    createdAt: string;
    updatedAt: string;
}

export interface User {
    _id: string;
    name: string;
    email: string;
    bio: string;
    location: string;
    skillsOffered: string[];
    skillsWanted: string[];
    averageRating: number;
    totalRatings: number;
    createdAt: string;
    updatedAt: string;
    trustLevel?: 'new' | 'reliable' | 'verified';
    defaultRole?: 'learner' | 'mentor';
    mentorProfile?: {
        experienceYears: number;
        teachingStyle: string;
        availability: string;
        linkedinProfile: string;
        certifications: string[];
        bio: string;
    };
    stats?: {
        totalMinutesLearned: number;
        totalMinutesTaught: number;
        sessionsCompleted: number;
    };
    privacySettings?: {
        isIncognito: boolean;
        allowRequestsFrom: 'everyone' | 'verified' | 'none';
        showOnlineStatus: boolean;
    };
}


export interface Match {
    _id: string;
    requester: User;
    provider: User;
    skillRequested: string;
    skillOffered: string;
    status: 'pending' | 'accepted' | 'rejected' | 'completed';
    message: string;
    requesterRating?: { score: number; comment: string; ratedAt: string };
    providerRating?: { score: number; comment: string; ratedAt: string };
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface MatchResult {
    user: User;
    matchingSkills: string[];
    mutualInterest: string[];
    isMutual: boolean;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export interface Message {
    _id: string;
    matchId: string;
    senderId: { _id: string; name: string } | string;
    type: 'text' | 'image' | 'video' | 'system';
    content?: string;
    media?: {
        filename: string;
        originalName: string;
        mimeType: string;
        size: number;
        url: string;
    };
    status: 'sent' | 'delivered' | 'read';
    reported: boolean;
    deleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CommunicationStatus {
    allowed: boolean;
    readOnly: boolean;
}

export interface VoiceSessionInfo {
    sessionId: string;
    roomId: string;
    status: 'idle' | 'connecting' | 'live' | 'ended';
}

export interface VoiceSession {
    _id: string;
    matchId: string;
    roomId: string;
    initiatedBy: string;
    participants: {
        userId: string;
        joinedAt: string;
        leftAt?: string;
        status: 'connecting' | 'connected' | 'disconnected' | 'muted';
    }[];
    status: 'idle' | 'connecting' | 'live' | 'ended';
    startedAt?: string;
    endedAt?: string;
    duration?: number;
    createdAt: string;
    updatedAt: string;
}

export default api;

