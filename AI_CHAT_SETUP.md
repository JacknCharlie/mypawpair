# Charlie AI Chat - Setup Instructions

## Database Migration

You need to run the new database migration to create the AI chat tables.

### Option 1: Using Supabase CLI (Recommended)

```bash
# If you have Supabase CLI installed and initialized
supabase db push

# Or apply the specific migration file
supabase db push --file supabase/migrations/007_ai_chat_tables.sql
```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file: `supabase/migrations/007_ai_chat_tables.sql`
4. Copy the entire SQL content
5. Paste it into the SQL Editor
6. Click **Run** to execute the migration

### Option 3: Using Supabase Studio (Local Development)

If you're running Supabase locally:

```bash
# Start Supabase locally
supabase start

# Apply migrations
supabase db reset

# Or push specific migration
supabase migration up
```

## Verify Migration

After running the migration, verify that these tables exist:

1. `dog_profiles`
2. `chat_sessions`
3. `chat_messages`

You can check in:
- Supabase Dashboard → Table Editor
- OR run this SQL query:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('dog_profiles', 'chat_sessions', 'chat_messages');
```

## Environment Variables

Ensure these are set in your `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

## Testing the Feature

After migration:

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **Test authentication**:
   - Make sure you can log in at `/auth/login`

3. **Test AI Chat**:
   - Navigate to `/ask-ai`
   - You should see the onboarding flow if it's your first time
   - Complete onboarding or skip it
   - Start chatting with Charlie
   - Create new chat sessions
   - Refresh the page and verify conversations persist

4. **Check database**:
   - Go to Supabase Dashboard
   - Check that records are created in:
     - `dog_profiles` (if you completed onboarding)
     - `chat_sessions`
     - `chat_messages`

## Troubleshooting

### "Relation does not exist" error
- Migration hasn't been run yet
- Run the migration steps above

### Authentication redirect loop
- Check Supabase auth is working
- Verify user is logged in before accessing `/ask-ai`

### AI responses not working
- Check `OPENAI_API_KEY` is set correctly
- Check browser console for errors
- Verify API route at `/api/chat` is accessible

### Data not persisting
- Check RLS policies in Supabase
- Verify user ID matches logged-in user
- Check browser console for Supabase errors

## What's New

This update includes:

✅ **Database-backed conversations** - All chats saved to Supabase
✅ **Charlie AI Assistant** - Named AI with personality
✅ **Onboarding flow** - Step-by-step dog profile collection
✅ **Personalized responses** - AI knows about your dog
✅ **Mobile-responsive UI** - Perfect on all devices
✅ **Brand consistency** - Matches homepage design
✅ **Session management** - Multiple chat sessions per user
✅ **Uses "dog" terminology** - Not "fur baby" (per client spec)

## Next Steps

1. Run the database migration (see above)
2. Test the feature thoroughly
3. Gather feedback
4. Optional: Customize Charlie's personality further in `/app/api/chat/route.ts`
5. Optional: Add more quick suggestions in the welcome screen

Enjoy Charlie! 🐕✨
