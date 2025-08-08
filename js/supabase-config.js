import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://lhcmjwtuycuwywyckuay.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoY21qd3R1eWN1d3l3eWNrdWF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzY1NzYsImV4cCI6MjA2OTkxMjU3Nn0.3KxEo8-gleA1I3r3dhNSYmZIRG-vcUxpdiD0XG-8mRg';

export const supabase = createClient(supabaseUrl, supabaseKey);
window.supabase = supabase;