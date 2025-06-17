
'use client';

import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { PackageSearch, ShoppingCart } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BottomNavBarProps {
  onOpenInventory: () => void;
  onOpenMarket: () => void;
}

const BottomNavBar: FC<BottomNavBarProps> = ({ onOpenInventory, onOpenMarket }) => {
  return (
    <TooltipProvider>
      <div className="fixed bottom-4 right-4 z-50">
        <div className="flex flex-row gap-2 p-2 bg-card border border-border rounded-lg shadow-lg">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onOpenInventory}
                size="lg"
                className="p-3 h-14 w-14 rounded-full shadow-md bg-primary hover:bg-primary/90"
                aria-label="Mở Kho"
              >
                <PackageSearch className="h-7 w-7" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Kho (Inventory)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onOpenMarket}
                size="lg"
                className="p-3 h-14 w-14 rounded-full shadow-md bg-accent hover:bg-accent/90"
                aria-label="Mở Chợ"
              >
                <ShoppingCart className="h-7 w-7" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Chợ (Market)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default BottomNavBar;
