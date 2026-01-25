

# InPilot.ai 🎤🤖

<div align="center">
   <img src="https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 14" />
   <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
   <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
   <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
   <img src="https://img.shields.io/badge/Shadcn_UI-111827?style=for-the-badge&logo=react&logoColor=white" alt="Shadcn UI" />
   <img src="https://img.shields.io/badge/Clerk-3A3A3A?style=for-the-badge&logo=clerk&logoColor=white" alt="Clerk" />
   <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
   <img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI" />
   <img src="https://img.shields.io/badge/Framer_Motion-EF008F?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
</div>

<p align="center">
   <b>The future of AI-powered interview practice with voice and instant feedback</b>
</p>

<div align="center">
   <p>An intelligent platform for practicing interview questions using your voice, with real-time transcription and AI-generated answers. Built with modern web technologies and a sleek, user-friendly design.</p>
</div>

## Highlights

<table>
   <tr>
      <td align="center" width="33%">
         <h3>🎤 Voice Interview Practice</h3>
         <p>Real-time voice recording, silence detection, and browser-based speech-to-text for a natural interview experience.</p>
      </td>
      <td align="center" width="33%">
         <h3>🤖 AI-Powered Answers</h3>
         <p>OpenAI GPT-4 generates direct answers, explanations, code, and complexity analysis for your questions.</p>
      </td>
      <td align="center" width="33%">
         <h3>🔒 Secure & Modern</h3>
         <p>Authentication with Clerk, data storage with Supabase, and a beautiful UI with Tailwind, Shadcn, and Framer Motion.</p>
      </td>
   </tr>
</table>

<br />

## What I Have Done

- Developed a full-stack AI Interview Assistant web app from scratch
- Implemented real-time voice recording and transcription using the Web Speech API
- Integrated OpenAI GPT-4 for structured, multi-part answer generation (direct answer, explanation, examples, code, complexity)
- Built secure authentication and user management with Clerk (email/password & social login)
- Designed a modern, responsive UI with Tailwind CSS, Shadcn UI, and Framer Motion
- Set up Supabase for database and session storage
- Added Google Search Console verification and sitemap for SEO and indexing
- Deployed and configured DNS records for custom domain

---


## Features

<details>
<summary><b>🎤 Voice Recording & Transcription</b></summary>
<br />
Real-time voice detection with automatic silence detection (stops after 2 seconds of silence). Built-in browser speech-to-text using Web Speech API for seamless, hands-free interview practice.
</details>

<details>
<summary><b>🤖 AI-Powered Answers</b></summary>
<br />
Get comprehensive answers powered by OpenAI GPT-4:
<ul>
   <li>Direct, concise answer</li>
   <li>Detailed explanation with context</li>
   <li>Real-world examples</li>
   <li>Code solutions (brute force & optimal)</li>
   <li>Time & space complexity analysis</li>
</ul>
</details>

<details>
<summary><b>🔐 Secure Authentication</b></summary>
<br />
User authentication and session management with Clerk. Supports email/password and social login. Dashboard and history are protected routes.
</details>

<details>
<summary><b>💾 Database & History</b></summary>
<br />
Interview sessions and answer history are stored securely in Supabase. Easily review past questions and answers.
</details>

<details>
<summary><b>🎨 Beautiful UI</b></summary>
<br />
Modern, responsive design with Tailwind CSS, Shadcn UI, and Framer Motion animations for a delightful user experience.
</details>

<br />

## UI Animations & Visual Effects

InPilot.ai features a modern, animated interface to enhance the user experience:

<table>
   <tr>
      <td width="33%" align="center">
         <h3>🔄 Pulse Glow Effects</h3>
         <p>Dynamic pulsing animations around the microphone and answer cards.</p>
      </td>
      <td width="33%" align="center">
         <h3>💬 Real-time Transcript</h3>
         <p>Live updating transcript with smooth fade-in and highlight effects.</p>
      </td>
      <td width="33%" align="center">
         <h3>✨ Animated Buttons</h3>
         <p>Interactive button hover and click animations for a tactile feel.</p>
      </td>
   </tr>
   <tr>
      <td width="33%" align="center">
         <h3>📊 Progress Indicators</h3>
         <p>Animated progress bars and loading spinners during answer generation.</p>
      </td>
      <td width="33%" align="center">
         <h3>🌈 Gradient Transitions</h3>
         <p>Smooth color shifts and gradients across UI elements.</p>
      </td>
      <td width="33%" align="center">
         <h3>🟢 Status Feedback</h3>
         <p>Visual feedback for recording, processing, and errors.</p>
      </td>
   </tr>
</table>

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, React
- **Styling**: Tailwind CSS, Shadcn UI components
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4
- **Voice**: Web Speech API
- **Animations**: Framer Motion

## Setup Instructions

### 1. Clone and Install

```bash
cd ai-chat-app
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
1. Go to [clerk.com](https://clerk.com) and create an account
3. Copy the API keys to your `.env.local` file
4. Configure the sign-in/sign-up pages

### 4. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Copy the project URL and anon key to your `.env.local` file
4. Run the SQL schema in the Supabase SQL Editor:
   - Open your Supabase project
   - Go to the SQL Editor
   - Copy and paste the contents of `supabase/schema.sql`
   - Run the query

### 5. Set Up OpenAI

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Add it to your `.env.local` file
### 6. Run the Application

```bash
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Browser Compatibility

The Web Speech API is best supported in:

**Note**: For production use, consider implementing a cloud-based speech recognition service like:
- Deepgram
- AssemblyAI
- Google Speech-to-Text

## How to Use

1. **Sign Up/Sign In**: Create an account or sign in
2. **Start Recording**: Click the microphone button
3. **Ask Question**: Speak your interview question clearly
4. **Auto Stop**: The recording stops automatically after 2 seconds of silence
5. **View Answer**: Get instant, comprehensive answers with:
   - Quick direct answer
   - Detailed explanation
   - Examples
   - Code solutions (if applicable)
   - Complexity analysis

## Features in Detail

### Voice Recording
- Uses Web Speech API for real-time transcription
- Automatic silence detection (2 seconds)
- Visual feedback with recording indicator
- Real-time transcript display

### AI Answer Generation
The AI provides structured answers:

1. **Direct Answer**: Immediate, concise response
2. **Detailed Explanation**: Comprehensive breakdown with context
3. **Example**: Real-world scenarios and use cases
4. **Code Solutions** (for coding questions):
   - Brute Force: Straightforward approach
   - Optimal Solution: Most efficient approach
   - Time Complexity: Big O analysis
   - Space Complexity: Memory usage analysis

### Answer History
- View recent questions
- Quick access to previous answers
- Timestamp tracking

## Project Structure

```
ai-chat-app/
├── app/
│   ├── api/
│   │   └── generate-answer/    # API route for AI generation
│   ├── dashboard/              # Main dashboard page
│   ├── sign-in/               # Clerk sign-in page
│   ├── sign-up/               # Clerk sign-up page
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Landing page
│   └── globals.css            # Global styles
├── components/
│   ├── ui/                    # Shadcn UI components
│   ├── VoiceRecorder.tsx      # Voice recording component
│   └── AnswerDisplay.tsx      # Answer display component
├── lib/
│   ├── ai-service.ts          # OpenAI integration
│   ├── supabase.ts            # Supabase client
│   └── utils.ts               # Utility functions
├── supabase/
│   └── schema.sql             # Database schema
├── middleware.ts              # Clerk middleware
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

## Database Schema

### interview_sessions
- Stores interview sessions for each user

### questions
- Stores questions asked during sessions

### answers
- Stores generated answers with all components

## Customization

### Change AI Model
Edit [lib/ai-service.ts](lib/ai-service.ts):
```typescript
model: 'gpt-4-turbo-preview', // Change to 'gpt-3.5-turbo' for faster/cheaper responses
```

### Adjust Silence Detection
Edit [components/VoiceRecorder.tsx](components/VoiceRecorder.tsx):
```typescript
silenceTimerRef.current = setTimeout(() => {
  // ... 
}, 2000) // Change 2000 to adjust milliseconds
```

### Modify Answer Format
Edit the system prompt in [lib/ai-service.ts](lib/ai-service.ts)

## Troubleshooting

### Microphone Not Working
1. Check browser permissions
2. Ensure you're using HTTPS (required for Web Speech API)
3. Try Chrome/Edge for best compatibility

### API Errors
1. Verify all environment variables are set
2. Check API key validity
3. Ensure OpenAI account has credits

### Database Issues
1. Verify Supabase connection
2. Check if schema is properly created
3. Review Row Level Security policies


## Domain Verification & Google Search Console

- **Domain Ownership Verified:**  
   Successfully verified domain ownership for `inpilot.vigneshlagishetti.me` using a DNS TXT record via Namecheap.
- **Google Search Console:**  
   Added the site to Google Search Console for indexing and performance tracking.
- **Sitemap Submission:**  
   Submitted `sitemap.xml` to Google Search Console to help Google discover and index site pages.
- **Requested Indexing:**  
   Used the URL Inspection tool to request indexing for the homepage and ensure faster appearance in Google search results.

## Future Enhancements

- [ ] Save sessions to database
- [ ] Export answers as PDF
- [ ] Code syntax highlighting
- [ ] Multi-language support
- [ ] Voice output (text-to-speech)
- [ ] Interview category selection
- [ ] Practice mode with timed questions
- [ ] Performance analytics


## License & Copyright

Copyright © 2026 Lagishetti Vignesh. All rights reserved.

This project and its source code are the intellectual property of Lagishetti Vignesh. Unauthorized copying, distribution, modification, or use of this code, in whole or in part, is strictly prohibited without express written permission from the copyright holder.

For licensing inquiries, please contact: lvigneshbunty789@gmail.com

MIT License applies to open source contributions only.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.
