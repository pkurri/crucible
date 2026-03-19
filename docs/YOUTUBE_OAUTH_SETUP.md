# 📘 Google Cloud & YouTube OAuth2 Setup Guide

To connect your **Crucible Autonomous Agents** to your real YouTube channel, you need to create a secure bridge in the Google Cloud Console. Follow these steps carefully to ensure the account is tied to your **LLC**.

## 🏗️ Step 1: Create a Google Cloud Project
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Login with your **LLC's primary email address** (best for business separation).
3.  Click the Project Dropdown (top left) → **"New Project"**.
4.  **Project Name**: `Crucible-YouTube-Empire` (or your LLC name).
5.  **Organization**: If you have a business domain, select your organization. Otherwise, select "No organization".
6.  Click **"Create"**.

## 🔌 Step 2: Enable the YouTube API
1.  In the Sidebar, go to **"APIs & Services"** → **"Library"**.
2.  Search for **"YouTube Data API v3"**.
3.  Click it, and then click **"Enable"**.

## ⚖️ Step 3: Configure the OAuth Consent Screen
*This is the screen you see when "Logging in with Google".*

1.  Go to **"APIs & Services"** → **"OAuth consent screen"**.
2.  **User Type**: Select **"External"** (unless your LLC has a Google Workspace and your channel is inside it).
3.  Click **"Create"**.
4.  **App Information**:
    - **App name**: `Crucible Agent Division`
    - **User support email**: Your LLC's support email.
    - **Developer contact info**: Your business email.
5.  **Scopes**: Click **"Add or Remove Scopes"**. Add these three:
    - `./auth/youtube.upload`
    - `./auth/youtube.force-ssl`
    - `./auth/youtube.readonly`
6.  Click **"Save and Continue"**.
7.  **Test Users**: Add the email address of the YouTube channel you want to automate. (Crucial while the app is in "Testing" mode).

## 🔑 Step 4: Create OAuth2 Client ID
1.  Go to **"APIs & Services"** → **"Credentials"**.
2.  Click **"+ Create Credentials"** → **"OAuth client ID"**.
3.  **Application type**: Select **"Web application"** (if using the Crucible Dashboard) OR **"Desktop app"** (if running only from local scripts).
4.  **Name**: `Crucible Autonomous Production`
5.  **Authorized Redirect URIs** (for Web Apps):
    - `http://localhost:3000/api/auth/callback/google`
6.  Click **"Create"**.
7.  **Download the Secret**: A popup will show your `Client ID` and `Client Secret`. **Download the JSON file** and name it `client_secret.json`.

---

### 🚀 Next Step: Connect to Crucible
Once you have the `client_secret.json`, you will place it in your `config/secrets/` directory.

> **Crucial for LLCs**: Ensure you have a **"Tax Identification Number" (EIN)** ready for the next phase: **Google AdSense for Business**. This guide only handles the *Automation* part; AdSense handles the *Payments*.
