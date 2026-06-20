import { useEffect, useState, useRef } from 'react';
import { usePlayerStore, type Song } from '../store/usePlayerStore';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

interface LyricLine {
  time: number;
  text: string;
}

interface SyncedLyricsProps {
  song: Song;
  isCurrentSong: boolean;
}

export const SyncedLyrics: React.FC<SyncedLyricsProps> = ({ song, isCurrentSong }) => {
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [plainLyrics, setPlainLyrics] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { currentTime } = usePlayerStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    console.log("Lyrics component mounted");
    console.log("song:", song);
    
    const cleanTitle = (title: string, artist: string) => {
      let cleaned = title
        .replace(/\s*\(official.*?\)\s*/i, ' ')
        .replace(/\s*\[official.*?\]\s*/i, ' ')
        .replace(/\s*\([^)]*lyric[^)]*\)\s*/i, ' ')
        .replace(/\s*\[[^\]]*lyric[^\]]*\]\s*/i, ' ')
        .replace(/\s*\|.*/, '')
        .trim();

      if (artist && cleaned.toLowerCase().includes(artist.toLowerCase())) {
        cleaned = cleaned.replace(new RegExp(artist, 'ig'), '').trim();
      }

      cleaned = cleaned.replace(/^[-–—\s]+|[-–—\s]+$/g, '').trim();
      return cleaned || title;
    };

    const fetchLyrics = async () => {
      setLoading(true);
      setError('');
      try {
        const cTitle = cleanTitle(song.title, song.artist);
        const cArtist = song.artist;
        
        console.log(`Original title: ${song.title}`);
        console.log(`Cleaned title: ${cTitle}`);
        console.log(`Artist: ${cArtist}`);

        // 1. Exact match
        let queryUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(cTitle)}&artist_name=${encodeURIComponent(cArtist)}`;
        console.log(`LRCLIB query (Exact): ${queryUrl}`);
        let res = await fetch(queryUrl);
        let data = null;

        if (res.ok) {
          data = await res.json();
          console.log(`Match result: Exact match found`);
        } else {
          // 2. Search by title + artist
          queryUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(cTitle + ' ' + cArtist)}`;
          console.log(`LRCLIB query (Title+Artist): ${queryUrl}`);
          res = await fetch(queryUrl);
          if (res.ok) {
            const searchResults = await res.json();
            if (searchResults && searchResults.length > 0) {
              data = searchResults.find((t: any) => t.syncedLyrics) || searchResults[0];
              console.log(`Match result: Title+Artist search found match`);
            }
          }

          if (!data) {
            // 3. Search by title only
            queryUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(cTitle)}`;
            console.log(`LRCLIB query (Title only): ${queryUrl}`);
            res = await fetch(queryUrl);
            if (res.ok) {
              const searchResults = await res.json();
              if (searchResults && searchResults.length > 0) {
                // Try fuzzy match or just pick first with synced lyrics
                data = searchResults.find((t: any) => t.syncedLyrics) || searchResults[0];
                console.log(`Match result: Title only search found match`);
              }
            }
          }
        }
        
        if (!data) {
          console.log("LRCLIB API response: No matches found");
          throw new Error('Looks like we don\'t have lyrics for this song.');
        }
        
        console.log("LRCLIB API response received: true");
        if (!isMounted) return;

        if (data.syncedLyrics) {
          const parsed = parseLrc(data.syncedLyrics);
          console.log(`Parsed lyric lines count: ${parsed.length}`);
          setLyrics(parsed);
          setPlainLyrics('');
        } else if (data.plainLyrics) {
          console.log(`Parsed plain lyric lines length: ${data.plainLyrics.length}`);
          setPlainLyrics(data.plainLyrics);
          setLyrics([]);
        } else {
          console.log("No lyrics found in response.");
          throw new Error('Looks like we don\'t have lyrics for this song.');
        }
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || 'Error loading lyrics.');
        setLyrics([]);
        setPlainLyrics('');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLyrics();
    
    return () => {
      isMounted = false;
    };
  }, [song.title, song.artist]);

  // Find active line
  let activeIndex = -1;
  if (isCurrentSong && lyrics.length > 0) {
    for (let i = lyrics.length - 1; i >= 0; i--) {
      // 0.3s lookahead for smoother visual transition before audio catches up
      if (currentTime >= lyrics[i].time - 0.3) { 
        activeIndex = i;
        break;
      }
    }
  }

  // Auto-scroll
  useEffect(() => {
    if (activeLineRef.current && isCurrentSong) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex, isCurrentSong]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-text-secondary gap-3 bg-surface/30 rounded-3xl mt-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-lg font-medium">Loading lyrics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-text-secondary gap-3 bg-surface/30 rounded-3xl mt-8">
        <span className="text-lg font-medium text-text-secondary">{error}</span>
      </div>
    );
  }

  if (plainLyrics) {
    return (
      <div className="bg-surface/30 p-8 rounded-3xl max-w-3xl mt-8">
        <h2 className="text-2xl font-bold text-white mb-6">Lyrics</h2>
        <div className="whitespace-pre-wrap text-text-secondary text-lg leading-loose font-medium">
          {plainLyrics}
        </div>
      </div>
    );
  }

  if (lyrics.length === 0) {
    return null;
  }

  return (
    <div className="bg-surface/30 p-8 rounded-3xl max-w-3xl w-full mt-8">
      <h2 className="text-2xl font-bold text-white mb-6">Lyrics</h2>
      <div 
        ref={containerRef}
        className="h-[450px] overflow-y-auto space-y-6 px-4 py-8"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
        <div className="scrollbar-hide">
          {lyrics.map((line, index) => {
            const isActive = index === activeIndex;
            const isPassed = index < activeIndex;
            
            return (
              <div
                key={index}
                ref={isActive ? activeLineRef : null}
                className={cn(
                  "text-2xl md:text-3xl font-bold transition-all duration-300 py-1",
                  isActive ? "text-white scale-105 origin-left" : 
                  isPassed ? "text-text-secondary/60" : "text-text-secondary"
                )}
              >
                {line.text || " "} {/* Render space for instrumental breaks */}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function parseLrc(lrc: string): LyricLine[] {
  const lines = lrc.split('\n');
  const result: LyricLine[] = [];
  const timeRegex = /\[(\d{2}):(\d{2}(?:\.\d{2,3})?)\]/;
  
  for (const line of lines) {
    const match = timeRegex.exec(line);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseFloat(match[2]);
      const time = minutes * 60 + seconds;
      const text = line.replace(timeRegex, '').replace(/\[.*?\]/g, '').trim();
      result.push({ time, text });
    }
  }
  return result;
}
