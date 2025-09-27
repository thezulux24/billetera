// Simple debug script to test Supabase connection
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://erblgohhxlvhqwwkkxjm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYmxnb2hoeGx2aHF3d2treGptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyMzg2NDcsImV4cCI6MjA0NzgxNDY0N30.gYnI5H2fhlg_oMpZsN-EJqaJj63_V-Ga8N9cRVW2mt4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test simple query
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Connection successful, found profiles:', data?.length || 0);
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

testConnection();