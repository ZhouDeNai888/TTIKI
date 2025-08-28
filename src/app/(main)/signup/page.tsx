"use client";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/utils/translation";
import ApiService from "@/utils/ApiService";
import React from "react";
import AlertModal from "@/component/AlertModal";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const { language } = useLanguage();
  const t = translations[language];
  const tSignup = t.signup || {};
  const [form, setForm] = React.useState({
    firstname: "",
    lastname: "",
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    phoneNumber: "",
    birthday: "",
    terms: false,
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  // alert modal state to show confirmation before navigation
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [alertTitle, setAlertTitle] = React.useState("");
  const [alertMessage, setAlertMessage] = React.useState("");
  const [alertType, setAlertType] = React.useState<
    "success" | "error" | "info" | "warning" | "delete"
  >("success");
  const router = useRouter();

  // Password requirement checks for live UI feedback
  const pwd = form.password || "";
  const pwdChecks = {
    minLength: pwd.length >= 6,
    upper: /[A-Z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    special: /[^A-Za-z0-9]/.test(pwd),
    match: form.password !== "" && form.password === form.confirmPassword,
  };

  // visibility toggles for password fields
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    // Password validation: 6-12 chars, at least 1 uppercase, 1 number, 1 special char
    const password = form.password;
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number");
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      setError("Password must contain at least one special character");
      return;
    }
    if (!form.confirmPassword) {
      setError("Please confirm your password");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!form.terms) {
      setError("You must accept the terms and privacy policy");
      return;
    }
    setLoading(true);
    const { confirmPassword, terms, ...registerData } = form;
    // Map camelCase to snake_case for backend
    const payload = {
      first_name: registerData.firstname,
      last_name: registerData.lastname,
      username: registerData.username,
      password: registerData.password,
      email: registerData.email,
      phone_number: registerData.phoneNumber,
      birthday: registerData.birthday,
    };
    const res = await ApiService.register(payload);
    console.log("Registration response:", res);
    setLoading(false);
    if (res.success) {
      setSuccess(res.message || "Registration successful!");
      setForm({
        firstname: "",
        lastname: "",
        username: "",
        password: "",
        confirmPassword: "",
        email: "",
        phoneNumber: "",
        birthday: "",
        terms: false,
      });
      // show confirmation modal, navigate to signin when modal closed
      setAlertTitle(tSignup.signUp || "Sign Up");
      setAlertMessage(res.message || "Registration successful!");
      setAlertType("success");
      setAlertOpen(true);
    } else {
      setError(res.message || "Registration failed");
      // show an error alert as well
      setAlertTitle("Error");
      setAlertMessage(res.message || "Registration failed");
      setAlertType("error");
      setAlertOpen(true);
    }
  };

  const handleRegister = (provider: string) => {
    const popup = window.open(
      `/api/oauth/${provider}/login`,
      "oauthLogin",
      "width=500,height=600"
    );

    window.addEventListener("message", (event) => {
      try {
        const user = event.data?.user;
        if (user) {
          sessionStorage.setItem("user", JSON.stringify(user));
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
          {tSignup.signUp || "Sign Up"}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
          {tSignup.createAccount || "Create your account to get started!"}
        </p>

        {error && (
          <div className="text-red-600 text-sm font-bold text-center mb-2">
            {error}
          </div>
        )}
        {success && (
          <div className="text-green-600 text-sm font-bold text-center mb-2">
            {success}
          </div>
        )}

        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="firstname"
              placeholder={tSignup.firstname || "First Name"}
              className="w-full px-4 py-3 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
              value={form.firstname}
              onChange={handleChange}
            />
            <input
              type="text"
              name="lastname"
              placeholder={tSignup.lastname || "Last Name"}
              className="w-full px-4 py-3 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
              value={form.lastname}
              onChange={handleChange}
            />
          </div>
          <input
            type="text"
            name="username"
            placeholder={tSignup.username || "Username"}
            className="w-full px-4 py-3 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            required
            value={form.username}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder={tSignup.email || "Email"}
            className="w-full px-4 py-3 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            required
            value={form.email}
            onChange={handleChange}
          />
          <input
            type="tel"
            name="phoneNumber"
            placeholder={tSignup.phoneNumber || "Phone Number"}
            className="w-full px-4 py-3 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            required
            value={form.phoneNumber}
            onChange={handleChange}
          />
          <input
            type="date"
            name="birthday"
            placeholder={tSignup.birthday || "Birthday"}
            className="w-full px-4 py-3 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            required
            value={form.birthday}
            onChange={handleChange}
          />
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder={tSignup.password || "Password"}
              className="w-full px-4 py-3 pr-12 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
              value={form.password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="cursor-pointer absolute inset-y-0 right-0 flex items-center px-3 rounded-r-lg text-gray-600 dark:text-gray-300 bg-transparent  transition-colors "
            >
              <i
                className={`${
                  showPassword ? "fa fa-eye-slash" : "fa fa-eye"
                } text-lg text-gray-400 hover:text-red-600 `}
                aria-hidden="true"
              />
            </button>
          </div>

          <div className="relative w-full">
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder={tSignup.confirmPassword || "Confirm Password"}
              className="w-full px-4 py-3 pr-12 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
              value={form.confirmPassword}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              aria-label={
                showConfirm ? "Hide confirm password" : "Show confirm password"
              }
              className="cursor-pointer absolute inset-y-0 right-0 flex items-center px-3 rounded-r-lg text-gray-600 dark:text-gray-300 bg-transparent  transition-colors"
            >
              <i
                className={`${
                  showConfirm ? "fa fa-eye-slash" : "fa fa-eye"
                } text-lg text-gray-400 hover:text-red-600`}
                aria-hidden="true"
              />
            </button>
          </div>

          {/* Password requirement indicators */}
          <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
            <ul className="flex flex-col gap-1">
              <li className="flex items-center gap-2">
                <span
                  className={`inline-block w-3 h-3 rounded-full border ${
                    pwdChecks.minLength
                      ? "bg-green-500 border-green-500"
                      : "bg-white border-gray-300"
                  }`}
                />
                <span>อย่างน้อย 6 ตัวอักษร</span>
              </li>
              <li className="flex items-center gap-2">
                <span
                  className={`inline-block w-3 h-3 rounded-full border ${
                    pwdChecks.upper
                      ? "bg-green-500 border-green-500"
                      : "bg-white border-gray-300"
                  }`}
                />
                <span>มีตัวพิมพ์ใหญ่ 1 ตัวอย่างน้อย</span>
              </li>
              <li className="flex items-center gap-2">
                <span
                  className={`inline-block w-3 h-3 rounded-full border ${
                    pwdChecks.number
                      ? "bg-green-500 border-green-500"
                      : "bg-white border-gray-300"
                  }`}
                />
                <span>มีตัวเลข 1 ตัวอย่างน้อย</span>
              </li>
              <li className="flex items-center gap-2">
                <span
                  className={`inline-block w-3 h-3 rounded-full border ${
                    pwdChecks.special
                      ? "bg-green-500 border-green-500"
                      : "bg-white border-gray-300"
                  }`}
                />
                <span>มีอักขระพิเศษ 1 ตัวอย่างน้อย</span>
              </li>
              <li className="flex items-center gap-2">
                <span
                  className={`inline-block w-3 h-3 rounded-full border ${
                    pwdChecks.match
                      ? "bg-green-500 border-green-500"
                      : "bg-white border-gray-300"
                  }`}
                />
                <span>รหัสผ่านตรงกัน</span>
              </li>
            </ul>
          </div>

          {/* Terms and Privacy Checkbox */}
          <label className="flex items-center gap-3 mb-2 text-gray-700 dark:text-gray-300 text-sm">
            <input
              type="checkbox"
              name="terms"
              checked={form.terms}
              onChange={handleChange}
              required
              className="accent-red-600 w-5 h-5"
            />
            <span>
              อ่านข้อตกลงและนโยบาย&nbsp;
              <a
                href="/terms"
                target="_blank"
                className="text-red-600 dark:text-red-400 underline font-semibold"
              >
                ข้อตกลงและนโยบาย
              </a>
            </span>
          </label>

          <button
            type="submit"
            className="cursor-pointer w-full py-3 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white font-bold rounded-lg shadow-lg transition-all text-lg"
            disabled={loading}
          >
            {loading ? "Signing up..." : tSignup.signUp || "Sign Up"}
          </button>
          <div className="flex items-center my-2">
            <hr className="flex-grow border-t border-gray-300 dark:border-gray-700" />
            <span className="mx-3 text-gray-500 dark:text-gray-400">
              {tSignup.Or}
            </span>
            <hr className="flex-grow border-t border-gray-300 dark:border-gray-700" />
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={() => handleRegister("google")}
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
            <span>Sign up with Google</span>
          </button>

          {/* LINE Login Button */}
          <button
            type="button"
            onClick={() => handleRegister("line")}
            className="cursor-pointer w-full flex items-center justify-center gap-3 py-3 mt-2 bg-white border border-green-400 dark:bg-gray-800 dark:border-gray-700 rounded-lg shadow hover:shadow-md transition-all text-green-700 dark:text-green-400 font-semibold text-lg"
          >
            <i
              className="fab fa-line text-xl text-[#06C755]"
              style={{ width: 24, height: 24 }}
            ></i>
            <span>Sign up with LINE</span>
          </button>
        </form>
        {/* Alert Modal shown after signup */}
        <AlertModal
          open={alertOpen}
          title={alertTitle}
          message={alertMessage}
          type={alertType}
          onClose={() => {
            setAlertOpen(false);
            // if success, navigate to signin when user closes
            if (alertType === "success") {
              router.push("/signin");
            }
          }}
          autoCloseMs={alertType === "success" ? 10000 : null}
        />
        <div className="mt-6 text-center text-gray-700 dark:text-gray-300">
          {tSignup.alreadyHaveAccount || "Already have an account?"}{" "}
          <Link
            href="/signin"
            className="text-red-600 dark:text-red-400 font-bold hover:underline"
          >
            {tSignup.signIn || "Sign In"}
          </Link>
        </div>
      </div>
    </main>
  );
}
