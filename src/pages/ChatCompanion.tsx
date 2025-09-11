import { useState } from 'react';
import { PixelButton } from '@/components/ui/pixel-button';
import { PixelCard } from '@/components/ui/pixel-card';
import PixelNavigation from '@/components/pixel/PixelNavigation';
import PixelCharacter from '@/components/pixel/PixelCharacter';
import PixelAvatar from '@/components/pixel/PixelAvatar';
import { Input } from '@/components/ui/input';
import { Send, AlertTriangle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import pixelStudyRoom from '@/assets/pixel-study-room.png';

interface Message {
  id: string;
  type: 'user' | 'companion';
  content: string;
  timestamp: Date;
  mood?: 'happy' | 'sad' | 'thinking' | 'excited' | 'neutral';
}

const ChatCompanion = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'companion',
      content: "Hello, adventurer! I'm PixelPal, your wellness companion! How are you feeling today?",
      timestamp: new Date(),
      mood: 'happy'
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Simulated AI responses (in real app, this would connect to Supabase + AI)
  const companionResponses = [
    { trigger: ['sad', 'down', 'depressed', 'upset'], response: "I hear you're feeling down. That's completely okay - we all have tough days. Would a gentle walk or some deep breathing help right now?", mood: 'sad' },
    { trigger: ['happy', 'great', 'good', 'awesome'], response: "That's wonderful to hear! Your positive energy is contagious! How about we channel that into completing a fun quest?", mood: 'excited' },
    { trigger: ['tired', 'exhausted', 'sleepy'], response: "Rest is so important for your wellness journey. Have you been getting enough sleep? Maybe we can work on a better bedtime routine!", mood: 'thinking' },
    { trigger: ['stressed', 'anxious', 'worried'], response: "I understand you're feeling stressed. Let's take this one step at a time. Try taking 3 deep breaths with me right now. In... and out...", mood: 'thinking' },
    { trigger: ['help', 'crisis', 'hurt'], response: "I'm concerned about you. If you're in crisis, please reach out to a mental health professional or crisis helpline immediately. You're not alone! 🆘", mood: 'sad' }
  ];

  const sendMessage = () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    // Check for crisis keywords
    const crisisKeywords = ['crisis', 'hurt', 'suicide', 'die', 'kill'];
    const hasCrisisContent = crisisKeywords.some(keyword => 
      currentMessage.toLowerCase().includes(keyword)
    );

    if (hasCrisisContent) {
      toast.error("Crisis Support Resources Available", {
        description: "Please reach out to a crisis helpline if you need immediate help.",
        duration: 10000,
      });
    }

    // Simulate AI response delay
    setTimeout(() => {
      const messageText = currentMessage.toLowerCase();
      let response = "That's interesting! Tell me more about how you're feeling. I'm here to support your wellness journey! ✨";
      let mood: any = 'neutral';

      // Find matching response
      for (const resp of companionResponses) {
        if (resp.trigger.some(trigger => messageText.includes(trigger))) {
          response = resp.response;
          mood = resp.mood;
          break;
        }
      }

      const companionMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'companion',
        content: response,
        timestamp: new Date(),
        mood
      };

      setMessages(prev => [...prev, companionMessage]);
      setIsTyping(false);

      // Suggest a quest based on the conversation
      if (messageText.includes('walk') || messageText.includes('exercise')) {
        setTimeout(() => {
          toast.success("New Quest Available!", {
            description: "Take a 15-minute wellness walk - Added to your dashboard!",
            duration: 5000,
          });
        }, 2000);
      }
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <main 
      className="min-h-screen bg-background pb-24 relative"
      style={{
        backgroundImage: `url(${pixelStudyRoom})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated'
      }}
    >
      <div className="absolute inset-0 bg-background/85"></div>
      
      <div className="max-w-md mx-auto h-screen flex flex-col relative z-10">
        {/* Header */}
        <div className="p-4 hud-element border-b-2 border-primary">
          <div className="flex items-center gap-3">
            <PixelCharacter size="md" />
            <div className="flex-1">
              <h1 className="text-pixel font-pixel text-primary">PIXELPAL</h1>
              <p className="text-pixel-sm text-muted-foreground font-pixel">
                Your Wellness Companion
              </p>
            </div>
            <Sparkles className="w-4 h-4 text-pixel-accent animate-pulse" />
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.type === 'companion' && (
                <PixelAvatar size="sm" mood={message.mood} />
              )}
              
              <PixelCard 
                className={`max-w-[80%] p-3 ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-surface'
                }`}
              >
                <p className="text-pixel-sm font-pixel leading-relaxed">
                  {message.content}
                </p>
                <div className="mt-2 text-pixel-sm opacity-60">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </PixelCard>
              
              {message.type === 'user' && (
                <div className="w-8 h-8 bg-primary border-2 border-primary flex items-center justify-center">
                  <div className="w-3 h-3 bg-primary-foreground"></div>
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3 justify-start">
              <PixelAvatar size="sm" mood="thinking" />
              <PixelCard className="bg-surface p-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-primary animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </PixelCard>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 hud-element border-t-2 border-primary">
          <div className="flex gap-3 items-end">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="input-pixel flex-1"
              disabled={isTyping}
            />
            <PixelButton 
              onClick={sendMessage}
              disabled={!currentMessage.trim() || isTyping}
              size="icon"
              variant="default"
            >
              <Send className="w-4 h-4" />
            </PixelButton>
          </div>
          
          {/* Crisis help notice */}
          <div className="mt-2 p-2 bg-pixel-warning/10 border border-pixel-warning/30 flex items-center gap-2">
            <AlertTriangle className="w-3 h-3 text-pixel-warning" />
            <p className="text-pixel-sm text-pixel-warning font-pixel">
              In crisis? Call 988 (US) for immediate help
            </p>
          </div>
        </div>
      </div>
      
      <PixelNavigation />
    </main>
  );
};

export default ChatCompanion;