import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mjabfvmvxhuipcdqpqqz.supabase.co';
const supabaseAnonKey = 'sb_publishable_Tzstas3YwEagp1Oe1BqDkQ_Fkyi_FkM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRecentlyPlayed() {
  const { data, error } = await supabase.from('recently_played').insert({
    user_id: 'd3b07384-d113-4c9f-8181-4c1264c1264c', // dummy uuid
    video_id: 'test_vid_id_2',
    title: 'Test Title 2',
    artist: 'Test Artist 2',
    thumbnail: 'https://test.com/thumb.jpg',
    duration: 225
  }).select();

  if (error) {
    console.error('Insert error:', error.message, error.details);
  } else {
    console.log('Insert success:', data);
  }
}

testRecentlyPlayed();
