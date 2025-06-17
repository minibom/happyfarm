
import type { FC } from 'react';
import { Coins, Star, Award, LogOut } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LEVEL_UP_XP_THRESHOLD } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ResourceBarProps {
  gold: number;
  xp: number;
  level: number;
}

const ResourceBar: FC<ResourceBarProps> = ({ gold, xp, level }) => {
  const { logOut, user } = useAuth();
  const { toast } = useToast();
  const nextLevelXp = LEVEL_UP_XP_THRESHOLD(level);
  const xpProgress = Math.min((xp / nextLevelXp) * 100, 100);

  const handleLogout = async () => {
    try {
      await logOut();
      toast({ title: "Đã Đăng Xuất", description: "Bạn đã đăng xuất thành công." });
    } catch (error) {
      console.error("Logout failed:", error);
      toast({ title: "Đăng Xuất Thất Bại", description: "Không thể đăng xuất. Vui lòng thử lại.", variant: "destructive" });
    }
  };

  return (
    <Card className="w-full sticky top-0 z-50 shadow-md">
      <CardContent className="p-3 flex flex-col sm:flex-row justify-around items-center space-y-3 sm:space-y-0 sm:space-x-4">
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
          <span className="font-semibold">Cấp: {level}</span>
        </div>
        {user && (
          <Button onClick={handleLogout} variant="outline" size="sm" className="sm:ml-auto">
            <LogOut className="mr-2 h-4 w-4" /> Đăng Xuất
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ResourceBar;
