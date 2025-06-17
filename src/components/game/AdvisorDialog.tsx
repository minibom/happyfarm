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
import { Brain, RefreshCw } from 'lucide-react';
import Image from 'next/image';

interface AdvisorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  advice: string | null;
  onGetNewAdvice: () => void;
  isLoading: boolean;
}

const AdvisorDialog: FC<AdvisorDialogProps> = ({ isOpen, onClose, advice, onGetNewAdvice, isLoading }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-headline">
            <Brain className="w-7 h-7 text-primary" /> Farming Advisor
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 my-4">
          <Image 
            src="https://placehold.co/100x100.png" // Placeholder for NPC image
            alt="Farming Advisor NPC" 
            width={100} 
            height={100} 
            className="rounded-full shadow-lg border-4 border-primary"
            data-ai-hint="friendly farmer"
          />
          {isLoading && <p className="text-muted-foreground">Thinking...</p>}
          {!isLoading && advice && (
            <DialogDescription className="text-center text-lg bg-secondary/50 p-4 rounded-md shadow">
              {advice}
            </DialogDescription>
          )}
          {!isLoading && !advice && (
             <DialogDescription className="text-center text-lg bg-secondary/50 p-4 rounded-md shadow">
              Click below to get some advice!
            </DialogDescription>
          )}
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={onGetNewAdvice} disabled={isLoading} className="bg-accent hover:bg-accent/90">
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Getting Advice...' : 'Get New Advice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdvisorDialog;
