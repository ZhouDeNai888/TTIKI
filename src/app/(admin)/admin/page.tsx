"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ApiService from "@/utils/ApiService";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await ApiService.adminLogin({ username, password });
      if (res.success && res.data) {
        // Store admin info in cookie (if needed)
        document.cookie = `admin=${encodeURIComponent(
          JSON.stringify(res.data.data)
        )};path=/;max-age=5400`;
        router.push("/admin/dashboard");
        document.cookie = `arft=${encodeURIComponent(
          res.data.refresh_token
        )};path=/;max-age=5400`;
        document.cookie = `aat=${encodeURIComponent(
          res.data.access_token
        )};path=/;max-age=3600`;
        router.push("/admin/dashboard");
      } else {
        setError(res.message || "Invalid admin username or password.");
        setLoading(false);
        setTimeout(() => {
          router.push("/admin");
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || "Login failed.");
      setLoading(false);
    }
  }

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
          Admin Login
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
          Please enter your admin credentials.
        </p>
        <form className="w-full flex flex-col gap-4" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Admin Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="px-4 py-3 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            required
          />
          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-3 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            required
          />
          {error && (
            <div className="text-red-600 text-sm font-bold text-center">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="w-full py-3 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white font-bold rounded-lg shadow-lg transition-all text-lg"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}
