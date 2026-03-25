# Quick Setup Guide for Supabase Email Templates

## ⚡ Quick Steps

### 1. Update Logo URL in All Templates (FIRST!)

Before doing anything else, replace the logo URL in all 6 HTML files:

**Find:** `https://yourdomain.com/logo.png`
**Replace with:** Your actual logo URL (upload logo to Vercel/CDN first)

Files to update:
- ✅ confirm-email-owner.html
- ✅ confirm-email-caregiver.html  
- ✅ welcome-owner.html
- ✅ welcome-caregiver.html
- ✅ reset-password.html
- ✅ caregiver-approved.html

### 2. Set Up in Supabase Dashboard

#### A. Confirm Email Template (Currently used for both roles)

**Path:** Supabase Dashboard → Authentication → Email Templates → "Confirm signup"

**Copy content from:** `confirm-email-owner.html`

**Subject:** `Confirm Your Email - myPawPair`

**Note:** This will be used for both owners and caregivers initially. See README.md for how to customize by role.

#### B. Password Reset Template

**Path:** Supabase Dashboard → Authentication → Email Templates → "Reset Password"

**Copy content from:** `reset-password.html`

**Subject:** `Reset Your Password - myPawPair`

#### C. Magic Link Template (Optional)

**Path:** Supabase Dashboard → Authentication → Email Templates → "Magic Link"

**Copy content from:** `confirm-email-owner.html` (you can customize this later)

**Subject:** `Your Magic Link - myPawPair`

### 3. Configure SMTP Settings (Already Done!)

You already configured Resend SMTP:
- ✅ Host: smtp.resend.com
- ✅ Port: 465 or 587
- ✅ Username: resend
- ✅ Password: Your Resend API key
- ✅ Sender: noreply@contact.mypawpair.com

### 4. Test Email Confirmation

1. Sign up a test user in your app
2. Check if confirmation email arrives
3. Click the link and verify it redirects correctly
4. Should now show success page instead of error!

### 5. Set Up Custom Emails (Welcome & Approval)

These templates need custom implementation since Supabase Auth only handles:
- Email confirmation
- Password reset
- Magic link

For welcome and approval emails, you have 2 options:

#### Option A: Install Resend SDK and Send Directly (Recommended)

```bash
npm install resend
```

Then create `lib/email.ts`:

```typescript
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(
  email: string, 
  role: 'owner' | 'caregiver'
) {
  const template = role === 'owner' 
    ? 'welcome-owner.html' 
    : 'welcome-caregiver.html';
    
  const html = fs.readFileSync(
    path.join(process.cwd(), 'email-templates', template),
    'utf-8'
  ).replace(
    /\{\{ \.SiteURL \}\}/g, 
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  );
  
  await resend.emails.send({
    from: 'noreply@contact.mypawpair.com',
    to: email,
    subject: role === 'owner' 
      ? 'Welcome to myPawPair!' 
      : 'Welcome to myPawPair Caregiver Network!',
    html,
  });
}

export async function sendCaregiverApprovalEmail(email: string) {
  const html = fs.readFileSync(
    path.join(process.cwd(), 'email-templates', 'caregiver-approved.html'),
    'utf-8'
  ).replace(
    /\{\{ \.SiteURL \}\}/g, 
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  );
  
  await resend.emails.send({
    from: 'noreply@contact.mypawpair.com',
    to: email,
    subject: 'Congratulations! Your Caregiver Application is Approved',
    html,
  });
}
```

#### Option B: Use Edge Functions (More Complex)

See README.md for detailed instructions.

### 6. Call Welcome Email After Confirmation

Update your auth confirm route (`app/auth/confirm/route.ts`):

```typescript
import { sendWelcomeEmail } from '@/lib/email';

// After successful verification:
if (!error) {
  const user = data?.user;
  const role = user?.user_metadata?.role;
  
  // Send welcome email
  try {
    await sendWelcomeEmail(user.email, role);
  } catch (emailError) {
    console.error('Failed to send welcome email:', emailError);
  }
  
  // Then redirect...
  if (role === "owner") {
    redirect("/auth/email-verified-success?role=owner");
  }
  // ...
}
```

### 7. Send Approval Email to Caregivers

When you approve a caregiver in your admin dashboard or database:

```typescript
import { sendCaregiverApprovalEmail } from '@/lib/email';

// After setting caregiver as approved in database
await sendCaregiverApprovalEmail(caregiver.email);
```

## 🎯 What's Fixed Now

✅ **Email verification redirect** - Now shows success page instead of error
✅ **Role-based success messages** - Different messages for owners vs caregivers
✅ **Professional email templates** - All emails now have branded designs
✅ **Caregiver approval workflow** - Template ready for when you approve caregivers

## 📝 Environment Variables Needed

Add to `.env.local`:

```env
RESEND_API_KEY=re_your_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change in production
```

## 🧪 Testing Checklist

- [ ] Test owner signup → confirmation email → verify → success page
- [ ] Test caregiver signup → confirmation email → verify → pending approval message
- [ ] Test password reset → email → reset link works
- [ ] Test welcome email sends after confirmation (once implemented)
- [ ] Test caregiver approval email (once implemented)

## 🚨 Important Notes

1. **Logo URL must be public** - Upload to Vercel public or CDN first
2. **Replace {{ .SiteURL }} carefully** - Keep it for Supabase templates, replace it for custom templates
3. **Test in multiple email clients** - Gmail, Outlook, Apple Mail, etc.
4. **Rate limits** - Resend free tier: 100 emails/day, upgrade as needed

## 📊 Current Status

| Email Type | Template Ready | Supabase Setup | Implementation |
|-----------|---------------|----------------|----------------|
| Confirm Email (Owner) | ✅ | ⏳ Pending | ✅ Done |
| Confirm Email (Caregiver) | ✅ | ⏳ Pending | ✅ Done |
| Password Reset | ✅ | ⏳ Pending | ✅ Done |
| Welcome (Owner) | ✅ | N/A | ⏳ Pending |
| Welcome (Caregiver) | ✅ | N/A | ⏳ Pending |
| Caregiver Approval | ✅ | N/A | ⏳ Pending |

## 🎨 Preview Templates

To preview templates locally before uploading:
1. Open any `.html` file in a browser
2. Templates are static HTML with inline CSS
3. Links won't work (they're Supabase variables)

## ❓ Need Help?

Common issues and solutions:
1. **Logo not showing?** → Make sure URL is public and accessible
2. **Variables not replacing?** → Supabase auto-replaces {{ .ConfirmationURL }} etc.
3. **Emails going to spam?** → Verify domain in Resend dashboard
4. **Styling broken?** → Email clients don't support all CSS, we used inline styles

---

**Next Steps:**
1. ⏳ Update logo URLs in all templates
2. ⏳ Copy templates to Supabase dashboard
3. ⏳ Test email confirmation flow
4. ⏳ Implement custom email sending (welcome/approval)
