"use client";
import React from "react";

type FreeModalProps = { className?: string };

export default function FreeModal({ className = "" }: FreeModalProps) {
  return (
    <div
      className={`fixed bottom-10 right-15 z-50 flex flex-col items-end ${className}`}
    >
      {/* Toggle button */}
      <div className="mb-2">
        {/* offset wrapper shifts the sticker half off-screen */}
        <div className="sticker-offset">
          <div className="freestyle-wrap" role="img" aria-label="ส่งฟรี">
            <div className="freestyle-ring" />
            <div className="freestyle-core">
              <svg
                className="freestyle-truck"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path
                  d="M3 7h11v7h-1l-1 2H8l-1-2H3V7z"
                  stroke="white"
                  strokeWidth="0.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 10h3l2 3v2"
                  stroke="white"
                  strokeWidth="0.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="7.5" cy="17.5" r="1.4" fill="white" />
                <circle cx="18.5" cy="17.5" r="1.4" fill="white" />
              </svg>
              <div className="freestyle-label">ส่งฟรี</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: ttiki-fade 160ms ease-out;
        }
        .sticker-pulse {
          animation: none;
        }
        .freestyle-wrap { position: relative; width: 5.25rem; height: 5.25rem; }
        .freestyle-ring {
          position: absolute; inset: 0; border-radius: 9999px;
          background: conic-gradient(from 200deg at 50% 50%, #ff7b79, #ff3b30, #ff6a4d, #ff7b79);
          box-shadow: 0 12px 30px rgba(255,80,80,0.28), 0 0 0 6px rgba(255,120,120,0.06) inset;
          transform-origin: center center;
          animation: ttiki-pulse 2000ms ease-in-out infinite;
        }
        .freestyle-core {
          position: absolute; inset: 8px; border-radius: 9999px;
          background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0.06));
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          box-shadow: 0 6px 18px rgba(0,0,0,0.22);
        }
        .freestyle-truck { width: 40%; height: auto; opacity: 0.95; margin-bottom: 4px }
        .freestyle-label {
          color: white; font-weight: 900; font-size: 1.05rem; letter-spacing: -0.6px;
          transform:  text-shadow: 0 2px 6px rgba(0,0,0,0.45);
        }
        .sticker-offset {
          transform: translate(50%, 50%);
          overflow: visible;
        }
        @keyframes ttiki-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.06); }
          100% { transform: scale(1); }
        }
        @keyframes ttiki-fade {
          from {
            transform: translateY(6px) scale(0.99);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
