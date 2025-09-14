import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PixelButton } from '@/components/ui/pixel-button';
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from '@/components/ui/pixel-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PixelCharacter from '@/components/pixel/PixelCharacter';
import { UserPlus, LogIn, Sparkles } from 'lucide-react';
import pixelForestBg from '@/assets/pixel-forest-bg.png';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, name);
        if (!error) {
          navigate('/');
        }
      } else {
        const { error } = await signIn(email, password);
        if (!error) {
          navigate('/dashboard');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: `url(${pixelForestBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated'
      }}
    >
      <div className="absolute inset-0 bg-background/80"></div>
      
      <div className="w-full max-w-md mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <PixelCharacter size="lg" />
          <div className="space-y-2">
            <h1 className="text-pixel-xl font-pixel text-primary">
              MINDQUEST
            </h1>
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-pixel-accent animate-pulse" />
              <p className="text-pixel-sm text-muted-foreground font-pixel">
                YOUR WELLNESS ADVENTURE AWAITS
              </p>
              <Sparkles className="w-4 h-4 text-pixel-accent animate-pulse" />
            </div>
          </div>
        </div>

        {/* Auth Form */}
        <PixelCard>
          <PixelCardHeader>
            <PixelCardTitle className="text-center">
              {isSignUp ? 'CREATE ACCOUNT' : 'WELCOME BACK'}
            </PixelCardTitle>
          </PixelCardHeader>
          <PixelCardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-pixel-sm font-pixel">
                    ADVENTURER NAME
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-pixel"
                    placeholder="Enter your name"
                    required={isSignUp}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-pixel-sm font-pixel">
                  EMAIL
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-pixel"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-pixel-sm font-pixel">
                  PASSWORD
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-pixel"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
              </div>
              
              <PixelButton
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                    LOADING...
                  </div>
                ) : (
                  <>
                    {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                    {isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
                  </>
                )}
              </PixelButton>
            </form>
          </PixelCardContent>
        </PixelCard>

        {/* Toggle Form */}
        <PixelCard className="p-4 text-center">
          <p className="text-pixel-sm text-muted-foreground mb-3">
            {isSignUp ? 'Already have an account?' : 'New to MindQuest?'}
          </p>
          <PixelButton
            variant="outline"
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full"
          >
            {isSignUp ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </PixelButton>
        </PixelCard>
      </div>
    </main>
  );
};

export default Auth;