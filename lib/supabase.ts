import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Debugging API Key availability
const isClient = typeof window !== 'undefined'
const platform = isClient ? 'BROWSER' : 'SERVER'

console.log(`[${platform}] Supabase Initializing...`)
console.log(`[${platform}] URL:`, supabaseUrl)
console.log(`[${platform}] Key exists:`, !!supabaseAnonKey)
console.log(`[${platform}] Key length:`, supabaseAnonKey?.length)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      conversations: {
        Row: {
          id: string
          user_id: string
          user_email: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_email: string
          title: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          user_email?: string
          title?: string
          created_at?: string
          updated_at?: string
        }
      }
      conversation_messages: {
        Row: {
          id: string
          conversation_id: string
          type: 'user' | 'assistant'
          content: string
          metadata: any // JSONB
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          type: 'user' | 'assistant'
          content: string
          metadata?: any
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          type?: 'user' | 'assistant'
          content?: string
          metadata?: any
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          user_name: string
          user_email: string
          rating: number
          text: string
          created_at: string
        }
        Insert: {
          id: string
          user_name: string
          user_email: string
          rating: number
          text: string
          created_at?: string
        }
        Update: {
          id?: string
          user_name?: string
          user_email?: string
          rating?: number
          text?: string
          created_at?: string
        }
      }
      user_projects: {
        Row: {
          id: string
          user_id: string
          name: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
