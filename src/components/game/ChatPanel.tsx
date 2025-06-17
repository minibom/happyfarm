
'use client';

import type { FC } from 'react';
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { rtdb } from '@/lib/firebase';
import { ref, onValue, push, serverTimestamp, query, orderByChild, limitToLast } from 'firebase/database';
import type { ChatMessage } from '@/types';
import { cn } from '@/lib/utils';

interface ChatPanelProps {
  isModalMode?: boolean;
}

const ChatPanel: FC<ChatPanelProps> = ({ isModalMode = false }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const messagesRef = query(ref(rtdb, 'messages'), orderByChild('timestamp'), limitToLast(50));
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedMessages = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setMessages(loadedMessages);
      } else {
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user) return;

    const messageData = {
      sender: user.email || 'Người chơi Vô Danh',
      text: newMessage.trim(),
      timestamp: serverTimestamp(),
    };

    push(ref(rtdb, 'messages'), messageData);
    setNewMessage('');
  };

  return (
    <Card className={cn(
      "flex flex-col shadow-xl rounded-lg",
      isModalMode ? "w-full h-full max-h-[80vh] bg-background" : "w-96 h-[600px]"
    )}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-xl font-headline text-primary">
          <MessageCircle className="mr-2 h-6 w-6" />
          Trò Chuyện Nông Trại
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col p-4 pt-0">
        <ScrollArea className="flex-grow h-0 mb-4 border rounded-md p-3 bg-muted/30" ref={scrollAreaRef}>
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="text-sm leading-relaxed">
                <span className={`font-semibold ${msg.sender === (user?.email || 'Người chơi Vô Danh') ? 'text-accent' : 'text-primary/90'}`}>
                  {msg.sender === (user?.email || 'Người chơi Vô Danh') ? 'Bạn' : msg.sender.split('@')[0]}:
                </span>{' '}
                <span className="text-foreground/90">{msg.text}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
        <form onSubmit={handleSendMessage} className="flex space-x-2 pt-2 border-t">
          <Input
            type="text"
            placeholder="Nhập tin nhắn..."
            className="flex-grow text-sm"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={!user}
          />
          <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={!user || newMessage.trim() === ''}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Gửi</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChatPanel;
