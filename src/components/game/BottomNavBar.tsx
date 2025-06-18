
'use client';

import { type FC, useMemo } from 'react'; 
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PackageSearch, ShoppingCart, Sprout, Hand, Settings, LogOut, ShieldCheck, UserCircle2, Lock, MessageSquare, Library, ListOrdered } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { SeedId, Inventory, CropId, CropDetails } from '@/types';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { getPlayerTierInfo } from '@/lib/constants';

interface BottomNavBarProps {
  onOpenInventory: () => void;
  onOpenMarket: () => void;
  onOpenProfile: () => void;
  onOpenChatModal: () => void;
  onOpenLeaderboard: () => void; // New prop for leaderboard
  onSetPlantMode: (seedId: SeedId) => void;
  onToggleHarvestMode: () => void;
  onClearAction: () => void;
  currentAction: 'planting' | 'harvesting' | 'none';
  selectedSeed?: SeedId;
  availableSeeds: SeedId[];
  inventory: Inventory;
  cropData: Record<CropId, CropDetails> | null;
  playerTier: number;
}

const BottomNavBar: FC<BottomNavBarProps> = ({
  onOpenInventory,
  onOpenMarket,
  onOpenProfile,
  onOpenChatModal,
  onOpenLeaderboard, // Use new prop
  onSetPlantMode,
  onToggleHarvestMode,
  onClearAction,
  currentAction,
  selectedSeed,
  availableSeeds,
  inventory,
  cropData,
  playerTier,
}) => {
  const router = useRouter();
  const { user, logOut } = useAuth(); 
  const { toast } = useToast();

  const isAdmin = useMemo(() => {
    if (!user) return false;
    const adminUidsString = process.env.NEXT_PUBLIC_ADMIN_UIDS || '';
    const adminUids = adminUidsString.split(',').map(uid => uid.trim()).filter(uid => uid);
    return adminUids.includes(user.uid);
  }, [user]);

  const getCropInfo = (seedId: SeedId) => {
    if (!cropData) return null;
    const cropId = seedId.replace('Seed', '') as CropId;
    return cropData[cropId];
  };

  const selectedSeedInfo = selectedSeed && currentAction === 'planting' ? getCropInfo(selectedSeed) : null;
  const selectedSeedName = selectedSeedInfo?.name;

  const handleAdminNavigation = () => {
    router.push('/admin/items');
  };

  const handleLogout = async () => {
    try {
      await logOut();
      toast({ title: "Đã Đăng Xuất", description: "Bạn đã đăng xuất thành công." });
      router.push('/login');
    } catch (error) {
      console.error("Logout failed:", error);
      toast({ title: "Đăng Xuất Thất Bại", description: "Không thể đăng xuất. Vui lòng thử lại.", variant: "destructive" });
    }
  };

  if (!cropData) {
    return null;
  }

  const buttonBaseClass = "p-2 h-auto w-[72px] rounded-lg shadow-md flex flex-col items-center justify-center gap-1";
  const iconClass = "h-5 w-5";
  const labelClass = "text-[10px] leading-none";

  return (
    <TooltipProvider>
      <div className="fixed bottom-4 right-1/2 translate-x-1/2 sm:right-4 sm:translate-x-0 z-50">
        <div className="flex flex-row gap-2 p-2 bg-card border border-border rounded-lg shadow-lg">
          
           <div className="block md:hidden">
            <Tooltip>
                <TooltipTrigger asChild>
                <Button
                    onClick={onOpenChatModal}
                    variant="outline"
                    className={cn(buttonBaseClass)}
                    aria-label="Mở Trò Chuyện"
                >
                    <MessageSquare className={iconClass} />
                    <span className={labelClass}>Chat</span>
                </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                <p>Mở Trò Chuyện</p>
                </TooltipContent>
            </Tooltip>
           </div>
          
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      buttonBaseClass,
                      currentAction === 'planting' && "bg-primary hover:bg-primary/90 text-primary-foreground"
                    )}
                    aria-label="Trồng Hạt Giống"
                  >
                    {currentAction === 'planting' && selectedSeedInfo?.icon ? (
                        <span className="text-xl h-5 flex items-center justify-center">{selectedSeedInfo.icon}</span>
                    ) : (
                        <Sprout className={iconClass} />
                    )}
                    <span className={labelClass}>Trồng</span>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{currentAction === 'planting' && selectedSeedName ? `Đang trồng: ${selectedSeedName}` : 'Chọn Hạt Giống Để Trồng'}</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" side="top" className="mb-2 max-h-72 overflow-y-auto">
              {availableSeeds.length > 0 ? (
                availableSeeds.map(seedId => {
                  const crop = getCropInfo(seedId);
                  if (!crop) return null;
                  const isSeedLocked = playerTier < crop.unlockTier;
                  const requiredTierName = isSeedLocked ? getPlayerTierInfo( (crop.unlockTier -1) * 10 +1 ).tierName : "";

                  return (
                    <DropdownMenuItem
                        key={seedId}
                        onClick={() => onSetPlantMode(seedId)}
                        disabled={!crop || isSeedLocked}
                        className={cn(isSeedLocked && "opacity-60")}
                    >
                      {crop?.icon && <span className="mr-2 text-lg">{crop.icon}</span>}
                       Trồng {crop?.name || seedId.replace('Seed','')} ({inventory[seedId]})
                      {isSeedLocked && <Lock className="ml-auto h-3 w-3 text-muted-foreground" />}
                      {isSeedLocked && <span className="ml-1 text-xs text-muted-foreground">(Bậc {crop.unlockTier})</span>}
                    </DropdownMenuItem>
                  );
                })
              ) : (
                <DropdownMenuItem disabled>Không có hạt giống để trồng</DropdownMenuItem>
              )}
              {currentAction === 'planting' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onClearAction} className="text-destructive">
                     Hủy Chế Độ Trồng
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onToggleHarvestMode}
                variant="outline"
                className={cn(
                  buttonBaseClass,
                  currentAction === 'harvesting' && "bg-primary hover:bg-primary/90 text-primary-foreground gentle-pulse"
                )}
                aria-label="Thu Hoạch"
              >
                <Hand className={iconClass} />
                <span className={labelClass}>Thu Hoạch</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Bật/Tắt Chế Độ Thu Hoạch</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onOpenInventory}
                variant="outline"
                className={cn(buttonBaseClass, "bg-secondary hover:bg-secondary/90")}
                aria-label="Mở Kho"
              >
                <PackageSearch className={iconClass} />
                <span className={labelClass}>Kho</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Kho Đồ</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onOpenMarket}
                variant="outline"
                className={cn(buttonBaseClass, "bg-accent hover:bg-accent/90 text-accent-foreground")}
                aria-label="Mở Chợ"
              >
                <ShoppingCart className={iconClass} />
                <span className={labelClass}>Chợ</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Chợ</p>
            </TooltipContent>
          </Tooltip>

         <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onOpenLeaderboard} // Call new handler
                variant="outline"
                className={cn(buttonBaseClass)}
                aria-label="Bảng Xếp Hạng"
              >
                <ListOrdered className={iconClass} />
                <span className={labelClass}>BXH</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Bảng Xếp Hạng</p>
            </TooltipContent>
          </Tooltip>


          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                  onClick={onOpenProfile}
                  variant="outline"
                  className={cn(buttonBaseClass)}
                  aria-label="Thông tin Người chơi"
              >
                  <UserCircle2 className={iconClass} />
                  <span className={labelClass}>Hồ Sơ</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
                <p>Thông tin Người chơi</p>
            </TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                 <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(buttonBaseClass)}
                        aria-label="Cài Đặt & Khác"
                    >
                        <Settings className={iconClass} />
                        <span className={labelClass}>Khác</span>
                    </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Cài Đặt & Khác</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" side="top" className="mb-2 min-w-[200px]">
                {/* Removed old leaderboard links */}
                 <DropdownMenuItem asChild>
                    <Link href="/library" className="w-full">
                        <Library className="mr-2 h-4 w-4" />
                        <span>Thư Viện Game</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <>
                    <DropdownMenuItem onClick={handleAdminNavigation}>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        <span>Vào trang Admin</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng Xuất</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </TooltipProvider>
  );
};

export default BottomNavBar;

    