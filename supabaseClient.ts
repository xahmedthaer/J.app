import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pffpejdczgxrjprlsovi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmZnBlamRjemd4cmpwcmxzb3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjMxNzUsImV4cCI6MjA3NzEzOTE3NX0.QzfmoI49SG0ZGmZLmZtDj7Q3xfcXzT1rF2gt4XDPqeE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
