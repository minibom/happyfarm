
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
import { Brain, RefreshCw, Smile } from 'lucide-react'; // Added Smile icon
// import Image from 'next/image'; // Removed Image import

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
            <Brain className="w-7 h-7 text-primary" /> Cố Vấn Nông Trại
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 my-4">
          <Smile className="w-24 h-24 text-primary opacity-80" /> {/* Replaced Image with Smile icon */}
          {isLoading && <p className="text-muted-foreground">Đang suy nghĩ...</p>}
          {!isLoading && advice && (
            <DialogDescription className="text-center text-lg bg-secondary/50 p-4 rounded-md shadow">
              {advice}
            </DialogDescription>
          )}
          {!isLoading && !advice && (
             <DialogDescription className="text-center text-lg bg-secondary/50 p-4 rounded-md shadow">
              Nhấn nút bên dưới để nhận lời khuyên!
            </DialogDescription>
          )}
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose}>Đóng</Button>
          <Button onClick={onGetNewAdvice} disabled={isLoading} className="bg-accent hover:bg-accent/90">
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Đang lấy lời khuyên...' : 'Lời Khuyên Mới'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdvisorDialog;
