
'use client';

import type { FC } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PackageSearch, ShoppingCart, Sprout, Hand, Settings } from 'lucide-react';
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
import type { SeedId, Inventory, CropId } from '@/types';
import { CROP_DATA } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface BottomNavBarProps {
  onOpenInventory: () => void;
  onOpenMarket: () => void;
  onSetPlantMode: (seedId: SeedId) => void;
  onToggleHarvestMode: () => void;
  onClearAction: () => void;
  currentAction: 'planting' | 'harvesting' | 'none';
  selectedSeed?: SeedId;
  availableSeeds: SeedId[];
  inventory: Inventory;
}

const BottomNavBar: FC<BottomNavBarProps> = ({
  onOpenInventory,
  onOpenMarket,
  onSetPlantMode,
  onToggleHarvestMode,
  onClearAction,
  currentAction,
  selectedSeed,
  availableSeeds,
  inventory,
}) => {
  const router = useRouter();

  const getCropInfo = (seedId: SeedId) => {
    const cropId = seedId.replace('Seed', '') as CropId;
    return CROP_DATA[cropId];
  };
  
  const selectedSeedName = selectedSeed && currentAction === 'planting' ? getCropInfo(selectedSeed)?.name : '';

  const handleAdminNavigation = () => {
    router.push('/admin/items');
  };

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
                      "p-2.5 h-12 w-12 rounded-full shadow-md", 
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
                    <DropdownMenuItem key={seedId} onClick={() => onSetPlantMode(seedId)}>
                      <span className="mr-2 text-lg">{crop?.icon}</span> Trồng {crop?.name} ({inventory[seedId]})
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
                  "p-2.5 h-12 w-12 rounded-full shadow-md",
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
                className="p-2.5 h-12 w-12 rounded-full shadow-md bg-secondary hover:bg-secondary/90"
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
                className="p-2.5 h-12 w-12 rounded-full shadow-md bg-accent hover:bg-accent/90 text-accent-foreground"
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
                onClick={handleAdminNavigation}
                size="icon"
                variant="outline"
                className="p-2.5 h-12 w-12 rounded-full shadow-md"
                aria-label="Cài Đặt"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Cài Đặt</p>
            </TooltipContent>
          </Tooltip>

        </div>
      </div>
    </TooltipProvider>
  );
};

export default BottomNavBar;
