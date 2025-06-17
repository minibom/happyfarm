
'use client';

import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { PackageSearch, ShoppingCart, Sprout, Hand } from 'lucide-react';
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
  const getCropInfo = (seedId: SeedId) => {
    const cropId = seedId.replace('Seed', '') as CropId;
    return CROP_DATA[cropId];
  };

  const getButtonVariant = (action: 'planting' | 'harvesting') => {
    return currentAction === action ? 'default' : 'outline';
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
                    size="lg"
                    variant={getButtonVariant('planting')}
                    className={cn("p-3 h-14 w-14 rounded-full shadow-md", 
                                 currentAction === 'planting' && "bg-primary hover:bg-primary/90 text-primary-foreground")}
                    aria-label="Plant Seed"
                  >
                    <Sprout className="h-7 w-7" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Plant {selectedSeed && currentAction === 'planting' ? `(${getCropInfo(selectedSeed)?.name})` : ''}</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="mb-2">
              {availableSeeds.length > 0 ? (
                availableSeeds.map(seedId => {
                  const crop = getCropInfo(seedId);
                  return (
                    <DropdownMenuItem key={seedId} onClick={() => onSetPlantMode(seedId)}>
                      <span className="mr-2 text-lg">{crop?.icon}</span> Plant {crop?.name} ({inventory[seedId]})
                    </DropdownMenuItem>
                  );
                })
              ) : (
                <DropdownMenuItem disabled>No seeds to plant</DropdownMenuItem>
              )}
              {currentAction === 'planting' && (
                 <DropdownMenuItem onClick={onClearAction} className="text-destructive">
                    Cancel Planting
                 </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onToggleHarvestMode}
                size="lg"
                variant={getButtonVariant('harvesting')}
                className={cn("p-3 h-14 w-14 rounded-full shadow-md",
                                currentAction === 'harvesting' && "bg-primary hover:bg-primary/90 text-primary-foreground")}
                aria-label="Harvest Crops"
              >
                <Hand className="h-7 w-7" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Harvest</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onOpenInventory}
                size="lg"
                className="p-3 h-14 w-14 rounded-full shadow-md bg-secondary hover:bg-secondary/90"
                aria-label="Open Inventory"
              >
                <PackageSearch className="h-7 w-7" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Inventory (Kho)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onOpenMarket}
                size="lg"
                className="p-3 h-14 w-14 rounded-full shadow-md bg-accent hover:bg-accent/90"
                aria-label="Open Market"
              >
                <ShoppingCart className="h-7 w-7" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Market (Chợ)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default BottomNavBar;
