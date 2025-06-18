
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Send, Users, User } from 'lucide-react';

export default function AdminMailPage() {
  // Placeholder state for mail composition
  const [recipientType, setRecipientType] = useState<'all' | 'specific'>('all');
  const [recipientUid, setRecipientUid] = useState('');
  const [mailSubject, setMailSubject] = useState('');
  const [mailBody, setMailBody] = useState('');

  const handleSendMail = () => {
    // TODO: Implement mail sending logic (e.g., call a Firebase Function)
    // This will involve writing to the 'mail' collection in Firestore for each recipient.
    alert(`(Mô phỏng) Gửi thư:\nNgười nhận: ${recipientType === 'all' ? 'Tất cả người chơi' : `UID: ${recipientUid}`}\nChủ đề: ${mailSubject}\nNội dung: ${mailBody}`);
    // Clear form after "sending"
    setRecipientUid('');
    setMailSubject('');
    setMailBody('');
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary font-headline flex items-center gap-2">
            <Mail className="h-7 w-7"/> Quản Lý Hệ Thống Thư
          </CardTitle>
          <CardDescription>
            Soạn và gửi thư thông báo hoặc quà tặng cho người chơi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="border-blue-500/50">
            <CardHeader>
              <CardTitle className="text-xl">Soạn Thư Mới</CardTitle>
              <CardDescription>
                Gửi thư cho tất cả người chơi hoặc một người chơi cụ thể. Phần thưởng đính kèm sẽ được triển khai sau.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Người Nhận</Label>
                <div className="flex gap-4 mt-1">
                  <Button 
                    variant={recipientType === 'all' ? 'default' : 'outline'} 
                    onClick={() => setRecipientType('all')}
                    className={recipientType === 'all' ? 'bg-primary hover:bg-primary/90' : ''}
                  >
                    <Users className="mr-2 h-4 w-4"/> Gửi Tất Cả
                  </Button>
                  <Button 
                    variant={recipientType === 'specific' ? 'default' : 'outline'} 
                    onClick={() => setRecipientType('specific')}
                    className={recipientType === 'specific' ? 'bg-primary hover:bg-primary/90' : ''}
                  >
                    <User className="mr-2 h-4 w-4"/> Gửi Cụ Thể
                  </Button>
                </div>
              </div>

              {recipientType === 'specific' && (
                <div className="space-y-1">
                  <Label htmlFor="recipientUid">UID Người Nhận</Label>
                  <Input 
                    id="recipientUid" 
                    value={recipientUid} 
                    onChange={(e) => setRecipientUid(e.target.value)}
                    placeholder="Nhập Firebase User ID"
                  />
                </div>
              )}

              <div className="space-y-1">
                <Label htmlFor="mailSubject">Chủ Đề Thư</Label>
                <Input 
                  id="mailSubject" 
                  value={mailSubject}
                  onChange={(e) => setMailSubject(e.target.value)}
                  placeholder="Ví dụ: Thông báo bảo trì, Chúc mừng sự kiện..."
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="mailBody">Nội Dung Thư</Label>
                <Textarea 
                  id="mailBody" 
                  value={mailBody}
                  onChange={(e) => setMailBody(e.target.value)}
                  placeholder="Nhập nội dung chi tiết của thư..."
                  rows={6}
                />
              </div>
              
              {/* Placeholder for adding rewards */}
              <div className="space-y-1">
                <Label>Vật Phẩm Đính Kèm (Sắp có)</Label>
                <p className="text-sm text-muted-foreground">Chức năng thêm vàng, XP, hoặc vật phẩm vào thư sẽ được phát triển sau.</p>
              </div>

              <Button onClick={handleSendMail} className="bg-accent hover:bg-accent/90">
                <Send className="mr-2 h-5 w-5" />
                Gửi Thư (Mô Phỏng)
              </Button>
            </CardContent>
          </Card>

           <Card className="border-gray-400/50">
            <CardHeader>
                <CardTitle className="text-xl">Lịch Sử Thư Đã Gửi</CardTitle>
                <CardDescription>
                Xem lại các thư đã được gửi từ hệ thống. (Chức năng này sẽ được phát triển)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Tính năng xem lịch sử thư sẽ được cập nhật trong tương lai...</p>
            </CardContent>
          </Card>

        </CardContent>
      </Card>
    </div>
  );
}
