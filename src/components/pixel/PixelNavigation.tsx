import { Link, useLocation } from 'react-router-dom';
import { Home, Trophy, MessageSquare, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const PixelNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/dashboard', icon: Home, label: 'HOME' },
    { path: '/progress', icon: Trophy, label: 'PROGRESS' },
    { path: '/chat', icon: MessageSquare, label: 'AI CHAT' },
    { path: '/profile', icon: User, label: 'PROFILE' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t-2 border-primary">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-4">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center gap-1 p-2 transition-all duration-75",
                "border-2 border-transparent hover:border-primary/50",
                isActive && "border-primary bg-primary/10",
                "btn-pixel"
              )}
            >
              <Icon 
                size={16} 
                className={cn(
                  "transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )} 
              />
              <span 
                className={cn(
                  "text-pixel-sm font-pixel transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default PixelNavigation;