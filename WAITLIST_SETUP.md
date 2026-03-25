# Waitlist Setup Instructions

This document explains how to set up the waitlist feature for myPawPair.

## Prerequisites

- Supabase project already set up
- Resend API key configured in Vercel environment variables

## Database Setup

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `supabase/migrations/create_waitlist_table.sql`
5. Click **Run** to execute the SQL

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db push
```

## Environment Variables

Make sure these environment variables are set in your Vercel project:

### Already Configured:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`

## Email Configuration

The system sends emails to:

### Admin Notifications:
- tarunkumarz211286@gmail.com
- annaduchene@outlook.com

### User Confirmation:
- The email address submitted in the form

### Resend Domain Setup

For production, you need to:

1. Go to your Resend dashboard (https://resend.com/domains)
2. Add and verify your domain (e.g., mypawpair.com)
3. Update the `from` email addresses in `/app/api/waitlist/route.ts`:
   - Change `noreply@contact.mypawpair.com` to your verified domain if needed
   - Or use Resend's default sending domain: `onboarding@resend.dev`

For testing, you can use: `onboarding@resend.dev`

## Testing the Feature

1. **Local Testing:**
   ```bash
   npm run dev
   ```
   - Visit http://localhost:3000
   - Scroll to the footer
   - Enter an email and click "Join the Waitlist"

2. **Check Database:**
   - Go to Supabase Dashboard > Table Editor
   - Open the `waitlist` table
   - You should see the submitted email

3. **Check Emails:**
   - Check the user's inbox for confirmation email
   - Check admin emails for notification

## Database Schema

```sql
Table: waitlist
- id (UUID, Primary Key)
- email (TEXT, Unique, Not Null)
- created_at (TIMESTAMPTZ, Default: NOW())
- updated_at (TIMESTAMPTZ, Default: NOW())
```

## Features

✅ Email validation
✅ Duplicate email prevention
✅ Beautiful welcome email to users
✅ Admin notification emails
✅ Mobile-responsive form
✅ Loading states
✅ Success/Error messages
✅ Supabase storage with RLS policies

## API Endpoint

**POST** `/api/waitlist`

Request body:
```json
{
  "email": "user@example.com"
}
```

Response (Success):
```json
{
  "success": true,
  "message": "Successfully joined the waitlist!",
  "data": {
    "id": "...",
    "email": "user@example.com",
    "created_at": "2026-03-07T..."
  }
}
```

Response (Error):
```json
{
  "error": "This email is already on the waitlist"
}
```

## Viewing Waitlist Data

You can view all waitlist entries in the Supabase dashboard:

1. Go to **Table Editor**
2. Select the `waitlist` table
3. You can export the data as CSV for marketing purposes

## Troubleshooting

### Emails not sending:
- Verify `RESEND_API_KEY` is set in Vercel
- Check Resend dashboard for error logs
- Make sure the `from` domain is verified

### Database errors:
- Ensure the SQL migration ran successfully
- Check RLS policies are enabled
- Verify Supabase credentials in `.env.local`

### Duplicate email errors:
- This is expected behavior - each email can only join once
- Clear the database entry if you need to test again

## Admin Panel (Future Enhancement)

Consider building an admin dashboard to:
- View all waitlist signups
- Export to CSV
- Send bulk emails to waitlist
- Track conversion rates
