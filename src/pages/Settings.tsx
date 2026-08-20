import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguagePicker from '@/components/LanguagePicker';
import { LANGUAGE_MAP } from '@/i18n/languages';
import { useTheme } from '@/contexts/ThemeContext';
import { useUIPrefs } from '@/hooks/useUIPrefs';
import Navigation from '@/components/Navigation';
import BackButton from '@/components/BackButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Palette, 
  Globe, 
  Bell, 
  HelpCircle, 
  Info, 
  Package,
  Moon,
  Sun,
  Sparkles,
  Rows3,
  Type,
  Contrast,
  PanelLeftClose,
  MapPin,
  RotateCcw,
  Mail,
  Phone,
  MessageSquare
} from 'lucide-react';

const Settings = () => {
  const { t, language, setLanguage, tx } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { prefs, set, reset } = useUIPrefs();
  const en = language === 'en';
  const [activeTab, setActiveTab] = useState('appearance');

  const tabs = [
    { id: 'appearance', label: t('appearance'), icon: Palette },
    { id: 'notifications', label: t('notifications'), icon: Bell },
    { id: 'support', label: t('support'), icon: HelpCircle },
    { id: 'orders', label: t('orders'), icon: Package },
    { id: 'about', label: t('about'), icon: Info },
  ];

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="px-4 lg:px-6 pt-5">
        <BackButton />
      </div>
      
      <div className="container mx-auto px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <h1 className="page-title mb-8 text-foreground">
          {t('settingsTitle')}
        </h1>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="glass rounded-3xl border-2 border-primary/10 lg:col-span-1 h-fit">
            <CardContent className="p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-[transform,box-shadow,border-color,background-color,color,opacity,filter] ${
                        activeTab === tab.id
                          ? 'accent-grad accent-ink shadow-lg'
                          : 'hover:bg-accent/50 text-foreground'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {activeTab === 'appearance' && (
              <Card className="glass rounded-3xl border-2 border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Palette className="h-6 w-6 text-primary" />
                    {t('appearance')}
                  </CardTitle>
                  <CardDescription>{tx('Customize how BhoomiX looks and feels', 'BhoomiX का रूप और अनुभव अनुकूलित करें')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Theme Toggle */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">{t('theme')}</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setTheme('light')}
                        className={`glass rounded-2xl p-6 border-2 transition-[transform,box-shadow,border-color,background-color,color,opacity,filter] ${
                          theme === 'light'
                            ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <Sun className="h-8 w-8 mx-auto mb-3 text-amber-500" />
                        <p className="font-semibold">{t('light')}</p>
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={`glass rounded-2xl p-6 border-2 transition-[transform,box-shadow,border-color,background-color,color,opacity,filter] ${
                          theme === 'dark'
                            ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <Moon className="h-8 w-8 mx-auto mb-3 text-[hsl(var(--aqua-deep))]" />
                        <p className="font-semibold">{t('dark')}</p>
                      </button>
                    </div>
                  </div>

                  <Separator />

                  {/* Language Selection */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      {t('language')}
                    </Label>
                    <LanguagePicker
                      trigger={
                        <button className="glass flex w-full items-center justify-between gap-4 rounded-2xl border-2 border-primary/40 p-6 text-left transition-[transform,box-shadow,border-color,background-color,color,opacity,filter] hover:border-primary">
                          <span>
                            <span className="mb-1 block text-2xl font-bold text-primary">
                              {LANGUAGE_MAP[language]?.native ?? language}
                            </span>
                            <span className="block text-sm text-muted-foreground">
                              {tx('Tap to change — 23 languages available', 'बदलने के लिए टैप करें — 23 भाषाएँ उपलब्ध')}
                            </span>
                          </span>
                          <Globe className="h-6 w-6 flex-shrink-0 text-primary" />
                        </button>
                      }
                    />
                  </div>

                  <Separator />

                  {/* Interface preferences */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-lg font-semibold">
                      <Sparkles className="h-5 w-5" />
                      {tx('Interface', 'इंटरफ़ेस')}
                    </Label>

                    {[
                      { key: 'motion' as const, icon: Sparkles, en: 'Animations', hi: 'एनिमेशन', dEn: 'Entrance and hover motion across the app', dHi: 'ऐप में प्रवेश और हॉवर एनिमेशन' },
                      { key: 'compact' as const, icon: Rows3, en: 'Compact layout', hi: 'संक्षिप्त लेआउट', dEn: 'Tighter spacing, fits more on screen', dHi: 'कम जगह, स्क्रीन पर अधिक सामग्री' },
                      { key: 'largeText' as const, icon: Type, en: 'Larger text', hi: 'बड़ा टेक्स्ट', dEn: 'Easier to read outdoors', dHi: 'बाहर पढ़ने में आसान' },
                      { key: 'highContrast' as const, icon: Contrast, en: 'High contrast', hi: 'उच्च कंट्रास्ट', dEn: 'Stronger borders and clearer text', dHi: 'गहरी सीमाएं और स्पष्ट टेक्स्ट' },
                      { key: 'sidebarCollapsed' as const, icon: PanelLeftClose, en: 'Start with sidebar collapsed', hi: 'साइडबार बंद रखें', dEn: 'Opens as an icon rail on load', dHi: 'शुरुआत में आइकन रेल के रूप में खुले' },
                      { key: 'useLocation' as const, icon: MapPin, en: 'Use my location', hi: 'मेरा स्थान उपयोग करें', dEn: 'Shows weather for where you are', dHi: 'आपके स्थान का मौसम दिखाए' },
                    ].map((row) => {
                      const RowIcon = row.icon;
                      return (
                        <div key={row.key} className="glass flex items-center justify-between gap-4 rounded-2xl p-4">
                          <div className="flex min-w-0 items-start gap-3">
                            <RowIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                            <div className="min-w-0 space-y-0.5">
                              <Label htmlFor={row.key} className="cursor-pointer">
                                {tx(row.en, row.hi)}
                              </Label>
                              <p className="text-sm text-muted-foreground">{tx(row.dEn, row.dHi)}</p>
                            </div>
                          </div>
                          <Switch
                            id={row.key}
                            checked={prefs[row.key]}
                            onCheckedChange={(v) => set(row.key, v)}
                          />
                        </div>
                      );
                    })}

                    <Button variant="outline" onClick={reset} className="mt-2 gap-2">
                      <RotateCcw className="h-4 w-4" />
                      {tx('Reset to defaults', 'डिफ़ॉल्ट पर रीसेट करें')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card className="glass rounded-3xl border-2 border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Bell className="h-6 w-6 text-primary" />
                    {t('notifications')}
                  </CardTitle>
                  <CardDescription>{tx('Manage your notification preferences', 'अपनी सूचना प्राथमिकताएं प्रबंधित करें')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between glass rounded-2xl p-4">
                    <div className="space-y-1">
                      <Label htmlFor="order-updates">{tx('Order Updates', 'ऑर्डर अपडेट')}</Label>
                      <p className="text-sm text-muted-foreground">{tx('Get notified about your order status', 'अपने ऑर्डर की स्थिति की सूचना पाएं')}</p>
                    </div>
                    <Switch id="order-updates" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between glass rounded-2xl p-4">
                    <div className="space-y-1">
                      <Label htmlFor="weather-alerts">{tx('Weather Alerts', 'मौसम अलर्ट')}</Label>
                      <p className="text-sm text-muted-foreground">{tx('Receive weather updates for farming', 'खेती के लिए मौसम अपडेट पाएं')}</p>
                    </div>
                    <Switch id="weather-alerts" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between glass rounded-2xl p-4">
                    <div className="space-y-1">
                      <Label htmlFor="crop-tips">{tx('Farming Tips', 'खेती के सुझाव')}</Label>
                      <p className="text-sm text-muted-foreground">{tx('Get helpful farming tips and advice', 'उपयोगी खेती सुझाव और सलाह पाएं')}</p>
                    </div>
                    <Switch id="crop-tips" />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'support' && (
              <Card className="glass rounded-3xl border-2 border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <HelpCircle className="h-6 w-6 text-primary" />
                    {t('support')}
                  </CardTitle>
                  <CardDescription>{tx('Get help and support', 'मदद और सहायता पाएं')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start glass rounded-2xl h-auto p-6 border-2 border-primary/20 hover:border-primary/50" variant="outline">
                    <Mail className="h-5 w-5 mr-3 text-primary" />
                    <div className="text-left">
                      <p className="font-semibold">{t('contactSupport')}</p>
                      <p className="text-sm text-muted-foreground">support@kisansmart.com</p>
                    </div>
                  </Button>
                  <Button className="w-full justify-start glass rounded-2xl h-auto p-6 border-2 border-primary/20 hover:border-primary/50" variant="outline">
                    <Phone className="h-5 w-5 mr-3 text-secondary" />
                    <div className="text-left">
                      <p className="font-semibold">{t('helpCenter')}</p>
                      <p className="text-sm text-muted-foreground">1800-123-4567 ({tx('Toll Free', 'टोल फ्री')})</p>
                    </div>
                  </Button>
                  <Button className="w-full justify-start glass rounded-2xl h-auto p-6 border-2 border-primary/20 hover:border-primary/50" variant="outline">
                    <MessageSquare className="h-5 w-5 mr-3 text-accent" />
                    <div className="text-left">
                      <p className="font-semibold">{t('reportIssue')}</p>
                      <p className="text-sm text-muted-foreground">{tx('Submit a support ticket', 'सहायता टिकट भेजें')}</p>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeTab === 'orders' && (
              <Card className="glass rounded-3xl border-2 border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Package className="h-6 w-6 text-primary" />
                    {t('orders')}
                  </CardTitle>
                  <CardDescription>{t('orderHistory')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-semibold mb-2">{tx('No orders yet', 'अभी कोई ऑर्डर नहीं')}</p>
                    <p className="text-muted-foreground mb-4">{tx('Start shopping to see your orders here', 'खरीदारी शुरू करें, आपके ऑर्डर यहाँ दिखेंगे')}</p>
                    <Button className="btn-metal rounded-2xl">
                      {t('shopNow')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'about' && (
              <Card className="glass rounded-3xl border-2 border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Info className="h-6 w-6 text-primary" />
                    {t('about')}
                  </CardTitle>
                  <CardDescription>{t('aboutApp')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="glass rounded-2xl p-6 text-center">
                    <div className="text-6xl mb-4">🌾</div>
                    <h3 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">
                      KisanSmart
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Empowering farmers with technology and AI-powered solutions
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t('version')} 1.0.0
                    </p>
                  </div>
                  <div className="glass rounded-2xl p-6 space-y-3">
                    <h4 className="font-semibold text-lg">{tx('Features:', 'विशेषताएं:')}</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>✅ AI-powered crop disease detection</li>
                      <li>✅ Quality agricultural products marketplace</li>
                      <li>✅ Quick grocery delivery</li>
                      <li>✅ Multi-language support (23 Indian languages)</li>
                      <li>✅ Weather updates and farming tips</li>
                      <li>✅ Government schemes information</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
