import { useState } from 'react';
import { Camera, MessageCircle, Upload, Send } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { SmoothInput } from '@/components/ui/smooth-input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { kisanChat, kisanImageAnalysis, isGeminiConfigured } from '@/lib/geminiApi';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};
const KisanHelp = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'user', content: 'What fertilizer for wheat?' },
    { 
      role: 'assistant', 
      content: 'For wheat, I recommend NPK fertilizer (Nitrogen, Phosphorus, Potassium) in the ratio 120:60:40 kg/hectare. Apply in three splits for best results.' 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [diseaseAnalysis, setDiseaseAnalysis] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const { language } = useLanguage();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageData = reader.result as string;
        setSelectedImage(imageData);
        setIsAnalyzingImage(true);
        setDiseaseAnalysis(null);
        
        toast({
          title: 'Image Uploaded',
          description: 'Analyzing your crop image...'
        });

        try {
          let reply: string;

          // Use client-side Gemini API if key is configured, otherwise
          // fall back to the Supabase edge function.
          if (isGeminiConfigured()) {
            reply = await kisanImageAnalysis(imageData, language);
          } else {
            const { data, error } = await supabase.functions.invoke('kisan-ai-chat', {
              body: {
                type: 'image',
                image: imageData,
                message: 'Analyze this crop image for diseases, pests, or health issues.',
                language: language
              }
            });
            if (error) throw error;
            reply = data.reply || 'Unable to analyze image. Please try again.';
          }

          setDiseaseAnalysis(reply);
          toast({
            title: 'Analysis Complete',
            description: 'AI analysis is ready!'
          });
        } catch (error) {
          console.error('Image analysis error:', error);
          setDiseaseAnalysis('Failed to analyze image. Please check your connection and try again.');
          toast({
            title: 'Analysis Failed',
            description: 'Unable to analyze the image. Please try again.',
            variant: 'destructive'
          });
        } finally {
          setIsAnalyzingImage(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let replyText: string;

      // Use client-side Gemini API if key is configured, otherwise
      // fall back to the Supabase edge function.
      if (isGeminiConfigured()) {
        replyText = await kisanChat(inputMessage, language);
      } else {
        const { data, error } = await supabase.functions.invoke('kisan-ai-chat', {
          body: {
            type: 'text',
            message: inputMessage,
            language: language
          }
        });
        if (error) throw error;
        replyText = data.reply || 'I apologize, but I could not generate a response. Please try again.';
      }

      const assistantMessage: Message = { 
        role: 'assistant', 
        content: replyText 
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please check your connection and try again.' 
      };
      setMessages(prev => [...prev, errorMessage]);
      toast({
        title: 'Error',
        description: 'Failed to get AI response. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  return <div className="min-h-screen">
      <Navigation />

      <div className="px-4 lg:px-6 pt-5">
        <BackButton />
      </div>
      
      <div className="container mx-auto px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          
          
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Image Upload Section */}
          <div className="glass rounded-3xl p-5 sm:p-8">
          <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
              <Camera className="h-6 w-6 text-primary" />
              {t('cropDiseaseDetection')}
            </h2>
            
            <div className="border-2 border-dashed border-primary/30 rounded-2xl p-12 text-center mb-6 hover:border-primary/60 transition-[transform,box-shadow,border-color,background-color,color,opacity,filter] cursor-pointer">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
              <label htmlFor="image-upload" className="cursor-pointer">
                {selectedImage ? <img src={selectedImage} alt="Uploaded crop" className="max-h-64 mx-auto rounded-lg" /> : <div>
                    <Upload className="h-16 w-16 mx-auto mb-4 text-primary" />
                    <p className="text-lg font-semibold text-foreground mb-2">{t('uploadCropImage')}</p>
                    <p className="text-sm text-muted-foreground">{t('clickToSelect')}</p>
                  </div>}
              </label>
            </div>

            {selectedImage && (
              <div className="glass rounded-xl p-4 space-y-3">
                {isAnalyzingImage ? (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                    <p className="text-foreground">{t('analyzing')}</p>
                  </div>
                ) : diseaseAnalysis ? (
                  <div className="space-y-3">
                    <p className="font-semibold text-foreground">{t('aiAnalysis')}</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{diseaseAnalysis}</p>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* AI Chatbot Section */}
          <div className="glass rounded-3xl p-5 sm:p-8">
          <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-primary" />
              {t('askAIAssistant')}
            </h2>
            
            <div className="space-y-4 mb-6 h-64 overflow-y-auto">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`glass rounded-xl p-4 ${msg.role === 'assistant' ? 'bg-primary/10' : ''}`}
                >
                  <p className="text-sm text-muted-foreground mb-1">
                    {msg.role === 'user' ? t('you') : t('aiAssistant')}
                  </p>
                  <p className="text-foreground">{msg.content}</p>
                </div>
              ))}
              {isLoading && (
                <div className="glass rounded-xl p-4 bg-primary/10">
                  <p className="text-sm text-muted-foreground mb-1">{t('aiAssistant')}</p>
                  <p className="text-foreground">{t('thinking')}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {/* The wrapper carries the padding and background now, so `focus:`
                  becomes `focus-within:` — focus lands on the inner input. */}
              <SmoothInput
                type="text"
                placeholder={t('askYourQuestion')}
                aria-label={t('askYourQuestion')}
                wrapperClassName="flex-1 glass rounded-xl px-4 py-3 border-primary/20 focus-within:border-primary/40"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="btn-metal"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default KisanHelp;