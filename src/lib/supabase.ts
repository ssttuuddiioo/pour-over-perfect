import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vubfkkqpluoiwlqroamd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1YmZra3FwbHVvaXdscXJvYW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNTE0ODIsImV4cCI6MjA3NDkyNzQ4Mn0.ogrdDlLk12jrCKQFF4OVVPIEH9lWzbfBjcwP-e1Kwa8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

