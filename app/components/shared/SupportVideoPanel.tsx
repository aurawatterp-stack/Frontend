"use client";

import { useEffect, useState } from "react";

import { getSupportVideos, type SupportVideoLanguage, type SupportVideoMap } from "../../lib/supportVideosApi";

const TABS: Array<{ id: SupportVideoLanguage; label: string; caption: string }> = [
  { id: "hindi", label: "हिंदी", caption: "शिकायत दर्ज करने का पूरा तरीका देखें" },
  { id: "english", label: "English", caption: "Watch how to register your complaint" },
];

export default function SupportVideoPanel() {
  const [videos, setVideos] = useState<SupportVideoMap | null>(null);
  const [active, setActive] = useState<SupportVideoLanguage>("hindi");

  useEffect(() => {
    let cancelled = false;
    getSupportVideos()
      .then((data) => {
        if (cancelled) return;
        setVideos(data);
        // Fall back to whichever language is actually uploaded.
        if (!data.hindi && data.english) setActive("english");
      })
      .catch(() => {
        if (!cancelled) setVideos(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const availableTabs = TABS.filter((tab) => videos?.[tab.id]);
  if (availableTabs.length === 0) return null;

  const activeTab = availableTabs.find((tab) => tab.id === active) ?? availableTabs[0];
  const activeVideo = videos?.[activeTab.id];

  return (
    <div className="mt-8 max-w-xl rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-bold text-white/90">How to raise a complaint</div>
          <div className="mt-0.5 text-xs text-white/55">{activeTab.caption}</div>
        </div>
        {availableTabs.length > 1 && (
          <div className="inline-flex rounded-full border border-white/15 bg-white/5 p-1">
            {availableTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActive(tab.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                  activeTab.id === tab.id ? "bg-amber-300 text-[#101828]" : "text-white/70 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {activeVideo && (
        <video
          key={activeVideo.url}
          src={activeVideo.url}
          controls
          playsInline
          preload="metadata"
          className="mt-3 w-full rounded-xl border border-white/10 bg-black"
        />
      )}
    </div>
  );
}
