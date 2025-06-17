
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
      <CardContent className="p-3 flex flex-wrap justify-between items-center gap-x-4 gap-y-2">
        <div className="text-xl font-bold text-primary font-headline order-1">
          Happy Farm
        </div>

        <div className="flex items-center space-x-2 text-lg order-2">
          <Coins className="w-7 h-7 text-primary" />
          <span className="font-semibold">{gold}</span>
        </div>
        
        <div className="flex flex-col items-center w-full sm:w-auto sm:min-w-[150px] md:min-w-[200px] order-4 sm:order-3 mt-2 sm:mt-0">
          <div className="flex items-center space-x-2 text-sm sm:text-base w-full justify-center">
            <Star className="w-6 h-6 text-yellow-400" />
            <span className="font-semibold">{xp} / {nextLevelXp} XP</span>
          </div>
          <Progress value={xpProgress} className="h-2.5 w-full mt-0.5" />
        </div>

        <div className="flex items-center space-x-2 text-lg order-3 sm:order-4">
          <Award className="w-7 h-7 text-blue-500" />
          <span className="font-semibold">Cấp: {level}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceBar;
