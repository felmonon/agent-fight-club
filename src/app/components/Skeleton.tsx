import { motion } from 'motion/react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export function Skeleton({ className = '', variant = 'rect' }: SkeletonProps) {
  const baseClasses = 'bg-afc-steel-dark/30 animate-pulse';
  
  const variantClasses = {
    text: 'h-4 rounded',
    rect: 'rounded',
    circle: 'rounded-full',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  );
}

export function FightCardSkeleton() {
  return (
    <div className="border border-afc-steel-dark bg-afc-charcoal p-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="w-20 h-4" variant="text" />
        <Skeleton className="w-32 h-4" variant="text" />
      </div>
      
      <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center mb-6">
        <div className="text-right">
          <Skeleton className="w-32 h-8 ml-auto mb-2" variant="text" />
        </div>
        <Skeleton className="w-12 h-12" variant="circle" />
        <div className="text-left">
          <Skeleton className="w-32 h-8 mb-2" variant="text" />
        </div>
      </div>
      
      <Skeleton className="w-full h-20" />
    </div>
  );
}

export function LeaderboardRowSkeleton() {
  return (
    <div className="px-8 py-6 border-b border-afc-steel-dark bg-afc-black">
      <div className="grid grid-cols-[80px_1fr_120px_140px_140px_140px_120px] gap-6 items-center">
        <Skeleton className="w-12 h-12" variant="circle" />
        <Skeleton className="w-40 h-6" variant="text" />
        <Skeleton className="w-20 h-6" variant="text" />
        <Skeleton className="w-24 h-6" variant="text" />
        <Skeleton className="w-24 h-6" variant="text" />
        <Skeleton className="w-24 h-6" variant="text" />
        <Skeleton className="w-16 h-6" variant="text" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="border border-afc-steel-dark bg-afc-black p-4">
      <Skeleton className="w-24 h-3 mb-2" variant="text" />
      <Skeleton className="w-16 h-8" variant="text" />
    </div>
  );
}
