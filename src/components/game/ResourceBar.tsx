import type { FC } from 'react';
import { Coins, Star, Award } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { LEVEL_UP_XP_THRESHOLD } from '@/lib/constants';

interface ResourceBarProps {
  gold: number;
  xp: number;
  level: number;
}

const ResourceBar: FC<ResourceBarProps> = ({ gold, xp, level }) => {
  const nextLevelXp = LEVEL_UP_XP_THRESHOLD(level);
  const xpProgress = Math.min((xp / nextLevelXp) * 100, 100);

  return (
    <Card className="w-full sticky top-0 z-50 shadow-md">
      <CardContent className="p-4 flex flex-col sm:flex-row justify-around items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center space-x-2 text-lg">
          <Coins className="w-7 h-7 text-primary" />
          <span className="font-semibold">{gold}</span>
        </div>
        <div className="flex flex-col items-center w-full sm:w-1/3 max-w-xs">
          <div className="flex items-center space-x-2 text-lg w-full justify-center">
            <Star className="w-7 h-7 text-yellow-400" />
            <span className="font-semibold">{xp} / {nextLevelXp} XP</span>
          </div>
          <Progress value={xpProgress} className="h-3 w-full mt-1" />
        </div>
        <div className="flex items-center space-x-2 text-lg">
          <Award className="w-7 h-7 text-blue-500" />
          <span className="font-semibold">Level: {level}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceBar;
