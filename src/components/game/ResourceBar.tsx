
import type { FC } from 'react';
import { Coins, Star, Award, ShieldHalf } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { LEVEL_UP_XP_THRESHOLD } from '@/lib/constants';
import type { TierInfo } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ResourceBarProps {
  gold: number;
  xp: number;
  level: number;
  playerTierInfo: TierInfo;
  playerDisplayName?: string;
}

const ResourceBar: FC<ResourceBarProps> = ({ gold, xp, level, playerTierInfo, playerDisplayName }) => {
  const nextLevelXp = LEVEL_UP_XP_THRESHOLD(level);
  const xpProgress = nextLevelXp > 0 ? Math.min((xp / nextLevelXp) * 100, 100) : 0;
  const displayNameOrDefault = playerDisplayName || "Nông Dân";

  return (
    <Card className="w-full sticky top-0 z-50 shadow-md">
      <CardContent className="p-2 flex flex-col sm:flex-row justify-between items-center gap-x-2 gap-y-1">

        {/* Player Name & Gold */}
        <div className="flex flex-row items-center justify-center sm:justify-start sm:flex-col sm:items-start order-1 sm:order-1 text-center sm:text-left gap-x-2 sm:gap-x-0">
          <div className="text-sm sm:text-base lg:text-lg font-semibold text-foreground truncate max-w-[100px] sm:max-w-[150px] lg:max-w-[180px]" title={displayNameOrDefault}>
            {displayNameOrDefault}
          </div>
          <div className="flex items-center space-x-1 text-xs sm:text-sm lg:text-base text-muted-foreground">
            <Coins className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-primary" />
            <span className="font-medium">{gold.toLocaleString()}</span>
          </div>
        </div>

        {/* "Happy Farm" Title - Hidden on xs, sm. Visible md+ */}
        <div className="order-3 sm:order-2 text-lg sm:text-xl md:text-2xl font-bold text-primary font-headline hidden md:block">
          Happy Farm
        </div>

        {/* Level, XP, Tier Block */}
        {/* On xs, this is order-2 (middle). On sm+, order-3 (right) */}
        {/* On xs, elements within are selectively hidden */}
        <div className="flex flex-row-reverse sm:flex-row items-center justify-between sm:justify-end w-full sm:w-auto order-2 sm:order-3 gap-x-2 sm:gap-x-3">
          
          {/* Level & XP Block */}
          <div className="flex flex-col items-center sm:items-end">
            {/* Level Display (Always Visible) */}
            <div className="flex items-center space-x-1 text-xs sm:text-sm lg:text-base">
              <Award className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-blue-500" />
              <span className="font-semibold">Cấp: {level}</span>
            </div>

            {/* XP Progress (Hidden on xs) */}
            <div className="hidden sm:flex flex-col items-center sm:items-end mt-0.5 w-full min-w-[60px] sm:min-w-[80px] lg:min-w-[100px] max-w-[100px] sm:max-w-[120px] lg:max-w-[150px]">
              <Progress value={xpProgress} className="h-1 sm:h-1.5 lg:h-2 w-full" />
              <span className="text-[8px] sm:text-[10px] lg:text-xs font-medium text-muted-foreground mt-0.5">
                {xp.toLocaleString()} / {nextLevelXp > 0 ? nextLevelXp.toLocaleString() : "MAX"} XP
              </span>
            </div>
          </div>

          {/* Tier Display (Hidden on xs, sm. Visible md+) */}
          <div className="hidden md:flex items-center">
            <Badge
              variant="outline"
              className={cn(
                "px-1.5 py-0.5 text-[9px] sm:px-2 sm:py-1 sm:text-xs lg:text-sm font-semibold border-current flex items-center gap-1",
                playerTierInfo.colorClass
              )}
            >
              <span className="text-xs sm:text-sm lg:text-lg">{playerTierInfo.icon}</span>
              {playerTierInfo.tierName}
            </Badge>
          </div>
        </div>

      </CardContent>
    </Card>
  );
};

export default ResourceBar;
