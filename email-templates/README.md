# Email Templates for myPawPair

This directory contains all email templates for the myPawPair application. These templates are designed for use with Supabase Auth email system with Resend SMTP.

## 📧 Available Templates

### 1. **Confirmation Emails** (Required by Supabase Auth)
- `confirm-email-owner.html` - Email confirmation for dog owners
- `confirm-email-caregiver.html` - Email confirmation for caregivers

### 2. **Welcome Emails** (Custom - needs manual trigger)
- `welcome-owner.html` - Welcome email sent after owner confirms email
- `welcome-caregiver.html` - Welcome email sent after caregiver confirms email

### 3. **Password Reset** (Required by Supabase Auth)
- `reset-password.html` - Password reset email template

### 4. **Caregiver Approval** (Custom - needs manual trigger)
- `caregiver-approved.html` - Approval notification for caregivers

### 5. **Base Template**
- `base-template.html` - Base structure for creating new templates

## 🚀 Setup Instructions

### Step 1: Update Logo URL in All Templates

Before uploading to Supabase, replace `https://yourdomain.com/logo.png` with your actual hosted logo URL in all template files:

1. Upload your logo (`public/logo.png`) to a public location (Vercel, Cloudflare, or CDN)
2. Get the public URL (e.g., `https://yourapp.vercel.app/logo.png`)
3. Search and replace in all templates:
   - Find: `https://yourdomain.com/logo.png`
   - Replace with: Your actual logo URL

### Step 2: Configure Supabase Email Templates

#### A. Email Confirmation Templates (Owners)

1. Go to Supabase Dashboard → Authentication → Email Templates
2. Select **"Confirm signup"** template
3. Replace the content with `confirm-email-owner.html`
4. **Important:** Replace Supabase variables:
   - Keep `{{ .ConfirmationURL }}` as-is (Supabase variable)
   - Replace `{{ .SiteURL }}` with your app URL or keep as-is if supported

#### B. Email Confirmation Templates (Caregivers)

Since Supabase doesn't support role-based email templates out of the box, you have two options:

**Option 1: Use Database Functions (Recommended)**
Create a database trigger/function to send custom emails based on user role:

```sql
-- Create function to send welcome email based on role
CREATE OR REPLACE FUNCTION public.send_role_based_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- This will be called after email confirmation
  IF NEW.raw_user_meta_data->>'role' = 'caregiver' THEN
    -- Send caregiver-specific email via your API
    PERFORM net.http_post(
      url := 'YOUR_API_ENDPOINT/send-caregiver-confirmation',
      body := json_build_object('email', NEW.email, 'name', NEW.raw_user_meta_data->>'full_name')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION send_role_based_confirmation();
```

**Option 2: Client-side API Route**
Create an API route that sends the appropriate email template via Resend API directly:

```typescript
// app/api/send-email/route.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { to, template, data } = await request.json();
  
  // Load the appropriate template
  const htmlTemplate = loadTemplate(template); // Load from file system
  
  await resend.emails.send({
    from: 'noreply@contact.mypawpair.com',
    to,
    subject: getSubjectForTemplate(template),
    html: htmlTemplate,
  });
  
  return Response.json({ success: true });
}
```

#### C. Password Reset Template

1. Go to Supabase Dashboard → Authentication → Email Templates
2. Select **"Reset password"** template
3. Replace the content with `reset-password.html`
4. Keep `{{ .ConfirmationURL }}` and `{{ .SiteURL }}` variables as-is

### Step 3: Set Up Custom Email Sending (Welcome & Approval Emails)

Since Supabase Auth only handles confirmation and password reset emails, you need to set up custom email sending for:
- Welcome emails
- Caregiver approval emails

#### Option A: Use Resend API Directly

1. Install Resend SDK:
```bash
npm install resend
```

2. Create email service:
```typescript
// lib/email-service.ts
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string, role: 'owner' | 'caregiver', name: string) {
  const template = role === 'owner' ? 'welcome-owner.html' : 'welcome-caregiver.html';
  const html = fs.readFileSync(path.join(process.cwd(), 'email-templates', template), 'utf-8');
  
  // Replace variables in template
  const htmlWithData = html.replace(/\{\{ \.SiteURL \}\}/g, process.env.NEXT_PUBLIC_APP_URL || '');
  
  await resend.emails.send({
    from: 'noreply@contact.mypawpair.com',
    to: email,
    subject: role === 'owner' ? 'Welcome to myPawPair!' : 'Welcome to myPawPair Caregiver Network!',
    html: htmlWithData,
  });
}

export async function sendCaregiverApprovalEmail(email: string, name: string) {
  const html = fs.readFileSync(
    path.join(process.cwd(), 'email-templates', 'caregiver-approved.html'),
    'utf-8'
  );
  
  const htmlWithData = html.replace(/\{\{ \.SiteURL \}\}/g, process.env.NEXT_PUBLIC_APP_URL || '');
  
  await resend.emails.send({
    from: 'noreply@contact.mypawpair.com',
    to: email,
    subject: 'Congratulations! Your Caregiver Application is Approved',
    html: htmlWithData,
  });
}
```

3. Call these functions when needed:
```typescript
// After email verification succeeds (in auth callback)
await sendWelcomeEmail(user.email, user.user_metadata.role, user.user_metadata.full_name);

// After admin approves caregiver (in admin dashboard or database trigger)
await sendCaregiverApprovalEmail(caregiver.email, caregiver.full_name);
```

#### Option B: Use Supabase Edge Functions

1. Create a Supabase Edge Function:
```bash
supabase functions new send-email
```

2. Implement the function to call Resend API with your templates

### Step 4: Update Supabase Auth Settings

1. Go to Supabase Dashboard → Authentication → Email Templates
2. Update the site URL:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`

3. Update email rate limits if needed (Settings → Auth → Rate Limits)

## 🎨 Customization

### Variables Available in Templates

Supabase provides these variables that you can use:
- `{{ .ConfirmationURL }}` - Confirmation/reset link
- `{{ .Token }}` - Token value
- `{{ .TokenHash }}` - Token hash
- `{{ .SiteURL }}` - Your site URL
- `{{ .Email }}` - User's email

### Styling Guidelines

All templates use inline CSS for maximum email client compatibility:
- Mobile-responsive design
- Works with Gmail, Outlook, Apple Mail, etc.
- Includes dark mode considerations
- Uses web-safe fonts

### Brand Colors

Current color scheme:
- Primary: `#5F7E9D` (Owner theme)
- Secondary: `#8B7355` (Caregiver theme)
- Success: `#10B981` (Approval emails)
- Dark: `#2F3E4E` (Text and footer)
- Light: `#F6F2EA` (Background accents)

Update these colors across all templates if you need to match your brand.

## 📝 Testing Emails

### Test with Supabase (Confirmation/Reset)

1. Trigger a signup or password reset in your app
2. Check the email in your inbox
3. Verify links work correctly

### Test with Resend (Welcome/Approval)

1. Use Resend's testing environment
2. Or create a test API route:

```typescript
// app/api/test-email/route.ts
import { sendWelcomeEmail } from '@/lib/email-service';

export async function GET() {
  await sendWelcomeEmail('test@example.com', 'owner', 'Test User');
  return Response.json({ message: 'Test email sent!' });
}
```

## 🔒 Security Notes

1. **Never commit** your Resend API key to Git
2. Store all API keys in `.env.local`:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxx
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```
3. Use environment variables in production (Vercel/Netlify)
4. Implement rate limiting on custom email endpoints

## 📊 Email Deliverability Tips

1. **Warm up your domain** - Start with low volume, gradually increase
2. **Monitor bounce rates** - Keep below 5%
3. **Include unsubscribe links** - Already in templates
4. **Use SPF, DKIM, DMARC** - Configure in Resend
5. **Test before sending** - Use email testing tools

## 🆘 Troubleshooting

### Emails not sending?
1. Check SMTP settings in Supabase
2. Verify Resend API key is correct
3. Check rate limits aren't exceeded
4. Verify sender email domain is verified in Resend

### Emails going to spam?
1. Verify domain authentication in Resend
2. Warm up your sending domain
3. Avoid spam trigger words
4. Include proper unsubscribe links

### Styling issues?
1. Use email testing tools (Litmus, Email on Acid)
2. Test in multiple email clients
3. Keep CSS inline
4. Avoid complex layouts

## 📚 Resources

- [Supabase Email Templates Docs](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Resend Documentation](https://resend.com/docs)
- [Email Client CSS Support](https://www.caniemail.com/)

## 📞 Support

For questions or issues:
- Email: dev@mypawpair.com
- GitHub Issues: [Your repo]/issues
