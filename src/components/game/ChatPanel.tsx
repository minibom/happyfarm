
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
import type { ChatMessage, GameState } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useGameLogic } from '@/hooks/useGameLogic';

interface ChatPanelProps {
  isModalMode?: boolean;
  userStatus: GameState['status'];
}

const ChatPanel: FC<ChatPanelProps> = ({ isModalMode = false, userStatus }) => {
  const { user } = useAuth();
  const { gameState } = useGameLogic();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const messagesRef = query(ref(rtdb, 'messages'), orderByChild('timestamp'), limitToLast(50));
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedMessages = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        } as ChatMessage));
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
    if (!user || !gameState) return;

    if (userStatus === 'banned_chat') {
      toast({
        title: "Bị Cấm Chat",
        description: "Bạn không thể gửi tin nhắn vì tài khoản đã bị cấm chat.",
        variant: "destructive",
      });
      return;
    }

    if (newMessage.trim() === '') return;

    const senderDisplayName = gameState.displayName || user.email?.split('@')[0] || 'AnonymousFarmer';

    const messageData: Omit<ChatMessage, 'id'> = {
      senderUid: user.uid,
      senderDisplayName: senderDisplayName,
      text: newMessage.trim(),
      timestamp: serverTimestamp() as any,
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
              <div 
                key={msg.id} 
                className={cn(
                  "flex w-full", 
                  msg.senderUid === user?.uid ? "justify-end pl-8 sm:pl-12" : "justify-start pr-8 sm:pr-12"
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-lg shadow text-sm max-w-[80%]",
                    msg.senderUid === user?.uid
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border" 
                  )}
                >
                  <p className={cn(
                    "text-xs font-semibold mb-0.5",
                    msg.senderUid === user?.uid ? "text-primary-foreground/90" : "text-accent"
                  )}>
                    {msg.senderDisplayName || 'Người chơi'}
                  </p>
                  <p className="break-words whitespace-pre-wrap">{msg.text}</p>
                  <p
                    className={cn(
                      "text-xs mt-1",
                      msg.senderUid === user?.uid ? "text-right text-primary-foreground/70" : "text-left text-muted-foreground"
                    )}
                  >
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : "Đang gửi..."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <form onSubmit={handleSendMessage} className="flex space-x-2 pt-2 border-t">
          <Input
            type="text"
            placeholder={userStatus === 'banned_chat' ? "Bạn đã bị cấm chat" : "Nhập tin nhắn..."}
            className="flex-grow text-sm"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={!user || userStatus === 'banned_chat'}
          />
          <Button 
            type="submit" 
            className="bg-accent hover:bg-accent/90 text-accent-foreground" 
            disabled={!user || userStatus === 'banned_chat' || newMessage.trim() === ''}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Gửi</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChatPanel;
