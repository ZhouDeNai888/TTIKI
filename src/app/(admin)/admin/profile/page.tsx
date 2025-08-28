"use client";

import { translations } from "@/utils/translation";
import { useLanguage } from "@/context/LanguageContext";

import React, { useState, useEffect } from "react";
import ApiService from "@/utils/ApiService";
import AlertModal from "@/component/AlertModal";

export default function AdminProfile() {
  const { language } = useLanguage();
  const t = translations[language].adminprofile;
  const [admin, setAdmin] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({
    name: "",
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    role: "",
    birthday: "",
    status: "",
    phone: "",
    profile_picture: "",
    // holds selected File when a user picks a new avatar
    profile_picture_file: null,
    created_at: "",
    updated_at: "",
  });

  // Alert state + helper
  const [alertState, setAlertState] = useState<{
    open: boolean;
    title?: string;
    message: string;
    type?: "success" | "error" | "info" | "warning" | "delete";
    autoCloseMs?: number | null;
  }>({ open: false, message: "", type: "info", autoCloseMs: null });

  const showAlert = (
    message: string,
    type: "success" | "error" | "info" | "warning" | "delete" = "info",
    title?: string,
    autoCloseMs: number | null = null
  ) => setAlertState({ open: true, title, message, type, autoCloseMs });

  useEffect(() => {
    let mounted = true;
    ApiService.getAdminProfile()
      .then((res) => {
        if (!mounted) return;
        if (res && res.success && res.data) {
          const d = res.data;
          const normalized = {
            ...d,
            name:
              d.name ||
              `${(d.first_name || "").trim()} ${(
                d.last_name || ""
              ).trim()}`.trim(),
            username: d.username || d.user_name || d.email || "",
            first_name:
              d.first_name ||
              (d.name ? d.name.split(" ").slice(0, -1).join(" ") : "") ||
              "",
            last_name:
              d.last_name ||
              (d.name ? d.name.split(" ").slice(-1).join(" ") : "") ||
              "",
            birthday: d.birthday || "",
            status: d.status || "",
            phone: d.phone || d.phone_number || "",
            profile_picture_url:
              d.profile_picture_url || d.profile_picture || "",
            permission: d.permission || d.permission_name || undefined,
          };
          setAdmin(normalized);
          setForm({
            name: normalized.name || "",
            username: normalized.username || "",
            first_name: normalized.first_name || "",
            last_name: normalized.last_name || "",
            birthday: normalized.birthday || "",
            status: normalized.status || "",
            email: normalized.email || "",
            role:
              normalized.permission ||
              normalized.role ||
              normalized.position ||
              "",
            phone: normalized.phone || "",
            profile_picture: normalized.profile_picture_url || "",
            created_at: normalized.created_at || "",
            updated_at: normalized.updated_at || "",
          });
        }
      })
      .catch(() => {
        // ignore
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === "string") {
        setForm((prev: any) => ({
          ...prev,
          profile_picture: ev.target?.result,
          profile_picture_file: file,
        }));
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        username: form.username,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone_number: form.phone,
        birthday: form.birthday,
      };

      // Attach file if selected (read directly from the submitted form) per API expectations
      const fileInput = (e.currentTarget as HTMLFormElement).querySelector(
        'input[type="file"]'
      ) as HTMLInputElement | null;
      if (fileInput && fileInput.files && fileInput.files[0]) {
        payload.profile_picture = fileInput.files[0];
      }

      // console.log("Saving profile with payload:", payload);

      const res = await ApiService.updateAdminProfile(payload);
      if (res && res.success && res.data) {
        const d = res.data;
        const normalized = {
          ...d,
          name:
            d.name ||
            `${(d.first_name || "").trim()} ${(
              d.last_name || ""
            ).trim()}`.trim(),
          username: d.username || d.user_name || d.email || "",
          first_name: d.first_name || "",
          last_name: d.last_name || "",
          birthday: d.birthday || "",
          status: d.status || "",
          phone: d.phone || d.phone_number || "",
          profile_picture_url: d.profile_picture_url || d.profile_picture || "",
          permission: d.permission || d.permission_name || undefined,
        };
        setAdmin(normalized);
        setForm((prev: any) => ({
          ...prev,
          name: normalized.name || "",
          username: normalized.username || "",
          first_name: normalized.first_name || "",
          last_name: normalized.last_name || "",
          birthday: normalized.birthday || "",
          status: normalized.status || "",
          email: normalized.email || "",
          role: normalized.permission || normalized.role || "",
          phone: normalized.phone || "",
          profile_picture: normalized.profile_picture_url || "",
          // clear the staged file after successful upload
          profile_picture_file: null,
        }));
        setEditMode(false);
      } else {
        showAlert(res?.message || "Failed to update profile", "error");
      }
    } catch (err) {
      console.error(err);
      showAlert((err as Error).message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-red-50 to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="w-full max-w-4xl bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl p-6 md:p-8 mt-12 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-2 space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
            <div className="md:col-span-1 flex flex-col items-center">
              <div className="w-36 h-36 rounded-full bg-gray-200 dark:bg-gray-700 mb-4" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4" />
              <div className="w-full">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-red-50 to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-4xl bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl p-6 md:p-8 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2">
            <h1 className="text-2xl font-extrabold text-red-700 dark:text-red-300 mb-4">
              {t.adminProfile}
            </h1>
            {editMode ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-red-200 dark:border-red-400">
                    <img
                      src={
                        form.profile_picture ||
                        admin?.profile_picture_url ||
                        admin?.profile_picture ||
                        "https://ui-avatars.com/api/?name=Admin+User&background=F87171&color=fff"
                      }
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg"
                      name="profile_picture"
                      onChange={handleFileChange}
                      className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 font-semibold text-gray-700 dark:text-gray-200 block">
                      {translations[language].usersmanage.username ||
                        "Username"}
                    </label>
                    <input
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>
                  <div />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 font-semibold text-gray-700 dark:text-gray-200 block">
                      {translations[language].usersmanage.firstName ||
                        "First name"}
                    </label>
                    <input
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 font-semibold text-gray-700 dark:text-gray-200 block">
                      {translations[language].usersmanage.lastName ||
                        "Last name"}
                    </label>
                    <input
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 font-semibold text-gray-700 dark:text-gray-200 block">
                      {translations[language].profile.birthday || "Birthday"}
                    </label>
                    <input
                      type="date"
                      name="birthday"
                      value={form.birthday}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 font-semibold text-gray-700 dark:text-gray-200 block">
                      {t.phone}
                    </label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 font-semibold text-gray-700 dark:text-gray-200 block">
                    {t.email}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className={`flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg ${
                      saving ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {saving ? "Saving..." : t.save}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="flex-1 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded-lg"
                  >
                    {t.cancel}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {translations[language].usersmanage.username ||
                        "Username"}
                    </div>
                    <div className="font-medium">{admin.username}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {translations[language].usersmanage.permission ||
                        "Permission"}
                    </div>
                    <div className="font-medium">
                      {admin.permission || admin.role}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {translations[language].usersmanage.firstName ||
                        "First name"}
                    </div>
                    <div className="font-medium">{admin.first_name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {translations[language].usersmanage.lastName ||
                        "Last name"}
                    </div>
                    <div className="font-medium">{admin.last_name}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {translations[language].profile.birthday || "Birthday"}
                    </div>
                    <div className="font-medium">{admin.birthday}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {t.phone}
                    </div>
                    <div className="font-medium">{admin.phone}</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {t.email}
                  </div>
                  <div className="font-medium">{admin.email}</div>
                </div>
              </div>
            )}
          </div>
          <div className="md:col-span-1 flex flex-col items-center">
            <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-red-200 dark:border-red-400 mb-4">
              <img
                src={
                  admin?.profile_picture_url ||
                  admin?.profile_picture ||
                  form.profile_picture ||
                  "https://ui-avatars.com/api/?name=Admin+User&background=F87171&color=fff"
                }
                alt="profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800 dark:text-gray-100">
                {admin.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {admin.permission || admin.role}
              </div>
            </div>
            <div className="w-full">
              <button
                onClick={() => setEditMode(true)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
              >
                {t.editProfile}
              </button>
            </div>
          </div>
        </div>
      </div>
      <AlertModal
        open={alertState.open}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        autoCloseMs={alertState.autoCloseMs}
        onClose={() => setAlertState((s) => ({ ...s, open: false }))}
      />
    </main>
  );
}
