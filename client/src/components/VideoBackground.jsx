/**
 * VideoBackground - Reusable full-screen video background for pages
 */
import React from 'react';
 
export default function VideoBackground({ videoUrl, overlayOpacity = 'bg-black/60' }) {
  return (
    <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover"
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className={`absolute inset-0 ${overlayOpacity}`} />
    </div>
  );
}
 