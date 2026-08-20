import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LanguagePicker from '@/components/LanguagePicker';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_MAP } from '@/i18n/languages';

/**
 * Opens the full language picker. This used to toggle straight between English
 * and Hindi, which no longer works now that there are 23 languages to reach.
 */
const LanguageSwitcher = () => {
  const { language } = useLanguage();
  const meta = LANGUAGE_MAP[language];

  return (
    <LanguagePicker
      trigger={
        <Button
          variant="outline"
          size="sm"
          aria-label="Change language"
          className="glass border-primary/20 transition-[transform,box-shadow,border-color,background-color,color,opacity,filter] hover:border-primary/40"
        >
          <Languages className="mr-2 h-4 w-4" />
          {/* Endonyms can be long; the code keeps the header compact. */}
          {meta ? meta.native.slice(0, 3) : language.toUpperCase()}
        </Button>
      }
    />
  );
};

export default LanguageSwitcher;
