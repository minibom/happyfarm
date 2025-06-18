
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
      <CardContent className="p-3 flex flex-col sm:flex-row justify-between items-center gap-x-6 gap-y-3">
        
        {/* Left Section: Player Name & Gold */}
        <div className="flex flex-col items-center sm:items-start order-1 sm:order-1 text-center sm:text-left">
          <div className="text-lg font-semibold text-foreground truncate max-w-[150px] sm:max-w-[200px]" title={displayNameOrDefault}>
            {displayNameOrDefault}
          </div>
          <div className="flex items-center space-x-1.5 text-md text-muted-foreground">
            <Coins className="w-5 h-5 text-primary" />
            <span className="font-medium">{gold.toLocaleString()}</span>
          </div>
        </div>

        {/* Center Section: Game Title */}
        <div className="order-2 sm:order-2 text-2xl font-bold text-primary font-headline">
          Happy Farm
        </div>

        {/* Right Section: Tier, Level & XP */}
        <div className="flex flex-col sm:flex-row items-center gap-x-4 gap-y-2 order-3 sm:order-3">
          {/* Tier Display */}
          <div className="flex items-center space-x-1.5">
            <Badge 
              variant="outline" 
              className={cn(
                "px-2.5 py-1 text-sm font-semibold border-current flex items-center gap-1.5",
                playerTierInfo.colorClass
              )}
            >
              <span className="text-lg">{playerTierInfo.icon}</span>
              {playerTierInfo.tierName}
            </Badge>
          </div>

          {/* Level & XP Block */}
          <div className="flex flex-col items-center sm:items-end">
            <div className="flex items-center space-x-1.5 text-lg">
              <Award className="w-6 h-6 text-blue-500" />
              <span className="font-semibold">Cấp: {level}</span>
            </div>
            <div className="flex flex-col items-center sm:items-end mt-0.5 w-full min-w-[120px] max-w-[150px]">
              <Progress value={xpProgress} className="h-2 w-full" />
              <span className="text-xs font-medium text-muted-foreground mt-0.5">
                {xp.toLocaleString()} / {nextLevelXp > 0 ? nextLevelXp.toLocaleString() : "MAX"} XP
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceBar;
