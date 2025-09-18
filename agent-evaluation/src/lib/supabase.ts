import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      navos_test_result: {
        Row: {
          id: number
          q_id: number
          q_name: string
          title: string
          agent_type: string
          item_visual: number
          item_major: number
          item_data: number
          item_guide: number
          created_at: string
        }
        Insert: {
          id?: number
          q_id: number
          q_name: string
          title: string
          agent_type: string
          item_visual: number
          item_major: number
          item_data: number
          item_guide: number
          created_at?: string
        }
        Update: {
          id?: number
          q_id?: number
          q_name?: string
          title?: string
          agent_type?: string
          item_visual?: number
          item_major?: number
          item_data?: number
          item_guide?: number
          created_at?: string
        }
      }
    }
  }
}