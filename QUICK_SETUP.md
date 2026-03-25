# Quick Deployment Steps

## 1. Set up Supabase Database

Run this SQL in Supabase SQL Editor:

```sql
-- Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON public.waitlist(created_at DESC);

-- Enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow public inserts
CREATE POLICY "Allow public inserts" ON public.waitlist
    FOR INSERT TO public WITH CHECK (true);

-- Allow authenticated reads
CREATE POLICY "Allow authenticated users to read" ON public.waitlist
    FOR SELECT TO authenticated USING (true);
```

## 2. Configure Resend Email

In Vercel, make sure this environment variable is set:
- `RESEND_API_KEY` = your_resend_api_key_here

⚠️ **Important:** Update the email sender in `/app/api/waitlist/route.ts`:
- Change the `from` address to your verified Resend domain (e.g. `noreply@contact.mypawpair.com`)
- Or use `onboarding@resend.dev` for testing

## 3. Deploy

Push your code to GitHub and Vercel will automatically deploy.

## 4. Test

1. Go to your website
2. Scroll to the footer
3. Enter an email address
4. Click "Join the Waitlist"
5. Check:
   - User receives confirmation email
   - Admins receive notification at:
     - tarunkumarz211286@gmail.com
     - annaduchene@outlook.com
   - Email appears in Supabase `waitlist` table

## Done! 🎉

Your waitlist is now live and functional.
