
'use client';

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, UserPlus, UserCheck, UserX, Hourglass, Eye, Loader2 } from 'lucide-react';
import type { FriendInfo, FriendRequestReceived, FriendRequestSent } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string | null;
  friendsList: FriendInfo[];
  incomingRequests: FriendRequestReceived[];
  outgoingRequests: FriendRequestSent[]; // Not displayed directly in this version, but hook provides it
  onAcceptRequest: (senderId: string) => Promise<void>;
  onDeclineRequest: (senderId: string) => Promise<void>;
  onRemoveFriend: (friendId: string) => Promise<void>;
  onBlockUser: (userIdToBlock: string) => Promise<void>; // For future use with friend profile
  onUnblockUser: (userIdToUnblock: string) => Promise<void>; // For future use
  onViewProfile: (friendId: string, friendName: string) => void;
  loading: boolean;
}

const FriendListItem: FC<{ friend: FriendInfo; onRemove: (uid: string) => void; onViewProfile: (uid: string, name: string) => void }> = ({ friend, onRemove, onViewProfile }) => {
  return (
    <Card className="flex items-center justify-between p-2.5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={friend.avatarUrl || `https://placehold.co/40x40.png?text=${friend.displayName?.[0] || 'U'}`} alt={friend.displayName} data-ai-hint="user avatar"/>
          <AvatarFallback>{friend.displayName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold">{friend.displayName}</p>
          <p className="text-xs text-muted-foreground">Bạn bè từ: {new Date(friend.friendSince?.seconds ? friend.friendSince.seconds * 1000 : Date.now()).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="flex gap-1.5">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onViewProfile(friend.uid, friend.displayName)}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => onRemove(friend.uid)}>
          <UserX className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

const FriendRequestItem: FC<{ request: FriendRequestReceived; onAccept: (uid: string) => void; onDecline: (uid: string) => void }> = ({ request, onAccept, onDecline }) => {
  return (
    <Card className="flex items-center justify-between p-2.5 shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
           <AvatarImage src={`https://placehold.co/40x40.png?text=${request.senderName?.[0] || 'R'}`} alt={request.senderName} data-ai-hint="user avatar" />
          <AvatarFallback>{request.senderName?.[0]?.toUpperCase() || 'R'}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold">{request.senderName}</p>
          <p className="text-xs text-muted-foreground">Cấp độ: {request.senderLevel || 'N/A'}</p>
        </div>
      </div>
      <div className="flex gap-1.5">
        <Button variant="default" size="sm" className="bg-green-500 hover:bg-green-600 h-7 px-2 py-1" onClick={() => onAccept(request.senderId)}>
          <UserCheck className="mr-1 h-3.5 w-3.5" /> Chấp Nhận
        </Button>
        <Button variant="outline" size="sm" className="h-7 px-2 py-1" onClick={() => onDecline(request.senderId)}>
          <UserX className="mr-1 h-3.5 w-3.5" /> Từ Chối
        </Button>
      </div>
    </Card>
  );
};


const FriendsModal: FC<FriendsModalProps> = ({
  isOpen,
  onClose,
  currentUserId,
  friendsList,
  incomingRequests,
  // outgoingRequests, // Not used directly in UI yet
  onAcceptRequest,
  onDeclineRequest,
  onRemoveFriend,
  // onBlockUser,
  // onUnblockUser,
  onViewProfile,
  loading,
}) => {
  const { toast } = useToast();

  const handleAccept = async (senderId: string) => {
    try {
      await onAcceptRequest(senderId);
      toast({ title: "Đã đồng ý!", description: "Bạn đã trở thành bạn bè.", className: "bg-green-500 text-white" });
    } catch (error) {
      toast({ title: "Lỗi", description: "Không thể đồng ý lời mời.", variant: "destructive" });
    }
  };

  const handleDecline = async (senderId: string) => {
     try {
      await onDeclineRequest(senderId);
      toast({ title: "Đã từ chối", description: "Đã từ chối lời mời kết bạn." });
    } catch (error) {
      toast({ title: "Lỗi", description: "Không thể từ chối lời mời.", variant: "destructive" });
    }
  };
  
  const handleRemove = async (friendId: string) => {
     try {
      await onRemoveFriend(friendId);
      toast({ title: "Đã hủy kết bạn", description: "Không còn là bạn bè nữa." });
    } catch (error) {
      toast({ title: "Lỗi", description: "Không thể hủy kết bạn.", variant: "destructive" });
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl flex flex-col max-h-[85vh] h-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-headline">
            <Users className="w-7 h-7 text-primary" /> Quản Lý Bạn Bè
          </DialogTitle>
          <DialogDescription>
            Kết nối với những người nông dân khác trong Happy Farm!
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="friends" className="w-full flex-grow flex flex-col min-h-0 mt-2">
          <TabsList className="grid w-full grid-cols-2 shrink-0">
            <TabsTrigger value="friends"><UserCheck className="w-4 h-4 mr-1.5"/>Bạn Bè ({friendsList.length})</TabsTrigger>
            <TabsTrigger value="requests" className="relative">
              <UserPlus className="w-4 h-4 mr-1.5"/>Lời Mời ({incomingRequests.length})
              {incomingRequests.filter(req => req.status === 'pending').length > 0 && (
                <span className="absolute top-0 right-1 h-2 w-2 rounded-full bg-red-500" />
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="friends" className="mt-2 flex-1 overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
            ) : friendsList.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">Bạn chưa có người bạn nào. Hãy gửi lời mời kết bạn!</p>
            ) : (
              <ScrollArea className="h-full pr-2">
                <div className="space-y-2">
                  {friendsList.map(friend => (
                    <FriendListItem key={friend.uid} friend={friend} onRemove={handleRemove} onViewProfile={onViewProfile} />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="requests" className="mt-2 flex-1 overflow-hidden">
             {loading ? (
              <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
            ) : incomingRequests.filter(req => req.status === 'pending').length === 0 ? (
              <p className="text-center text-muted-foreground py-6">Không có lời mời kết bạn nào.</p>
            ) : (
              <ScrollArea className="h-full pr-2">
                <div className="space-y-2">
                  {incomingRequests.filter(req => req.status === 'pending').map(request => (
                    <FriendRequestItem key={request.senderId} request={request} onAccept={handleAccept} onDecline={handleDecline} />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FriendsModal;
