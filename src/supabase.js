import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://omuhummnxyhjgqdippen.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tdWh1bW1ueHloamdxZGlwcGVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2ODc0MjIsImV4cCI6MjA4NzI2MzQyMn0.yCK510WRj0OvIAq2rx-WYqfrZAeSWGdCLTSegmv4eHY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
