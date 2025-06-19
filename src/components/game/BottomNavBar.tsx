
'use client';

import { type FC, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  PackageSearch,
  ShoppingCart,
  Sprout,
  Hand,
  Settings,
  LogOut,
  ShieldCheck,
  UserCircle2,
  MessageSquare,
  Library,
  ListOrdered,
  ClipboardList,
  Zap,
  ChevronDown,
  Menu,
  Mail as MailIcon,
  CheckSquare as MissionIcon,
  Users, // Added Users icon for Friends
} from 'lucide-react';
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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import type { SeedId, Inventory, CropId, CropDetails, FertilizerId, FertilizerDetails } from '@/types';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface BottomNavBarProps {
  onOpenInventory: () => void;
  onOpenMarket: () => void;
  onOpenProfile: () => void;
  onOpenChatModal: () => void;
  onOpenLeaderboard: () => void;
  onOpenMailModal: () => void;
  onOpenMissionModal: () => void;
  onOpenFriendsModal: () => void;
  unreadMailCount: number;
  unreadFriendRequestCount: number;
  claimableMissionCount: number; 
  onSetPlantMode: (seedId: SeedId) => void;
  onToggleHarvestMode: () => void;
  onSetFertilizeMode: (fertilizerId: FertilizerId) => void;
  onClearAction: () => void;
  currentAction: 'planting' | 'harvesting' | 'fertilizing' | 'none';
  selectedSeed?: SeedId;
  selectedFertilizerId?: FertilizerId;
  availableSeeds: SeedId[];
  availableFertilizers: FertilizerDetails[];
  inventory: Inventory;
  cropData: Record<CropId, CropDetails> | null;
  fertilizerData: Record<FertilizerId, FertilizerDetails> | null;
  playerTier: number;
}

const BottomNavBar: FC<BottomNavBarProps> = ({
  onOpenInventory,
  onOpenMarket,
  onOpenProfile,
  onOpenChatModal,
  onOpenLeaderboard,
  onOpenMailModal,
  onOpenMissionModal,
  onOpenFriendsModal,
  unreadMailCount,
  unreadFriendRequestCount,
  claimableMissionCount,
  onSetPlantMode,
  onToggleHarvestMode,
  onSetFertilizeMode,
  onClearAction,
  currentAction,
  selectedSeed,
  selectedFertilizerId,
  availableSeeds,
  availableFertilizers,
  inventory,
  cropData,
  fertilizerData,
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

  const getSeedCropInfo = (seedId: SeedId) => {
    if (!cropData) return null;
    const cropId = seedId.replace('Seed', '') as CropId;
    return cropData[cropId];
  };

  const getFertilizerInfo = (fertilizerId: FertilizerId) => {
    if (!fertilizerData) return null;
    return fertilizerData[fertilizerId];
  }

  const selectedSeedInfo = selectedSeed && currentAction === 'planting' ? getSeedCropInfo(selectedSeed) : null;
  const selectedFertilizerInfo = selectedFertilizerId && currentAction === 'fertilizing' ? getFertilizerInfo(selectedFertilizerId) : null;

  const handleAdminNavigation = () => {
    router.push('/admin/missions-events');
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

  if (!cropData || !fertilizerData) {
    return null;
  }

  const buttonBaseClass = "p-2 h-auto w-[72px] rounded-lg shadow-md flex flex-col items-center justify-center gap-1 relative";
  const mainActionButtonClass = "p-2 h-auto w-auto min-w-[80px] max-w-[150px] rounded-lg shadow-md flex flex-row items-center justify-center gap-1.5 text-xs";
  const iconClass = "h-5 w-5";
  const labelClass = "text-[10px] leading-none";

  let mainActionIcon = <ClipboardList className={iconClass} />;
  let mainActionLabel = "Hành Động";
  let mainActionTooltip = "Chọn Hành Động (Trồng/Thu Hoạch/Bón Phân)";
  let mainActionActiveColorClass = "";

  if (currentAction === 'planting' && selectedSeedInfo) {
    mainActionIcon = <span className="text-xl h-5 flex items-center justify-center">{selectedSeedInfo.icon}</span>;
    mainActionLabel = `Trồng: ${selectedSeedInfo.name.substring(0,10)}${selectedSeedInfo.name.length > 10 ? '...' : ''}`;
    mainActionTooltip = `Đang trồng: ${selectedSeedInfo.name}`;
    mainActionActiveColorClass = "bg-primary hover:bg-primary/90 text-primary-foreground";
  } else if (currentAction === 'harvesting') {
    mainActionIcon = <Hand className={iconClass} />;
    mainActionLabel = "Thu Hoạch";
    mainActionTooltip = "Chế độ Thu Hoạch";
    mainActionActiveColorClass = "bg-primary hover:bg-primary/90 text-primary-foreground gentle-pulse";
  } else if (currentAction === 'fertilizing' && selectedFertilizerInfo) {
    mainActionIcon = <span className="text-xl h-5 flex items-center justify-center">{selectedFertilizerInfo.icon}</span>;
    mainActionLabel = `Bón: ${selectedFertilizerInfo.name.substring(0,10)}${selectedFertilizerInfo.name.length > 10 ? '...' : ''}`;
    mainActionTooltip = `Đang bón: ${selectedFertilizerInfo.name}`;
    mainActionActiveColorClass = "bg-blue-500 hover:bg-blue-600 text-white";
  }

  const ownedAvailableFertilizers = availableFertilizers.filter(fert => (inventory[fert.id] || 0) > 0);

  const UnreadCountBadge = ({ count, color = "bg-red-500" }: { count: number; color?: string }) => (
    count > 0 ? (
      <Badge className={cn("ml-auto h-4 px-1.5 text-[9px] text-white", color)}>
        {count > 9 ? '9+' : count}
      </Badge>
    ) : null
  );

  const NotificationBadge = ({ count, color = "bg-red-500" }: { count: number; color?: string }) => (
    count > 0 ? (
      <Badge
        className={cn(
          "absolute top-1 right-1 h-4 w-4 p-0 min-w-4 justify-center text-[9px] text-white z-10 pointer-events-none",
          color
        )}
      >
        {count > 9 ? '9+' : count}
      </Badge>
    ) : null
  );


  return (
    <TooltipProvider>
      <div className="fixed bottom-4 right-1/2 translate-x-1/2 sm:right-4 sm:translate-x-0 z-50">
        <div className="flex flex-row gap-2 p-2 bg-card border border-border rounded-lg shadow-lg items-center">

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(mainActionButtonClass, mainActionActiveColorClass)}
                    aria-label="Chọn Hành Động"
                  >
                    {mainActionIcon}
                    <span className="truncate">{mainActionLabel}</span>
                    <ChevronDown className="h-3 w-3 ml-auto opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{mainActionTooltip}</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" side="top" className="mb-2 max-h-80 overflow-y-auto">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Sprout className="mr-2 h-4 w-4" />
                  Trồng Hạt Giống
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="max-h-60 overflow-y-auto">
                    {availableSeeds.length > 0 ? (
                      availableSeeds.map(seedId => {
                        const crop = getSeedCropInfo(seedId);
                        if (!crop) return null;
                        return (
                          <DropdownMenuItem
                              key={seedId}
                              onSelect={() => onSetPlantMode(seedId)}
                          >
                            {crop.icon && <span className="mr-2 text-lg">{crop.icon}</span>}
                            Trồng {crop.name} ({inventory[seedId]})
                          </DropdownMenuItem>
                        );
                      })
                    ) : (
                      <DropdownMenuItem disabled>Không có hạt giống để trồng</DropdownMenuItem>
                    )}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuItem onSelect={onToggleHarvestMode}>
                <Hand className="mr-2 h-4 w-4" />
                Thu Hoạch
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Zap className="mr-2 h-4 w-4" />
                  Bón Phân
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="max-h-60 overflow-y-auto">
                    {ownedAvailableFertilizers.length > 0 ? (
                      ownedAvailableFertilizers.map(fertilizer => {
                        return (
                          <DropdownMenuItem
                              key={fertilizer.id}
                              onSelect={() => onSetFertilizeMode(fertilizer.id)}
                          >
                            {fertilizer.icon && <span className="mr-2 text-lg">{fertilizer.icon}</span>}
                            Bón {fertilizer.name} ({inventory[fertilizer.id]})
                          </DropdownMenuItem>
                        );
                      })
                    ) : (
                      <DropdownMenuItem disabled>Không có phân bón trong kho</DropdownMenuItem>
                    )}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              {currentAction !== 'none' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={onClearAction} className="text-destructive">
                    Hủy Hành Động
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
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

          {/* ---- Desktop Specific Buttons (Missions and Settings Dropdown) ---- */}
          <div className="hidden md:flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Button
                    onClick={onOpenMissionModal}
                    variant="outline"
                    className={cn(buttonBaseClass, "bg-blue-500 hover:bg-blue-600 text-white")}
                    aria-label="Nhiệm Vụ"
                  >
                    <MissionIcon className={iconClass} />
                    <span className={labelClass}>Nhiệm Vụ</span>
                  </Button>
                  <NotificationBadge count={claimableMissionCount} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Nhiệm Vụ</p>
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
                          <span className={labelClass}>Cài Đặt</span>
                      </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Cài Đặt & Khác</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" side="top" className="mb-2 min-w-[200px]">
                  <DropdownMenuItem onSelect={onOpenProfile}>
                      <UserCircle2 className="mr-2 h-4 w-4" />
                      <span>Hồ Sơ</span>
                  </DropdownMenuItem>
                   <DropdownMenuItem onSelect={onOpenFriendsModal} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      <span>Bạn Bè</span>
                    </div>
                    <UnreadCountBadge count={unreadFriendRequestCount} color="bg-blue-500" />
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={onOpenMailModal} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <MailIcon className="mr-2 h-4 w-4" />
                      <span>Hộp Thư</span>
                    </div>
                    <UnreadCountBadge count={unreadMailCount} />
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={onOpenLeaderboard}>
                      <ListOrdered className="mr-2 h-4 w-4" />
                      <span>Bảng Xếp Hạng</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                      <Link href="/library" className="w-full">
                          <Library className="mr-2 h-4 w-4" />
                          <span>Thư Viện Game</span>
                      </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <>
                      <DropdownMenuItem onSelect={handleAdminNavigation}>
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          <span>Vào trang Admin</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onSelect={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Đăng Xuất</span>
                  </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* ---- Mobile Specific "More" Dropdown ---- */}
          <div className="relative block md:hidden">
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                      <Button
                          variant="outline"
                          className={cn(buttonBaseClass)} 
                          aria-label="Thêm tùy chọn"
                      >
                          <Menu className={iconClass} />
                          <span className={labelClass}>Thêm</span>
                      </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Thêm tùy chọn</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" side="top" className="mb-2 min-w-[200px]">
                <DropdownMenuItem onSelect={onOpenProfile}>
                    <UserCircle2 className="mr-2 h-4 w-4" />
                    <span>Hồ Sơ</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onOpenMissionModal} className="flex justify-between items-center w-full">
                    <div className="flex items-center">
                        <MissionIcon className="mr-2 h-4 w-4" />
                        <span>Nhiệm Vụ</span>
                    </div>
                    <UnreadCountBadge count={claimableMissionCount} />
                </DropdownMenuItem>
                 <DropdownMenuItem onSelect={onOpenFriendsModal} className="flex justify-between items-center">
                    <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        <span>Bạn Bè</span>
                    </div>
                     <UnreadCountBadge count={unreadFriendRequestCount} color="bg-blue-500" />
                  </DropdownMenuItem>
                <DropdownMenuItem onSelect={onOpenMailModal} className="flex justify-between items-center">
                    <div className="flex items-center">
                        <MailIcon className="mr-2 h-4 w-4" />
                        <span>Hộp Thư</span>
                    </div>
                    <UnreadCountBadge count={unreadMailCount} />
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onOpenLeaderboard}>
                    <ListOrdered className="mr-2 h-4 w-4" />
                    <span>Bảng Xếp Hạng</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/library" className="w-full">
                        <Library className="mr-2 h-4 w-4" />
                        <span>Thư Viện Game</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <>
                    <DropdownMenuItem onSelect={handleAdminNavigation}>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        <span>Vào trang Admin</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onSelect={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng Xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {(unreadMailCount > 0 || unreadFriendRequestCount > 0 || claimableMissionCount > 0) && (
              <Badge className="absolute top-1 right-1 h-4 w-4 p-0 min-w-4 justify-center text-[9px] bg-red-500 text-white z-20 pointer-events-none">
                  {(unreadMailCount + unreadFriendRequestCount + claimableMissionCount) > 9 ? '9+' : (unreadMailCount + unreadFriendRequestCount + claimableMissionCount)}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default BottomNavBar;
