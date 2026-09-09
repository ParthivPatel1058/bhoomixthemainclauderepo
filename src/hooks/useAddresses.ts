import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { resetWeatherLocation } from '@/hooks/useWeather';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export type Address = Tables<'addresses'>;
export type AddressLabel = 'Home' | 'Work' | 'Other';

/** Fields the form collects; everything else is set by the database. */
export type AddressDraft = Omit<
  TablesInsert<'addresses'>,
  'id' | 'user_id' | 'created_at' | 'updated_at'
>;

/** Single-line form used on order rows and the cart summary. */
export function formatAddress(a: Address): string {
  return [a.house, a.area, a.landmark, a.city, a.state, a.pincode]
    .map((p) => p?.trim())
    .filter(Boolean)
    .join(', ');
}

/**
 * Saved delivery addresses for the signed-in user.
 *
 * The default flag is maintained by database triggers — the first address a
 * user saves becomes default, and promoting one demotes the rest — so the
 * client only ever writes `is_default: true` and re-reads.
 */
export function useAddresses() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setAddresses([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });
    if (!error && data) setAddresses(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(
    async (draft: AddressDraft) => {
      if (!user) throw new Error('Not signed in');
      const { data, error } = await supabase
        .from('addresses')
        .insert({ ...draft, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      await load();
      // The nav-bar weather is reported for this address, so it has to
      // re-resolve when the address is added, edited, removed or switched.
      resetWeatherLocation();
      return data;
    },
    [user, load],
  );

  const update = useCallback(
    async (id: string, patch: Partial<AddressDraft>) => {
      const { error } = await supabase.from('addresses').update(patch).eq('id', id);
      if (error) throw error;
      await load();
      // The nav-bar weather is reported for this address, so it has to
      // re-resolve when the address is added, edited, removed or switched.
      resetWeatherLocation();
    },
    [load],
  );

  const remove = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('addresses').delete().eq('id', id);
      if (error) throw error;
      await load();
      // The nav-bar weather is reported for this address, so it has to
      // re-resolve when the address is added, edited, removed or switched.
      resetWeatherLocation();
    },
    [load],
  );

  const setDefault = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('addresses').update({ is_default: true }).eq('id', id);
      if (error) throw error;
      await load();
      // The nav-bar weather is reported for this address, so it has to
      // re-resolve when the address is added, edited, removed or switched.
      resetWeatherLocation();
    },
    [load],
  );

  return {
    addresses,
    loading,
    defaultAddress: addresses.find((a) => a.is_default) ?? addresses[0] ?? null,
    reload: load,
    create,
    update,
    remove,
    setDefault,
  };
}

export interface GeocodedAddress {
  house: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  label: string;
}

/** Turn the device's coordinates into fillable address fields. */
export async function locateMe(): Promise<GeocodedAddress> {
  if (!('geolocation' in navigator)) throw new Error('no-geolocation');

  const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 30_000,
    });
  });

  const { data, error } = await supabase.functions.invoke('geocode', {
    body: { mode: 'reverse', lat: pos.coords.latitude, lng: pos.coords.longitude },
  });
  if (error || !data?.address) throw new Error('lookup-failed');

  // Keep the device fix rather than the one snapped to the matched street —
  // it is what the delivery partner should actually navigate to.
  return { ...data.address, lat: pos.coords.latitude, lng: pos.coords.longitude };
}

/** Free-text locality search, used to pin an address without GPS. */
export async function searchAddress(query: string): Promise<GeocodedAddress[]> {
  const { data, error } = await supabase.functions.invoke('geocode', {
    body: { mode: 'search', query },
  });
  if (error || !data?.results) return [];
  return data.results;
}
