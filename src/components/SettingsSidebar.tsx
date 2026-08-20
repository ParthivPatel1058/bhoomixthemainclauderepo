import React from 'react';
import { X, User, Bell, Moon, Sun, HelpCircle, Info, Package } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';

interface SettingsSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ open, onOpenChange }) => {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const menuItems = [
    { icon: User, label: t('profile'), path: '/settings' },
    { icon: Package, label: t('orders'), path: '/orders' },
    { icon: HelpCircle, label: t('support'), path: '/support' },
    { icon: Info, label: t('about'), path: '/settings' },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 glass-strong border-l border-primary/20">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
            {t('settings')}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Theme Toggle */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {t('appearance')}
            </h3>
            <div className="flex items-center justify-between p-4 rounded-[1.5rem] bg-card/50 border border-border/50">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="h-5 w-5 text-primary" />
                ) : (
                  <Sun className="h-5 w-5 text-primary" />
                )}
                <span className="font-medium">{t('theme')}</span>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Menu Items */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {t('account')}
            </h3>
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      navigate(item.path);
                      onOpenChange(false);
                    }}
                    className="w-full flex items-center gap-3 p-4 rounded-[1.5rem] bg-card/50 border border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-[transform,box-shadow,border-color,background-color,color,opacity,filter] duration-300 group"
                  >
                    <Icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-foreground">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Notifications Toggle */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {t('notifications')}
            </h3>
            <div className="flex items-center justify-between p-4 rounded-[1.5rem] bg-card/50 border border-border/50">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-primary" />
                <span className="font-medium">{t('notifications')}</span>
              </div>
              <Switch className="data-[state=checked]:bg-primary" />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsSidebar;
