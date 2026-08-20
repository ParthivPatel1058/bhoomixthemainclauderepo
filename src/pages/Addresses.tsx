import { useState } from 'react';
import { Plus, MapPin, Pencil, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';
import BackButton from '@/components/BackButton';
import CartBar from '@/components/CartBar';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import AddressCard from '@/components/address/AddressCard';
import AddressForm from '@/components/address/AddressForm';
import { useAddresses, type Address, type AddressDraft } from '@/hooks/useAddresses';

const Addresses = () => {
  const { tx } = useLanguage();
  const { addresses, loading, create, update, remove, setDefault } = useAddresses();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (a: Address) => {
    setEditing(a);
    setFormOpen(true);
  };

  const save = async (draft: AddressDraft) => {
    if (editing) await update(editing.id, draft);
    else await create(draft);
  };

  const del = async (a: Address) => {
    try {
      await remove(a.id);
      toast.success(tx('Address removed', 'पता हटा दिया गया'));
    } catch {
      toast.error(tx('Could not remove the address', 'पता हटाया नहीं जा सका'));
    }
  };

  const promote = async (a: Address) => {
    try {
      await setDefault(a.id);
      toast.success(tx('Default address updated', 'डिफ़ॉल्ट पता बदल गया'));
    } catch {
      toast.error(tx('Could not update the default', 'डिफ़ॉल्ट नहीं बदला जा सका'));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="pt-5">
          <BackButton />
        </div>

        <header className="flex flex-wrap items-end justify-between gap-4 pb-6 pt-8">
          <div>
            <h1 className="page-title text-foreground">
              {tx('My Addresses', 'मेरे पते')}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {tx('Saved delivery addresses, reused at every checkout', 'सहेजे गए पते, हर ऑर्डर पर दोबारा इस्तेमाल करें')}
            </p>
          </div>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" />
            {tx('Add address', 'पता जोड़ें')}
          </Button>
        </header>

        {loading ? (
          <div className="py-16 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : addresses.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card py-16 text-center">
            <MapPin className="mx-auto mb-4 h-16 w-16 text-muted-foreground/25" />
            <p className="mb-1 font-semibold text-foreground">
              {tx('No addresses yet', 'अभी कोई पता नहीं')}
            </p>
            <p className="mb-5 text-sm text-muted-foreground">
              {tx('Add your first address so orders reach you faster', 'पहला पता जोड़ें ताकि ऑर्डर जल्दी पहुँचे')}
            </p>
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4" />
              {tx('Add address', 'पता जोड़ें')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pb-28">
            {addresses.map((a) => (
              <AddressCard
                key={a.id}
                address={a}
                actions={
                  <>
                    <Button variant="outline" size="sm" onClick={() => openEdit(a)} className="gap-1.5">
                      <Pencil className="h-3.5 w-3.5" />
                      {tx('Edit', 'बदलें')}
                    </Button>

                    {!a.is_default && (
                      <Button variant="outline" size="sm" onClick={() => promote(a)} className="gap-1.5">
                        <Star className="h-3.5 w-3.5" />
                        {tx('Set as default', 'डिफ़ॉल्ट बनाएं')}
                      </Button>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-1.5 text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                          {tx('Delete', 'हटाएं')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {tx('Delete this address?', 'यह पता हटाएं?')}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {tx('Orders already placed keep the address they were delivered to.', 'पहले दिए गए ऑर्डर पर इसका असर नहीं होगा।')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{tx('Keep', 'रहने दें')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => del(a)}>
                            {tx('Delete', 'हटाएं')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                }
              />
            ))}
          </div>
        )}
      </div>

      <AddressForm
        open={formOpen}
        onOpenChange={setFormOpen}
        existing={editing}
        onSave={save}
      />
      <CartBar />
    </div>
  );
};

export default Addresses;
