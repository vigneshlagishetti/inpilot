# AI Interview Assistant

An intelligent interview practice application with voice recognition, real-time transcription, and AI-powered answer generation.

## Features

- 🎤 **Voice Recording**: Real-time voice detection with automatic silence detection (stops after 2 seconds of silence)
- 🗣️ **Speech Recognition**: Built-in browser speech-to-text using Web Speech API
- 🤖 **AI-Powered Answers**: Get comprehensive answers with:
  - Direct, concise answer
  - Detailed explanation with context
  - Real-world examples
  - Code solutions (brute force & optimal)
  - Time & space complexity analysis
- 🔐 **Authentication**: Secure user authentication with Clerk
- 💾 **Database**: Supabase for storing interview sessions and history
- 🎨 **Beautiful UI**: Modern design with Tailwind CSS and Framer Motion animations

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
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key
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

## Future Enhancements

- [ ] Save sessions to database
- [ ] Export answers as PDF
- [ ] Code syntax highlighting
- [ ] Multi-language support
- [ ] Voice output (text-to-speech)
- [ ] Interview category selection
- [ ] Practice mode with timed questions
- [ ] Performance analytics

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.
