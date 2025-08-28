"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/utils/translation";
import Freemodal from "@/component/Freemodal";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Star,
  Shield,
  Award,
  Zap,
  Truck,
  Wrench,
} from "lucide-react";

export default function Home() {
  const { language } = useLanguage();
  const t = translations[language];

  // Video controls state
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [sectionsVisible, setSectionsVisible] = useState<
    Record<string, boolean>
  >({});
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.target === sectionRef.current) {
          setIsVisible(entry.isIntersecting);
        } else {
          setSectionsVisible((prev) => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting,
          }));
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    // Observe other sections
    const sections = [
      "become-section",
      "company-info",
      "features-section",
      "cta-section",
    ];
    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-white via-red-50 to-red-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-hidden">
      {/* Animated Startup Background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-red-200 via-white to-red-400 dark:from-gray-800 dark:via-gray-900 dark:to-red-900 opacity-30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-gradient-to-br from-red-100 via-white to-red-300 dark:from-gray-900 dark:via-gray-800 dark:to-red-900 opacity-20 rounded-full blur-2xl animate-pulse" />
      </div>

      {/* Modern Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Subtle truck image background */}
        <div
          className="absolute inset-0 w-full h-full z-0"
          style={{
            backgroundImage: "url(/hino3.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            opacity: 0.1,
          }}
        />
        <div className="absolute inset-0 w-full h-full z-10 bg-gradient-to-b from-white/90 to-red-100/60 dark:from-gray-900/90 dark:to-red-900/60" />
        <div className="relative z-20 flex flex-col items-center text-center px-4">
          <Image
            src="/Logo.png"
            alt="TT (I.K.I) Autoparts Logo"
            width={160}
            height={90}
            className="mx-auto mb-4 drop-shadow-xl rounded-lg animate-hero-fade-in"
            priority
          />
          <span className="text-base md:text-lg font-semibold text-red-500 dark:text-red-300 mb-2 animate-hero-fade-in delay-200 tracking-wide uppercase">
            {t.home.heroSlogan}
          </span>
          <h1 className="text-6xl md:text-8xl font-extrabold text-red-700 dark:text-red-400 drop-shadow-lg mb-4 animate-hero-fade-in delay-200">
            {t.home.heroTitle}
          </h1>
          <p className="mt-2 text-xl md:text-2xl text-gray-700 dark:text-gray-200 max-w-2xl animate-hero-fade-in delay-400">
            {t.home.heroDesc}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="px-12 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xl transition-all duration-300 animate-fade-in-up flex items-center justify-center gap-2 text-lg dark:bg-red-700 dark:hover:bg-red-800 cursor-pointer"
              aria-label="Shop Now"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12h18m-6-6l6 6-6 6"
                />
              </svg>
              {t.home.shopNow}
            </Link>
            <Link
              href="/contact"
              className="block px-12 py-4 bg-white border-2 border-red-600 text-red-700 font-bold rounded-xl shadow-xl hover:bg-red-50 transition-all duration-300 animate-fade-in-up delay-200 text-lg dark:bg-gray-900 dark:text-red-300 dark:border-red-400 dark:hover:bg-gray-800 cursor-pointer"
            >
              {t.home.contactUs}
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Become to TT Section */}
      <section
        id="become-section"
        className="w-full py-24 bg-gradient-to-br from-white via-red-25 to-pink-50 dark:from-gray-900 dark:via-gray-850 dark:to-red-950/30 border-t border-red-100 dark:border-red-900 relative overflow-hidden"
      >
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-red-200/20 to-pink-200/20 dark:from-red-800/10 dark:to-pink-800/10 rounded-full blur-2xl" />
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-tr from-orange-200/30 to-red-200/20 dark:from-orange-800/15 dark:to-red-800/10 rounded-full blur-xl" />
        </div>

        <div
          className={`max-w-6xl mx-auto px-6 relative z-10 transform transition-all duration-1000 ${
            sectionsVisible["become-section"]
              ? "translate-y-0 opacity-100"
              : "translate-y-12 opacity-0"
          }`}
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-400/30 via-pink-400/30 to-orange-400/30 rounded-3xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity duration-700" />
            <div className="relative bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-red-100/50 dark:border-red-900/50 p-12 md:p-16 flex flex-col items-center overflow-hidden">
              {/* Decorative corner elements */}
              <div className="absolute top-8 left-8 w-12 h-12 border-l-3 border-t-3 border-red-300/40 dark:border-red-700/40 rounded-tl-2xl" />
              <div className="absolute bottom-8 right-8 w-12 h-12 border-r-3 border-b-3 border-red-300/40 dark:border-red-700/40 rounded-br-2xl" />

              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/40 dark:to-pink-900/40 rounded-full mb-8">
                <span className="text-sm font-medium text-red-700 dark:text-red-300">
                  Company History
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-red-700 via-red-600 to-pink-600 dark:from-red-300 dark:via-red-200 dark:to-pink-200 bg-clip-text text-transparent mb-10 pb-2 tracking-tight text-center">
                {(t.home as any).becomeToTTIKI.title}
              </h2>

              <div className="space-y-6 text-gray-700 dark:text-gray-200 text-lg md:text-xl text-center leading-relaxed max-w-3xl">
                <p className="relative">
                  <span className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-red-400 to-pink-400 rounded-full opacity-30" />
                  {(t.home as any).becomeToTTIKI.desc1}
                </p>
                <p className="relative">
                  <span className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-pink-400 to-orange-400 rounded-full opacity-30" />
                  {(t.home as any).becomeToTTIKI.desc2}
                </p>
                <div className="relative mt-10 p-6 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/50 dark:to-pink-950/50 rounded-2xl border border-red-200/50 dark:border-red-800/50">
                  <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-700 to-pink-700 dark:from-red-200 dark:to-pink-200 bg-clip-text text-transparent">
                    {(t.home as any).becomeToTTIKI.concept}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Presentation Video Section - Modern Design */}
      <section
        ref={sectionRef}
        className="relative w-full py-24 bg-gradient-to-br from-slate-50 via-white to-rose-50 dark:from-gray-900 dark:via-gray-950 dark:to-red-950/20 overflow-hidden"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-red-200/30 to-pink-300/20 dark:from-red-800/20 dark:to-pink-800/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-orange-200/40 to-red-300/30 dark:from-orange-800/20 dark:to-red-800/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

          {/* Floating geometric shapes */}
          <div className="absolute top-20 left-1/4 w-4 h-4 bg-red-400/30 dark:bg-red-500/40 rounded-full animate-bounce delay-300"></div>
          <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-pink-400/40 dark:bg-pink-500/40 rounded-full animate-bounce delay-700"></div>
          <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-orange-400/50 dark:bg-orange-500/40 rounded-full animate-bounce delay-1000"></div>
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div
            className={`text-center mb-16 transform transition-all duration-1000 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-red-800 to-pink-800 dark:from-white dark:via-red-200 dark:to-pink-200 bg-clip-text text-transparent mb-4">
              Experience Our Vision
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Discover the story behind our innovation through this immersive
              journey
            </p>
          </div>

          {/* Video Container */}
          <div
            className={`relative group transform transition-all duration-1000 delay-300 ${
              isVisible
                ? "translate-y-0 opacity-100 scale-100"
                : "translate-y-12 opacity-0 scale-95"
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Glowing border effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-red-400 via-pink-400 to-orange-400 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity duration-700 animate-pulse"></div>

            {/* Video wrapper with glassmorphism effect */}
            <div className="relative bg-white/10 dark:bg-black/20 backdrop-blur-xl rounded-2xl p-1 border border-white/20 dark:border-white/10 shadow-2xl">
              <div className="relative overflow-hidden rounded-xl bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster="/Logo.png"
                  className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                >
                  <source src="/ttiki_video_h264.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Video Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>

                {/* Custom Video Controls */}
                <div
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                    isHovered
                      ? "bg-black/20 backdrop-blur-sm"
                      : "bg-transparent"
                  }`}
                >
                  <div
                    className={`flex items-center space-x-4 transition-all duration-500 transform ${
                      isHovered
                        ? "translate-y-0 opacity-100 scale-100"
                        : "translate-y-4 opacity-0 scale-90"
                    }`}
                  >
                    <button
                      onClick={togglePlay}
                      className="group/btn relative flex items-center justify-center w-16 h-16 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-pink-400/20 rounded-full blur group-hover/btn:blur-md transition-all duration-300"></div>
                      {isPlaying ? (
                        <Pause className="w-6 h-6 text-white relative z-10" />
                      ) : (
                        <Play className="w-6 h-6 text-white ml-1 relative z-10" />
                      )}
                    </button>

                    <button
                      onClick={toggleMute}
                      className="group/btn relative flex items-center justify-center w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5 text-white" />
                      ) : (
                        <Volume2 className="w-5 h-5 text-white" />
                      )}
                    </button>

                    <button
                      onClick={() => {
                        if (
                          videoRef.current &&
                          videoRef.current.requestFullscreen
                        ) {
                          videoRef.current.requestFullscreen();
                        }
                      }}
                      className="group/btn relative flex items-center justify-center w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
                    >
                      <Maximize className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Corner Decorations */}
                <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-white/30 rounded-tl-lg"></div>
                <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-white/30 rounded-tr-lg"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-white/30 rounded-bl-lg"></div>
                <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-white/30 rounded-br-lg"></div>
              </div>
            </div>

            {/* Floating Action Indicators */}
            <div className="absolute -top-2 -right-2 flex space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse delay-300 shadow-lg shadow-red-400/50"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Info Section */}
      <section
        id="company-info"
        className={`w-full py-20 bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 border-t border-red-100 dark:border-red-900 relative overflow-hidden`}
      >
        {/* Parallax Truck Image BG */}
        <div
          className="absolute inset-0 w-full h-full z-0 pointer-events-none select-none hidden md:block"
          style={{
            backgroundImage: "url(/hino3.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            opacity: 0.1,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-transparent to-red-100/60 dark:from-gray-950/90 dark:to-gray-950/60 z-0" />
        <div
          className={`max-w-7xl mx-auto px-6 relative z-10 transform transition-all duration-1000 ${
            sectionsVisible["company-info"]
              ? "translate-y-0 opacity-100"
              : "translate-y-12 opacity-0"
          }`}
        >
          <div className="bg-white/90 dark:bg-gray-900/80 rounded-3xl shadow-2xl border border-red-100 dark:border-red-900 p-10 md:p-14 flex flex-col items-center relative overflow-hidden">
            <div className="absolute -top-10 right-10 opacity-10 text-red-200 dark:text-red-900 text-[8rem] pointer-events-none select-none hidden md:block">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 64 64"
                className="w-32 h-32"
              >
                <rect width="64" height="64" rx="16" fill="currentColor" />
                <path
                  d="M16 32h32M32 16v32"
                  stroke="#fff"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-6 mb-4">
              <Image
                src="/Logo.png"
                alt="Company Logo"
                width={90}
                height={90}
                className="rounded-xl shadow-lg dark:border-red-900 bg-white dark:bg-gray-900"
              />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-red-700 dark:text-red-300 mb-4 tracking-tight drop-shadow-sm">
              {t.home.companyInfo.title}
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-200 text-base md:text-lg text-center leading-relaxed">
              <p className="text-lg md:text-xl font-medium text-red-700 dark:text-red-200 mb-2">
                {t.home.companyInfo.desc1}
              </p>
              <p>{t.home.companyInfo.desc2}</p>
              <p>{t.home.companyInfo.desc3}</p>
              <p>{t.home.companyInfo.desc4}</p>
              <p>{t.home.companyInfo.desc5}</p>
              <p className="font-semibold text-red-700 dark:text-red-200">
                {t.home.companyInfo.desc6}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Modern Cards with Animation */}
      <section
        id="features-section"
        className="w-full py-24 bg-white dark:bg-gray-900 relative z-10"
      >
        <div
          className={`max-w-7xl mx-auto px-4 relative z-10 transform transition-all duration-1000 ${
            sectionsVisible["features-section"]
              ? "translate-y-0 opacity-100"
              : "translate-y-12 opacity-0"
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center text-red-700 dark:text-red-400 mb-16 animate-section-fade-in">
            {t.home.whyChoose}
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 shadow-xl flex flex-col items-center animate-section-fade-in border border-red-100 dark:border-red-900 hover:scale-105 transition-transform duration-300">
              <Image
                src="/Logo.png"
                alt="TTIKI Logo"
                width={72}
                height={72}
                className="rounded-full object-cover mb-4 animate-section-fade-in"
              />
              <h3 className="text-2xl font-semibold text-red-700 dark:text-red-400 mb-2 animate-section-fade-in delay-200">
                {t.home.trustedBrand}
              </h3>
              <p className="text-red-900 dark:text-red-200 text-center animate-section-fade-in delay-400">
                {t.home.trustedBrandDesc}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 shadow-xl flex flex-col items-center animate-section-fade-in delay-200 border border-red-100 dark:border-red-900 hover:scale-105 transition-transform duration-300">
              <Image
                src="/hino3.png"
                alt="Truck Front"
                width={72}
                height={72}
                className="rounded-full object-cover mb-4 animate-section-fade-in"
              />
              <h3 className="text-2xl font-semibold text-red-700 dark:text-red-400 mb-2 animate-section-fade-in delay-200">
                {t.home.truckParts}
              </h3>
              <p className="text-red-900 dark:text-red-200 text-center animate-section-fade-in delay-400">
                {t.home.truckPartsDesc}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 shadow-xl flex flex-col items-center animate-section-fade-in delay-400 border border-red-100 dark:border-red-900 hover:scale-105 transition-transform duration-300">
              <Image
                src="/HI0390.png"
                alt="Truck Box"
                width={72}
                height={72}
                className="rounded-full object-cover mb-4 animate-section-fade-in"
              />
              <h3 className="text-2xl font-semibold text-red-700 dark:text-red-400 mb-2 animate-section-fade-in delay-200">
                {t.home.boxTruck}
              </h3>
              <p className="text-red-900 dark:text-red-200 text-center animate-section-fade-in delay-400">
                {t.home.boxTruckDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Parallax CTA Section with Animation */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full z-0"
          style={{
            backgroundImage: "url(/HI0390.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            opacity: 0.12,
            filter: "brightness(0.7)",
          }}
        />
        <div className="relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-red-700 dark:text-red-400 animate-section-fade-in mb-10">
            {t.home.ctaTitle}
          </h2>
          <div className=" flex flex-row items-center justify-center gap-4 ">
            <Link
              href="/shop"
              className="px-12 py-5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xl transition-all duration-300 animate-section-fade-in delay-200 dark:bg-red-700 dark:hover:bg-red-800 cursor-pointer"
            >
              {t.home.shopNow}
            </Link>
            <Link
              href="/contact"
              className="px-12 py-5 bg-white hover:bg-gray-300 text-red-700 font-bold rounded-xl shadow-xl transition-all duration-300 animate-section-fade-in delay-200 cursor-pointer"
            >
              {t.home.contactUs}
            </Link>
          </div>
        </div>
      </section>
      <Freemodal />

      {/* Animations */}
      <style jsx global>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s cubic-bezier(0.23, 1, 0.32, 1) both;
        }
        .animate-fade-in-up.delay-200 {
          animation-delay: 0.2s;
        }
        .animate-fade-in-up.delay-400 {
          animation-delay: 0.4s;
        }

        @keyframes hero-fade-in {
          0% { opacity: 0; transform: translateY(60px) scale(0.95); }
          60% { opacity: 0.7; transform: translateY(10px) scale(1.02); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-hero-fade-in {
          animation: hero-fade-in 1.2s cubic-bezier(0.23, 1, 0.32, 1) both;
        }
        .animate-hero-fade-in.delay-200 {
          animation-delay: 0.2s;
        }
        .animate-hero-fade-in.delay-400 {
          animation-delay: 0.4s;
        }

        @keyframes section-fade-in {
          0% { opacity: 0; transform: translateY(40px) scale(0.98); }
          60% { opacity: 0.7; transform: translateY(10px) scale(1.01); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-section-fade-in {
          animation: section-fade-in 1.1s cubic-bezier(0.23, 1, 0.32, 1) both;
        }
        .animate-section-fade-in.delay-200 {
          animation-delay: 0.2s;
        }
        .animate-section-fade-in.delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </main>
  );
}
