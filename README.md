

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
   <p>An intelligent platform for practicing interview questions using your voice, with real-time transcription and AI-generated personalized answers based on your resume. Built with modern web technologies and a sleek, user-friendly design.</p>
</div>

## Highlights

<table>
   <tr>
      <td align="center" width="33%">
         <h3>🎤 Voice Interview Practice</h3>
         <p>Real-time voice recording, silence detection, and browser-based speech-to-text for a natural interview experience.</p>
      </td>
      <td align="center" width="33%">
         <h3>🤖 AI-Powered Personalized Answers</h3>
         <p>OpenAI GPT generates answers based on YOUR resume, job role, projects, and custom instructions.</p>
      </td>
      <td align="center" width="33%">
         <h3>🔒 Secure & Modern</h3>
         <p>Authentication with Clerk, permanent data storage with Supabase, and a beautiful UI with Tailwind, Shadcn, and Framer Motion.</p>
      </td>
   </tr>
</table>

<br />

## What Has Been Implemented

### Core Features
- ✅ Full-stack AI Interview Assistant web app from scratch
- ✅ Real-time voice recording and transcription using Web Speech API
- ✅ OpenAI GPT-4 integration for structured answer generation
- ✅ Secure authentication with Clerk (email/password & social login)
- ✅ Modern, responsive UI with Tailwind CSS, Shadcn UI, and Framer Motion
- ✅ Supabase database for permanent data storage
- ✅ Google Search Console verification and sitemap for SEO

### Resume & Profile Management
- ✅ **PDF Resume Upload** - Accurate text extraction from PDF files using `pdf2json`
- ✅ **DOCX Resume Upload** - Support for Word documents using `mammoth`
- ✅ **TXT Resume Upload** - Direct text file support
- ✅ **Paste Resume Text** - Quick paste option for resume content
- ✅ **Permanent Resume Storage** - Resumes saved to Supabase database
- ✅ **Auto-Load on Login** - Resume automatically loads from database
- ✅ **Job Role Configuration** - Specify the role you're interviewing for
- ✅ **Custom Instructions** - Add personalized instructions for AI responses
- ✅ **Loading Indicators** - Visual feedback during PDF/DOCX processing

### Project Context
- ✅ **Multiple Projects** - Add unlimited project documentation
- ✅ **Project Storage** - Projects permanently saved in Supabase
- ✅ **Context-Aware Answers** - AI uses project details for technical questions
- ✅ **Project Management** - Add, edit, and delete projects

### AI Personalization
- ✅ **Resume-Based Responses** - AI answers AS YOU, using your resume
- ✅ **Name Extraction** - Automatically extracts your name from resume
- ✅ **Role-Specific Answers** - Tailored to your target job role
- ✅ **Project-Specific Details** - References your actual implementations
- ✅ **Custom Instructions** - Follows your specific preferences

### Data Persistence
- ✅ **Dual Storage** - Database + localStorage backup
- ✅ **Cross-Device Sync** - Access your data from anywhere
- ✅ **Conversation History** - All Q&A saved to database
- ✅ **History Management** - Delete individual history items
- ✅ **Session Management** - Automatic session creation and tracking

---

## Features

<details>
<summary><b>🎤 Voice Recording & Transcription</b></summary>
<br />
Real-time voice detection with automatic silence detection (stops after 2 seconds of silence). Built-in browser speech-to-text using Web Speech API for seamless, hands-free interview practice.
</details>

<details>
<summary><b>📄 Resume Upload & Processing</b></summary>
<br />
Upload your resume in multiple formats:
<ul>
   <li><b>PDF</b> - Accurate text extraction with pdf2json</li>
   <li><b>DOCX/DOC</b> - Word document support with mammoth</li>
   <li><b>TXT</b> - Direct text file upload</li>
   <li><b>Paste Text</b> - Quick copy-paste option</li>
</ul>
Features:
<ul>
   <li>Loading spinner during processing</li>
   <li>Toast notifications for progress</li>
   <li>Error handling with helpful messages</li>
   <li>Automatic save to database</li>
   <li>Permanent storage across sessions</li>
</ul>
</details>

<details>
<summary><b>🤖 AI-Powered Personalized Answers</b></summary>
<br />
Get comprehensive answers powered by OpenAI GPT-4, personalized to YOUR profile:
<ul>
   <li><b>Resume-Based</b> - AI responds as YOU, using your actual experience</li>
   <li><b>Role-Specific</b> - Tailored to your target job position</li>
   <li><b>Project Context</b> - References your specific implementations</li>
   <li><b>Custom Instructions</b> - Follows your preferences (e.g., "Keep answers under 2 minutes")</li>
   <li>Direct, concise answer</li>
   <li>Detailed explanation with context</li>
   <li>Real-world examples from YOUR experience</li>
   <li>Code solutions (brute force & optimal) when applicable</li>
   <li>Time & space complexity analysis</li>
</ul>
</details>

<details>
<summary><b>📁 Project Management</b></summary>
<br />
Add detailed project documentation for context-aware answers:
<ul>
   <li>Add unlimited projects with descriptions</li>
   <li>Permanently stored in Supabase</li>
   <li>AI references your projects for technical questions</li>
   <li>Edit and delete projects anytime</li>
</ul>
</details>

<details>
<summary><b>🔐 Secure Authentication</b></summary>
<br />
User authentication and session management with Clerk. Supports email/password and social login. Dashboard and history are protected routes.
</details>

<details>
<summary><b>💾 Permanent Data Storage</b></summary>
<br />
All your data is permanently stored in Supabase:
<ul>
   <li><b>Resume</b> - Full text content, file name</li>
   <li><b>Job Role</b> - Target position</li>
   <li><b>Custom Instructions</b> - Your AI preferences</li>
   <li><b>Projects</b> - All project documentation</li>
   <li><b>Conversation History</b> - All questions and answers</li>
   <li><b>Auto-sync</b> - Changes save automatically</li>
   <li><b>Cross-device</b> - Access from anywhere</li>
</ul>
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
         <p>Animated progress bars and loading spinners during answer generation and file processing.</p>
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
- **AI**: OpenAI GPT-4 (llama-3.1-8b-instant for fast responses)
- **Voice**: Web Speech API
- **Animations**: Framer Motion
- **PDF Processing**: pdf2json
- **DOCX Processing**: mammoth
- **File Upload**: Next.js API Routes with FormData

## Setup Instructions

### 1. Clone and Install

```bash
cd inpilot
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
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key
OPENAI_BASE_URL=https://api.openai.com/v1  # Or your custom endpoint
```

### 3. Set Up Clerk

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Copy the API keys to your `.env.local` file
4. Configure the sign-in/sign-up pages

### 4. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Copy the project URL and anon key to your `.env.local` file
4. Run the SQL migrations in the Supabase SQL Editor:
   - `supabase/schema.sql` - Main schema
   - `supabase_projects_migration.sql` - Projects table
   - `supabase_resumes_migration.sql` - Resumes table
   - `supabase_reviews_migration.sql` - Reviews table

**Important SQL Migrations:**

```sql
-- Run these in order in Supabase SQL Editor

-- 1. Main schema (conversations and messages)
-- Copy from supabase/schema.sql

-- 2. Projects table
CREATE TABLE IF NOT EXISTS user_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS user_projects_user_id_idx ON user_projects (user_id);
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for now" ON user_projects FOR ALL USING (true) WITH CHECK (true);

-- 3. Resumes table
CREATE TABLE IF NOT EXISTS user_resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  resume_content TEXT NOT NULL,
  file_name TEXT NOT NULL,
  job_role TEXT,
  custom_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS user_resumes_user_id_idx ON user_resumes (user_id);
ALTER TABLE user_resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for user resumes" ON user_resumes FOR ALL USING (true) WITH CHECK (true);
```

### 5. Set Up OpenAI

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Add it to your `.env.local` file

### 6. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Browser Compatibility

The Web Speech API is best supported in:
- ✅ Chrome/Edge (Recommended)
- ✅ Safari
- ⚠️ Firefox (Limited support)

**Note**: For production use, consider implementing a cloud-based speech recognition service like:
- Deepgram
- AssemblyAI
- Google Speech-to-Text

## How to Use

### First Time Setup
1. **Sign Up/Sign In**: Create an account or sign in
2. **Upload Resume**: Go to Settings tab
   - Upload PDF, DOCX, or TXT file
   - Or paste your resume text directly
3. **Configure Profile**:
   - Enter job role (e.g., "Full Stack Developer")
   - Add custom instructions (optional)
   - Add project documentation (optional)
4. **Save**: Everything saves automatically to database

### Using the Interview Practice
1. **Go to Practice Tab**: Click on the microphone icon
2. **Start Recording**: Click the microphone button
3. **Ask Question**: Speak your interview question clearly
4. **Auto Stop**: Recording stops after 2 seconds of silence
5. **View Personalized Answer**: Get instant answers that:
   - Reference YOUR resume and experience
   - Are tailored to YOUR target job role
   - Include details from YOUR projects
   - Follow YOUR custom instructions

### Example Questions
- "Tell me about yourself" → AI responds using YOUR name and experience
- "What's your experience with React?" → AI references YOUR React projects
- "Explain your authentication implementation" → AI uses YOUR project documentation

## Features in Detail

### Resume Processing
The app supports multiple resume formats with accurate text extraction:

**PDF Files:**
- Uses `pdf2json` library
- Extracts text from all pages
- Handles malformed URI encoding
- Decodes special characters properly
- Shows loading spinner during processing

**DOCX Files:**
- Uses `mammoth` library
- Extracts raw text content
- Preserves text structure
- Handles .doc and .docx formats

**Text Processing:**
- Cleans excessive whitespace
- Preserves line structure
- Filters empty lines
- Validates extracted content

### AI Answer Generation
The AI provides structured, personalized answers:

1. **Direct Answer**: Immediate response using your background
2. **Detailed Explanation**: Comprehensive breakdown with YOUR context
3. **Example**: Real-world scenarios from YOUR experience
4. **Code Solutions** (for coding questions):
   - Brute Force: Straightforward approach
   - Optimal Solution: Most efficient approach
   - Time Complexity: Big O analysis
   - Space Complexity: Memory usage analysis

### Data Persistence Architecture
- **Primary Storage**: Supabase PostgreSQL database
- **Backup Storage**: Browser localStorage
- **Auto-Sync**: Changes save immediately to database
- **Cross-Device**: Access from any device with same account
- **Offline Fallback**: localStorage provides offline access

## Project Structure

```
inpilot/
├── app/
│   ├── api/
│   │   ├── extract-text/         # PDF/DOCX text extraction
│   │   ├── generate-answer/      # AI answer generation
│   │   ├── reviews/              # User reviews API
│   │   └── contact/              # Contact form API
│   ├── dashboard/                # Main dashboard page
│   ├── sign-in/                  # Clerk sign-in page
│   ├── sign-up/                  # Clerk sign-up page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/
│   ├── ui/                       # Shadcn UI components
│   ├── VoiceRecorder.tsx         # Voice recording component
│   ├── AnswerDisplay.tsx         # Answer display component
│   ├── ResumeUploader.tsx        # Resume upload component
│   └── ThemeProvider.tsx         # Dark mode provider
├── lib/
│   ├── ai-service.ts             # OpenAI integration
│   ├── supabase.ts               # Supabase client
│   └── utils.ts                  # Utility functions
├── supabase/
│   ├── schema.sql                # Main database schema
│   ├── supabase_projects_migration.sql
│   ├── supabase_resumes_migration.sql
│   └── supabase_reviews_migration.sql
├── middleware.ts                 # Clerk middleware
├── next.config.js                # Next.js config (canvas externalization)
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

## Database Schema

### conversations
- Stores conversation sessions for each user
- Links to conversation_messages

### conversation_messages
- Stores all questions and answers
- Type: 'user' or 'assistant'
- Metadata contains full answer structure

### user_projects
- Stores project documentation
- Multiple projects per user
- Used for context-aware answers

### user_resumes
- Stores resume content permanently
- One resume per user (UNIQUE constraint)
- Includes job role and custom instructions
- Auto-updates timestamp on changes

### reviews
- User feedback and ratings
- Public reviews visible to all users

## Customization

### Change AI Model
Edit `lib/ai-service.ts`:
```typescript
model: 'llama-3.1-8b-instant', // Change to 'gpt-4' for better quality
```

### Adjust Silence Detection
Edit `components/VoiceRecorder.tsx`:
```typescript
silenceTimerRef.current = setTimeout(() => {
  // ... 
}, 2000) // Change 2000 to adjust milliseconds
```

### Modify Answer Format
Edit the system prompt in `lib/ai-service.ts`

### Configure PDF Processing
Edit `app/api/extract-text/route.ts` to adjust text cleanup or add filters

## Troubleshooting

### Microphone Not Working
1. Check browser permissions
2. Ensure you're using HTTPS (required for Web Speech API)
3. Try Chrome/Edge for best compatibility

### PDF Upload Issues
1. Check file size (should be reasonable)
2. Ensure PDF is not password-protected
3. Try converting to TXT if issues persist
4. Check browser console for errors

### Resume Not Saving to Database
1. Verify Supabase connection in `.env.local`
2. Check if `user_resumes` table exists
3. Run the migration SQL if not created
4. Check browser console for errors
5. Wait for Supabase maintenance to complete (if applicable)

### API Errors
1. Verify all environment variables are set
2. Check API key validity
3. Ensure OpenAI account has credits
4. Check Supabase project status

### Database Issues
1. Verify Supabase connection
2. Check if all migrations are run
3. Review Row Level Security policies
4. Check Supabase logs for errors

## Domain Verification & Google Search Console

- **Domain Ownership Verified:**  
   Successfully verified domain ownership for `inpilot.vigneshlagishetti.me` using a DNS TXT record via Namecheap.
- **Google Search Console:**  
   Added the site to Google Search Console for indexing and performance tracking.
- **Sitemap Submission:**  
   Submitted `sitemap.xml` to Google Search Console to help Google discover and index site pages.
- **Requested Indexing:**  
   Used the URL Inspection tool to request indexing for the homepage and ensure faster appearance in Google search results.

## Recent Updates

### Resume Upload & Storage (Latest)
- ✅ PDF resume upload with accurate text extraction
- ✅ DOCX/DOC resume support
- ✅ Paste resume text option
- ✅ Permanent database storage for resumes
- ✅ Auto-load resume on login
- ✅ Loading indicators and progress feedback
- ✅ Job role and custom instructions storage
- ✅ Cross-device resume sync

### AI Personalization
- ✅ Resume-based AI responses
- ✅ Role-specific answer tailoring
- ✅ Project context integration
- ✅ Custom instruction support
- ✅ Name extraction from resume

## Future Enhancements

- [ ] Export answers as PDF
- [ ] Code syntax highlighting in answers
- [ ] Multi-language support
- [ ] Voice output (text-to-speech for answers)
- [ ] Interview category selection
- [ ] Practice mode with timed questions
- [ ] Performance analytics and progress tracking
- [ ] Mock interview scheduling
- [ ] Video recording for behavioral questions
- [ ] Resume builder/editor
- [ ] Cover letter generation
- [ ] Interview tips and best practices

## License & Copyright

Copyright © 2026 Lagishetti Vignesh. All rights reserved.

This project and its source code are the intellectual property of Lagishetti Vignesh. Unauthorized copying, distribution, modification, or use of this code, in whole or in part, is strictly prohibited without express written permission from the copyright holder.

For licensing inquiries, please contact: lvigneshbunty789@gmail.com

MIT License applies to open source contributions only.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub or contact: lvigneshbunty789@gmail.com

---

<p align="center">
   Developed by <b>Lagishetti Vignesh</b>
</p>
