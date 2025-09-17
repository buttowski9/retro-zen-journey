import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PixelCard } from '@/components/ui/pixel-card';
import { PixelButton } from '@/components/ui/pixel-button';
import PixelCharacter from '@/components/pixel/PixelCharacter';
import PixelNavigation from '@/components/pixel/PixelNavigation';
import { toast } from 'sonner';
import pixelCompanion from '@/assets/pixel-companion.png';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  type: 'user' | 'companion';
  content: string;
  timestamp: Date;
  mood?: string;
}

const EnhancedChatCompanion = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    loadChatHistory();
  }, [user, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true })
        .limit(20);

      if (error) throw error;

      const formattedMessages: Message[] = [];
      data?.forEach((chat, index) => {
        if (chat.message) {
          formattedMessages.push({
            id: `${chat.id}-user`,
            type: 'user',
            content: chat.message,
            timestamp: new Date(chat.created_at),
          });
        }
        if (chat.response) {
          formattedMessages.push({
            id: `${chat.id}-companion`,
            type: 'companion',
            content: chat.response,
            timestamp: new Date(chat.created_at),
          });
        }
      });

      setMessages(formattedMessages);

      // If no chat history, send welcome message
      if (formattedMessages.length === 0) {
        const welcomeMessage: Message = {
          id: 'welcome',
          type: 'companion',
          content: "Hey there! 😊 I'm your wellness companion! How are you feeling today? I'm here to listen, support you, and help with any challenges you're facing.",
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const getContextualResponse = (message: string, chatHistory: Message[]): string => {
    const lowerMessage = message.toLowerCase();
    
    // Get recent context from chat history
    const recentMessages = chatHistory.slice(-6); // Last 3 exchanges
    const hasDiscussedStress = recentMessages.some(msg => 
      msg.content.toLowerCase().includes('stress') || 
      msg.content.toLowerCase().includes('anxious')
    );
    
    const hasDiscussedSleep = recentMessages.some(msg => 
      msg.content.toLowerCase().includes('sleep') || 
      msg.content.toLowerCase().includes('tired')
    );

    // Stress/Anxiety responses
    if (lowerMessage.includes('stressed') || lowerMessage.includes('anxiety') || lowerMessage.includes('anxious')) {
      if (hasDiscussedStress) {
        return "I remember you mentioned feeling stressed earlier. Have you tried any of the breathing exercises we talked about? Sometimes taking just 3 deep breaths can help reset your mind. What's been the most stressful part of your day?";
      }
      return "I hear that you're feeling stressed 💙 That sounds really tough. Can you tell me more about what's been weighing on your mind? Sometimes just talking about it can help lighten the load.";
    }

    // Sleep issues
    if (lowerMessage.includes('tired') || lowerMessage.includes('sleep') || lowerMessage.includes('exhausted')) {
      if (hasDiscussedSleep) {
        return "Sleep troubles again? 😴 I know we talked about this before. How did last night go? Have you been able to try creating a wind-down routine before bed?";
      }
      return "Sleep is so important for our well-being! 😴 What's been affecting your sleep lately? Is it your mind racing, or maybe screen time before bed?";
    }

    // Sad/down responses
    if (lowerMessage.includes('sad') || lowerMessage.includes('down') || lowerMessage.includes('depressed')) {
      return "I'm really glad you felt comfortable sharing that with me 💜 Feeling down is part of being human, and you're not alone in this. What's one small thing that usually brings you a tiny bit of joy? Even if it doesn't feel like much right now?";
    }

    // Overwhelmed
    if (lowerMessage.includes('overwhelmed') || lowerMessage.includes('too much')) {
      return "Feeling overwhelmed can be so draining 😓 Let's break this down together. What feels like the biggest priority right now? Sometimes focusing on just one thing at a time can help make everything feel more manageable.";
    }

    // Happy/good responses
    if (lowerMessage.includes('good') || lowerMessage.includes('happy') || lowerMessage.includes('great') || lowerMessage.includes('awesome')) {
      return "That's wonderful to hear! 😊 I love seeing you feeling positive. What's been going well for you? It's so important to celebrate these good moments!";
    }

    // School/work stress
    if (lowerMessage.includes('school') || lowerMessage.includes('work') || lowerMessage.includes('homework')) {
      return "School and work pressures can feel intense! 📚 What's the most challenging part right now? Remember, it's okay to take breaks and ask for help when you need it.";
    }

    // Relationship issues
    if (lowerMessage.includes('friend') || lowerMessage.includes('family') || lowerMessage.includes('relationship')) {
      return "Relationships can be complicated sometimes 💭 Want to tell me more about what's going on? Sometimes talking through these feelings can help us see things more clearly.";
    }

    // Follow-up questions based on context
    if (recentMessages.length > 0) {
      const lastUserMessage = recentMessages.filter(m => m.type === 'user').pop();
      if (lastUserMessage) {
        return `Thanks for sharing more with me. I'm here to listen and support you. How are you feeling about everything we've been talking about? Is there anything specific you'd like to focus on or work through together?`;
      }
    }

    // Default supportive responses
    const defaultResponses = [
      "Thanks for sharing that with me 💙 I'm here to listen. How has your day been treating you overall?",
      "I appreciate you opening up to me. What's been on your mind lately? Sometimes it helps just to get thoughts out.",
      "That sounds important to you. Can you tell me more about how you're feeling about it? I'm here to support you.",
      "I'm glad you felt comfortable sharing with me. What would feel most helpful to talk about right now?",
      "It sounds like you have a lot going on. What's been the most challenging part of your week so far?"
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    // Generate contextual response
    setTimeout(async () => {
      const companionResponse = getContextualResponse(currentMessage, messages);
      
      const companionMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'companion',
        content: companionResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, companionMessage]);
      setIsTyping(false);

      // Save conversation to database
      try {
        await supabase
          .from('chat_history')
          .insert({
            user_id: user?.id,
            message: userMessage.content,
            response: companionMessage.content,
          });
      } catch (error) {
        console.error('Error saving chat:', error);
      }
    }, 1500 + Math.random() * 1000); // Realistic typing delay
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestQuest = (type: string) => {
    const questSuggestions = {
      breathing: "Try this: Take 4 deep breaths in for 4 counts, hold for 4, then out for 6. This activates your calm response! 🫁",
      walk: "How about a 10-minute mindful walk? Even around your house or yard. Focus on what you see, hear, and feel. Nature (even a houseplant!) can be really grounding 🌱",
      journal: "Sometimes writing helps clear our minds. Try writing down 3 things - doesn't matter what, just whatever comes to mind. No pressure to make it perfect! ✍️",
      gratitude: "When things feel heavy, sometimes tiny gratitudes help. Can you think of one small thing you're thankful for today? Even something as simple as a warm drink or comfortable bed 💙"
    };

    const message: Message = {
      id: (Date.now() + 1).toString(),
      type: 'companion',
      content: questSuggestions[type as keyof typeof questSuggestions],
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, message]);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-surface pb-20">
      <div className="container mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="border-b-2 border-primary p-4">
          <div className="flex items-center gap-3">
            <img 
              src={pixelCompanion} 
              alt="Wellness Companion" 
              className="w-12 h-12 pixelated"
            />
            <div>
              <h1 className="text-lg font-pixel text-primary">
                Your Wellness Companion
              </h1>
              <p className="text-pixel-sm text-muted-foreground">
                Always here to listen and support you 💙
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-start gap-3 max-w-[80%]">
                {message.type === 'companion' && (
                  <img 
                    src={pixelCompanion} 
                    alt="Companion" 
                    className="w-8 h-8 pixelated mt-1"
                  />
                )}
                
                <PixelCard 
                  className={`p-3 ${
                    message.type === 'user' 
                      ? 'bg-primary text-surface' 
                      : 'bg-surface'
                  }`}
                >
                  <p className="text-pixel-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p className={`text-pixel-xs mt-2 opacity-70 ${
                    message.type === 'user' ? 'text-surface/70' : 'text-muted-foreground'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </PixelCard>

                {message.type === 'user' && (
                  <PixelCharacter size="sm" className="mt-1" />
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start gap-3">
                <img 
                  src={pixelCompanion} 
                  alt="Companion" 
                  className="w-8 h-8 pixelated mt-1"
                />
                <PixelCard className="p-3 bg-surface">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </PixelCard>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t-2 border-primary">
          <div className="flex flex-wrap gap-2 mb-4">
            <PixelButton
              size="sm"
              variant="outline"
              onClick={() => suggestQuest('breathing')}
            >
              🫁 Breathing
            </PixelButton>
            <PixelButton
              size="sm"
              variant="outline"
              onClick={() => suggestQuest('walk')}
            >
              🚶 Walk
            </PixelButton>
            <PixelButton
              size="sm"
              variant="outline"
              onClick={() => suggestQuest('journal')}
            >
              ✍️ Journal
            </PixelButton>
            <PixelButton
              size="sm"
              variant="outline"
              onClick={() => suggestQuest('gratitude')}
            >
              💙 Gratitude
            </PixelButton>
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your mind..."
              className="flex-1 border-2 border-primary bg-surface"
              disabled={isTyping}
            />
            <PixelButton
              onClick={sendMessage}
              disabled={!currentMessage.trim() || isTyping}
            >
              Send
            </PixelButton>
          </div>
        </div>
      </div>

      <PixelNavigation />
    </div>
  );
};

export default EnhancedChatCompanion;