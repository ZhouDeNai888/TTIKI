"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/utils/translation";
import ApiService from "@/utils/ApiService";

export default function SignIn() {
  const { language } = useLanguage();
  const t = translations[language];
  const tSignin = t.signin || {};
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  // Detect Edge browser
  const isEdge =
    typeof window !== "undefined" && window.navigator.userAgent.includes("Edg");
  const router = require("next/navigation").useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError(
        tSignin.enterUsernamePassword || "Please enter username and password."
      );
      return;
    }
    const res = await ApiService.login({ username, password });
    if (!res.success) {
      setError(
        res.message ||
          tSignin.invalidUsernamePassword ||
          "Invalid username or password."
      );
      return;
    }

    if (rememberMe) {
      document.cookie = `user=${encodeURIComponent(
        res.data.data
      )};path=/;max-age=31536000`;
      document.cookie = `urft=${encodeURIComponent(
        res.data.refresh_token
      )};path=/;max-age=31536000`;
      document.cookie = `uat=${encodeURIComponent(
        res.data.access_token
      )};path=/;max-age=31536000`;
    } else {
      document.cookie = `user=${encodeURIComponent(
        JSON.stringify(res.data.data)
      )};path=/;max-age=3600`;

      document.cookie = `urft=${encodeURIComponent(
        res.data.refresh_token
      )};path=/;max-age=5400`;

      document.cookie = `uat=${encodeURIComponent(
        res.data.access_token
      )};path=/;max-age=3600`;
    }
    window.dispatchEvent(new Event("userUpdated"));
    router.push("/");
  }

  const handleOauthLogin = (provider: string) => {
    const popup = window.open(
      `/api/oauth/${provider}/login`,
      "oauthLogin",
      "width=500,height=600"
    );

    window.addEventListener("message", (event) => {
      try {
        const user = event.data?.user;
        if (user) {
          document.cookie = `user=${encodeURIComponent(
            JSON.stringify(user.data)
          )};path=/;max-age=5400`;
          document.cookie = `urft=${encodeURIComponent(
            user.refresh_token
          )};path=/;max-age=5400`;
          document.cookie = `uat=${encodeURIComponent(
            user.access_token
          )};path=/;max-age=3600`;
          window.dispatchEvent(new Event("userUpdated"));
          router.push("/");
        }
      } catch (e) {
        // ignore
      }
    });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-red-50 to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 flex flex-col items-center">
        <Image
          src="/Logo.png"
          alt="TTKI Logo"
          width={80}
          height={45}
          className="mb-4 rounded-lg bg-white dark:bg-gray-800"
        />
        <h1 className="text-3xl font-extrabold text-red-700 dark:text-red-300 mb-2">
          {tSignin.signIn || "Sign In"}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
          {tSignin.welcomeBack ||
            "Welcome back! Please sign in to your account."}
        </p>
        <form className="w-full flex flex-col gap-4" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder={tSignin.username || "Username"}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="px-4 py-3 rounded-xl border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition-all duration-200"
            required
            autoComplete="username"
          />
          {isEdge ? (
            <input
              type="password"
              placeholder={tSignin.password || "Password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-3 rounded-xl border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition-all duration-200"
              required
              autoComplete="current-password"
            />
          ) : (
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={tSignin.password || "Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-4 py-3 pr-12 rounded-xl border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition-all duration-200 w-full"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 p-0 m-0 bg-transparent border-none text-gray-400 hover:text-red-600 focus:outline-none transition-colors duration-200 flex items-center"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{ pointerEvents: "auto" }}
              >
                <i
                  className={`fa ${
                    showPassword ? "fa-eye-slash" : "fa-eye"
                  } text-xl`}
                  aria-hidden="true"
                ></i>
              </button>
            </div>
          )}
          {/* Remember Me Checkbox */}
          <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm mb-2">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="accent-red-600 w-5 h-5"
            />
            <span>{tSignin.Rememberme}</span>
          </label>
          {error && (
            <div className="text-red-600 text-sm font-bold text-center">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="cursor-pointer w-full py-3 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white font-bold rounded-lg shadow-lg transition-all text-lg"
          >
            {tSignin.signIn || "Sign In"}
          </button>
          <div className="flex items-center my-2">
            <hr className="flex-grow border-t border-gray-300 dark:border-gray-700" />
            <span className="mx-3 text-gray-500 dark:text-gray-400">
              {tSignin.Or}
            </span>
            <hr className="flex-grow border-t border-gray-300 dark:border-gray-700" />
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={() => handleOauthLogin("google")}
            className="cursor-pointer w-full flex items-center justify-center gap-3 py-3 mt-2 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 rounded-lg shadow hover:shadow-md transition-all text-gray-700 dark:text-gray-100 font-semibold text-lg"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_17_40)">
                <path
                  d="M23.9999 12.2763C23.9999 11.4607 23.9307 10.6716 23.8126 9.90918H12.2393V14.3682H18.8436C18.5707 15.8182 17.7017 17.0182 16.4199 17.8182V20.3263H20.3263C22.3263 18.5091 23.9999 15.7273 23.9999 12.2763Z"
                  fill="#4285F4"
                />
                <path
                  d="M12.2393 24C15.2993 24 17.8726 22.9636 19.7017 21.2182L16.4199 17.8182C15.3636 18.5455 13.9272 19.0182 12.2393 19.0182C9.29929 19.0182 6.81818 17.1273 5.92718 14.5455H2.50909V17.1273C4.32727 20.8364 8.01818 24 12.2393 24Z"
                  fill="#34A853"
                />
                <path
                  d="M5.92718 14.5455C5.68182 13.8182 5.54545 13.0364 5.54545 12.2182C5.54545 11.4 5.68182 10.6182 5.92718 9.89091V7.30909H2.50909C1.83636 8.61818 1.45454 10.0727 1.45454 11.5636C1.45454 13.0545 1.83636 14.5091 2.50909 15.8182L5.92718 14.5455Z"
                  fill="#FBBC05"
                />
                <path
                  d="M12.2393 5.41818C13.9272 5.41818 15.3636 5.96364 16.4199 6.69091L19.7017 3.29091C17.8726 1.54545 15.2993 0.509094 12.2393 0.509094C8.01818 0.509094 4.32727 3.67273 2.50909 7.30909L5.92718 9.89091C6.81818 7.30909 9.29929 5.41818 12.2393 5.41818Z"
                  fill="#EA4335"
                />
              </g>
              <defs>
                <clipPath id="clip0_17_40">
                  <rect width="24" height="24" fill="white" />
                </clipPath>
              </defs>
            </svg>
            <span>Sign in with Google</span>
          </button>
          {/* LINE Login Button */}
          <button
            type="button"
            onClick={() => handleOauthLogin("line")}
            className="cursor-pointer w-full flex items-center justify-center gap-3 py-3 mt-2 bg-white border border-green-400 dark:bg-gray-800 dark:border-gray-700 rounded-lg shadow hover:shadow-md transition-all text-green-700 dark:text-green-400 font-semibold text-lg"
          >
            <i
              className="fab fa-line text-xl text-[#06C755]"
              style={{ width: 24, height: 24 }}
            ></i>
            <span>Sign in with LINE</span>
          </button>
        </form>
        <div className="mt-6 text-center text-gray-700 dark:text-gray-300">
          {tSignin.dontHaveAccount || "Don't have an account?"}{" "}
          <Link
            href="/signup"
            className="text-red-600 dark:text-red-400 font-bold hover:underline"
          >
            {tSignin.signUp || "Sign Up"}
          </Link>
        </div>
      </div>
    </main>
  );
}
