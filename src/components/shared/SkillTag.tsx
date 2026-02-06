import { cn } from '@/lib/utils';
import { Skill } from '@/data/mockData';

interface SkillTagProps {
  skill: Skill;
  variant?: 'offered' | 'wanted' | 'default';
  showLevel?: boolean;
  onRemove?: () => void;
}

const SkillTag = ({ skill, variant = 'default', showLevel = false, onRemove }: SkillTagProps) => {
  const levelColors = {
    Beginner: 'bg-success/10 text-success',
    Intermediate: 'bg-warning/10 text-warning',
    Expert: 'bg-primary/10 text-primary',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
        variant === 'offered' && 'bg-primary/10 text-primary',
        variant === 'wanted' && 'bg-accent/10 text-accent',
        variant === 'default' && 'bg-muted text-muted-foreground'
      )}
    >
      {skill.name}
      {showLevel && (
        <span className={cn('text-xs px-1.5 py-0.5 rounded-full', levelColors[skill.level])}>
          {skill.level}
        </span>
      )}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:bg-foreground/10 rounded-full p-0.5 transition-colors"
        >
          <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
            <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </span>
  );
};

export default SkillTag;
