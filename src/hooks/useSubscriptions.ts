import { useEffect, useMemo } from 'react';
import { useAuth } from '@clerk/expo';
import { createClerkSupabaseClient } from '@/src/config/supabase';
import { SubscriptionService } from '@/src/services/subscriptionService';
import { useSubscriptionStore, SubscriptionRow, SubscriptionInsert } from '@/lib/subscriptionStore';

export const useSubscriptions = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const store = useSubscriptionStore();

  // Memoize the service so we don't recreate it unnecessarily
  const subscriptionService = useMemo(() => {
    const supabase = createClerkSupabaseClient(getToken);
    return new SubscriptionService(supabase);
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      // Clear data if user logs out
      store.setSubscriptions([]);
      store.setLoading(false);
      return;
    }

    const fetchSubscriptions = async () => {
      // Create a fresh instance here to avoid dependency cycle with getToken
      const service = new SubscriptionService(createClerkSupabaseClient(getToken));
      store.setLoading(true);
      try {
        const data = await service.getSubscriptions();
        store.setSubscriptions(data);
      } catch (error: any) {
        store.setError(error.message);
      }
    };

    fetchSubscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn]);

  // Expose CRUD actions that handle the DB call + optimistic UI
  const addSubscription = async (subscription: Omit<SubscriptionInsert, 'user_id' | 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Create a temporary ID for optimistic update
      const tempId = `temp_${Date.now()}`;
      const tempSub: SubscriptionRow = {
        ...subscription,
        id: tempId,
        user_id: '', // Will be assigned by DB
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category: subscription.category ?? null,
        start_date: subscription.start_date ?? null,
        renewal_date: subscription.renewal_date ?? null,
        payment_method: subscription.payment_method ?? null,
        notes: subscription.notes ?? null,
        color: subscription.color ?? null,
        icon: subscription.icon ?? null,
      } as SubscriptionRow;

      store.optimisticAdd(tempSub);

      // Perform actual DB insertion
      const newSub = await subscriptionService.createSubscription(subscription);

      // Replace temp with real data
      store.optimisticUpdate(tempId, newSub);
    } catch (error: any) {
      console.error('Add subscription failed:', error);
      // Revert optimism by refetching or removing temp
      store.setError(error.message);
      const data = await subscriptionService.getSubscriptions();
      store.setSubscriptions(data);
      throw error;
    }
  };

  const updateSubscription = async (id: string, updates: Partial<SubscriptionRow>) => {
    try {
      store.optimisticUpdate(id, updates);
      await subscriptionService.updateSubscription(id, updates);
    } catch (error: any) {
      console.error('Update subscription failed:', error);
      store.setError(error.message);
      const data = await subscriptionService.getSubscriptions();
      store.setSubscriptions(data);
      throw error;
    }
  };

  const deleteSubscription = async (id: string) => {
    try {
      store.optimisticDelete(id);
      await subscriptionService.deleteSubscription(id);
    } catch (error: any) {
      console.error('Delete subscription failed:', error);
      store.setError(error.message);
      const data = await subscriptionService.getSubscriptions();
      store.setSubscriptions(data);
      throw error;
    }
  };

  return {
    ...store,
    addSubscription,
    updateSubscription,
    deleteSubscription,
  };
};
