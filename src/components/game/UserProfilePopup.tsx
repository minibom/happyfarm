
'use client';

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCircle2, UserPlus, UserX, MessageSquareOff, Ban, Loader2, CheckSquare, ShieldQuestion } from 'lucide-react';
import type { GameState, TierInfo, FriendInfo, FriendRequestReceived, FriendRequestSent } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase'; // For fetching target user's basic info
import { doc, getDoc } from 'firebase/firestore';
import { getPlayerTierInfo } from '@/lib/constants';

interface UserProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserDisplayName: string; // Passed in for immediate display
  currentUserId: string | null;
  friendsList: FriendInfo[];
  incomingRequests: FriendRequestReceived[];
  outgoingRequests: FriendRequestSent[];
  onSendFriendRequest: (recipientId: string) => Promise<void>;
  onAcceptFriendRequest: (senderId: string) => Promise<void>;
  onDeclineFriendRequest: (senderId: string) => Promise<void>;
  onRemoveFriend: (friendId: string) => Promise<void>;
  onBlockUser: (userIdToBlock: string) => Promise<void>;
  onUnblockUser: (userIdToUnblock: string) => Promise<void>; // Placeholder for now
}

const UserProfilePopup: FC<UserProfilePopupProps> = ({
  isOpen,
  onClose,
  targetUserId,
  targetUserDisplayName,
  currentUserId,
  friendsList,
  incomingRequests,
  outgoingRequests,
  onSendFriendRequest,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
  onRemoveFriend,
  onBlockUser,
  onUnblockUser,
}) => {
  const { toast } = useToast();
  const [targetUserProfile, setTargetUserProfile] = useState<Partial<GameState> | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isOpen && targetUserId) {
      const fetchProfile = async () => {
        setIsLoadingProfile(true);
        try {
          const userGameStateRef = doc(db, 'users', targetUserId, 'gameState', 'data');
          const userGameStateSnap = await getDoc(userGameStateRef);
          if (userGameStateSnap.exists()) {
            setTargetUserProfile(userGameStateSnap.data() as GameState);
          } else {
            // Fallback if only top-level user doc exists or neither
            const userDocRef = doc(db, 'users', targetUserId);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                const baseData = userDocSnap.data();
                setTargetUserProfile({ 
                    displayName: baseData.displayName || targetUserDisplayName, 
                    level: baseData.level || 1, 
                    // other minimal defaults
                });
            } else {
                 setTargetUserProfile({ displayName: targetUserDisplayName, level: 1 }); // Minimal fallback
            }
          }
        } catch (error) {
          console.error("Error fetching target user profile:", error);
          setTargetUserProfile({ displayName: targetUserDisplayName, level: 1 }); // Minimal fallback on error
          toast({ title: "Lỗi", description: "Không thể tải thông tin người chơi.", variant: "destructive" });
        } finally {
          setIsLoadingProfile(false);
        }
      };
      fetchProfile();
    }
  }, [isOpen, targetUserId, targetUserDisplayName, toast]);

  const isSelf = currentUserId === targetUserId;
  const isFriend = friendsList.some(f => f.uid === targetUserId);
  const hasSentRequestToTarget = outgoingRequests.some(req => req.recipientId === targetUserId && req.status === 'pending');
  const hasReceivedRequestFromTarget = incomingRequests.some(req => req.senderId === targetUserId && req.status === 'pending');

  const handleAction = async (action: () => Promise<void>) => {
    setActionLoading(true);
    try {
      await action();
    } catch (err) {
      // Toast for error is usually handled within the action itself in useFriends
      console.error("Friend action failed in popup:", err);
    } finally {
      setActionLoading(false);
    }
  };
  
  const targetTierInfo = targetUserProfile?.level ? getPlayerTierInfo(targetUserProfile.level) : getPlayerTierInfo(1);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-headline text-primary">
            <UserCircle2 className="w-6 h-6" />
            Hồ Sơ Người Chơi
          </DialogTitle>
        </DialogHeader>

        {isLoadingProfile ? (
          <div className="flex justify-center items-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : targetUserProfile ? (
          <div className="my-4 space-y-4">
            <div className="flex flex-col items-center gap-2">
              <Avatar className="w-20 h-20 border-2 border-primary">
                <AvatarImage src={`https://placehold.co/80x80.png?text=${targetUserProfile.displayName?.[0] || 'P'}`} alt={targetUserProfile.displayName || 'Player'} data-ai-hint="player avatar"/>
                <AvatarFallback>{targetUserProfile.displayName?.[0]?.toUpperCase() || 'P'}</AvatarFallback>
              </Avatar>
              <p className="text-lg font-bold text-foreground">{targetUserProfile.displayName || 'Chưa đặt tên'}</p>
              <p className="text-xs text-muted-foreground">Cấp {targetUserProfile.level || 1} - {targetTierInfo.tierName}</p>
            </div>

            {!isSelf && currentUserId && (
              <div className="grid grid-cols-2 gap-2 pt-3 border-t">
                {isFriend ? (
                  <Button variant="outline" onClick={() => handleAction(() => onRemoveFriend(targetUserId))} disabled={actionLoading}>
                    <UserX className="mr-1.5 h-4 w-4" /> Hủy Bạn
                  </Button>
                ) : hasSentRequestToTarget ? (
                  <Button variant="outline" disabled>
                    <Hourglass className="mr-1.5 h-4 w-4" /> Đã Gửi Yêu Cầu
                  </Button>
                ) : hasReceivedRequestFromTarget ? (
                  <>
                    <Button className="bg-green-500 hover:bg-green-600" onClick={() => handleAction(() => onAcceptFriendRequest(targetUserId))} disabled={actionLoading}>
                      <UserCheck className="mr-1.5 h-4 w-4" /> Chấp Nhận
                    </Button>
                    <Button variant="outline" onClick={() => handleAction(() => onDeclineFriendRequest(targetUserId))} disabled={actionLoading}>
                      <UserX className="mr-1.5 h-4 w-4" /> Từ Chối
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => handleAction(() => onSendFriendRequest(targetUserId))} disabled={actionLoading}>
                    <UserPlus className="mr-1.5 h-4 w-4" /> Thêm Bạn
                  </Button>
                )}
                
                <Button variant="destructive" onClick={() => handleAction(() => onBlockUser(targetUserId))} disabled={actionLoading}>
                  <Ban className="mr-1.5 h-4 w-4" /> Chặn Người Này
                </Button>
              </div>
            )}
             {actionLoading && <div className="flex justify-center"><Loader2 className="h-5 w-5 animate-spin"/></div>}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">Không thể tải thông tin người chơi.</p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfilePopup;
