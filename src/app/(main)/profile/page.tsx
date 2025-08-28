"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ApiService from "@/utils/ApiService";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/utils/translation";
import Image from "next/image";
import AlertModal from "@/component/AlertModal";

export default function ProfilePage() {
  const { language } = useLanguage();
  const t = translations[language];
  const tProfile = t.profile || {};

  // User state
  const [user, setUser] = useState<any>(null);
  const [avatar, setAvatar] = useState<string>("/Logo.png");
  const [loading, setLoading] = useState(true);
  // State for password fields and feedback
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Controlled state for edit form fields
  const [editUsername, setEditUsername] = useState("");
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editBirthday, setEditBirthday] = useState("");

  // Alert modal state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState<string | undefined>(undefined);
  const [alertType, setAlertType] = useState<
    "success" | "error" | "info" | "warning" | "delete"
  >("info");
  const [alertAutoCloseMs, setAlertAutoCloseMs] = useState<number | null>(4000);

  function showAlert(
    message: string,
    type: "success" | "error" | "info" | "warning" | "delete" = "info",
    title?: string,
    autoCloseMs: number | null = 4000
  ) {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertAutoCloseMs(autoCloseMs);
    setAlertOpen(true);
  }

  const [activeTab, setActiveTab] = useState("overview");

  // When entering edit mode or user changes, update edit fields
  useEffect(() => {
    if (activeTab === "edit" && user) {
      setEditUsername(typeof user.username === "string" ? user.username : "");
      setEditFirstName(
        typeof user.first_name === "string" ? user.first_name : ""
      );
      setEditLastName(typeof user.last_name === "string" ? user.last_name : "");
      setEditEmail(typeof user.email === "string" ? user.email : "");
      setEditPhone(
        typeof user.phone_number === "string" ? user.phone_number : ""
      );
      setEditBirthday(typeof user.birthday === "string" ? user.birthday : "");
    }
  }, [activeTab, user]);

  useEffect(() => {
    ApiService.getProfile().then((res) => {
      if (res.success && res.data) {
        setUser(res.data);
        setAvatar(res.data.avatar || "/Logo.png");
      }
      setLoading(false);
    });
  }, []);

  // ...moved above...
  const router = useRouter();

  // Handler for password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);
    // if (!currentPassword || !newPassword) {
    //   setPasswordError("Please fill in both fields.");
    //   return;
    // }
    setPasswordLoading(true);
    try {
      const res = await ApiService.changePassword({
        old_password: currentPassword,
        new_password: newPassword,
      });
      if (res.success) {
        setPasswordMessage("Password updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        setPasswordError(res.message || "Failed to update password.");
      }
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Content for each tab
  const renderContent = () => {
    if (loading) {
      return (
        <div className="w-full max-w-5xl flex bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-red-100 dark:border-gray-800 overflow-hidden animate-pulse">
          {/* Container skeleton */}
          <section className="flex-1 p-10 flex flex-col justify-center items-center">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
            <div className="w-full max-w-lg bg-gray-100 dark:bg-gray-900 rounded-2xl shadow p-8 flex flex-col items-center border border-red-100 dark:border-gray-800">
              <div className="mt-4 w-full flex flex-col gap-2">
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="h-4 w-32 bg-gray-300 dark:bg-gray-800 rounded" />
                    <div className="h-4 w-20 bg-gray-300 dark:bg-gray-800 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      );
    }
    if (!user) {
      return (
        <div className="text-center text-lg text-red-500 dark:text-red-300">
          User not found or not logged in.
        </div>
      );
    }
    switch (activeTab) {
      case "overview":
        return (
          <>
            <h1 className="text-3xl font-extrabold text-red-700 dark:text-red-300 mb-4 tracking-tight drop-shadow-sm">
              {tProfile.profileOverview || "Profile Overview"}
            </h1>
            <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow p-8 flex flex-col items-center border border-red-100 dark:border-gray-800">
              <div className="mt-4 w-full flex flex-col gap-2">
                <div className="flex justify-between items-center px-4 py-2 bg-red-50 dark:bg-gray-800 rounded-lg">
                  <span className="font-semibold text-gray-700 dark:text-gray-200">
                    {tProfile.accountType || "Account Type"}
                  </span>
                  <span className="text-red-700 dark:text-red-300 font-bold">
                    {user.client_type_name || tProfile.standard || "Standard"}
                  </span>
                </div>
                <div className="flex justify-between items-center px-4 py-2 bg-red-50 dark:bg-gray-800 rounded-lg">
                  <span className="font-semibold text-gray-700 dark:text-gray-200">
                    {tProfile.memberSince || "Member Since"}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {user.created_at || "Jan 2024"}
                  </span>
                </div>
              </div>
            </div>
          </>
        );
      case "edit":
        return (
          <>
            <h1 className="text-3xl font-extrabold text-red-700 dark:text-red-300 mb-4 tracking-tight drop-shadow-sm">
              {tProfile.editProfile || "Edit Profile"}
            </h1>
            <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow p-8 border border-red-100 dark:border-gray-800 flex flex-col items-center">
              <form
                className="flex flex-col gap-4 w-full items-center"
                onSubmit={async (e) => {
                  e.preventDefault();
                  // Build payload for ApiService.updateProfile (fields + file)
                  const payload: any = {
                    username: editUsername,
                    first_name: editFirstName,
                    last_name: editLastName,
                    email: editEmail,
                    phone_number: editPhone,
                    birthday: editBirthday,
                  };
                  // Attach file if selected
                  const fileInput = e.currentTarget.querySelector(
                    'input[type="file"]'
                  ) as HTMLInputElement | null;
                  if (fileInput && fileInput.files && fileInput.files[0]) {
                    payload.profile_picture = fileInput.files[0];
                  }

                  const res = await ApiService.updateProfile(payload);
                  console.log("Profile update response:", res);
                  if (res.success && res.data) {
                    setUser(res.data);
                    if (res.data.profile_picture_url) {
                      setAvatar(res.data.profile_picture_url);
                    }
                    try {
                      const userStr = window.sessionStorage.getItem("user");
                      if (userStr) {
                        const userObj = JSON.parse(userStr);
                        let updated = false;
                        if (userObj.username !== res.data.username) {
                          userObj.username = res.data.username;
                          updated = true;
                        }
                        if (
                          res.data.profile_picture_url &&
                          userObj.profile_picture_url !==
                            res.data.profile_picture_url
                        ) {
                          userObj.profile_picture_url =
                            res.data.profile_picture_url;
                          updated = true;
                        }
                        if (updated) {
                          window.sessionStorage.setItem(
                            "user",
                            JSON.stringify(userObj)
                          );
                        }
                      }
                      const match = document.cookie.match(/user=([^;]+)/);
                      if (match) {
                        const userObj = JSON.parse(
                          decodeURIComponent(match[1])
                        );
                        let updated = false;
                        if (userObj.username !== res.data.username) {
                          userObj.username = res.data.username;
                          updated = true;
                        }
                        if (
                          res.data.profile_picture_url &&
                          userObj.profile_picture_url !==
                            res.data.profile_picture_url
                        ) {
                          userObj.profile_picture_url =
                            res.data.profile_picture_url;
                          updated = true;
                        }
                        if (updated) {
                          document.cookie = `user=${encodeURIComponent(
                            JSON.stringify(userObj)
                          )};path=/;max-age=31536000`;
                        }
                      }
                    } catch (error) {
                      console.error("Error updating session/cookie:", error);
                    }
                    showAlert(
                      "Profile updated successfully.",
                      "success",
                      "สำเร็จ",
                      2000
                    );
                  } else {
                    showAlert(
                      "Failed to update profile.",
                      "error",
                      "ข้อผิดพลาด",
                      null
                    );
                  }
                }}
              >
                {/* Avatar upload */}
                <div className="flex flex-col items-center mb-4">
                  <Image
                    src={user?.profile_picture_url || avatar}
                    alt="User Avatar"
                    className="w-24 h-24 rounded-full border-4 border-red-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg object-cover mb-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/default-profile.jpg";
                    }}
                    width={96}
                    height={96}
                  />
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                    onChange={(e) => {
                      const file = e.target.files && e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (typeof ev.target?.result === "string") {
                            setAvatar(ev.target.result);
                            try {
                              const userStr =
                                window.sessionStorage.getItem("user");
                              if (userStr) {
                                const userObj = JSON.parse(userStr);
                                userObj.profile_picture_preview =
                                  ev.target.result;
                                window.sessionStorage.setItem(
                                  "user",
                                  JSON.stringify(userObj)
                                );
                              }
                              const match =
                                document.cookie.match(/user=([^;]+)/);
                              if (match) {
                                const userObj = JSON.parse(
                                  decodeURIComponent(match[1])
                                );
                                userObj.profile_picture_preview =
                                  ev.target.result;
                                document.cookie = `user=${encodeURIComponent(
                                  JSON.stringify(userObj)
                                )};path=/;max-age=31536000`;
                              }
                            } catch (error) {
                              console.error(
                                "Error saving avatar preview to session/cookie:",
                                error
                              );
                            }
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>

                <label className="font-semibold text-gray-700 dark:text-gray-200 w-full">
                  {tProfile.username || "Username"}
                  <input
                    type="text"
                    name="username"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="mt-1 w-full px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </label>
                <div className="flex gap-4 w-full">
                  <label className="font-semibold text-gray-700 dark:text-gray-200 w-1/2">
                    {tProfile.firstname || "First Name"}
                    <input
                      type="text"
                      name="first_name"
                      value={editFirstName}
                      onChange={(e) => setEditFirstName(e.target.value)}
                      className="mt-1 w-full px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                  </label>
                  <label className="font-semibold text-gray-700 dark:text-gray-200 w-1/2">
                    {tProfile.lastname || "Last Name"}
                    <input
                      type="text"
                      name="last_name"
                      value={editLastName}
                      onChange={(e) => setEditLastName(e.target.value)}
                      className="mt-1 w-full px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                  </label>
                </div>
                <label className="font-semibold text-gray-700 dark:text-gray-200 w-full">
                  {tProfile.email || "Email"}
                  <input
                    type="email"
                    name="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="mt-1 w-full px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </label>

                <label className="font-semibold text-gray-700 dark:text-gray-200 w-full">
                  {tProfile.phoneNumber || "Phone Number"}
                  <input
                    type="tel"
                    name="phone_number"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="mt-1 w-full px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </label>
                <label className="font-semibold text-gray-700 dark:text-gray-200 w-full">
                  {tProfile.birthday || "Birthday"}
                  <input
                    type="date"
                    name="birthday"
                    value={editBirthday}
                    onChange={(e) => setEditBirthday(e.target.value)}
                    className="mt-1 w-full px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </label>
                <button
                  type="submit"
                  className="cursor-pointer mt-4 px-6 py-2 bg-gradient-to-r from-red-600 to-red-500 dark:from-red-700 dark:to-red-600 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-all duration-200"
                >
                  {tProfile.saveChanges || "Save Changes"}
                </button>
              </form>
            </div>
          </>
        );
      case "password":
        return (
          <>
            <h1 className="text-3xl font-extrabold text-red-700 dark:text-red-300 mb-4 tracking-tight drop-shadow-sm">
              {tProfile.changePassword || "Change Password"}
            </h1>
            <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow p-8 border border-red-100 dark:border-gray-800">
              <form
                className="flex flex-col gap-4"
                onSubmit={handlePasswordChange}
              >
                <label className="font-semibold text-gray-700 dark:text-gray-200">
                  {tProfile.currentPassword || "Current Password"}
                  <input
                    type="password"
                    value={
                      typeof currentPassword === "string" ? currentPassword : ""
                    }
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="mt-1 w-full px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </label>
                <label className="font-semibold text-gray-700 dark:text-gray-200">
                  {tProfile.newPassword || "New Password"}
                  <input
                    type="password"
                    value={typeof newPassword === "string" ? newPassword : ""}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 w-full px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </label>
                {passwordError && (
                  <div className="text-red-600 dark:text-red-400 text-sm font-semibold">
                    {passwordError}
                  </div>
                )}
                {passwordMessage && (
                  <div className="text-green-600 dark:text-green-400 text-sm font-semibold">
                    {passwordMessage}
                  </div>
                )}
                <button
                  type="submit"
                  className="cursor-pointer mt-4 px-6 py-2 bg-gradient-to-r from-red-600 to-red-500 dark:from-red-700 dark:to-red-600 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-60"
                  disabled={passwordLoading}
                >
                  {passwordLoading
                    ? "Updating..."
                    : tProfile.updatePassword || "Update Password"}
                </button>
              </form>
            </div>
          </>
        );
      case "logout":
        return (
          <>
            <h1 className="text-3xl font-extrabold text-red-700 dark:text-red-300 mb-4 tracking-tight drop-shadow-sm">
              {tProfile.logout || "Logout"}
            </h1>
            <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow p-8 border border-red-100 dark:border-gray-800 flex flex-col items-center">
              <p className="mb-6 text-lg text-gray-700 dark:text-gray-200">
                {"Are you sure you want to logout?"}
              </p>
              <button
                className="cursor-pointer px-6 py-2 bg-red-600 text-white rounded-xl font-bold shadow-lg hover:bg-red-700 transition-all duration-200"
                onClick={() => {
                  document.cookie = "user=;path=/;max-age=0";
                  window.sessionStorage.removeItem("user");
                  window.dispatchEvent(new Event("userUpdated"));
                  router.push("/");
                }}
              >
                {tProfile.confirmLogout || "Confirm Logout"}
              </button>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-red-50 to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-5xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-red-100 dark:border-gray-800 overflow-hidden flex flex-col md:flex-row">
        {/* Aside (Left) */}
        <aside className="w-full md:w-1/3 min-w-[220px] bg-red-50 dark:bg-gray-800 flex flex-col md:flex-col justify-between py-4 px-2 sm:px-4 md:px-6 md:py-8 lg:py-10 border-b md:border-b-0 md:border-r border-red-100 dark:border-gray-800 gap-4">
          <div className="w-full flex flex-col items-center gap-2 mb-2">
            {loading ? (
              <>
                <div className="w-24 h-24 rounded-full border-4 border-red-300 dark:border-gray-700 bg-gray-200 dark:bg-gray-700 shadow-lg mb-4 animate-pulse" />
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse" />
                <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse" />
                <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-6 animate-pulse" />
              </>
            ) : (
              <>
                <Image
                  src={user?.profile_picture_url || avatar}
                  alt="User Avatar"
                  className="w-24 h-24 rounded-full border-4 border-red-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg object-cover mb-4"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/default-profile.jpg";
                  }}
                  width={96}
                  height={96}
                />
                <h2 className="text-xl font-bold text-red-700 dark:text-red-300 mb-2 text-center">
                  {user ? user.username : "-"}
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 text-center">
                  {user ? `${user.first_name} ${user.last_name}` : "-"}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-200 mb-6 text-center">
                  {user ? user.email : "-"}
                </div>
              </>
            )}
          </div>
          <nav className="w-full flex flex-row md:flex-col gap-2 mt-0 md:mt-4 justify-center md:justify-start">
            <button
              onClick={() => setActiveTab("overview")}
              className={`cursor-pointer w-full text-left px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === "overview"
                  ? "bg-red-100 dark:bg-gray-700 text-red-700 dark:text-red-300"
                  : "text-gray-700 dark:text-gray-200 hover:bg-red-100 dark:hover:bg-gray-700"
              }`}
            >
              {tProfile.profileOverview || "Profile Overview"}
            </button>
            <button
              onClick={() => setActiveTab("edit")}
              className={`cursor-pointer w-full text-left px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === "edit"
                  ? "bg-red-100 dark:bg-gray-700 text-red-700 dark:text-red-300"
                  : "text-gray-700 dark:text-gray-200 hover:bg-red-100 dark:hover:bg-gray-700"
              }`}
            >
              {tProfile.editProfile || "Edit Profile"}
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`cursor-pointer w-full text-left px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === "password"
                  ? "bg-red-100 dark:bg-gray-700 text-red-700 dark:text-red-300"
                  : "text-gray-700 dark:text-gray-200 hover:bg-red-100 dark:hover:bg-gray-700"
              }`}
            >
              {tProfile.changePassword || "Change Password"}
            </button>
            <button
              onClick={() => setActiveTab("logout")}
              className={`cursor-pointer w-full text-left px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === "logout"
                  ? "bg-red-100 dark:bg-gray-700 text-red-700 dark:text-red-300"
                  : "text-gray-700 dark:text-gray-200 hover:bg-red-100 dark:hover:bg-gray-700"
              }`}
            >
              {tProfile.logout || "Logout"}
            </button>
          </nav>
        </aside>
        {/* Container (Right) */}
        <section className="w-full md:w-2/3 p-2 sm:p-4 md:p-10 flex flex-col justify-center items-center">
          {renderContent()}
        </section>
      </div>
      <AlertModal
        open={alertOpen}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        autoCloseMs={alertAutoCloseMs}
        onClose={() => setAlertOpen(false)}
      />
    </main>
  );
}
