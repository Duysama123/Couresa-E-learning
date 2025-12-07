import React from 'react';

/**
 * YouTube Player Component
 * 
 * Converts YouTube URLs to embeddable format and displays them in an iframe
 * 
 * Supported URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 */
const YouTubePlayer = ({ url, title = "YouTube video player" }) => {
    // Extract video ID from various YouTube URL formats
    const getYouTubeVideoId = (url) => {
        if (!url) return null;

        // Already an embed URL
        if (url.includes('/embed/')) {
            return url.split('/embed/')[1].split('?')[0];
        }

        // Standard watch URL: https://www.youtube.com/watch?v=VIDEO_ID
        if (url.includes('watch?v=')) {
            return url.split('watch?v=')[1].split('&')[0];
        }

        // Short URL: https://youtu.be/VIDEO_ID
        if (url.includes('youtu.be/')) {
            return url.split('youtu.be/')[1].split('?')[0];
        }

        return null;
    };

    const videoId = getYouTubeVideoId(url);

    if (!videoId) {
        return (
            <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                <p className="text-white">Invalid YouTube URL</p>
            </div>
        );
    }

    const embedUrl = `https://www.youtube.com/embed/${videoId}`;

    return (
        <div className="w-full aspect-video rounded-lg overflow-hidden shadow-lg">
            <iframe
                width="100%"
                height="100%"
                src={embedUrl}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
            />
        </div>
    );
};

export default YouTubePlayer;
