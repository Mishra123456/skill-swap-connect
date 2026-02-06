import { User } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import SkillTag from './SkillTag';
import { ArrowRightLeft } from 'lucide-react';

interface UserCardProps {
  user: User;
  onRequestSwap?: () => void;
}

const UserCard = ({ user, onRequestSwap }: UserCardProps) => {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all duration-300 border border-border/50">
      <div className="flex items-start gap-4 mb-4">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-14 h-14 rounded-full bg-muted"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{user.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{user.bio}</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Skills Offered</p>
          <div className="flex flex-wrap gap-1.5">
            {user.skillsOffered.slice(0, 3).map((skill) => (
              <SkillTag key={skill.id} skill={skill} variant="offered" />
            ))}
            {user.skillsOffered.length > 3 && (
              <span className="text-xs text-muted-foreground self-center">
                +{user.skillsOffered.length - 3} more
              </span>
            )}
          </div>
        </div>
        
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Skills Wanted</p>
          <div className="flex flex-wrap gap-1.5">
            {user.skillsWanted.slice(0, 3).map((skill) => (
              <SkillTag key={skill.id} skill={skill} variant="wanted" />
            ))}
            {user.skillsWanted.length > 3 && (
              <span className="text-xs text-muted-foreground self-center">
                +{user.skillsWanted.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {onRequestSwap && (
        <Button onClick={onRequestSwap} className="w-full" size="sm">
          <ArrowRightLeft className="h-4 w-4 mr-2" />
          Request Skill Swap
        </Button>
      )}
    </div>
  );
};

export default UserCard;
