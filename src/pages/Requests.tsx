import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { api, Match } from '@/lib/api';
import { TrustBadge } from '@/components/ui/TrustScore';
import { CardSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  MessageCircle,
  Check,
  X,
  Star,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRightLeft,
  MessageSquare,
  Send,
  XCircle,
  Video,
  Mic,
  Calendar,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Celebration } from '@/components/shared/Celebration';

const Requests = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();
  const [requests, setRequests] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState<{ isOpen: boolean; request: Match | null }>({
    isOpen: false,
    request: null,
  });
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await api.matches.getMyRequests();
      if (response.success && response.data) {
        setRequests(response.data.matches);
      }
    } catch (error) {
      console.error('Failed to load requests:', error);
      toast({
        title: 'Failed to load requests',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const acceptedRequests = requests.filter((r) => r.status === 'accepted');
  const completedRequests = requests.filter((r) => r.status === 'completed');

  const handleAccept = async (requestId: string) => {
    try {
      await api.matches.accept(requestId);
      setRequests((prev) =>
        prev.map((r) => (r._id === requestId ? { ...r, status: 'accepted' as const } : r))
      );
      toast({
        title: 'Request Accepted!',
        description: 'You can now chat with your match.',
      });
      setShowCelebration(true);
    } catch (error) {
      toast({
        title: 'Failed to accept',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await api.matches.reject(requestId);
      setRequests((prev) =>
        prev.map((r) => (r._id === requestId ? { ...r, status: 'rejected' as const } : r))
      );
      toast({
        title: 'Request Rejected',
        description: 'The request has been rejected.',
      });
    } catch (error) {
      toast({
        title: 'Failed to reject',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const handleComplete = async (requestId: string) => {
    try {
      await api.matches.complete(requestId);
      const completedRequest = requests.find(r => r._id === requestId);
      setRequests((prev) =>
        prev.map((r) => (r._id === requestId ? { ...r, status: 'completed' as const } : r))
      );
      toast({
        title: 'Exchange Completed!',
        description: 'Please rate your experience.',
      });
      // Open rating modal
      if (completedRequest) {
        setRatingModal({ isOpen: true, request: { ...completedRequest, status: 'completed' } });
      }
    } catch (error) {
      toast({
        title: 'Failed to complete',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const handleRate = async (requestId: string, score: number, comment: string) => {
    try {
      await api.matches.rate(requestId, score, comment);
      await refreshUser(); // Refresh to get updated ratings
      toast({
        title: 'Rating Submitted!',
        description: 'Thank you for your feedback.',
      });
      setRatingModal({ isOpen: false, request: null });
      loadRequests();
    } catch (error) {
      toast({
        title: 'Failed to rate',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const isProvider = (request: Match) => request.provider._id === user?._id;

  // Rating Modal Component
  const RatingModal = () => {
    const [rating, setRating] = useState(0);
    const [hovering, setHovering] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!ratingModal.isOpen || !ratingModal.request) return null;

    const otherUser = isProvider(ratingModal.request)
      ? ratingModal.request.requester
      : ratingModal.request.provider;

    const submitRating = async () => {
      if (rating === 0) {
        toast({
          title: 'Please select a rating',
          description: 'Choose between 1-5 stars',
          variant: 'destructive',
        });
        return;
      }
      setIsSubmitting(true);
      await handleRate(ratingModal.request!._id, rating, comment);
      setIsSubmitting(false);
    };

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setRatingModal({ isOpen: false, request: null })}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="glass rounded-3xl p-8 max-w-md w-full border border-white/10 shadow-elevated"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg shadow-amber-500/30">
                {otherUser.name.charAt(0)}
              </div>
              <h3 className="text-2xl font-bold text-gray-100 mb-1">Rate Your Experience</h3>
              <p className="text-gray-400">How was your skill exchange with {otherUser.name}?</p>
            </div>

            {/* Star Rating */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onMouseEnter={() => setHovering(star)}
                  onMouseLeave={() => setHovering(0)}
                  onClick={() => setRating(star)}
                  className="p-1"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${star <= (hovering || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-600'
                      }`}
                  />
                </motion.button>
              ))}
            </div>

            <Textarea
              placeholder="Share your feedback (optional)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mb-6 bg-slate-800/50 border-slate-600 focus:border-amber-500 text-gray-200 min-h-[100px] rounded-xl"
            />

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setRatingModal({ isOpen: false, request: null })}
                className="flex-1 text-gray-400 hover:text-white hover:bg-white/10"
              >
                Skip
              </Button>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Button
                  onClick={submitRating}
                  disabled={isSubmitting || rating === 0}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Rating
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // Contact Card Component (shown when accepted)
  const ContactCard = ({ otherUser, matchId }: { otherUser: Match['provider']; matchId: string }) => (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20"
    >
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="h-4 w-4 text-emerald-400" />
        <span className="text-sm font-medium text-emerald-400">Communication Unlocked!</span>
      </div>
      <p className="text-gray-400 text-sm mb-3">
        Start chatting with {otherUser.name} to arrange your skill exchange.
      </p>
      <div className="flex gap-2">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
          <Button
            size="sm"
            onClick={() => navigate(`/session/${matchId}`)}
            className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Open Chat
          </Button>
        </motion.div>
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          Text Chat
        </span>
        <span className="flex items-center gap-1">
          <Video className="h-3 w-3" />
          Send Videos
        </span>
        <span className="flex items-center gap-1">
          <Mic className="h-3 w-3" />
          Voice Chat
        </span>
      </div>
    </motion.div>
  );

  const RequestCard = ({ request, index }: { request: Match; index: number }) => {
    const otherUser = isProvider(request) ? request.requester : request.provider;
    const [rating, setRating] = useState(0);
    const [isHovering, setIsHovering] = useState(0);
    const hasRated = isProvider(request)
      ? request.providerRating?.score
      : request.requesterRating?.score;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -4 }}
        className="glass rounded-3xl p-6 shadow-card border border-white/10 hover:border-indigo-500/30 transition-all"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-semibold text-lg shadow-lg ${request.status === 'pending' ? 'from-amber-500 to-orange-500 shadow-amber-500/25' :
              request.status === 'accepted' ? 'from-emerald-500 to-teal-500 shadow-emerald-500/25' :
                'from-violet-500 to-purple-500 shadow-violet-500/25'
              }`}>
              {otherUser.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-100">{otherUser.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <p>{isProvider(request) ? 'Wants to learn:' : 'Can teach you:'} {request.skillRequested}</p>
                <span>•</span>
                <span className="capitalize text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-white/10">
                  {request.status}
                </span>
              </div>
            </div>
          </div>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(request.createdAt).toLocaleDateString()}
          </span>
        </div>

        {request.message && (
          <p className="text-sm text-gray-400 mb-4 italic bg-slate-800/30 rounded-xl p-3 border border-white/5">
            "{request.message}"
          </p>
        )}

        {/* PENDING - Provider can Accept/Reject */}
        {request.status === 'pending' && isProvider(request) && (
          <div className="flex gap-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button
                size="sm"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                onClick={() => handleAccept(request._id)}
              >
                <Check className="h-4 w-4 mr-1" />
                Accept
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button
                size="sm"
                variant="outline"
                className="w-full bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/10"
                onClick={() => handleReject(request._id)}
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </motion.div>
          </div>
        )}

        {/* PENDING - Requester waiting */}
        {request.status === 'pending' && !isProvider(request) && (
          <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-medium">Waiting for response...</span>
          </div>
        )}

        {/* ACCEPTED - Show contact options + Mark Complete */}
        {request.status === 'accepted' && (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Check className="h-4 w-4" />
              <span className="text-sm font-medium">Exchange accepted!</span>
            </div>

            {/* Contact Card */}
            <ContactCard otherUser={otherUser} matchId={request._id} />

            {/* Mark as Completed Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="sm"
                className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg shadow-violet-500/25"
                onClick={() => handleComplete(request._id)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Completed
              </Button>
            </motion.div>
          </div>
        )}

        {/* COMPLETED - Not yet rated */}
        {request.status === 'completed' && !hasRated && (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Exchange completed!</span>
            </div>

            {/* Inline Rating */}
            <div className="text-center p-4 rounded-2xl bg-slate-800/50 border border-white/5">
              <p className="text-sm text-gray-400 mb-3">Rate your experience:</p>
              <div className="flex justify-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setIsHovering(star)}
                    onMouseLeave={() => setIsHovering(0)}
                    className="p-1"
                  >
                    <Star
                      className={`h-6 w-6 transition-all ${star <= (isHovering || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-600'
                        }`}
                    />
                  </motion.button>
                ))}
              </div>
              {rating > 0 && (
                <Button
                  size="sm"
                  onClick={() => handleRate(request._id, rating, '')}
                  className="w-full bg-amber-500 text-white hover:bg-amber-600"
                >
                  Submit {rating} Star{rating > 1 ? 's' : ''}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* COMPLETED & RATED */}
        {request.status === 'completed' && hasRated && (
          <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800/50 text-gray-400 border border-white/5">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            <span className="text-sm font-medium">You rated this exchange</span>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25">
            <ArrowRightLeft className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm font-medium text-amber-400">Connections</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-100 mb-2">
          Swap <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Requests</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Manage your incoming requests and active swaps.
        </p>
      </motion.div>

      <div className="space-y-6">
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="mb-0 glass border border-white/10 p-1.5 rounded-2xl bg-slate-800/50 w-full sm:w-auto inline-flex overflow-x-auto">
            <TabsTrigger
              value="pending"
              className="relative rounded-xl px-6 text-gray-400 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 transition-all duration-300"
            >
              Pending
              {pendingRequests.length > 0 && (
                <span className="ml-2 bg-amber-400 text-amber-900 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                  {pendingRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="accepted"
              className="rounded-xl px-6 text-gray-400 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 transition-all duration-300"
            >
              Accepted
              {acceptedRequests.length > 0 && (
                <span className="ml-2 bg-emerald-400 text-emerald-900 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                  {acceptedRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="rounded-xl px-6 text-gray-400 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 transition-all duration-300"
            >
              Completed
              {completedRequests.length > 0 && (
                <span className="ml-2 bg-violet-400 text-violet-900 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                  {completedRequests.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="outline-none mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <CardSkeleton /> <CardSkeleton /> <CardSkeleton />
                </div>
              ) : pendingRequests.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingRequests.map((request, index) => (
                    <RequestCard key={request._id} request={request} index={index} />
                  ))}
                </div>
              ) : (
                <EmptyState variant="requests" title="No pending requests" description="You have no pending requests at the moment." />
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="accepted" className="outline-none mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <CardSkeleton /> <CardSkeleton />
                </div>
              ) : acceptedRequests.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {acceptedRequests.map((request, index) => (
                    <RequestCard key={request._id} request={request} index={index} />
                  ))}
                </div>
              ) : (
                <EmptyState variant="messages" title="No active swaps" description="Browse skills to find a match!" action={{ label: 'Browse Skills', onClick: () => navigate('/browse') }} />
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="completed" className="outline-none mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <CardSkeleton /> <CardSkeleton />
                </div>
              ) : completedRequests.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedRequests.map((request, index) => (
                    <RequestCard key={request._id} request={request} index={index} />
                  ))}
                </div>
              ) : (
                <EmptyState variant="default" title="No completed exchanges" description="Exchange skills to build your history." />
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Rating Modal */}
      {ratingModal.isOpen && <RatingModal />}

      {/* Celebration Animation */}
      <Celebration isVisible={showCelebration} onComplete={() => setShowCelebration(false)} />
    </DashboardLayout>
  );
};

export default Requests;
