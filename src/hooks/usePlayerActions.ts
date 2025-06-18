
'use client';

import { useCallback } from 'react';
import type { GameState } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface UsePlayerActionsProps {
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const usePlayerActions = ({ setGameState }: UsePlayerActionsProps) => {
  const { toast } = useToast();

  const updateDisplayName = useCallback(async (newName: string) => {
    const trimmedName = newName.trim();
    if (!trimmedName) {
      toast({ title: "Tên Không Hợp Lệ", description: "Tên hiển thị không được để trống.", variant: "destructive" });
      return;
    }
    if (trimmedName.length > 20) {
      toast({ title: "Tên Quá Dài", description: "Tên hiển thị không được quá 20 ký tự.", variant: "destructive" });
      return;
    }
    // Add more validation if needed (e.g., profanity filter)

    setGameState(prev => ({
      ...prev,
      displayName: trimmedName,
      lastUpdate: Date.now(),
    }));
    toast({ title: "Đã Cập Nhật Tên", description: `Tên hiển thị mới của bạn là: ${trimmedName}`, className: "bg-primary text-primary-foreground" });
    // Firestore save will be handled by useGameStateCore's effect
  }, [setGameState, toast]);

  return { updateDisplayName };
};
