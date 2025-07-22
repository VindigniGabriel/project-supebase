import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zhsqitiosfpnnrmwvplh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpoc3FpdGlvc2Zwbm5ybXd2cGxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMzg4OTksImV4cCI6MjA2ODcxNDg5OX0.xLWW9VRFrQ9Cu609FnDIB-HPKSsYy3QtMgQFXWVBW_U'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
