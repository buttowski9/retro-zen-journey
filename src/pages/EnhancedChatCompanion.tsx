import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile, useQuests } from '@/hooks/useSupabaseData';
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
  const { profile } = useUserProfile();
  const { assignQuest, quests } = useQuests();
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
  }, [user, navigate, profile]); // Add profile to dependencies

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

      // If no chat history, send personalized welcome message
      if (formattedMessages.length === 0) {
        const userName = profile?.name || 'friend';
        const userGoals = profile?.wellness_goals || [];
        const stressLevel = profile?.stress_level || 5;
        
        let welcomeContent = `Hey ${userName}! 😊 I'm your wellness companion! `;
        
        if (userGoals.length > 0) {
          welcomeContent += `I see you're working on ${userGoals[0]} - that's awesome! `;
        }
        
        if (stressLevel > 7) {
          welcomeContent += `I notice your stress levels have been high lately. I'm here to help you find some calm. `;
        } else if (stressLevel < 4) {
          welcomeContent += `You seem to be managing stress well! Let's keep that positive energy flowing. `;
        }
        
        welcomeContent += `How are you feeling today? I remember our past conversations and I'm here to listen, support you, and help with any challenges. Ready to make today awesome together?`;
        
        const welcomeMessage: Message = {
          id: 'welcome',
          type: 'companion',
          content: welcomeContent,
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      } else {
        // If there's chat history, show continuity
        console.log(`Loaded ${formattedMessages.length} messages from chat history`);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const getContextualResponse = (message: string, chatHistory: Message[]): string => {
    const lowerMessage = message.toLowerCase();
    const userName = profile?.name || 'friend';
    
    // Get recent context from chat history
    const recentMessages = chatHistory.slice(-6);
    const hasDiscussedStress = recentMessages.some(msg => 
      msg.content.toLowerCase().includes('stress') || 
      msg.content.toLowerCase().includes('anxious')
    );
    
    const hasDiscussedSleep = recentMessages.some(msg => 
      msg.content.toLowerCase().includes('sleep') || 
      msg.content.toLowerCase().includes('tired')
    );

    // Detect emotional tone and intensity
    const detectMood = (message: string) => {
      const highStress = /really|very|extremely|so|super|can't|overwhelmed|terrible|awful|horrible/.test(message);
      const positive = /good|great|awesome|happy|excited|amazing|wonderful|fantastic/.test(message);
      const negative = /bad|sad|down|depressed|anxious|worried|stressed|tired|exhausted/.test(message);
      
      if (positive) return 'positive';
      if (highStress || (negative && /really|very|extremely|so|super/.test(message))) return 'high_negative';
      if (negative) return 'negative';
      return 'neutral';
    };

    const mood = detectMood(lowerMessage);
    
    // Stress/Anxiety responses with quest integration
    if (lowerMessage.includes('stressed') || lowerMessage.includes('anxiety') || lowerMessage.includes('anxious')) {
      suggestQuestForEmotion('stress');
      if (hasDiscussedStress) {
        return `Hey ${userName}, I notice stress keeps coming up for you. Have you tried the breathing exercise I mentioned earlier? I just assigned you a quick 2-minute breathing quest - it might really help right now. What's been the biggest stressor today?`;
      }
      
      if (mood === 'high_negative') {
        return `${userName}, I can feel how overwhelmed you're feeling right now 💙 That sounds really intense. Take a deep breath with me for a second. I'm going to give you a gentle breathing quest to help you reset. What's making you feel most anxious right now?`;
      }
      
      return `I hear you're feeling stressed, ${userName} 💙 That's tough, but you're not alone in this. I've got a calming quest ready for you. Want to tell me more about what's been weighing on your mind? Sometimes just naming it helps.`;
    }

    // Sleep issues with personalized approach
    if (lowerMessage.includes('tired') || lowerMessage.includes('sleep') || lowerMessage.includes('exhausted')) {
      if (hasDiscussedSleep) {
        return `${userName}, sleep troubles again? 😴 I remember we talked about this. How did you sleep last night? I'm thinking of assigning you a gentle evening routine quest. Do you think that would help, or would you prefer something else?`;
      }
      
      const stressLevel = profile?.stress_level || 5;
      if (stressLevel > 7) {
        return `${userName}, sleep is extra important when stress is high 😴 Your stress level tells me your mind might be racing at bedtime. Want to try a wind-down quest? What's been keeping you up - thoughts or just can't get comfortable?`;
      }
      
      return `Sleep is everything, ${userName}! 😴 What's been messing with your sleep lately? Is it your mind being busy, or something else? I might have a perfect bedtime quest for you.`;
    }

    // Sad/down responses with empathy
    if (lowerMessage.includes('sad') || lowerMessage.includes('down') || lowerMessage.includes('depressed')) {
      if (mood === 'high_negative') {
        return `${userName}, I'm really glad you trusted me with this 💜 What you're feeling sounds really heavy. You don't have to carry this alone. I'm here with you. Want to try a gentle self-care quest together? What's been the hardest part today?`;
      }
      
      return `Thanks for sharing that with me, ${userName} 💜 Feeling down is so human, and I'm here for you. What's one tiny thing that sometimes makes you feel a little lighter? Even something super small? Let's find a gentle quest to lift your spirits.`;
    }

    // Boredom - suggest engaging quests
    if (lowerMessage.includes('bored') || lowerMessage.includes('nothing to do')) {
      suggestQuestForEmotion('boredom');
      return `Boredom hitting hard, ${userName}? 🎮 I just assigned you a fun quest to shake things up! Do you want something creative, active, or just something different? What usually gets you excited?`;
    }

    // Overwhelmed with personalized support
    if (lowerMessage.includes('overwhelmed') || lowerMessage.includes('too much')) {
      suggestQuestForEmotion('overwhelmed');
      const goals = profile?.wellness_goals || [];
      return `Feeling overwhelmed can be so draining, ${userName} 😓 I see ${goals.length > 0 ? `you're working on ${goals[0]}` : `you're juggling a lot`}. Let's break this down together - I just gave you a simple grounding quest. What feels like the biggest thing on your plate right now?`;
    }

    // Happy/good responses with energy matching
    if (lowerMessage.includes('good') || lowerMessage.includes('happy') || lowerMessage.includes('great') || lowerMessage.includes('awesome')) {
      if (mood === 'positive') {
        return `${userName}, I LOVE this energy! 😊✨ You're absolutely glowing today! What's got you feeling so amazing? Want me to assign you a fun challenge quest to ride this wave? Tell me what's been going so right!`;
      }
      
      return `That's wonderful to hear, ${userName}! 😊 Your positivity is contagious. What's been the highlight? Should we celebrate with a fun quest or just keep building on this good feeling?`;
    }

    // School/work with personalized advice
    if (lowerMessage.includes('school') || lowerMessage.includes('work') || lowerMessage.includes('homework') || lowerMessage.includes('exam')) {
      const stressLevel = profile?.stress_level || 5;
      if (stressLevel > 7) {
        suggestQuestForEmotion('study_stress');
        return `School pressure when you're already stressed is no joke, ${userName} 📚 I just assigned you a focus-and-breathe quest. What subject or task feels most overwhelming? Want to break it down into smaller pieces together?`;
      }
      
      return `School stuff can be intense, ${userName}! 📚 What's the trickiest part right now? Are you more stressed about the work itself or managing your time? I might have the perfect study-break quest for you!`;
    }

    // Follow-up with continuity and choices
    if (recentMessages.length > 0) {
      const lastUserMessage = recentMessages.filter(m => m.type === 'user').pop();
      if (lastUserMessage) {
        return `Thanks for sharing more, ${userName}. I can see this is important to you. How are you feeling about everything we've been talking about? Would you rather dive deeper into this, or would a quick mood-boosting quest help right now?`;
      }
    }

    // Default responses with personality and choices
    const defaultResponses = [
      `I'm really glad you shared that with me, ${userName} 💙 What's been on your mind today? Want to talk it through or would you prefer I suggest a quick wellness quest?`,
      `Thanks for opening up, ${userName}. I'm here to listen and support you. What would feel most helpful right now - talking more about this or trying something to shift your energy?`,
      `That sounds meaningful to you, ${userName}. How are you feeling about it? Should we explore this together or would you like me to suggest a quest that might help?`,
      `I appreciate you trusting me with this, ${userName} 💙 What's the most important thing on your heart right now? Want to dive into it or try a wellness activity together?`
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  // Dynamic quest assignment based on emotions
  const suggestQuestForEmotion = async (emotion: string) => {
    if (!user?.id) {
      console.error('No user ID available for quest assignment');
      return;
    }

    const questMappings = {
      'stress': ['Breathing Exercise', 'Mindful Walk', '5-Minute Meditation'],
      'boredom': ['Creative Journaling', 'Quick Dance Break', 'Gratitude List'],
      'overwhelmed': ['Grounding Exercise', 'Breathing Exercise', 'Organize Space'],
      'study_stress': ['Pomodoro Focus', 'Study Break Walk', 'Breathing Exercise']
    };

    const possibleQuests = questMappings[emotion as keyof typeof questMappings] || ['Mindful Walk'];
    const questTitle = possibleQuests[Math.floor(Math.random() * possibleQuests.length)];
    
    // Find quest in database and assign it
    const matchingQuest = quests.find(q => 
      q.title?.toLowerCase().includes(questTitle.toLowerCase()) ||
      questTitle.toLowerCase().includes(q.title?.toLowerCase())
    );
    
    if (matchingQuest) {
      try {
        // Check if quest is already assigned today
        const { data: existingQuest } = await supabase
          .from('user_quests')
          .select('id')
          .eq('user_id', user.id)
          .eq('quest_id', matchingQuest.id)
          .eq('assigned_date', new Date().toISOString().split('T')[0])
          .single();

        if (!existingQuest) {
          await assignQuest(matchingQuest.id);
          toast.success(`New quest assigned: ${matchingQuest.title}! Check your dashboard to complete it.`);
          console.log(`Quest "${matchingQuest.title}" assigned successfully for ${emotion}`);
        } else {
          console.log(`Quest "${matchingQuest.title}" already assigned today`);
        }
      } catch (error) {
        console.error('Error assigning quest:', error);
        // Try creating a simple quest record
        try {
          await supabase
            .from('user_quests')
            .insert({
              user_id: user.id,
              quest_id: matchingQuest.id,
              status: 'pending',
              assigned_date: new Date().toISOString().split('T')[0]
            });
          
          toast.success(`Quest assigned: ${matchingQuest.title}!`);
          console.log(`Fallback quest assignment successful`);
        } catch (fallbackError) {
          console.error('Fallback quest assignment failed:', fallbackError);
        }
      }
    } else {
      console.log(`No matching quest found for emotion: ${emotion}, title: ${questTitle}`);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date(),
    };

    // Store current message for context processing
    const messageToProcess = currentMessage;
    
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    // Generate contextual response with all current messages including the new one
    setTimeout(async () => {
      const updatedMessages = [...messages, userMessage];
      const companionResponse = getContextualResponse(messageToProcess, updatedMessages);
      
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
        
        console.log('Chat saved successfully');
      } catch (error) {
        console.error('Error saving chat:', error);
        toast.error('Failed to save conversation');
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
                  className={`p-4 transition-all duration-200 ${
                    message.type === 'user' 
                      ? 'bg-primary text-surface border-primary shadow-lg transform hover:scale-[1.02]' 
                      : 'bg-surface border-accent shadow-md hover:shadow-lg'
                  }`}
                >
                  <p className="text-pixel-sm whitespace-pre-wrap leading-relaxed">
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
                <PixelCard className="p-4 bg-surface border-accent shadow-md">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span className="text-pixel-xs text-muted-foreground">Companion is thinking...</span>
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