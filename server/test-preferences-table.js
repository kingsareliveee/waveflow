import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mjabfvmvxhuipcdqpqqz.supabase.co';
const supabaseAnonKey = 'sb_publishable_Tzstas3YwEagp1Oe1BqDkQ_Fkyi_FkM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.from('user_artist_preferences').select('*').limit(1);
  if (error) {
    console.log('Error selecting user_artist_preferences:', error.message);
  } else {
    console.log('user_artist_preferences structure/data:', data);
  }
}

check();
