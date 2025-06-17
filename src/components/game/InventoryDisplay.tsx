import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Inventory } from '@/types';
import { CROP_DATA, ALL_SEED_IDS, ALL_CROP_IDS } from '@/lib/constants';
import { PackageSearch, Wheat } from 'lucide-react';

interface InventoryDisplayProps {
  inventory: Inventory;
}

const InventoryDisplay: FC<InventoryDisplayProps> = ({ inventory }) => {
  const seeds = ALL_SEED_IDS.filter(id => inventory[id] > 0);
  const crops = ALL_CROP_IDS.filter(id => inventory[id] > 0);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-headline">
          <PackageSearch className="w-6 h-6 text-primary" />
          Inventory
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48">
          {seeds.length === 0 && crops.length === 0 && (
            <p className="text-muted-foreground text-center">Your inventory is empty.</p>
          )}
          {seeds.length > 0 && (
            <>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-1"><Wheat className="w-5 h-5 text-green-600" />Seeds</h3>
              <ul className="space-y-1 mb-4">
                {seeds.map((seedId) => (
                  <li key={seedId} className="flex justify-between items-center p-2 bg-secondary/50 rounded-md">
                    <span>{CROP_DATA[seedId.replace('Seed','') as keyof typeof CROP_DATA]?.seedName || seedId}</span>
                    <span className="font-bold text-primary">{inventory[seedId]}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {crops.length > 0 && (
            <>
              <h3 className="text-lg font-semibold mb-2">Crops</h3>
              <ul className="space-y-1">
                {crops.map((cropId) => (
                  <li key={cropId} className="flex justify-between items-center p-2 bg-secondary/50 rounded-md">
                    <span className="flex items-center gap-1">
                      {CROP_DATA[cropId]?.icon && <span className="text-xl">{CROP_DATA[cropId].icon}</span>}
                      {CROP_DATA[cropId]?.name || cropId}
                    </span>
                    <span className="font-bold text-primary">{inventory[cropId]}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default InventoryDisplay;
