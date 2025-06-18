
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
}

const ResourceBar: FC<ResourceBarProps> = ({ gold, xp, level, playerTierInfo }) => {
  const nextLevelXp = LEVEL_UP_XP_THRESHOLD(level);
  const xpProgress = nextLevelXp > 0 ? Math.min((xp / nextLevelXp) * 100, 100) : 0;

  return (
    <Card className="w-full sticky top-0 z-50 shadow-md">
      <CardContent className="p-3 flex flex-col sm:flex-row justify-between items-center gap-x-4 gap-y-2">
        {/* Left Side: Title & Gold */}
        <div className="flex items-center gap-4 order-1 sm:order-1">
          <div className="text-xl font-bold text-primary font-headline">
            Happy Farm
          </div>
          <div className="flex items-center space-x-1.5 text-lg">
            <Coins className="w-6 h-6 text-primary" />
            <span className="font-semibold">{gold.toLocaleString()}</span>
          </div>
        </div>

        {/* Right Side: Tier, Level & XP */}
        <div className="flex flex-col sm:flex-row items-center gap-4 order-2 sm:order-2 mt-2 sm:mt-0">
          {/* Tier Display */}
          <div className="flex items-center space-x-1.5 text-lg">
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
            <div className="flex flex-col items-center sm:items-end mt-0.5 w-full min-w-[150px] max-w-[180px]">
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
