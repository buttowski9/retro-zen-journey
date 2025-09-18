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
    
    // First, check if this is within our scope (mental wellness only)
    if (!isWellnessRelated(lowerMessage)) {
      return `Hey ${userName} 💙 I'm your wellness companion, so I focus on helping with things like stress, anxiety, motivation, healthy habits, and student challenges. Is there something about your mental wellness or personal growth you'd like to talk about instead? I'm here to support you! 😊`;
    }

    // Crisis detection - highest priority
    if (detectCrisis(lowerMessage)) {
      return handleCrisisResponse(userName);
    }
    
    // Get recent context from chat history and user profile
    const recentMessages = chatHistory.slice(-6);
    const hasDiscussedStress = recentMessages.some(msg => 
      msg.content.toLowerCase().includes('stress') || 
      msg.content.toLowerCase().includes('anxious')
    );
    
    const hasDiscussedSleep = recentMessages.some(msg => 
      msg.content.toLowerCase().includes('sleep') || 
      msg.content.toLowerCase().includes('tired')
    );

    // Get user goals and preferences for personalization
    const userGoals = profile?.wellness_goals || [];
    const stressLevel = profile?.stress_level || 5;
    const motivationStyle = profile?.motivation_style || 'encouraging';

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
    
    // Stress/Anxiety responses with enhanced personalization
    if (lowerMessage.includes('stressed') || lowerMessage.includes('anxiety') || lowerMessage.includes('anxious')) {
      suggestQuestForEmotion('stress');
      
      // Reference their goals if relevant
      const stressGoal = userGoals.find(goal => goal.toLowerCase().includes('stress') || goal.toLowerCase().includes('calm'));
      const goalMessage = stressGoal ? ` I remember you're working on ${stressGoal.toLowerCase()}, so this is totally connected to that. ` : ' ';
      
      if (hasDiscussedStress) {
        return `Hey ${userName}, stress is showing up again for you.${goalMessage}Have you tried the breathing technique from our last chat? I just assigned you a 2-minute reset quest. 

What would help more right now - talking through what's stressing you out, or would you prefer I suggest some quick coping strategies? Your choice! 💙`;
      }
      
      if (mood === 'high_negative') {
        return `${userName}, I can really feel the intensity of what you're going through right now 💙${goalMessage}This sounds overwhelming, and I'm here with you. I just assigned a gentle breathing quest to help ground you.

Take your time - what's making you feel most anxious right now? Or would you rather try the breathing exercise first and then talk? Whatever feels right for you.`;
      }
      
      if (motivationStyle === 'gentle') {
        return `That sounds really tough, ${userName} 💙${goalMessage}Stress can feel so heavy. I've got a calming quest ready for you that's super gentle.

Want to share what's been weighing on your mind? Or would you prefer to try something calming first? I'm here either way.`;
      }
      
      return `I hear you're feeling stressed, ${userName} 💙${goalMessage}You're definitely not alone in this - stress is so human. I just assigned you a calming quest.

What would be most helpful - diving into what's causing the stress, or trying a quick reset activity first? What sounds better to you right now?`;
    }

    // Sleep issues with enhanced personalization and choices
    if (lowerMessage.includes('tired') || lowerMessage.includes('sleep') || lowerMessage.includes('exhausted')) {
      suggestQuestForEmotion('sleep');
      
      if (hasDiscussedSleep) {
        return `${userName}, sleep challenges are coming up again 😴 I remember our conversation about this. How have you been sleeping since we last talked?

I'm thinking of a few options:
• A gentle evening routine quest
• Some sleep hygiene tips
• A quick energy boost if you need to stay awake

What feels most helpful right now?`;
      }
      
      if (stressLevel > 7) {
        return `${userName}, sleep gets so much harder when stress is high 😴 Your stress level tells me your mind might be racing at bedtime. I just assigned you a wind-down quest.

What's been the biggest sleep disruptor lately?
• Racing thoughts
• Physical restlessness  
• Worry about tomorrow
• Something else?

Let's tackle this together!`;
      }
      
      return `Sleep affects everything, ${userName}! 😴 I just assigned you a sleep support quest.

What's been the main issue lately?
• Trouble falling asleep
• Waking up during the night
• Not feeling rested
• Just feeling exhausted during the day

Once I know more, I can give you the most helpful suggestions!`;
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

    // Enhanced default responses with better personalization and choices
    const getPersonalizedDefault = (): string => {
      const currentHour = new Date().getHours();
      const timeGreeting = currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : 'evening';
      
      // Reference recent conversations if available
      if (recentMessages.length > 2) {
        const lastTopics = recentMessages
          .filter(m => m.type === 'user')
          .slice(-2)
          .map(m => m.content.toLowerCase());
        
        if (lastTopics.some(topic => topic.includes('stress'))) {
          return `Thanks for sharing more, ${userName}. I remember we've been talking about stress lately. How are you feeling about everything right now? 

Would you like to:
• Continue working through the stress stuff
• Try a quick mood reset quest
• Talk about something completely different

I'm here for whatever feels right! 💙`;
        }
      }
      
      // Use user goals for personalized responses
      if (userGoals.length > 0) {
        const primaryGoal = userGoals[0];
        return `I appreciate you sharing with me, ${userName} 💙 Since I know you're focused on ${primaryGoal.toLowerCase()}, I'm wondering how that's been going for you lately.

What would be most helpful this ${timeGreeting}:
• Talking through what's on your mind
• Getting some motivation for your ${primaryGoal.toLowerCase()} journey
• A quick wellness quest to boost your mood

What sounds good to you?`;
      }
      
      // Motivational style-based responses
      if (motivationStyle === 'gentle') {
        return `Thanks for trusting me with your thoughts, ${userName} 💙 I'm here to listen and support you however feels best.

What would feel most comfortable:
• Talking through what's on your heart
• Some gentle encouragement
• A calming wellness activity

Take your time - no pressure at all.`;
      }
      
      if (motivationStyle === 'energetic') {
        return `Hey ${userName}! 💙 Love that you're here chatting with me this ${timeGreeting}! 

What's calling to you right now:
• Diving into what's on your mind
• Getting pumped up with some motivation
• Trying an energizing quest together

Let's make this ${timeGreeting} awesome! What sounds fun?`;
      }
      
      // Default encouraging response
      return `I'm really glad you're here, ${userName} 💙 What's been on your mind this ${timeGreeting}? 

I'm here to:
• Listen to whatever you want to share
• Offer support and advice
• Suggest wellness activities that might help

What would feel most helpful right now?`;
    };

    return getPersonalizedDefault();
  };

  // Helper functions for enhanced AI assistant
  const isWellnessRelated = (message: string): boolean => {
    const wellnessKeywords = [
      'stress', 'anxiety', 'anxious', 'worried', 'overwhelmed', 'tired', 'exhausted', 
      'sad', 'depressed', 'down', 'happy', 'good', 'great', 'motivation', 'mood',
      'sleep', 'habits', 'routine', 'exercise', 'meditation', 'breathe', 'breathing',
      'school', 'study', 'exam', 'work', 'productivity', 'focus', 'procrastination',
      'lonely', 'friends', 'relationship', 'confidence', 'self-esteem', 'pressure',
      'goal', 'goals', 'wellness', 'health', 'mental health', 'feeling', 'feelings',
      'emotion', 'emotions', 'cope', 'coping', 'help', 'support', 'advice',
      'bored', 'boredom', 'energy', 'lazy', 'unmotivated', 'stuck', 'frustrated',
      'angry', 'upset', 'confused', 'lost', 'hopeless', 'hopeful', 'excited',
      'nervous', 'scared', 'fear', 'phobia', 'panic', 'calm', 'peace', 'relax'
    ];
    
    const hasWellnessKeyword = wellnessKeywords.some(keyword => message.includes(keyword));
    const isGreeting = /^(hi|hello|hey|sup|what's up|how are you)/i.test(message.trim());
    const isShort = message.length < 50 && /how|feel|doing|today|life|ok|fine|good|bad/.test(message);
    
    return hasWellnessKeyword || isGreeting || isShort;
  };

  const detectCrisis = (message: string): boolean => {
    const crisisKeywords = [
      'suicide', 'kill myself', 'end it all', 'want to die', 'better off dead',
      'hurt myself', 'self harm', 'cutting', 'overdose', 'can\'t go on',
      'no point', 'give up', 'worthless', 'hate myself', 'everyone hates me'
    ];
    
    return crisisKeywords.some(keyword => message.includes(keyword));
  };

  const handleCrisisResponse = (userName: string): string => {
    return `${userName}, I'm really glad you trusted me with this. What you're feeling sounds incredibly heavy, and I want you to know that your life has value 💜

I care about your safety, and I think it would be really helpful to talk to someone who can provide professional support right now. Here are some resources:

🇮🇳 India:
• iCall: 9152987821 (Mon-Sat, 8am-10pm)
• Snehi: 91-22-27546669

🌍 International:
• Crisis Text Line: Text "HELLO" to 741741

You don't have to go through this alone. Would you be willing to reach out to one of these resources? In the meantime, I'm here to listen. What's been the hardest part today?`;
  };

  // Dynamic quest assignment based on emotions and user preferences
  const suggestQuestForEmotion = async (emotion: string) => {
    if (!user?.id) {
      console.error('No user ID available for quest assignment');
      return;
    }

    const questMappings = {
      'stress': ['Breathing Exercise', 'Mindful Walk', '5-Minute Meditation', 'Progressive Muscle Relaxation'],
      'boredom': ['Creative Journaling', 'Quick Dance Break', 'Gratitude List', 'Learn Something New'],
      'overwhelmed': ['Grounding Exercise', 'Breathing Exercise', 'Organize Space', 'Break Tasks Down'],
      'study_stress': ['Pomodoro Focus', 'Study Break Walk', 'Breathing Exercise', 'Study Space Reset'],
      'sleep': ['Evening Wind-Down', 'Sleep Meditation', 'Digital Detox Hour', 'Gratitude Journaling'],
      'motivation': ['Small Win Challenge', 'Energy Boost Walk', 'Goal Setting', 'Inspiration Reading'],
      'social': ['Reach Out Challenge', 'Kindness Quest', 'Social Confidence', 'Community Connection']
    };

    // Consider user preferences from profile
    const userPreferences = profile?.preferred_quest_types || [];
    const motivationStyle = profile?.motivation_style || 'encouraging';
    
    let possibleQuests = questMappings[emotion as keyof typeof questMappings] || ['Mindful Walk'];
    
    // Filter based on user preferences if available
    if (userPreferences.length > 0) {
      const preferredQuests = possibleQuests.filter(quest => 
        userPreferences.some(pref => quest.toLowerCase().includes(pref.toLowerCase()))
      );
      if (preferredQuests.length > 0) {
        possibleQuests = preferredQuests;
      }
    }

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
    const userName = profile?.name || 'friend';
    const questSuggestions = {
      breathing: `Perfect choice, ${userName}! 🫁 Here's a super effective technique: 
      
**4-7-8 Breathing:**
• Breathe in for 4 counts
• Hold for 7 counts  
• Breathe out for 8 counts
• Repeat 3-4 times

This actually activates your nervous system's calm response. Try it now and let me know how it feels! Want me to assign you a breathing quest too?`,
      
      walk: `Great idea, ${userName}! 🚶 Even a 5-minute walk can completely shift your energy.

**Mindful Walking Tips:**
• Notice 3 things you can see
• Listen for 2 different sounds
• Feel 1 physical sensation (ground, air, etc.)

Whether it's around your room, house, or outside - movement + mindfulness = magic! Want a walking quest to keep you motivated?`,
      
      journal: `Love this choice, ${userName}! ✍️ Writing can unlock so much clarity.

**Quick Journal Prompts:**
• What's one thing on your mind right now?
• How are you feeling in your body?
• What's one small thing you're grateful for?

No pressure to be perfect or profound - just let your thoughts flow. Should I assign you a journaling quest to keep this momentum going?`,
      
      gratitude: `Beautiful, ${userName}! 💙 Gratitude literally rewires your brain for positivity.

**Gratitude Micro-Practice:**
Think of something tiny you're thankful for right now. Could be:
• Your favorite pillow
• A friend who gets you
• That first sip of a warm drink
• Having a safe place to be

What came to mind for you? Want me to give you a daily gratitude quest?`,

      energy: `Yes, ${userName}! ⚡ Let's get your energy flowing!

**2-Minute Energy Boost:**
• 10 jumping jacks (or arm circles if sitting)
• Take 3 deep breaths
• Stretch your arms overhead
• Smile (seriously, it works!)

Your body affects your mood more than you think! Try it and tell me how you feel. Want an energizing quest for later?`,

      focus: `Smart choice, ${userName}! 🎯 Sometimes we just need to reset our mental clarity.

**Focus Reset Technique:**
• Clear your space of distractions
• Set a 10-minute timer
• Pick ONE thing to focus on
• When your mind wanders, gently bring it back

No judgment on the wandering - that's totally normal! How does your focus feel right now? Want a concentration quest?`
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

        {/* Enhanced Quick Actions */}
        <div className="p-4 border-t-2 border-primary">
          <p className="text-pixel-sm text-muted-foreground mb-3">
            Need a quick boost? Try these:
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            <PixelButton
              size="sm"
              variant="outline"
              onClick={() => suggestQuest('breathing')}
            >
              🫁 2-Min Breathing
            </PixelButton>
            <PixelButton
              size="sm"
              variant="outline"
              onClick={() => suggestQuest('walk')}
            >
              🚶 Mindful Walk
            </PixelButton>
            <PixelButton
              size="sm"
              variant="outline"
              onClick={() => suggestQuest('journal')}
            >
              ✍️ Quick Journal
            </PixelButton>
            <PixelButton
              size="sm"
              variant="outline"
              onClick={() => suggestQuest('gratitude')}
            >
              💙 Gratitude Moment
            </PixelButton>
            <PixelButton
              size="sm"
              variant="outline"
              onClick={() => suggestQuest('energy')}
            >
              ⚡ Energy Boost
            </PixelButton>
            <PixelButton
              size="sm"
              variant="outline"
              onClick={() => suggestQuest('focus')}
            >
              🎯 Focus Reset
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