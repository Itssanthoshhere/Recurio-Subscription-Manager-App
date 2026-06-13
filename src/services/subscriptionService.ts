import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/src/types/database.types';

type SubscriptionRow = Database['public']['Tables']['subscriptions']['Row'];
type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert'];
type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update'];

export class SubscriptionService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Fetches all subscriptions for the authenticated user.
   */
  async getSubscriptions(): Promise<SubscriptionRow[]> {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching subscriptions:', error);
      throw new Error(error.message);
    }
    return data || [];
  }

  /**
   * Fetches a single subscription by ID.
   */
  async getSubscriptionById(id: string): Promise<SubscriptionRow | null> {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching subscription ${id}:`, error);
      throw new Error(error.message);
    }
    return data;
  }

  /**
   * Creates a new subscription.
   */
  async createSubscription(subscription: SubscriptionInsert): Promise<SubscriptionRow> {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .insert(subscription)
      .select()
      .single();

    if (error) {
      console.error('Error creating subscription:', error);
      throw new Error(error.message);
    }
    return data;
  }

  /**
   * Updates an existing subscription.
   */
  async updateSubscription(id: string, updates: SubscriptionUpdate): Promise<SubscriptionRow> {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating subscription ${id}:`, error);
      throw new Error(error.message);
    }
    return data;
  }

  /**
   * Deletes a subscription.
   */
  async deleteSubscription(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('subscriptions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting subscription ${id}:`, error);
      throw new Error(error.message);
    }
  }

  /**
   * Updates the status of a subscription (e.g. pause/resume).
   */
  async updateStatus(id: string, status: 'active' | 'paused' | 'cancelled'): Promise<SubscriptionRow> {
    return this.updateSubscription(id, { status });
  }
}
