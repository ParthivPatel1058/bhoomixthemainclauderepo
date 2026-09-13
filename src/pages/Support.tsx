import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Leaf, Loader2, MessageSquare, Package, ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import PageShell from '@/components/layout/PageShell';
import PageHeader from '@/components/layout/PageHeader';

/**
 * Support.
 *
 * This page used to be a template. It listed a toll-free number, an email
 * address at a different company, a WhatsApp number belonging to whoever
 * owns 98765-43210, an office at "123 Kisan Bhawan", "24/7" availability
 * and a "reply within 24 hours" promise — none of it real — and the form
 * showed "Message Sent!" while discarding the text. A farmer with a real
 * problem got a false receipt and no one ever saw their message.
 *
 * Now the form writes to `support_messages`, which the team reads in the
 * dashboard, and the page claims exactly the channels that exist. Real
 * phone, email and office details belong here once there are any; until
 * then, nothing is invented.
 */
const Support = () => {
  const { tx } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: user?.email ?? '',
    phone: '',
    subject: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: tx('Sign in to send a message', 'संदेश भेजने के लिए साइन इन करें') });
      return;
    }
    setSending(true);
    const { error } = await supabase.from('support_messages').insert({
      user_id: user.id,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      subject: form.subject.trim(),
      message: form.message.trim(),
    });
    setSending(false);

    // Only say it was sent when it was. The old form said so unconditionally.
    if (error) {
      toast({
        title: tx('Could not send your message', 'संदेश नहीं भेजा जा सका'),
        description: tx('Please try again in a moment.', 'कृपया थोड़ी देर बाद फिर कोशिश करें।'),
        variant: 'destructive',
      });
      return;
    }
    setSent(true);
    toast({
      title: tx('Message sent', 'संदेश भेजा गया'),
      description: tx('The bhoomix team has it and will reply by email.', 'bhoomix टीम को मिल गया है, ईमेल से जवाब देंगे।'),
    });
  };

  const quickLinks = [
    {
      icon: Leaf,
      label: tx('Urgent crop question? Ask the advisory', 'फसल का ज़रूरी सवाल? सलाह पूछें'),
      to: '/kisan-help',
    },
    { icon: Package, label: tx('Track my order', 'मेरा ऑर्डर ट्रैक करें'), to: '/orders' },
    { icon: ShoppingBag, label: tx('How to place an order', 'ऑर्डर कैसे दें'), to: '/agri-market' },
  ];

  return (
    <PageShell width="wide">
      <PageHeader
        eyebrow={tx('Help', 'सहायता')}
        title={tx('Support', 'सहायता')}
        lede={tx(
          'Write to the bhoomix team. Every message is read and answered by email.',
          'bhoomix टीम को लिखें। हर संदेश पढ़ा जाता है और ईमेल से जवाब दिया जाता है।',
        )}
      />

      <div className="grid gap-8 md:grid-cols-2">
        {/* Contact form — the one channel that exists. */}
        <div>
          <Card className="glass hover:shadow-xl transition-[transform,box-shadow,border-color,background-color,color,opacity,filter]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                {tx('Send us a message', 'हमें संदेश भेजें')}
              </CardTitle>
              <CardDescription>
                {tx(
                  'Tell us what happened. Add your phone number if you would rather be called back.',
                  'बताएं क्या हुआ। अगर कॉल चाहते हैं तो अपना फोन नंबर भी लिखें।',
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sent ? (
                <div className="rounded-2xl bg-primary/10 p-6 text-center">
                  <p className="font-semibold text-foreground">
                    {tx('Thanks — your message is with the team.', 'धन्यवाद — आपका संदेश टीम के पास है।')}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {tx('We reply to the email address you gave.', 'हम आपके दिए ईमेल पर जवाब देंगे।')}
                  </p>
                  <Button variant="outline" className="mt-4" onClick={() => { setSent(false); setForm((f) => ({ ...f, subject: '', message: '' })); }}>
                    {tx('Send another', 'एक और भेजें')}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">{tx('Name', 'नाम')}</label>
                    <Input value={form.name} onChange={set('name')} placeholder={tx('Your name', 'आपका नाम')} maxLength={120} required />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">{tx('Email', 'ईमेल')}</label>
                    <Input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" maxLength={254} required />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      {tx('Phone', 'फोन')} <span className="text-muted-foreground">({tx('optional', 'वैकल्पिक')})</span>
                    </label>
                    <Input type="tel" value={form.phone} onChange={set('phone')} inputMode="tel" maxLength={20} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">{tx('Subject', 'विषय')}</label>
                    <Input value={form.subject} onChange={set('subject')} placeholder={tx('What is this about?', 'यह किस बारे में है?')} maxLength={200} required />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">{tx('Message', 'संदेश')}</label>
                    <Textarea value={form.message} onChange={set('message')} placeholder={tx('Your message…', 'आपका संदेश…')} rows={6} maxLength={4000} required />
                  </div>
                  <Button type="submit" className="btn-metal w-full border-0 hover:shadow-lg" size="lg" disabled={sending}>
                    {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {sending ? tx('Sending…', 'भेज रहे हैं…') : tx('Send message', 'संदेश भेजें')}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Things the app can already do for you, so a stuck farmer is not
            waiting on an email for something that has an answer now. */}
        <div>
          <Card className="glass hover:shadow-xl transition-[transform,box-shadow,border-color,background-color,color,opacity,filter]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                {tx('Get an answer now', 'अभी जवाब पाएं')}
              </CardTitle>
              <CardDescription>
                {tx('For the most common questions, you do not need to wait for us.', 'आम सवालों के लिए आपको हमारा इंतज़ार नहीं करना पड़ेगा।')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickLinks.map(({ icon: Icon, label, to }) => (
                <Button key={to} variant="outline" className="w-full justify-start" onClick={() => navigate(to)}>
                  <Icon className="mr-2 h-4 w-4 text-primary" />
                  {label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
};

export default Support;
