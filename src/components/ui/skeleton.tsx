import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => (
  <div className={cn("animate-pulse bg-slate-700/50 rounded", className)} />
);

export const CardSkeleton = () => (
  <div className="glass rounded-3xl p-6 border border-white/10 space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-4/5" />
    <div className="flex gap-2 pt-2">
      <Skeleton className="h-8 w-24 rounded-full" />
      <Skeleton className="h-8 w-24 rounded-full" />
    </div>
  </div>
);

export const ListItemSkeleton = () => (
  <div className="flex items-center gap-4 p-4 glass rounded-2xl border border-white/10">
    <Skeleton className="w-10 h-10 rounded-xl" />
    <div className="space-y-2 flex-1">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-3 w-1/3" />
    </div>
    <Skeleton className="h-8 w-20 rounded-lg" />
  </div>
);

export const ChatMessageSkeleton = ({ isOwn = false }: { isOwn?: boolean }) => (
  <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
    <div className={cn("max-w-[60%] space-y-2", isOwn ? "items-end" : "items-start")}>
      <Skeleton className={cn("h-16 rounded-2xl", isOwn ? "w-48" : "w-64")} />
      <Skeleton className="h-3 w-16" />
    </div>
  </div>
);

export const StatsSkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="glass rounded-2xl p-4 border border-white/10 space-y-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-24" />
      </div>
    ))}
  </div>
);

export const ProfileSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-6">
      <Skeleton className="w-24 h-24 rounded-3xl" />
      <div className="space-y-3 flex-1">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
    <Skeleton className="h-24 w-full rounded-2xl" />
  </div>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3">
    <div className="flex gap-4 p-3 border-b border-white/10">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/4" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 p-3">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    ))}
  </div>
);

export default Skeleton;
