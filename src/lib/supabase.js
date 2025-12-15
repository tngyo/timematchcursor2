import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hewxidiimciwjbarccaq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhld3hpZGlpbWNpd2piYXJjY2FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MjE5OTIsImV4cCI6MjA4MTE5Nzk5Mn0.FhxaYMzGQscMZPpBOio1Z912ebmkPInBEbwqRGxG9Z4';

export const supabase = createClient(supabaseUrl, supabaseKey);

