import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Sprout, Hand, Brain } from 'lucide-react';
import type { SeedId } from '@/types';

interface ActionButtonsProps {
  onTogglePlantMode: (seedId: SeedId) => void;
  onToggleHarvestMode: () => void;
  onOpenMarket: () => void;
  onOpenAdvisor: () => void;
  availableSeeds: SeedId[];
  isPlanting: boolean;
  isHarvesting: boolean;
  selectedSeed?: SeedId;
}

const ActionButtons: FC<ActionButtonsProps> = ({
  onTogglePlantMode,
  onToggleHarvestMode,
  onOpenMarket,
  onOpenAdvisor,
  availableSeeds,
  isPlanting,
  isHarvesting,
  selectedSeed,
}) => {
  return (
    <div className="p-4 bg-card rounded-lg shadow-md space-y-3">
      <h3 className="text-lg font-semibold text-center font-headline">Actions</h3>
      <div className="grid grid-cols-2 gap-2">
        {availableSeeds.map(seedId => (
          <Button
            key={seedId}
            onClick={() => onTogglePlantMode(seedId)}
            variant={isPlanting && selectedSeed === seedId ? 'default' : 'outline'}
            className="w-full"
          >
            <Sprout className="mr-2 h-5 w-5" /> Plant {seedId.replace('Seed','')}
          </Button>
        ))}
         {availableSeeds.length === 0 && <p className="text-sm text-muted-foreground col-span-2 text-center">Buy seeds from market to plant.</p>}
      </div>

      <Button
        onClick={onToggleHarvestMode}
        variant={isHarvesting ? 'default' : 'outline'}
        className="w-full"
      >
        <Hand className="mr-2 h-5 w-5" /> Harvest
      </Button>
      <Button onClick={onOpenMarket} variant="outline" className="w-full">
        <ShoppingCart className="mr-2 h-5 w-5" /> Market
      </Button>
      <Button onClick={onOpenAdvisor} variant="outline" className="w-full">
        <Brain className="mr-2 h-5 w-5" /> Advisor
      </Button>
    </div>
  );
};

export default ActionButtons;
