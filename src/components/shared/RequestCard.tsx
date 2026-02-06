import { SwapRequest, currentUser } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RequestCardProps {
  request: SwapRequest;
  onAccept?: () => void;
  onReject?: () => void;
}

const RequestCard = ({ request, onAccept, onReject }: RequestCardProps) => {
  const isIncoming = request.toUser.id === currentUser.id;
  const otherUser = isIncoming ? request.fromUser : request.toUser;

  const statusStyles = {
    pending: 'bg-warning/10 text-warning',
    accepted: 'bg-success/10 text-success',
    completed: 'bg-primary/10 text-primary',
    rejected: 'bg-destructive/10 text-destructive',
  };

  const statusLabels = {
    pending: 'Pending',
    accepted: 'Accepted',
    completed: 'Completed',
    rejected: 'Rejected',
  };

  return (
    <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50 hover:shadow-elevated transition-all duration-300">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <img
            src={otherUser.avatar}
            alt={otherUser.name}
            className="w-12 h-12 rounded-full bg-muted"
          />
          <div>
            <h4 className="font-semibold text-foreground">{otherUser.name}</h4>
            <p className="text-xs text-muted-foreground">
              {isIncoming ? 'Incoming request' : 'Outgoing request'}
            </p>
          </div>
        </div>
        <span className={cn('px-3 py-1 rounded-full text-xs font-medium', statusStyles[request.status])}>
          {statusLabels[request.status]}
        </span>
      </div>

      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl mb-4">
        <div className="flex-1 text-center">
          <p className="text-xs text-muted-foreground mb-1">
            {isIncoming ? 'They offer' : 'You offer'}
          </p>
          <p className="text-sm font-medium text-foreground">
            {isIncoming ? request.skillOffered.name : request.skillWanted.name}
          </p>
        </div>
        <ArrowLeftRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 text-center">
          <p className="text-xs text-muted-foreground mb-1">
            {isIncoming ? 'They want' : 'You want'}
          </p>
          <p className="text-sm font-medium text-foreground">
            {isIncoming ? request.skillWanted.name : request.skillOffered.name}
          </p>
        </div>
      </div>

      {request.status === 'pending' && isIncoming && (
        <div className="flex gap-2">
          <Button onClick={onAccept} size="sm" className="flex-1">
            <Check className="h-4 w-4 mr-1" />
            Accept
          </Button>
          <Button onClick={onReject} variant="outline" size="sm" className="flex-1">
            <X className="h-4 w-4 mr-1" />
            Reject
          </Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-3">
        Created on {new Date(request.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
};

export default RequestCard;
