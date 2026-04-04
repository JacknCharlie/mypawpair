# Charlie AI Chat - Feature Documentation

## Overview

Charlie is your dog's personal AI care assistant on myPawPair. This feature provides personalized AI-powered chat support with comprehensive onboarding and database-backed conversation history.

## Key Features

### 1. **Personalized Onboarding Flow**
- **Welcome Screen**: Users choose between Quick Path (skip to chat) or Detailed Path (provide dog profile)
- **Step-by-step Collection**:
  1. Dog's name
  2. Pronouns (he/him, she/her, they/them)
  3. Species (Dog, Cat, Other)
  4. Breed
  5. Age
  6. Health conditions
  7. Dietary needs
- **Mobile-responsive UI** with proper touch interactions
- **Quick selection buttons** for common choices (pronouns, species)

### 2. **Database Integration**
All conversations are saved to Supabase:
- **dog_profiles**: Stores dog information for personalization
- **chat_sessions**: Individual chat sessions per user
- **chat_messages**: All messages within sessions

### 3. **Charlie AI Assistant**
- Named AI assistant (Charlie) that remembers dog profiles
- Personalized responses based on:
  - Dog's name
  - Preferred pronouns
  - Breed and age
  - Health conditions
  - Dietary needs
- Always uses "dog" instead of "fur baby" (per client requirements)
- Context-aware conversations

### 4. **UI/UX Features**
- **Brand-consistent design**: Matches homepage with warm colors (#FFF2DD, #F3B443, #5F7E9D)
- **Mobile-responsive**: Sidebar becomes overlay on mobile
- **Session management**: Create new chats, switch between conversations
- **Dog profile display**: Shows active dog info in sidebar
- **Auto-scroll**: Messages automatically scroll to latest

## Database Schema

### `dog_profiles`
```sql
- id (uuid, primary key)
- user_id (uuid, references profiles)
- dog_id (uuid, optional reference to dogs table)
- name (text)
- pronouns (text)
- species (text, default: 'dog')
- breed (text)
- age (integer)
- health_conditions (text[])
- dietary_needs (text[])
- preferences (jsonb)
- created_at, updated_at (timestamps)
```

### `chat_sessions`
```sql
- id (uuid, primary key)
- user_id (uuid, references profiles)
- dog_profile_id (uuid, references dog_profiles)
- title (text)
- is_onboarded (boolean)
- created_at, updated_at (timestamps)
```

### `chat_messages`
```sql
- id (uuid, primary key)
- session_id (uuid, references chat_sessions)
- role (text: 'user' | 'assistant' | 'system')
- content (text)
- created_at (timestamp)
```

## API Routes

### POST `/api/chat`
Handles AI chat requests with personalized context.

**Request Body:**
```typescript
{
  messages: Array<{ role: "user" | "assistant", content: string }>,
  dogProfile?: {
    name: string;
    pronouns: string;
    species: string;
    breed?: string;
    age?: string;
    healthConditions?: string[];
    dietaryNeeds?: string[];
  },
  systemContext?: string
}
```

**Response:**
```typescript
{
  content: string  // AI-generated response
}
```

## Components

### `<AiChat />`
Main chat interface component
- **Location**: `components/ai-chat/ai-chat.tsx`
- **Features**:
  - User authentication check
  - Data loading from Supabase
  - Session management
  - Message handling
  - Real-time UI updates

### `<OnboardingFlow />`
Dog profile collection component
- **Location**: `components/ai-chat/onboarding-flow.tsx`
- **Props**:
  - `onComplete(profile: DogProfile)`: Called when user completes onboarding
  - `onSkip()`: Called when user skips onboarding

## Usage

### For Logged-In Users
1. Navigate to `/ask-ai`
2. First-time users see onboarding flow
3. Choose Quick Path or Detailed Path
4. Start chatting with Charlie
5. All conversations saved automatically

### Authentication Required
Users must be logged in to access the AI chat. The component automatically redirects to `/auth/login` if not authenticated.

## Styling

### Color Palette
- Background: `#FFF2DD` (warm cream)
- Primary: `#F3B443` (golden yellow)
- Secondary: `#5F7E9D` (muted blue)
- Text: `#260900` (dark brown)
- Accent text: `#4A5563` (gray)

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Key Design Elements
- Rounded-full buttons with shadow effects
- Smooth transitions (300ms)
- Modern Sans font family
- Glass-morphism effects on cards

## Client Requirements Met

1. ✅ AI assistant named "Charlie"
2. ✅ Introduction: "Hi! I am Charlie, your dog's personal AI care assistant."
3. ✅ Always uses "dog" instead of "fur baby"
4. ✅ Full onboarding flow with step-by-step collection
5. ✅ Database-backed chat sessions for logged-in users
6. ✅ Personalized responses based on dog profile
7. ✅ Mobile-responsive, pixel-perfect UI
8. ✅ Matches homepage branding

## Testing

To test the feature:
1. Run database migration: `supabase db push` (if using local dev)
2. Ensure environment variables are set (OPENAI_API_KEY, Supabase keys)
3. Start development server: `npm run dev`
4. Navigate to `/ask-ai`
5. Test onboarding flow
6. Test chat functionality
7. Verify data persistence in Supabase

## Future Enhancements

Potential additions:
- Voice input/output
- Image upload support
- Multi-pet profiles
- Chat export functionality
- Advanced filtering/search in chat history
- Suggested follow-up questions
- Integration with service provider directory
