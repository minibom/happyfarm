import type { FC } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import type { GeneratedItem } from '@/types';
import { CROP_DATA } from '@/lib/constants';

interface ItemDescriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: GeneratedItem | null;
}

const ItemDescriptionDialog: FC<ItemDescriptionDialogProps> = ({ isOpen, onClose, item }) => {
  if (!item) return null;

  const cropIcon = CROP_DATA[item.cropId]?.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-headline">
            <Sparkles className="w-7 h-7 text-primary animate-pulse" /> A Special Harvest!
          </DialogTitle>
        </DialogHeader>
        <div className="my-4 space-y-3 text-center">
          {cropIcon && <p className="text-6xl">{cropIcon}</p>}
          <h3 className="text-2xl font-semibold text-accent">{item.name}</h3>
          <DialogDescription className="text-md bg-secondary/50 p-3 rounded-md shadow">
            {item.description}
          </DialogDescription>
        </div>
        <DialogFooter>
          <Button onClick={onClose} className="bg-primary hover:bg-primary/90">Awesome!</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ItemDescriptionDialog;
