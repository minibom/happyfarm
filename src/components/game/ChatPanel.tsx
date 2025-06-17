
'use client';

import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send } from 'lucide-react';

// Dummy messages for now
const messages = [
  { id: 1, sender: 'FarmerJoe', text: 'Welcome to the chat!' },
  { id: 2, sender: 'PlantLover22', text: 'My tomatoes are growing so fast! 🍅' },
  { id: 3, sender: 'You', text: 'Hey everyone!' },
  { id: 4, sender: 'CornKing', text: 'Anyone got tips for growing corn?' },
  { id: 5, sender: 'BerryBest', text: 'Just harvested some amazing carrots! 🥕🥕🥕' },
  { id: 6, sender: 'You', text: 'Nice! I\'m hoping for a good corn harvest.' },
];

const ChatPanel: FC = () => {
  return (
    <Card className="w-96 h-[600px] flex flex-col shadow-xl rounded-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-xl font-headline text-primary">
          <MessageCircle className="mr-2 h-6 w-6" />
          Farm Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col p-4 pt-0">
        <ScrollArea className="flex-grow h-0 mb-4 border rounded-md p-3 bg-muted/30">
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="text-sm leading-relaxed">
                <span className={`font-semibold ${msg.sender === 'You' ? 'text-accent' : 'text-primary/90'}`}>
                  {msg.sender}:
                </span>{' '}
                <span className="text-foreground/90">{msg.text}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex space-x-2 pt-2 border-t">
          <Input type="text" placeholder="Type a message..." className="flex-grow text-sm" />
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatPanel;
