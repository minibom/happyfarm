
'use client';

import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { PackageSearch, ShoppingCart } from 'lucide-react';

interface BottomNavBarProps {
  onOpenInventory: () => void;
  onOpenMarket: () => void;
}

const BottomNavBar: FC<BottomNavBarProps> = ({ onOpenInventory, onOpenMarket }) => {
  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-3 z-50">
      <Button
        onClick={onOpenInventory}
        size="lg"
        className="p-4 h-16 w-16 rounded-full shadow-lg bg-primary hover:bg-primary/90"
        aria-label="Open Inventory"
      >
        <PackageSearch className="h-8 w-8" />
      </Button>
      <Button
        onClick={onOpenMarket}
        size="lg"
        className="p-4 h-16 w-16 rounded-full shadow-lg bg-accent hover:bg-accent/90"
        aria-label="Open Market"
      >
        <ShoppingCart className="h-8 w-8" />
      </Button>
    </div>
  );
};

export default BottomNavBar;
