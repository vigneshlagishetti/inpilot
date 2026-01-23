import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      interview_sessions: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          created_at?: string
          updated_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          session_id: string
          question_text: string
          audio_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          question_text: string
          audio_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          question_text?: string
          audio_url?: string | null
          created_at?: string
        }
      }
      answers: {
        Row: {
          id: string
          question_id: string
          direct_answer: string
          detailed_explanation: string
          example: string | null
          brute_force_approach: string | null
          optimal_approach: string | null
          time_complexity: string | null
          space_complexity: string | null
          created_at: string
        }
        Insert: {
          id?: string
          question_id: string
          direct_answer: string
          detailed_explanation: string
          example?: string | null
          brute_force_approach?: string | null
          optimal_approach?: string | null
          time_complexity?: string | null
          space_complexity?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          direct_answer?: string
          detailed_explanation?: string
          example?: string | null
          brute_force_approach?: string | null
          optimal_approach?: string | null
          time_complexity?: string | null
          space_complexity?: string | null
          created_at?: string
        }
      }
    }
  }
}
