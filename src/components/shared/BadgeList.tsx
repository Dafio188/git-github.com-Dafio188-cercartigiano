import React from 'react';
import { BadgeType } from '../../types';
import { TRUST_BADGES } from '../../constants';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '../../lib/utils';

interface BadgeListProps {
  badges: BadgeType[];
  className?: string;
  showLabels?: boolean;
}

export function BadgeList({ badges, className, showLabels = true }: BadgeListProps) {
  if (!badges || badges.length === 0) return null;

  return (
    <TooltipProvider>
      <div className={cn("flex flex-wrap gap-2", className)}>
        {badges.map((badgeId) => {
          const badgeMeta = TRUST_BADGES.find(b => b.id === badgeId);
          if (!badgeMeta) return null;

          const Icon = badgeMeta.icon;

          return (
            <React.Fragment key={badgeId}>
              <Tooltip>
                <TooltipTrigger>
                  <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-default",
                    badgeMeta.bg,
                    badgeMeta.color
                  )}>
                    <Icon className="w-3.5 h-3.5" />
                    {showLabels && <span className="text-[10px] font-black uppercase tracking-wider">{badgeMeta.label}</span>}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-white border-[#D2D2D7]/30 shadow-xl rounded-xl p-3 max-w-[200px]">
                  <div className="space-y-1">
                    <p className="text-xs font-black text-[#1D1D1F]">{badgeMeta.label}</p>
                    <p className="text-[10px] font-bold text-[#86868B] leading-relaxed">{badgeMeta.description}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </React.Fragment>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
