import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ipixwbgotqvonlaooqod.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwaXh3YmdvdHF2b25sYW9vcW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNjE3MzMsImV4cCI6MjA2OTYzNzczM30.WdkbCIboU_aDTNLcQLEbcfaf8mtzFeCKi3oze9fDqCw';

export const supabase = createClient(supabaseUrl, supabaseKey);