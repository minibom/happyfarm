
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; 
import { Timestamp, collection, addDoc, serverTimestamp, getDocs, query, orderBy, where, writeBatch, doc, setDoc, deleteDoc, getDoc, updateDoc, onSnapshot, limit } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import type { MailMessage, RewardItem, RewardItemType, InventoryItem, AdminUserView, BonusConfiguration, BonusTriggerType, AdminMailLogEntry, GameState } from '@/types';
import { Eye, Edit, Trash2, Loader2, PlusCircle, Mail, Gift, Send, History, Package, Coins, Star, XCircle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CROP_DATA, FERTILIZER_DATA, MAIL_TEMPLATES_DATA } from '@/lib/constants';
import { BonusActionModal } from '@/components/admin/BonusActionModal';
import { useAuth } from '@/hooks/useAuth';
import type { MailTemplate } from '@/lib/mail-templates';


type ActiveView = 'mail' | 'bonuses';
type ActiveMailSubView = 'compose' | 'templates' | 'history';

const MailManagementView = () => {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeMailSubView, setActiveMailSubView] = useState<ActiveMailSubView>('compose');
  const [targetAudience, setTargetAudience] = useState<'all' | 'specific'>('all');
  const [specificUids, setSpecificUids] = useState('');
  const [mailSubject, setMailSubject] = useState('');
  const [mailBody, setMailBody] = useState('');
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [currentRewardType, setCurrentRewardType] = useState<RewardItemType>('gold');
  const [currentRewardItemId, setCurrentRewardItemId] = useState<InventoryItem | ''>('');
  const [currentRewardQuantity, setCurrentRewardQuantity] = useState<number>(1);
  const [currentRewardAmount, setCurrentRewardAmount] = useState<number>(100);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const [mailTemplates, setMailTemplates] = useState<MailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('__clear_template__');
  const [selectedTemplatePlaceholders, setSelectedTemplatePlaceholders] = useState<string[]>([]);

  const [sentMailsLog, setSentMailsLog] = useState<AdminMailLogEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    setMailTemplates(MAIL_TEMPLATES_DATA);
  }, []);

  useEffect(() => {
    const mailDraftString = localStorage.getItem('happyFarmAdminMailDraftFromEvent');
    const mailDraftSource = localStorage.getItem('happyFarmAdminMailDraftSource');

    if (mailDraftString && mailDraftSource === 'event') {
      try {
        const mailDraft = JSON.parse(mailDraftString);
        if (mailDraft.subject && mailDraft.body) {
          setMailSubject(mailDraft.subject);
          setMailBody(mailDraft.body);
          setActiveMailSubView('compose'); 
          setSelectedTemplateId('__clear_template__'); 
          setRewards([]); 
          toast({ title: "Bản Nháp Đã Tải", description: "Nội dung thư từ sự kiện đã được điền. Hãy kiểm tra và gửi." });
        }
      } catch (e) {
        // console.error("Error parsing mail draft from localStorage", e); // Kept for debugging admin tool itself
      } finally {
        localStorage.removeItem('happyFarmAdminMailDraftFromEvent');
        localStorage.removeItem('happyFarmAdminMailDraftSource');
      }
    } else if (searchParams && searchParams.has('subject') && searchParams.has('body')) {
        setMailSubject(searchParams.get('subject') || '');
        setMailBody(searchParams.get('body') || '');
        setActiveMailSubView('compose');
        setSelectedTemplateId('__clear_template__');
        setRewards([]);
        router.replace('/admin/mail-bonuses', { scroll: false }); 
    }
  }, [searchParams, router, toast]);


  useEffect(() => {
    if (activeMailSubView === 'history') {
      fetchSentMailsHistory();
    }
  }, [activeMailSubView]);

  const handleTemplateSelect = (templateIdValue: string) => {
    if (templateIdValue === "__clear_template__") {
      setSelectedTemplateId('__clear_template__');
      setMailSubject('');
      setMailBody('');
      setRewards([]);
      setSelectedTemplatePlaceholders([]);
      toast({ title: "Đã Xóa Thư Mẫu", description: "Nội dung thư đã được làm mới.", variant: "default" });
    } else {
      setSelectedTemplateId(templateIdValue);
      const template = mailTemplates.find(t => t.id === templateIdValue);
      if (template) {
        setMailSubject(template.defaultSubject);
        setMailBody(template.defaultBody);
        setRewards([...template.defaultRewards]);
        setSelectedTemplatePlaceholders(template.placeholders || []);
        toast({ title: "Đã Áp Dụng Thư Mẫu", description: `Thư mẫu "${template.templateName}" đã được tải.`, className: "bg-blue-500 text-white" });
      } else {
        setSelectedTemplateId('__clear_template__');
        setMailSubject('');
        setMailBody('');
        setRewards([]);
        setSelectedTemplatePlaceholders([]);
      }
    }
  };


  const fetchSentMailsHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const logCollectionRef = collection(db, 'adminMailLog');
      const q = query(logCollectionRef, orderBy('sentAt', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      const logs: AdminMailLogEntry[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        logs.push({
          id: docSnap.id,
          ...data,
          sentAt: data.sentAt instanceof Timestamp ? data.sentAt.toMillis() : data.sentAt,
        } as AdminMailLogEntry);
      });
      setSentMailsLog(logs);
    } catch (error) {
      console.error("Error fetching admin mail log:", error);
      toast({ title: "Lỗi Tải Lịch Sử Thư", description: "Không thể tải lịch sử thư đã gửi bởi admin.", variant: "destructive" });
      setSentMailsLog([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const getRewardItemNameDisplay = (reward: RewardItem): string => {
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

  const handleAddReward = () => {
    let newReward: RewardItem | null = null;
    if (currentRewardType === 'gold') {
        if (currentRewardAmount <= 0) { toast({ title: "Lỗi", description: "Số lượng vàng phải lớn hơn 0.", variant: "destructive" }); return; }
        newReward = { type: 'gold', amount: currentRewardAmount };
    } else if (currentRewardType === 'xp') {
        if (currentRewardAmount <= 0) { toast({ title: "Lỗi", description: "Số lượng XP phải lớn hơn 0.", variant: "destructive" }); return; }
        newReward = { type: 'xp', amount: currentRewardAmount };
    } else if (currentRewardType === 'item') {
        if (!currentRewardItemId.trim()) { toast({ title: "Lỗi", description: "ID Vật phẩm không được để trống.", variant: "destructive" }); return; }
        if (currentRewardQuantity <= 0) { toast({ title: "Lỗi", description: "Số lượng vật phẩm phải lớn hơn 0.", variant: "destructive" }); return; }
        newReward = { type: 'item', itemId: currentRewardItemId.trim() as InventoryItem, quantity: currentRewardQuantity };
    }

    if (newReward) {
        setRewards(prev => [...prev, newReward!]);
        setCurrentRewardItemId('');
        setCurrentRewardQuantity(1);
        setCurrentRewardAmount(currentRewardType === 'gold' ? 100 : currentRewardType === 'xp' ? 50 : 1);
        toast({ title: "Đã Thêm Phần Thưởng", description: getRewardItemNameDisplay(newReward), className: "bg-green-500 text-white" });
    }
  };

  const handleRemoveReward = (index: number) => {
    setRewards(prev => prev.filter((_, i) => i !== index));
    toast({ title: "Đã Xóa Phần Thưởng", variant: "default" });
  };

  const handleSendMail = async () => {
    if (!user) {
        toast({ title: "Lỗi Xác Thực", description: "Không tìm thấy thông tin admin.", variant: "destructive" });
        return;
    }
    if (!mailSubject.trim() || !mailBody.trim()) {
      toast({ title: "Thiếu Thông Tin", description: "Chủ đề và nội dung thư không được để trống.", variant: "destructive" });
      return;
    }
    if (targetAudience === 'specific' && !specificUids.trim()) {
      toast({ title: "Thiếu Người Nhận", description: "Vui lòng nhập UID người nhận cụ thể.", variant: "destructive" });
      return;
    }

    setIsSending(true);
    
    let uidsToSend: string[] = [];

    if (targetAudience === 'all') {
      try {
        const usersCollectionRef = collection(db, 'users');
        const usersSnapshot = await getDocs(query(usersCollectionRef));
        usersSnapshot.forEach(userDoc => uidsToSend.push(userDoc.id));
      } catch (error) {
        console.error("Error fetching all users for mail:", error);
        toast({ title: "Lỗi Gửi Thư", description: "Không thể lấy danh sách tất cả người dùng.", variant: "destructive" });
        setIsSending(false);
        return;
      }
    } else {
      uidsToSend = specificUids.split(',').map(uid => uid.trim()).filter(uid => uid);
    }

    if (uidsToSend.length === 0) {
      toast({ title: "Không Có Người Nhận", description: "Không có người dùng nào được chọn để gửi thư.", variant: "destructive" });
      setIsSending(false);
      return;
    }

    try {
      const mailPromises = uidsToSend.map(async (uid) => {
        const userGameStateRef = doc(db, 'users', uid, 'gameState', 'data');
        const userGameStateSnap = await getDoc(userGameStateRef);
        let recipientDisplayName = 'Nông Dân'; 

        if (userGameStateSnap.exists()) {
          const gs = userGameStateSnap.data() as GameState;
          recipientDisplayName = gs.displayName || gs.email?.split('@')[0] || 'Nông Dân';
        }

        const finalMailSubject = mailSubject.replace(/{{playerName}}/g, recipientDisplayName);
        const finalMailBody = mailBody.replace(/{{playerName}}/g, recipientDisplayName);

        const mailRef = doc(collection(db, 'users', uid, 'mail'));
        const newMail: Omit<MailMessage, 'id'> = {
          senderType: 'admin',
          senderName: user.displayName || user.email || 'Quản Trị Viên HappyFarm',
          subject: finalMailSubject,
          body: finalMailBody,
          rewards: rewards,
          isRead: false,
          isClaimed: false,
          createdAt: serverTimestamp(),
        };
        return { mailRef, newMail };
      });

      const mailsToCommit = await Promise.all(mailPromises);
      
      const batch = writeBatch(db);
      mailsToCommit.forEach(({ mailRef, newMail }) => {
        batch.set(mailRef, newMail);
      });
      await batch.commit();

      const logEntry: AdminMailLogEntry = {
        sentAt: serverTimestamp(),
        mailSubject: mailSubject, 
        mailBodyPreview: mailBody.substring(0, 100) + (mailBody.length > 100 ? '...' : ''), 
        targetAudience: targetAudience,
        specificUidsPreview: targetAudience === 'specific'
            ? (uidsToSend.slice(0,2).join(', ') + (uidsToSend.length > 2 ? `, (+${uidsToSend.length - 2} more)`: ''))
            : 'N/A',
        rewardCount: rewards.length,
        sentByUid: user.uid,
        sentByName: user.displayName || user.email || 'Unknown Admin',
      };
      await addDoc(collection(db, 'adminMailLog'), logEntry);

      toast({
        title: "Gửi Thư Thành Công!",
        description: `Đã gửi thư đến ${uidsToSend.length} người dùng.`,
        className: "bg-green-500 text-white"
      });
      setMailSubject(''); setMailBody(''); setRewards([]); setSpecificUids(''); setSelectedTemplateId('__clear_template__'); setSelectedTemplatePlaceholders([]);
    } catch (error) {
      console.error("Error sending mail:", error);
      toast({ title: "Lỗi Gửi Thư", description: `Không thể gửi thư. Lỗi: ${String((error as Error)?.message)}`, variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  const getRewardItemIcon = (type: RewardItemType) => {
    if (type === 'gold') return <Coins className="mr-2 h-4 w-4 text-yellow-500" />;
    if (type === 'xp') return <Star className="mr-2 h-4 w-4 text-yellow-400" />;
    if (type === 'item') return <Package className="mr-2 h-4 w-4 text-muted-foreground" />;
    return null;
  };

  const formatTimestamp = (timestamp: any): string => {
    if (!timestamp) return 'N/A';
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString('vi-VN');
    }
    if (typeof timestamp === 'number') {
      return new Date(timestamp).toLocaleString('vi-VN');
    }
    return 'Không rõ ngày';
  };


  return (
     <div className="flex-1 flex flex-col min-h-0">
        <div className="flex border-b mb-4 shrink-0">
            <Button
                variant="ghost"
                onClick={() => setActiveMailSubView('compose')}
                className={cn("py-2.5 px-3.5 rounded-none text-sm", activeMailSubView === 'compose' ? 'border-b-2 border-accent text-accent font-medium' : 'text-muted-foreground hover:bg-muted/40')}
            >
                <Send className="mr-1.5 h-4 w-4"/> Soạn Thư Mới
            </Button>
            <Button
                variant="ghost"
                onClick={() => setActiveMailSubView('templates')}
                className={cn("py-2.5 px-3.5 rounded-none text-sm", activeMailSubView === 'templates' ? 'border-b-2 border-accent text-accent font-medium' : 'text-muted-foreground hover:bg-muted/40')}
            >
                <FileText className="mr-1.5 h-4 w-4"/> Dùng Thư Mẫu
            </Button>
            <Button
                variant="ghost"
                onClick={() => setActiveMailSubView('history')}
                className={cn("py-2.5 px-3.5 rounded-none text-sm", activeMailSubView === 'history' ? 'border-b-2 border-accent text-accent font-medium' : 'text-muted-foreground hover:bg-muted/40')}
            >
                <History className="mr-1.5 h-4 w-4"/> Lịch Sử Gửi
            </Button>
        </div>

        {(activeMailSubView === 'compose' || activeMailSubView === 'templates') && (
            <ScrollArea className="flex-1 pr-2">
                <div className="space-y-6">
                    {activeMailSubView === 'templates' && (
                        <div className="space-y-2 border-b pb-4">
                            <Label htmlFor="mailTemplateSelect" className="text-base">Chọn Thư Mẫu</Label>
                            <Select value={selectedTemplateId} onValueChange={handleTemplateSelect}>
                                <SelectTrigger id="mailTemplateSelect">
                                    <SelectValue placeholder="-- Chọn một thư mẫu --" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__clear_template__">-- Xóa/Không dùng thư mẫu --</SelectItem>
                                    {mailTemplates.map(template => (
                                        <SelectItem key={template.id} value={template.id}>
                                            {template.templateName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="targetAudience" className="text-base">Đối tượng nhận thư</Label>
                        <Select value={targetAudience} onValueChange={(value) => setTargetAudience(value as 'all' | 'specific')}>
                        <SelectTrigger id="targetAudience"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả người chơi</SelectItem>
                            <SelectItem value="specific">Người chơi cụ thể (theo UID)</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>

                    {targetAudience === 'specific' && (
                        <div className="space-y-2">
                        <Label htmlFor="specificUids" className="text-base">UID người nhận (cách nhau bằng dấu phẩy)</Label>
                        <Textarea
                            id="specificUids"
                            placeholder="vd: uid1,uid2,uid3"
                            value={specificUids}
                            onChange={(e) => setSpecificUids(e.target.value)}
                            rows={2}
                        />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="mailSubject" className="text-base">Chủ đề thư*</Label>
                        <Input id="mailSubject" value={mailSubject} onChange={(e) => setMailSubject(e.target.value)} placeholder="Chúc mừng bạn đã..." />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="mailBody" className="text-base">Nội dung thư*</Label>
                        <Textarea id="mailBody" value={mailBody} onChange={(e) => setMailBody(e.target.value)} rows={5} placeholder="Nội dung chi tiết của thư..." />
                         {selectedTemplateId && selectedTemplateId !== "__clear_template__" && selectedTemplatePlaceholders.length > 0 && activeMailSubView === 'templates' && (
                            <div className="text-xs text-muted-foreground mt-1">
                                <p className="font-medium">Các placeholder cần thay thế trong mẫu này:</p>
                                <ul className="list-disc list-inside">
                                    {selectedTemplatePlaceholders.map(ph => <li key={ph}>{ph}</li>)}
                                </ul>
                                <p className="italic">Lưu ý: `{"{{playerName}}"}}` sẽ được tự động thay thế bằng tên người nhận.</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 border-t pt-4">
                        <Label className="text-base font-semibold">Đính kèm phần thưởng (Tùy chọn)</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div className="space-y-1">
                                <Label htmlFor="rewardType">Loại Phần Thưởng</Label>
                                <Select value={currentRewardType} onValueChange={(value) => setCurrentRewardType(value as RewardItemType)}>
                                <SelectTrigger id="rewardType"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="gold">Vàng</SelectItem>
                                    <SelectItem value="xp">Kinh Nghiệm (XP)</SelectItem>
                                    <SelectItem value="item">Vật Phẩm</SelectItem>
                                </SelectContent>
                                </Select>
                            </div>
                            {currentRewardType === 'item' && (
                                <>
                                <div className="space-y-1">
                                    <Label htmlFor="rewardItemId">ID Vật Phẩm*</Label>
                                    <Input id="rewardItemId" value={currentRewardItemId} onChange={(e) => setCurrentRewardItemId(e.target.value as InventoryItem)} placeholder="vd: tomatoSeed, t1_basicGrow" />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="rewardQuantity">Số Lượng*</Label>
                                    <Input id="rewardQuantity" type="number" value={currentRewardQuantity} onChange={(e) => setCurrentRewardQuantity(Math.max(1, parseInt(e.target.value,10) || 1))} min="1" />
                                </div>
                                </>
                            )}
                            {(currentRewardType === 'gold' || currentRewardType === 'xp') && (
                                <div className="space-y-1 md:col-span-2">
                                <Label htmlFor="rewardAmount">{currentRewardType === 'gold' ? 'Số Lượng Vàng*' : 'Số Lượng XP*'}</Label>
                                <Input id="rewardAmount" type="number" value={currentRewardAmount} onChange={(e) => setCurrentRewardAmount(Math.max(1, parseInt(e.target.value,10) || 1))} min="1" />
                                </div>
                            )}
                        </div>
                        <Button onClick={handleAddReward} variant="outline" size="sm">
                            <PlusCircle className="mr-2 h-4 w-4"/> Thêm Phần Thưởng Này
                        </Button>

                        {rewards.length > 0 && (
                        <div className="mt-3 space-y-2">
                            <Label className="font-medium">Danh sách phần thưởng đính kèm:</Label>
                            <div className="max-h-32 overflow-y-auto space-y-1.5 pr-2">
                            {rewards.map((reward, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md text-sm">
                                <span className="flex items-center gap-1.5">
                                    {getRewardItemIcon(reward.type)} {getRewardItemNameDisplay(reward)}
                                </span>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveReward(index)} className="h-6 w-6 text-destructive hover:bg-destructive/10">
                                    <XCircle className="h-4 w-4" />
                                </Button>
                                </div>
                            ))}
                            </div>
                        </div>
                        )}
                    </div>
                    <Button onClick={handleSendMail} disabled={isSending} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-lg py-3">
                        {isSending ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Send className="mr-2 h-5 w-5"/>}
                        {isSending ? 'Đang Gửi...' : 'Gửi Thư'}
                    </Button>
                </div>
            </ScrollArea>
        )}
        {activeMailSubView === 'history' && (
            <div className="flex-1 flex flex-col min-h-0">
            {isLoadingHistory ? (
                <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="ml-3 text-lg">Đang tải lịch sử thư...</p>
                </div>
            ) : (
                 <div className="flex-1 overflow-y-auto">
                    {sentMailsLog.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">Chưa có thư nào trong lịch sử gửi của admin.</p>
                    ) : (
                        <Table>
                            <TableHeader className="sticky top-0 bg-card z-10">
                                <TableRow>
                                <TableHead>Chủ Đề</TableHead>
                                <TableHead className="w-[180px]">Ngày Gửi</TableHead>
                                <TableHead>Đối Tượng</TableHead>
                                <TableHead className="w-[100px] text-center">P.Thưởng</TableHead>
                                <TableHead className="w-[150px]">Người Gửi (Admin)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sentMailsLog.map(log => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-medium truncate max-w-xs" title={log.mailSubject}>{log.mailSubject}</TableCell>
                                    <TableCell>{formatTimestamp(log.sentAt)}</TableCell>
                                    <TableCell>
                                        {log.targetAudience === 'all' ? <Badge variant="secondary">Tất cả</Badge> : <Badge variant="outline">{log.specificUidsPreview || 'Cụ thể'}</Badge>}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge>{log.rewardCount}</Badge>
                                    </TableCell>
                                    <TableCell className="text-xs" title={log.sentByUid}>{log.sentByName}</TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                 </div>
            )}
            </div>
        )}
     </div>
  );
};

const BonusesManagementView = () => {
  const [bonusConfigs, setBonusConfigs] = useState<BonusConfiguration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProps, setModalProps] = useState<Omit<React.ComponentProps<typeof BonusActionModal>, 'isOpen' | 'onClose'>>({
    mode: 'view',
    bonusData: { id: '', triggerType: 'firstLogin', description: '', rewards: [], mailSubject: '', mailBody: '', isEnabled: true },
  });
  const { toast } = useToast();

  useEffect(() => {
    const bonusCollectionRef = collection(db, 'gameBonusConfigurations');
    const q = query(bonusCollectionRef, orderBy("triggerType"), orderBy("description"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const configs: BonusConfiguration[] = [];
      snapshot.forEach(docSnap => {
        configs.push({ id: docSnap.id, ...(docSnap.data() as Omit<BonusConfiguration, 'id'>) });
      });
      setBonusConfigs(configs);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching bonus configurations:", error);
      toast({ title: "Lỗi Tải Cấu Hình Bonus", description: "Không thể tải danh sách cấu hình bonus.", variant: "destructive" });
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [toast]);

  const openModal = (mode: 'view' | 'edit' | 'create', bonus?: BonusConfiguration) => {
    if (mode === 'create') {
      setModalProps({
        mode: 'create',
        bonusData: { id: `new_bonus_${Date.now().toString().slice(-4)}`, triggerType: 'specialEvent', description: 'Bonus Sự kiện Mới', rewards: [], mailSubject: 'Sự kiện Đặc Biệt!', mailBody: 'Chúc mừng bạn đã tham gia sự kiện...', isEnabled: true },
      });
    } else if (bonus) {
      setModalProps({ mode, bonusData: bonus, bonusId: bonus.id });
    }
    setIsModalOpen(true);
  };

  const handleSaveChanges = async (data: BonusConfiguration, idToSave: string, originalId?: string) => {
    try {
      if (modalProps.mode === 'edit' && originalId && originalId !== idToSave) {
        const oldDocRef = doc(db, 'gameBonusConfigurations', originalId);
        await deleteDoc(oldDocRef);
      }
      const bonusRef = doc(db, 'gameBonusConfigurations', idToSave);
      await setDoc(bonusRef, { ...data, id: idToSave }, { merge: modalProps.mode === 'edit' });
      toast({
        title: `Thành Công (${modalProps.mode === 'create' ? 'Tạo Mới' : 'Chỉnh Sửa'})`,
        description: `Đã ${modalProps.mode === 'create' ? 'tạo' : 'cập nhật'} cấu hình bonus "${data.description}".`,
        className: "bg-green-500 text-white"
      });
    } catch (error) {
      console.error(`Error ${modalProps.mode === 'create' ? 'creating' : 'updating'} bonus config:`, error);
      toast({ title: "Lỗi Lưu Trữ", description: `Không thể ${modalProps.mode === 'create' ? 'tạo' : 'cập nhật'} cấu hình bonus.`, variant: "destructive" });
    }
    setIsModalOpen(false);
  };

  const handleDeleteBonus = async (bonusToDelete: BonusConfiguration) => {
    try {
      await deleteDoc(doc(db, 'gameBonusConfigurations', bonusToDelete.id));
      toast({
        title: "Đã Xóa",
        description: `Đã xóa cấu hình bonus "${bonusToDelete.description}".`,
        className: "bg-orange-500 text-white"
      });
    } catch (error) {
      console.error("Error deleting bonus config:", error);
      toast({ title: "Lỗi Xóa", description: `Không thể xóa cấu hình bonus "${bonusToDelete.description}".`, variant: "destructive" });
    }
  };

  const getRewardSummary = (rewards: RewardItem[]) => {
    if (rewards.length === 0) return "Không có";
    const summary = rewards.map(r => {
      if (r.type === 'gold') return `${r.amount} Vàng`;
      if (r.type === 'xp') return `${r.amount} XP`;
      if (r.type === 'item') return `${r.quantity}x ${r.itemId}`;
      return "";
    }).filter(s => s).join(', ');
    return summary.length > 50 ? summary.substring(0, 47) + "..." : summary;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex justify-end mb-4 shrink-0">
        <Button onClick={() => openModal('create')} className="bg-accent hover:bg-accent/90">
          <PlusCircle className="mr-2 h-5 w-5" /> Tạo Cấu Hình Bonus Mới
        </Button>
      </div>
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-xl">Đang tải cấu hình bonus...</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <Table className="relative border-separate border-spacing-0">
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead className="w-[100px] text-center">Trạng Thái</TableHead>
                <TableHead>Mô Tả (ID)</TableHead>
                <TableHead className="w-[150px]">Loại Kích Hoạt</TableHead>
                <TableHead className="w-[100px]">Giá Trị K.Hoạt</TableHead>
                <TableHead>Phần Thưởng</TableHead>
                <TableHead className="text-center w-[120px]">Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bonusConfigs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Không có cấu hình bonus nào.
                  </TableCell>
                </TableRow>
              ) : (
                bonusConfigs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell className="text-center">
                      <Badge variant={config.isEnabled ? 'default' : 'outline'} className={cn(config.isEnabled ? 'bg-green-500 hover:bg-green-600' : 'text-muted-foreground')}>
                        {config.isEnabled ? 'Kích hoạt' : 'Vô hiệu'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{config.description}</div>
                      <Badge variant="outline" className="text-xs mt-1">{config.id}</Badge>
                    </TableCell>
                    <TableCell>{config.triggerType}</TableCell>
                    <TableCell className="text-center">{config.triggerValue ?? '-'}</TableCell>
                    <TableCell className="text-xs truncate max-w-xs" title={getRewardSummary(config.rewards)}>
                      {getRewardSummary(config.rewards)}
                    </TableCell>
                    <TableCell className="text-center space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openModal('view', config)} className="hover:text-primary" title="Xem">
                        <Eye className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openModal('edit', config)} className="hover:text-blue-600" title="Sửa">
                        <Edit className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteBonus(config)} className="hover:text-destructive" title="Xóa">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
      <BonusActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveChanges}
        {...modalProps}
      />
    </div>
  );
};

export default function AdminMailBonusesPage() {
  const [activeView, setActiveView] = useState<ActiveView>('mail');

  return (
    <Card className="shadow-xl flex flex-col flex-1 min-h-0">
      <CardContent className="flex-1 flex flex-col min-h-0 p-6">
        <div className="flex border-b mb-4 shrink-0">
          <Button
            variant="ghost"
            onClick={() => setActiveView('mail')}
            className={cn(
              "py-3 px-4 rounded-none text-base",
              activeView === 'mail' ? 'border-b-2 border-primary text-primary font-semibold' : 'text-muted-foreground hover:bg-muted/50'
            )}
          >
            <Mail className="mr-2 h-5 w-5"/> Quản Lý Thư
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveView('bonuses')}
            className={cn(
              "py-3 px-4 rounded-none text-base",
              activeView === 'bonuses' ? 'border-b-2 border-primary text-primary font-semibold' : 'text-muted-foreground hover:bg-muted/50'
            )}
          >
            <Gift className="mr-2 h-5 w-5"/> Quản Lý Bonus
          </Button>
        </div>

        {activeView === 'mail' && <MailManagementView />}
        {activeView === 'bonuses' && <BonusesManagementView />}
      </CardContent>
    </Card>
  );
}
