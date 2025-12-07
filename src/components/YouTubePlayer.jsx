import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, SkipBack, SkipForward } from 'lucide-react';

/**
 * Custom YouTube Player with Coursera-style Interface
 * 
 * Uses YouTube IFrame API for video playback with custom controls
 * Branded with Coursera colors and design language
 */
const YouTubePlayer = ({ url, title = "Course video" }) => {
    const playerRef = useRef(null);
    const containerRef = useRef(null);
    const [player, setPlayer] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(100);
    const [showControls, setShowControls] = useState(true);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showSettings, setShowSettings] = useState(false);

    // Extract video ID from various YouTube URL formats
    const getYouTubeVideoId = (url) => {
        if (!url) return null;

        if (url.includes('/embed/')) {
            return url.split('/embed/')[1].split('?')[0];
        }

        if (url.includes('watch?v=')) {
            return url.split('watch?v=')[1].split('&')[0];
        }

        if (url.includes('youtu.be/')) {
            return url.split('youtu.be/')[1].split('?')[0];
        }

        return null;
    };

    const videoId = getYouTubeVideoId(url);

    // Load YouTube IFrame API
    useEffect(() => {
        if (!videoId) return;

        // Load YouTube IFrame API script
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        // Initialize player when API is ready
        window.onYouTubeIframeAPIReady = () => {
            initializePlayer();
        };

        if (window.YT && window.YT.Player) {
            initializePlayer();
        }

        return () => {
            if (player) {
                player.destroy();
            }
        };
    }, [videoId]);

    const initializePlayer = () => {
        const newPlayer = new window.YT.Player(playerRef.current, {
            videoId: videoId,
            playerVars: {
                autoplay: 0,
                controls: 0, // Hide default YouTube controls
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
                fs: 1,
                playsinline: 1
            },
            events: {
                onReady: onPlayerReady,
                onStateChange: onPlayerStateChange
            }
        });
        setPlayer(newPlayer);
    };

    const onPlayerReady = (event) => {
        setDuration(event.target.getDuration());
        setVolume(event.target.getVolume());
    };

    const onPlayerStateChange = (event) => {
        if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            startTimeUpdate();
        } else if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
        } else if (event.data === window.YT.PlayerState.ENDED) {
            setIsPlaying(false);
        }
    };

    const startTimeUpdate = () => {
        const interval = setInterval(() => {
            if (player && player.getCurrentTime) {
                setCurrentTime(player.getCurrentTime());
            }
        }, 100);

        return () => clearInterval(interval);
    };

    useEffect(() => {
        if (isPlaying) {
            const cleanup = startTimeUpdate();
            return cleanup;
        }
    }, [isPlaying, player]);

    // Control functions
    const togglePlay = () => {
        if (!player) return;
        if (isPlaying) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    };

    const toggleMute = () => {
        if (!player) return;
        if (isMuted) {
            player.unMute();
            setIsMuted(false);
        } else {
            player.mute();
            setIsMuted(true);
        }
    };

    const handleVolumeChange = (e) => {
        if (!player) return;
        const newVolume = parseInt(e.target.value);
        player.setVolume(newVolume);
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    const handleProgressClick = (e) => {
        if (!player) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const newTime = pos * duration;
        player.seekTo(newTime);
        setCurrentTime(newTime);
    };

    const handlePlaybackRateChange = (rate) => {
        if (!player) return;
        player.setPlaybackRate(rate);
        setPlaybackRate(rate);
        setShowSettings(false);
    };

    const skip = (seconds) => {
        if (!player) return;
        const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
        player.seekTo(newTime);
        setCurrentTime(newTime);
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!videoId) {
        return (
            <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                <p className="text-white">Invalid YouTube URL</p>
            </div>
        );
    }

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl group"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(true)} // Always show for better UX
        >
            {/* YouTube Player (Hidden Controls) */}
            <div ref={playerRef} className="w-full h-full" />

            {/* Custom Coursera-style Overlay */}
            <div
                className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
                style={{ pointerEvents: showControls ? 'auto' : 'none' }}
            >
                {/* Top Bar - Title */}
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
                    <h3 className="text-white font-semibold text-lg drop-shadow-lg">{title}</h3>
                </div>

                {/* Center Play Button (when paused) */}
                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <button
                            onClick={togglePlay}
                            className="w-20 h-20 bg-[#0056d2] hover:bg-[#0066ff] rounded-full flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-200"
                        >
                            <Play size={36} className="text-white ml-1" fill="white" />
                        </button>
                    </div>
                )}

                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                    {/* Progress Bar */}
                    <div
                        className="w-full h-1.5 bg-white/30 rounded-full cursor-pointer group/progress hover:h-2 transition-all"
                        onClick={handleProgressClick}
                    >
                        <div
                            className="h-full bg-[#0056d2] rounded-full relative transition-all"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-lg" />
                        </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* Play/Pause */}
                            <button
                                onClick={togglePlay}
                                className="text-white hover:text-[#0056d2] transition-colors p-1"
                            >
                                {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
                            </button>

                            {/* Skip Backward */}
                            <button
                                onClick={() => skip(-10)}
                                className="text-white hover:text-[#0056d2] transition-colors p-1"
                                title="Rewind 10s"
                            >
                                <SkipBack size={20} />
                            </button>

                            {/* Skip Forward */}
                            <button
                                onClick={() => skip(10)}
                                className="text-white hover:text-[#0056d2] transition-colors p-1"
                                title="Forward 10s"
                            >
                                <SkipForward size={20} />
                            </button>

                            {/* Volume */}
                            <div className="flex items-center gap-2 group/volume">
                                <button
                                    onClick={toggleMute}
                                    className="text-white hover:text-[#0056d2] transition-colors p-1"
                                >
                                    {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="w-0 group-hover/volume:w-20 transition-all duration-200 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                                />
                            </div>

                            {/* Time */}
                            <span className="text-white text-sm font-medium">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Playback Speed */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowSettings(!showSettings)}
                                    className="text-white hover:text-[#0056d2] transition-colors p-1 flex items-center gap-1"
                                >
                                    <Settings size={20} />
                                    <span className="text-sm font-medium">{playbackRate}x</span>
                                </button>

                                {showSettings && (
                                    <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl py-2 min-w-[120px]">
                                        <div className="px-3 py-1 text-xs font-bold text-gray-500 uppercase">Speed</div>
                                        {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                                            <button
                                                key={rate}
                                                onClick={() => handlePlaybackRateChange(rate)}
                                                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${playbackRate === rate ? 'bg-blue-50 text-[#0056d2] font-semibold' : 'text-gray-700'}`}
                                            >
                                                {rate === 1 ? 'Normal' : `${rate}x`}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Fullscreen */}
                            <button
                                onClick={toggleFullscreen}
                                className="text-white hover:text-[#0056d2] transition-colors p-1"
                            >
                                <Maximize size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Coursera Branding Badge */}
            <div className="absolute top-4 right-4 bg-[#0056d2] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                Coursera
            </div>
        </div>
    );
};

export default YouTubePlayer;
