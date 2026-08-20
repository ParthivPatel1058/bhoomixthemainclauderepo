import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [search, setSearch] = useState('');
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      // The results page is its own feedback; a toast on top of it is noise.
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="group relative w-full max-w-2xl glass p-2 !rounded-full transition-[transform,box-shadow,border-color,background-color,color,opacity,filter] duration-500 hover:shadow-elevated focus-within:shadow-glow-primary focus-within:border-primary/50">
      <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors duration-300 group-focus-within:text-primary" />
      <Input
        type="text"
        placeholder={t('searchPlaceholder')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="pl-14 pr-4 h-14 text-lg border-0 bg-transparent hover:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 rounded-full font-medium"
      />
    </form>
  );
};

export default SearchBar;
