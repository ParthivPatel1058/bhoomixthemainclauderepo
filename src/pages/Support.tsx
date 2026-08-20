import { Phone, Mail, MapPin, MessageCircle, Clock, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import PageShell from '@/components/layout/PageShell';
import PageHeader from '@/components/layout/PageHeader';

const Support = () => {
  const { language, tx } = useLanguage();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: tx('Message Sent!', 'संदेश भेजा गया!'),
      description: tx('We will get back to you soon', 'हम जल्द ही आपसे संपर्क करेंगे')
    });
  };

  return (
    <PageShell width="wide">
          <PageHeader
        eyebrow={tx('Help', 'सहायता')}
        title={tx('Support', 'सहायता')}
        lede={tx(
          'Call, write, or come by. Someone answers every one of these.',
          'कॉल करें, लिखें, या मिलने आएं। इनमें से हर एक का जवाब मिलता है।',
        )}
        stats={[
          { label: tx('Phone', 'फोन'), value: '24/7', emphasis: true },
          { label: tx('Email reply', 'ईमेल उत्तर'), value: tx('under 24 hrs', '24 घंटे से कम') },
          { label: tx('Office', 'कार्यालय'), value: tx('Mon-Sat', 'सोम-शनि') },
        ]}
      />

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <Card className="glass hover:shadow-xl transition-[transform,box-shadow,border-color,background-color,color,opacity,filter]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    {tx('Call Us', 'हमें कॉल करें')}
                  </CardTitle>
                  <CardDescription>
                    {tx('Available 24/7', '24/7 उपलब्ध')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <a 
                    href="tel:+911800123456" 
                    className="text-2xl font-bold text-primary hover:underline"
                  >
                    1800-123-456
                  </a>
                  <p className="text-sm text-muted-foreground mt-2">
                    {tx('Toll-free number', 'टोल-फ्री नंबर')}
                  </p>
                </CardContent>
              </Card>

              <Card className="glass hover:shadow-xl transition-[transform,box-shadow,border-color,background-color,color,opacity,filter]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    {tx('Email Us', 'हमें ईमेल करें')}
                  </CardTitle>
                  <CardDescription>
                    {tx('Response within 24 hours', '24 घंटे के भीतर प्रतिक्रिया')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <a 
                    href="mailto:support@agrihub.com" 
                    className="text-xl font-semibold text-primary hover:underline"
                  >
                    support@agrihub.com
                  </a>
                </CardContent>
              </Card>

              <Card className="glass hover:shadow-xl transition-[transform,box-shadow,border-color,background-color,color,opacity,filter]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    {tx('Visit Us', 'हमसे मिलें')}
                  </CardTitle>
                  <CardDescription>
                    {tx('Office hours', 'कार्यालय समय')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">
                    AgriHub Office<br />
                    123 Kisan Bhawan<br />
                    Agricultural Complex<br />
                    Delhi - 110001
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {tx('Mon-Sat: 9:00 AM - 6:00 PM', 'सोम-शनि: सुबह 9:00 - शाम 6:00')}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass btn-metal hover:shadow-xl transition-[transform,box-shadow,border-color,background-color,color,opacity,filter]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <MessageCircle className="h-5 w-5" />
                    {tx('WhatsApp Support', 'व्हाट्सएप सपोर्ट')}
                  </CardTitle>
                  <CardDescription className="text-white/80">
                    {tx('Chat with us instantly', 'तुरंत हमसे चैट करें')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="secondary"
                    className="w-full"
                    onClick={() => window.open('https://wa.me/919876543210', '_blank')}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    +91 98765-43210
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div>
              <Card className="glass hover:shadow-xl transition-[transform,box-shadow,border-color,background-color,color,opacity,filter]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    {tx('Send us a Message', 'हमें संदेश भेजें')}
                  </CardTitle>
                  <CardDescription>
                    {tx('Fill out the form and we\'ll get back to you', 'फॉर्म भरें और हम आपसे संपर्क करेंगे')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {tx('Name', 'नाम')}
                      </label>
                      <Input 
                        placeholder={tx('Your name', 'आपका नाम')}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {tx('Email', 'ईमेल')}
                      </label>
                      <Input 
                        type="email"
                        placeholder={tx('your.email@example.com', 'आपका.ईमेल@example.com')}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {tx('Phone', 'फोन')}
                      </label>
                      <Input 
                        type="tel"
                        placeholder="+91 98765-43210"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {tx('Subject', 'विषय')}
                      </label>
                      <Input 
                        placeholder={tx('What is this about?', 'यह किस बारे में है?')}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {tx('Message', 'संदेश')}
                      </label>
                      <Textarea 
                        placeholder={tx('Your message...', 'आपका संदेश...')}
                        rows={6}
                        required
                      />
                    </div>

                    <Button 
                      type="submit"
                      className="w-full btn-metal border-0 hover:shadow-lg"
                      size="lg"
                    >
                      {tx('Send Message', 'संदेश भेजें')}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* FAQ Quick Links */}
              <Card className="glass mt-6 hover:shadow-xl transition-[transform,box-shadow,border-color,background-color,color,opacity,filter]">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {tx('Quick Help', 'त्वरित सहायता')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    {tx('How to place an order?', 'ऑर्डर कैसे दें?')}
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    {tx('Track my order', 'मेरा ऑर्डर ट्रैक करें')}
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    {tx('Return & Refund Policy', 'वापसी और रिफंड नीति')}
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    {tx('Payment Options', 'भुगतान विकल्प')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
    </PageShell>
  );
};

export default Support;