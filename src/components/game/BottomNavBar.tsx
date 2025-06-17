
'use client';

import type { FC } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PackageSearch, ShoppingCart, Sprout, Hand, Settings, LogOut, ShieldCheck, UserCircle2 } from 'lucide-react';
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
// CROP_DATA is no longer imported directly
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface BottomNavBarProps {
  onOpenInventory: () => void;
  onOpenMarket: () => void;
  onOpenProfile: () => void;
  onSetPlantMode: (seedId: SeedId) => void;
  onToggleHarvestMode: () => void;
  onClearAction: () => void;
  currentAction: 'planting' | 'harvesting' | 'none';
  selectedSeed?: SeedId;
  availableSeeds: SeedId[]; // These are already filtered SeedIds the player owns
  inventory: Inventory;
  cropData: Record<CropId, CropDetails> | null; // Pass fetched cropData
}

const BottomNavBar: FC<BottomNavBarProps> = ({
  onOpenInventory,
  onOpenMarket,
  onOpenProfile,
  onSetPlantMode,
  onToggleHarvestMode,
  onClearAction,
  currentAction,
  selectedSeed,
  availableSeeds,
  inventory,
  cropData, // Use this
}) => {
  const router = useRouter();
  const { logOut } = useAuth();
  const { toast } = useToast();

  const getCropInfo = (seedId: SeedId) => {
    if (!cropData) return null;
    const cropId = seedId.replace('Seed', '') as CropId;
    return cropData[cropId];
  };
  
  const selectedSeedName = selectedSeed && currentAction === 'planting' ? getCropInfo(selectedSeed)?.name : '';

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
    // Optionally render a loading state or minimal bar if cropData is essential for display
    return null; 
  }

  return (
    <TooltipProvider>
      <div className="fixed bottom-4 right-4 z-50">
        <div className="flex flex-row gap-2 p-2 bg-card border border-border rounded-lg shadow-lg">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon" 
                    variant="outline"
                    className={cn(
                      "p-2 h-12 w-12 rounded-full shadow-md", 
                      currentAction === 'planting' && "bg-primary hover:bg-primary/90 text-primary-foreground"
                    )}
                    aria-label="Trồng Hạt Giống"
                  >
                    <Sprout className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>{currentAction === 'planting' && selectedSeedName ? `Trồng (${selectedSeedName})` : 'Trồng Hạt Giống'}</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="mb-2">
              {availableSeeds.length > 0 ? (
                availableSeeds.map(seedId => {
                  const crop = getCropInfo(seedId);
                  return (
                    <DropdownMenuItem key={seedId} onClick={() => onSetPlantMode(seedId)} disabled={!crop}>
                      {crop?.icon && <span className="mr-2 text-lg">{crop.icon}</span>}
                       Trồng {crop?.name || seedId.replace('Seed','')} ({inventory[seedId]})
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
                size="icon"
                variant="outline"
                className={cn(
                  "p-2 h-12 w-12 rounded-full shadow-md gentle-pulse",
                  currentAction === 'harvesting' && "bg-primary hover:bg-primary/90 text-primary-foreground"
                )}
                aria-label="Thu Hoạch"
              >
                <Hand className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Thu Hoạch</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onOpenInventory}
                size="icon"
                variant="outline"
                className="p-2 h-12 w-12 rounded-full shadow-md bg-secondary hover:bg-secondary/90"
                aria-label="Mở Kho"
              >
                <PackageSearch className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Kho</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onOpenMarket}
                size="icon"
                variant="outline"
                className="p-2 h-12 w-12 rounded-full shadow-md bg-accent hover:bg-accent/90 text-accent-foreground"
                aria-label="Mở Chợ"
              >
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Chợ</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                  onClick={onOpenProfile}
                  size="icon"
                  variant="outline"
                  className="p-2 h-12 w-12 rounded-full shadow-md"
                  aria-label="Thông tin Người chơi"
              >
                  <UserCircle2 className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>Thông tin Người chơi</p>
            </TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                 <DropdownMenuTrigger asChild>
                    <Button
                        size="icon"
                        variant="outline"
                        className="p-2 h-12 w-12 rounded-full shadow-md"
                        aria-label="Cài Đặt & Quản trị"
                    >
                        <Settings className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Cài Đặt & Quản trị</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="mb-2">
                <DropdownMenuItem onClick={handleAdminNavigation}>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    <span>Vào trang Admin</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
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
