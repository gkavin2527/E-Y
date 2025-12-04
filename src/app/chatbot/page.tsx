
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { chat } from '@/ai/flows/chat';
import type { ChatMessage } from '@/ai/flows/types';
import { useUser } from '@/firebase';

function ChatBubble({ message }: { message: ChatMessage }) {
    const { user } = useUser();
    const isUser = message.role === 'user';
  
    const getInitials = (name?: string | null) => {
        if (!name) return 'U';
        return name.charAt(0).toUpperCase();
    }
  
    return (
      <div className={`flex items-start gap-4 ${isUser ? 'justify-end' : ''}`}>
        {!isUser && (
          <Avatar className="h-8 w-8">
            <AvatarFallback><Bot /></AvatarFallback>
          </Avatar>
        )}
        <div
          className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${
            isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        {isUser && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.photoURL ?? undefined} />
            <AvatarFallback>{getInitials(user?.displayName || user?.email)}</AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  }

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: 'Hello! I am your personal shopping assistant. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chat({ history: newMessages });
      const botMessage: ChatMessage = { role: 'model', content: result.message };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: ChatMessage = {
        role: 'model',
        content: 'Sorry, something went wrong. Please try again.',
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] w-full max-w-4xl mx-auto bg-card border rounded-lg shadow-lg">
      <div className="flex-1 p-6 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="space-y-6 pr-4">
            {messages.map((message, index) => (
              <ChatBubble key={index} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-start gap-4">
                 <Avatar className="h-8 w-8">
                    <AvatarFallback><Bot /></AvatarFallback>
                </Avatar>
                <div className="max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 bg-muted flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about products, style, or anything else..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
