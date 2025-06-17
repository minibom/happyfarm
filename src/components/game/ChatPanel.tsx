
'use client';

import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send } from 'lucide-react';

const messages = [
  { id: 1, sender: 'NongDanVuiVe', text: 'Chào mừng đến với phòng chat!' },
  { id: 2, sender: 'YeuCayTrong22', text: 'Cà chua của tôi lớn nhanh quá! 🍅' },
  { id: 3, sender: 'Bạn', text: 'Chào mọi người!' },
  { id: 4, sender: 'VuaNgo', text: 'Có ai có mẹo trồng ngô không?' },
  { id: 5, sender: 'CaRotNgonNhat', text: 'Mới thu hoạch được mớ cà rốt tuyệt vời! 🥕🥕🥕' },
  { id: 6, sender: 'Bạn', text: 'Tuyệt! Mình đang hy vọng vụ ngô bội thu.' },
];

const ChatPanel: FC = () => {
  return (
    <Card className="w-96 h-[600px] flex flex-col shadow-xl rounded-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-xl font-headline text-primary">
          <MessageCircle className="mr-2 h-6 w-6" />
          Trò Chuyện Nông Trại
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col p-4 pt-0">
        <ScrollArea className="flex-grow h-0 mb-4 border rounded-md p-3 bg-muted/30">
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="text-sm leading-relaxed">
                <span className={`font-semibold ${msg.sender === 'Bạn' ? 'text-accent' : 'text-primary/90'}`}>
                  {msg.sender}:
                </span>{' '}
                <span className="text-foreground/90">{msg.text}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex space-x-2 pt-2 border-t">
          <Input type="text" placeholder="Nhập tin nhắn..." className="flex-grow text-sm" />
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Send className="h-4 w-4" />
            <span className="sr-only">Gửi</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatPanel;
