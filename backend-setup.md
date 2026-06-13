# Backend Setup Instructions

To complete Phase 1 and ensure Row Level Security works correctly, you must configure Clerk to pass the User ID to Supabase.

## 1. Run the Supabase Migration
1. Open your hosted Supabase project.
2. Go to the **SQL Editor**.
3. Copy the contents of `supabase/schema.sql` from your project root.
4. Paste and click **Run**. This creates the `subscriptions` table and the necessary RLS policies.

## 2. Configure Clerk JWT Template
By default, Supabase doesn't know who the Clerk user is. We solve this using a JWT Template.

1. Open your [Clerk Dashboard](https://dashboard.clerk.com/).
2. Navigate to **JWT Templates** in the sidebar.
3. Click **New Template** and select **Supabase**.
4. Name the template `supabase`. (This exact name is required because our client configuration requests `{ template: 'supabase' }`).
5. You can leave the default Claims configuration as is. It should look something like this:
   ```json
   {
     "aud": "authenticated",
     "default_role": "authenticated",
     "role": "authenticated"
   }
   ```
6. Click **Apply Changes**.

## 3. Configure Environment Variables
In your root `.env` file (create it if it doesn't exist), ensure you have:

```env
# Clerk
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key

# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Once this is done, Phase 1 is officially complete and the infrastructure is ready to receive requests!
