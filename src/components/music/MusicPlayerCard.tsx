"use client";

import { useEffect, useState } from "react";
import { Music, Play, Pause, Search, HelpCircle, Check, Sparkles, ChevronDown, ChevronUp, Link as LinkIcon } from "lucide-react";
import { DayPlan, Goal } from "@/types";
import { getRecommendedPlaylist, CuratedPlaylist } from "@/data/playlists";

interface MusicPlayerCardProps {
  dayPlan: DayPlan;
  goal: Goal;
}

export default function MusicPlayerCard({ dayPlan, goal }: MusicPlayerCardProps) {
  const [playlist, setPlaylist] = useState<CuratedPlaylist | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [loadedId, setLoadedId] = useState<string>("");
  const [isPlaylistType, setIsPlaylistType] = useState(true);

  // Recommendations mapping
  useEffect(() => {
    const rec = getRecommendedPlaylist(dayPlan, goal);
    setPlaylist(rec);

    // Initial load check from storage
    if (typeof window !== "undefined") {
      const savedLink = localStorage.getItem("gym-planner:music:custom-link");
      if (savedLink) {
        setCustomUrl(savedLink);
        parseAndLoadUrl(savedLink);
      } else {
        setLoadedId(rec.youtubePlaylistId);
        setIsPlaylistType(true);
      }
    }
  }, [dayPlan, goal]);

  const parseAndLoadUrl = (url: string) => {
    if (!url.trim()) return;

    // Check for Playlist ID
    let playlistMatch = url.match(/[?&]list=([^#\&\?]+)/);
    if (playlistMatch) {
      setLoadedId(playlistMatch[1]);
      setIsPlaylistType(true);
      setIsPlaying(true);
      return;
    }

    // Check for standard video link or short link
    let videoMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (videoMatch) {
      setLoadedId(videoMatch[1]);
      setIsPlaylistType(false);
      setIsPlaying(true);
      return;
    }

    // Fallback: assume clean input is playlist ID or video ID
    if (url.length > 15) {
      setLoadedId(url);
      setIsPlaylistType(true);
    } else {
      setLoadedId(url);
      setIsPlaylistType(false);
    }
    setIsPlaying(true);
  };

  const handleSaveCustom = () => {
    parseAndLoadUrl(customUrl);
    if (typeof window !== "undefined") {
      localStorage.setItem("gym-planner:music:custom-link", customUrl);
    }
  };

  const handleResetToCurated = () => {
    if (playlist) {
      setLoadedId(playlist.youtubePlaylistId);
      setIsPlaylistType(true);
      setCustomUrl("");
      if (typeof window !== "undefined") {
        localStorage.removeItem("gym-planner:music:custom-link");
      }
    }
  };

  if (!playlist) return null;

  const embedUrl = isPlaylistType
    ? `https://www.youtube.com/embed/videoseries?list=${loadedId}&playsinline=1`
    : `https://www.youtube.com/embed/${loadedId}?playsinline=1`;

  return (
    <div className="glass-card p-5 mb-5 animate-stagger-in stagger-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-lime/10 border border-lime/20 flex items-center justify-center text-lime">
            <Music size={16} className={isPlaying ? "animate-pulse" : ""} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-lime flex items-center gap-1">
              <Sparkles size={10} /> Musik Pendukung Latihan
            </p>
            <h3 className="text-xs font-bold text-white/95 uppercase truncate max-w-[200px]">
              {customUrl ? "Custom Playback" : playlist.title}
            </h3>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-7 w-7 rounded-lg bg-white/5 border border-white/10 hover:border-lime/20 flex items-center justify-center text-white/60 hover:text-lime transition-all"
        >
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {!isExpanded ? (
        <div className="mt-3 flex items-center justify-between bg-white/2 border border-white/5 rounded-xl p-2.5">
          <p className="text-[10px] text-white/45 truncate max-w-[240px]">
            {customUrl ? "Memutar link kustom Anda" : playlist.description}
          </p>
          <button
            onClick={() => {
              setIsExpanded(true);
              setIsPlaying(true);
            }}
            className="flex items-center gap-1 bg-lime text-black font-extrabold text-[10px] py-1 px-2.5 rounded-lg active:scale-95 transition-transform"
          >
            <Play size={10} fill="black" /> PLAY
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-3 animate-fade-in">
          {/* Audio Disclaimer */}
          <div className="text-[9px] text-white/35 leading-tight bg-white/3 border border-white/5 rounded-lg p-2 flex items-start gap-1.5">
            <HelpCircle size={12} className="shrink-0 text-lime/50" />
            <span>
              <strong>Platform Note:</strong> Dikarenakan kebijakan browser seluler, silakan klik tombol play di dalam layar YouTube di bawah untuk memulai audio. Tetap buka aplikasi agar lagu berjalan tanpa jeda.
            </span>
          </div>

          {/* YouTube Embed Player Container */}
          {isPlaying && loadedId ? (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-base-border bg-black/60">
              <iframe
                src={embedUrl}
                title="YouTube Workout Music Player"
                className="absolute inset-0 w-full h-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <button
              onClick={() => setIsPlaying(true)}
              className="w-full aspect-video flex flex-col items-center justify-center gap-2 border border-dashed border-white/10 hover:border-lime/20 bg-white/2 rounded-xl transition-all group"
            >
              <div className="h-12 w-12 rounded-full bg-lime/10 border border-lime/20 flex items-center justify-center text-lime group-hover:scale-105 transition-transform">
                <Play size={20} fill="currentColor" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">Mulai Putar Musik</p>
            </button>
          )}

          {/* Custom Link Form */}
          <div className="space-y-1.5 pt-2 border-t border-white/5">
            <p className="text-[10px] font-bold text-white/35 uppercase tracking-wider flex items-center gap-1">
              <LinkIcon size={10} /> Putar URL YouTube Kustom
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste link video/playlist YouTube"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="flex-1 bg-black/40 border border-base-border rounded-lg py-1.5 px-3 text-[11px] text-white focus:outline-none focus:border-lime/45"
              />
              <button
                onClick={handleSaveCustom}
                className="bg-lime text-black font-extrabold text-[10px] px-3 rounded-lg hover:scale-98 active:scale-95 transition-transform shrink-0"
              >
                Muat
              </button>
            </div>
            {customUrl && (
              <button
                onClick={handleResetToCurated}
                className="text-[9px] text-white/40 hover:text-lime underline"
              >
                Kembalikan ke playlist bawaan hari ini
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
