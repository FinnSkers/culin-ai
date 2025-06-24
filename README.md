
# CulinAI: Your AI Kitchen Rebel

CulinAI is a smart, AI-powered kitchen assistant designed to feel like a native mobile application. It helps users discover recipes, manage their pantry, and get real-time assistance while cooking, all through a modern, voice-first interface. It's built with Next.js, Supabase, and OpenRouter Models, making it a powerful tool for both home cooks and culinary enthusiasts.

![CulinAI Screenshot](https://placehold.co/800x450.png)
*<p align="center" data-ai-hint="app screenshot">A screenshot of the CulinAI application interface.</p>*

---

## ✨ Core Features

- **AI-Powered Recipe Engine**:
    - **Generate from Ingredients**: Input ingredients you have, and get creative recipe ideas.
    - **Generate by Mood**: Tell the AI your vibe ("comforting," "adventurous," "quick & easy"), and get tailored recipe suggestions.
- **Voice-First Chat Assistant**: A hands-free, conversational AI assistant that can help with recipe steps, answer cooking questions, and even create recipes from a voice description.
- **Smart Pantry & Shopping List**:
    - Keep track of the ingredients you have on hand.
    - **Camera Scanning**: Use your phone's camera to automatically detect and add ingredients to your pantry.
    - Automatically add ingredients from a generated recipe to your shopping list.
- **Kitchen Safety Monitoring**: Use the "Disaster Check" feature to have the AI scan your camera feed for potential hazards like smoke or boil-overs.
- **User Personalization**: User accounts store dietary preferences (vegan, gluten-free, etc.) and taste profiles, which the AI considers for all recommendations.
- **PWA-Ready**: Optimized for mobile with a Progressive Web App manifest, allowing users to "install" it on their home screen.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **UI**: [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [ShadCN UI](https://ui.shadcn.com/)
- **AI**: [Google Gemini](https://ai.google.dev/) via [Genkit](https://firebase.google.com/docs/genkit)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **State Management**: React Context API

## 🚀 Getting Started

Follow these steps to get a local instance of CulinAI running.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/), or [pnpm](https://pnpm.io/)
- A [Supabase](https://supabase.com/) project
- A [Google AI API Key](https://aistudio.google.com/app/apikey)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/culinai.git
cd culinai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root of your project by copying the example below. This file stores all the necessary credentials for Supabase and Google AI.

```sh
# .env.local

# Supabase Credentials (from your Supabase Project > Settings > API)
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL_HERE
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE

# Google AI Credentials (from https://aistudio.google.com/app/apikey)
GOOGLE_API_KEY=YOUR_GOOGLE_AI_API_KEY_HERE
```
**Important**: The `SUPABASE_SERVICE_ROLE_KEY` is highly sensitive and should never be exposed publicly.

### 4. Set Up the Database
The application requires a specific database schema.
1.  Navigate to your Supabase project dashboard.
2.  In the left sidebar, go to the **SQL Editor**.
3.  Click on **New query**.
4.  Open the file `/supabase/schema.sql` in this project.
5.  Copy the entire contents of the file and paste it into the Supabase SQL Editor.
6.  Click the **Run** button.

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

---

## 📂 Project Structure

The codebase is organized to separate concerns, making it easier to navigate and maintain.

```
/
├── public/                 # Static assets (images, PWA icons)
├── supabase/               # Supabase schema and migrations
│   └── schema.sql          # Initial database schema
├── src/
│   ├── ai/                 # Genkit AI Flows & Configuration
│   │   ├── flows/          # Individual AI capabilities (e.g., generate recipes)
│   │   ├── genkit.ts       # Genkit initialization and plugin configuration
│   │   └── schemas.ts      # Zod schemas for AI input/output validation
│   ├── app/                # Next.js App Router: Pages, Layouts, and API routes
│   │   ├── (main)/         # Main app routes
│   │   │   ├── page.tsx      # Home page
│   │   │   └── profile/      # User profile page
│   │   ├── admin/            # Admin-only server actions
│   │   ├── auth/             # Authentication server actions and callbacks
│   │   ├── globals.css       # Global styles and Tailwind CSS variables
│   │   ├── layout.tsx        # Root layout for the application
│   │   └── setup/            # Page for initial app setup instructions
│   ├── components/           # Reusable React components
│   │   ├── admin/            # Components for the admin dashboard
│   │   ├── auth/             # Authentication form component
│   │   ├── dialogs/          # Modal dialogs (Chat, Recipe, Camera, Auth)
│   │   ├── features/         # Core feature components (RecipeGenerator, etc.)
│   │   ├── icons/            # Custom SVG icons (e.g., ChefRatAvatar)
│   │   ├── layout/           # Structural components (Header, BottomNav)
│   │   ├── sheets/           # Side sheets (Pantry)
│   │   └── ui/               # Base ShadCN UI components
│   ├── context/              # Global state management
│   │   └── CulinAIProvider.tsx # Core context for user, pantry, recipes, UI state
│   ├── hooks/                # Custom React Hooks
│   │   ├── useCulinAI.ts     # Hook to access the CulinAIContext
│   │   └── use-toast.ts      # Toast notification system
│   ├── lib/                  # Libraries, helpers, and utilities
│   │   ├── supabase/         # Supabase client and server helpers
│   │   ├── types.ts          # TypeScript type definitions for the app
│   │   └── utils.ts          # General utility functions (cn)
│   └── middleware.ts       # Next.js middleware for auth and routing
└── ...                     # Other project configuration files
```

## 🤖 The AI Brain: How Genkit Works

All AI functionality is handled by **Genkit** and lives in the `src/ai` directory.

-   **`genkit.ts`**: This is the central configuration file where the Google AI plugin is initialized. It sets up the default models for the application.
-   **`schemas.ts`**: This file contains all the Zod schemas that define the "contracts" for our AI. They ensure that the data sent to and received from the AI models is in the correct format.
-   **`flows/`**: Each file in this directory represents a specific AI skill. For example, `generate-recipe.ts` contains the logic to take ingredients and turn them into a full recipe, while `detect-ingredients.ts` knows how to analyze an image. This modular approach makes the AI's capabilities easy to manage and extend.

## 🔐 Authentication & Data

The application uses **Supabase** for both authentication and database storage.

-   **Authentication**: Supabase Auth handles user sign-up (with email OTP verification), sign-in, and session management.
-   **Database**: The Postgres database stores user-related data across three main tables:
    -   `profiles`: Stores user data, including their role (`user` or `admin`) and their culinary preferences. A new profile is automatically created for a user on their first sign-up.
    -   `pantry_items`: Stores each user's ingredients, linked by `user_id`.
    -   `invite_codes`: Manages the invite code system for new user sign-ups.
-   **Security**: The database schema in `supabase/schema.sql` enables **Row Level Security (RLS)** on all tables. This is a critical security feature that ensures users can only ever access their own data. The service role key is used in server-side actions to bypass RLS for administrative tasks.

## 👑 Admin Role & Invite Codes

The application includes a simple admin system for managing users and invite codes.

### Creating an Admin User
1.  Sign up for a new account through the CulinAI application's UI.
2.  Go to your Supabase project dashboard.
3.  In the left sidebar, navigate to **Table Editor** -> **profiles**.
4.  Find the row corresponding to the user you just created.
5.  In the `role` column, change the value from `user` to `admin` and save the change.

### Managing Invite Codes
-   An admin user will see an **Admin Dashboard** on their profile page.
-   From this dashboard, admins can create new invite codes and view their usage status.
-   The sign-up form includes an optional field for an invite code. If a valid, unused code is provided, the user can sign up, and the code is marked as used.
#   c u l i n - a i  
 #   c u l i n - a i  
 #   c u l i n - a i  
 