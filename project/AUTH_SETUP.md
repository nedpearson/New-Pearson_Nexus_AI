# Authentication Setup

The application now uses real Supabase authentication with credential-based login.

## Creating the Seeded User Account

To create the required business account for `nedpearson@gmail.com`:

1. Start the development server: `npm run dev`
2. Navigate to the login page
3. Click "Sign Up" tab
4. Fill in the following details:
   - **Full Name**: Ned Pearson
   - **Account Type**: Business
   - **Email**: nedpearson@gmail.com
   - **Password**: 1Pearson2
   - **Face Recognition**: (optional)
5. Click "Create Account"

The account will be created with:
- **Organization**: Pearson Business
- **Plan**: Business (full access to all features)
- **Role**: Owner
- **No demo restrictions**

## Login Credentials

After creating the account, you can log in with:
- **Email**: nedpearson@gmail.com
- **Password**: 1Pearson2

## Demo Mode

Demo mode is completely separate from your business account:
- Click "Try Demo" button to create a temporary demo workspace
- Demo workspace uses the "Demo Workspace" organization
- Demo accounts are separate users with no impact on business accounts

## Features

- ✅ Email + password authentication
- ✅ Password visibility toggle (show/hide)
- ✅ Optional face recognition checkbox (UI only)
- ✅ Auth state persists across refresh
- ✅ Business accounts have full access (no demo restrictions)
- ✅ Demo mode creates separate workspace
- ✅ Organization switching supported
- ✅ Secure RLS policies on all data

## Database Structure

- `organizations` table: Stores organization info (Business, Demo, etc.)
- `user_profiles` table: Links Supabase Auth users to organizations
- All user data is scoped to their organization via RLS policies
