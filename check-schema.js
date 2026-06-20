import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mjabfvmvxhuipcdqpqqz.supabase.co';
const supabaseAnonKey = 'sb_publishable_Tzstas3YwEagp1Oe1BqDkQ_Fkyi_FkM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  console.log("Checking schemas...");
  
  const tables = ['users', 'liked_songs', 'playlists', 'playlist_songs', 'recently_played'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Table ${table} error:`, error.message);
    } else {
      console.log(`Table ${table} columns:`, data.length > 0 ? Object.keys(data[0]) : "Empty table, cannot infer columns without postgrest schema");
    }
  }
}

checkSchema();
