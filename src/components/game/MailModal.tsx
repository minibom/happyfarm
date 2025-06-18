
'use client';

import type { FC } from 'react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { MailMessage, RewardItem } from '@/types';
import { Mail, Inbox, Package, Coins, Star, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CROP_DATA, FERTILIZER_DATA } from '@/lib/constants'; 
import { Timestamp } from 'firebase/firestore';

interface MailModalProps {
  isOpen: boolean;
  onClose: () => void;
  mailMessages: MailMessage[];
  onMarkAsRead: (mailId: string) => void;
  onClaimRewards: (mailId: string) => void; 
  onDeleteMail: (mailId: string) => void; 
}

const MailModal: FC<MailModalProps> = ({
  isOpen,
  onClose,
  mailMessages,
  onMarkAsRead,
  onClaimRewards,
  onDeleteMail,
}) => {
  const [selectedMail, setSelectedMail] = useState<MailMessage | null>(null);

  const handleSelectMail = (mail: MailMessage) => {
    setSelectedMail(mail);
    if (!mail.isRead) {
      onMarkAsRead(mail.id);
    }
  };

  const getRewardItemName = (reward: RewardItem): string => {
    if (reward.type === 'gold') return `${reward.amount} Vàng`;
    if (reward.type === 'xp') return `${reward.amount} XP`;
    if (reward.type === 'item' && reward.itemId) {
      const cropDetail = CROP_DATA[reward.itemId as keyof typeof CROP_DATA];
      if (cropDetail) return `${reward.quantity}x ${cropDetail.name}`;
      const fertilizerDetail = FERTILIZER_DATA[reward.itemId as keyof typeof FERTILIZER_DATA];
      if (fertilizerDetail) return `${reward.quantity}x ${fertilizerDetail.name}`;
      return `${reward.quantity}x ${reward.itemId}`;
    }
    return 'Phần thưởng không xác định';
  };
  
  const getRewardItemIcon = (reward: RewardItem) => {
    if (reward.type === 'gold') return <Coins className="w-4 h-4 text-yellow-500" />;
    if (reward.type === 'xp') return <Star className="w-4 h-4 text-yellow-400" />;
    if (reward.type === 'item' && reward.itemId) {
        const cropDetail = CROP_DATA[reward.itemId as keyof typeof CROP_DATA];
        if (cropDetail && cropDetail.icon) return <span className="text-lg">{cropDetail.icon}</span>;
        const fertilizerDetail = FERTILIZER_DATA[reward.itemId as keyof typeof FERTILIZER_DATA];
        if (fertilizerDetail && fertilizerDetail.icon) return <span className="text-lg">{fertilizerDetail.icon}</span>;
        return <Package className="w-4 h-4 text-muted-foreground" />;
    }
    return <Package className="w-4 h-4 text-muted-foreground" />;
  }

  const sortedMailMessages = mailMessages; 

  const formatTimestamp = (timestamp: any): string => {
    if (!timestamp) return 'N/A';
    if (timestamp.seconds) { // Firestore Timestamp object
      return new Date(timestamp.seconds * 1000).toLocaleString('vi-VN');
    }
    if (typeof timestamp === 'number') { // Milliseconds from toMillis()
      return new Date(timestamp).toLocaleString('vi-VN');
    }
    return 'Không rõ ngày';
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => { onClose(); setSelectedMail(null); }}>
      <DialogContent className="sm:max-w-2xl flex flex-col max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-headline">
            <Mail className="w-7 h-7 text-primary" /> Hộp Thư
          </DialogTitle>
          <DialogDescription>
            Xem thư và nhận phần thưởng từ hệ thống.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow flex min-h-0 gap-4 mt-2">
          {/* Mail List */}
          <div className="w-1/3 border-r pr-4 flex flex-col min-h-0">
            <h3 className="text-lg font-semibold mb-2 sticky top-0 bg-background py-1">Danh Sách Thư</h3>
            <ScrollArea className="flex-grow h-0">
              {sortedMailMessages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Hộp thư trống.</p>
              ) : (
                <ul className="space-y-1.5">
                  {sortedMailMessages.map((mail) => (
                    <li key={mail.id}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full h-auto justify-start p-2 text-left",
                          selectedMail?.id === mail.id && "bg-accent text-accent-foreground",
                          !mail.isRead && "font-bold"
                        )}
                        onClick={() => handleSelectMail(mail)}
                      >
                        <div className="flex items-center gap-1.5 w-full">
                         {!mail.isRead ? <Circle className="w-2.5 h-2.5 text-blue-500 fill-current" /> : <div className="w-2.5 h-2.5"></div>}
                          <div className="flex-grow truncate">
                            <p className="text-sm truncate" title={mail.subject}>{mail.subject}</p>
                            <p className="text-xs text-muted-foreground truncate" title={mail.senderName}>
                              Từ: {mail.senderName}
                            </p>
                          </div>
                        </div>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </div>

          {/* Mail Content */}
          <div className="w-2/3 flex flex-col min-h-0">
            {selectedMail ? (
              <>
                <h3 className="text-xl font-semibold mb-1 truncate">{selectedMail.subject}</h3>
                <div className="flex justify-between items-center mb-3">
                    <p className="text-xs text-muted-foreground">Từ: {selectedMail.senderName}</p>
                    <p className="text-xs text-muted-foreground">
                        {formatTimestamp(selectedMail.createdAt)}
                    </p>
                </div>
                <ScrollArea className="flex-grow h-0 bg-muted/30 p-3 rounded-md mb-3">
                  <p className="text-sm whitespace-pre-wrap">{selectedMail.body}</p>
                </ScrollArea>
                {selectedMail.rewards.length > 0 && (
                  <div className="mb-3">
                    <h4 className="font-semibold text-sm mb-1.5">Vật phẩm đính kèm:</h4>
                    <div className="space-y-1">
                      {selectedMail.rewards.map((reward, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1.5 py-1 px-2 text-sm">
                          {getRewardItemIcon(reward)}
                          {getRewardItemName(reward)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-auto flex gap-2">
                  <Button 
                    onClick={() => onClaimRewards(selectedMail.id)} 
                    disabled={selectedMail.isClaimed || selectedMail.rewards.length === 0}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    {selectedMail.isClaimed ? <CheckCircle2 className="mr-2 h-4 w-4"/> : <Package className="mr-2 h-4 w-4"/>}
                    {selectedMail.isClaimed ? 'Đã Nhận' : 'Nhận Quà'}
                  </Button>
                   <Button variant="outline" onClick={() => onDeleteMail(selectedMail.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/50">
                    <Trash2 className="mr-2 h-4 w-4"/> Xóa Thư
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-muted-foreground">
                <Inbox className="w-16 h-16 mb-4" />
                <p>Chọn một thư để đọc.</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => { onClose(); setSelectedMail(null); }}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MailModal;
