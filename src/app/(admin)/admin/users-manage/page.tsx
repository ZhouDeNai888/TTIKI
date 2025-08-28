"use client";
import { translations } from "@/utils/translation";
import { useLanguage } from "@/context/LanguageContext";

import React, { useState, useEffect } from "react";
import ApiService from "@/utils/ApiService";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AlertModal from "@/component/AlertModal";

export default function ManageUsers() {
  const router = useRouter();
  function safeValue(val: any) {
    return val == null ? "" : val;
  }
  // Dynamic select options
  // For client types, store array of objects with id, name, description
  type ClientType = {
    client_type_id: number;
    client_type_name: string;
    description: string;
  };
  const [clientTypes, setClientTypes] = useState<ClientType[]>([]);
  // For permissions, store array of objects with id, name, description
  type Permission = {
    permission_id: number;
    permission_name: string;
    description: string;
  };
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setOptionsLoading(true);
    Promise.all([
      ApiService.getAllClientTypes(),
      ApiService.getAllPermissions(),
      ApiService.getAllUsers(),
    ]).then(([ctRes, permRes, usersRes]) => {
      if (mounted) {
        setClientTypes(Array.isArray(ctRes.data) ? ctRes.data : []);
        setPermissions(Array.isArray(permRes.data) ? permRes.data : []);
        setOptionsLoading(false);
        if (usersRes.success && Array.isArray(usersRes.data)) {
          setUsers(
            usersRes.data.map((u: any) => ({
              user_id: u.user_id,
              username: u.username,
              first_name: u.first_name,
              last_name: u.last_name,
              phone_number: u.phone_number,
              birthday: u.birthday,
              email: u.email,
              profile_picture: u.profile_picture_url || "",
              client_type: u.client_type_name || "",
              permission: u.permission_name || "",
              Status: u.status || "",
              create_at: u.created_at ? u.created_at.slice(0, 10) : "",
              update_at: u.updated_at ? u.updated_at.slice(0, 10) : "",
              password: "",
              role: "",
            }))
          );
        }
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const { language } = useLanguage();
  const t = translations[language].usersmanage;
  // Alert modal state (replaces native alert)
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
    autoCloseMs?: number | null
  ) {
    setAlertMessage(message);
    setAlertType(type);
    setAlertTitle(title);
    setAlertAutoCloseMs(
      typeof autoCloseMs === "undefined" ? 4000 : autoCloseMs ?? null
    );
    setAlertOpen(true);
  }
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // filteredUsers is already declared below
  const [users, setUsers] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [editUser, setEditUser] = useState<any>(null);

  const filteredUsers =
    filter === "all" ? users : users.filter((u) => u.Status === filter);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const res = await ApiService.toggleUserStatus(id, { status: newStatus });
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.user_id === id ? { ...u, Status: newStatus } : u))
        );
      } else {
        showAlert(
          res.message || "Failed to toggle user status.",
          "error",
          "Error",
          null
        );
      }
    } catch (err: any) {
      showAlert(
        err.message || "Failed to toggle user status.",
        "error",
        "Error",
        null
      );
    }
  };

  // Add User Form State
  const [newUser, setNewUser] = useState({
    username: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    birthday: "",
    password: "",
    email: "",
    role: "Customer",
    permission: "Customer",
    profile_picture: "",
    client_type: "Retail",
    Status: "active",
  });
  const [profilePreview, setProfilePreview] = useState<string>("");

  const handleAddOrEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editUserId !== null) {
      // Prepare payload for update
      const payload: any = {
        username: newUser.username,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        phone_number: newUser.phone_number,
        email: newUser.email,
        permission_id:
          permissions.find((p) => p.permission_name === newUser.permission)
            ?.permission_id || undefined,
        client_type_id:
          clientTypes.find((c) => c.client_type_name === newUser.client_type)
            ?.client_type_id || undefined,
        birthday: newUser.birthday,
        status: newUser.Status,
        profile_picture: undefined as File | undefined,
      };
      // Only include password if not empty
      if (newUser.password && newUser.password.trim() !== "") {
        payload.password = newUser.password;
      }
      if (profilePreview && profilePreview.startsWith("data:")) {
        function dataURLtoFile(dataurl: string, filename: string) {
          const arr = dataurl.split(",");
          const match = arr[0].match(/:(.*?);/);
          const mime = match ? match[1] : "image/jpeg";
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          return new File([u8arr], filename, { type: mime });
        }
        payload.profile_picture = dataURLtoFile(profilePreview, "profile.jpg");
      }
      try {
        const res = await ApiService.updateUser(editUserId, payload);
        if (res.success && res.data) {
          // Optionally, you can re-fetch all users here for up-to-date data
          setUsers((prev) =>
            prev.map((u) =>
              u.user_id === editUserId
                ? {
                    ...u,
                    ...newUser,
                    profile_picture:
                      res.data.profile_picture_url || u.profile_picture,
                    update_at: new Date().toISOString().slice(0, 10),
                  }
                : u
            )
          );
          showAlert("User updated successfully.", "success", "Success");
        } else {
          showAlert(
            res.message || "Failed to update user.",
            "error",
            "Error",
            null
          );
        }
      } catch (err: any) {
        showAlert(
          err.message || "Failed to update user.",
          "error",
          "Error",
          null
        );
      }
      setEditUserId(null);
      // window.location.reload(); // Reload to reflect changes
    } else {
      // Add new (call adminRegister API)
      const payload: any = {
        username: newUser.username,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        phone_number: newUser.phone_number,
        email: newUser.email,
        password: newUser.password,
        permission_id:
          permissions.find((p) => p.permission_name === newUser.permission)
            ?.permission_id || undefined,
        client_type_id:
          clientTypes.find((c) => c.client_type_name === newUser.client_type)
            ?.client_type_id || undefined,
        birthday: newUser.birthday,
        status: newUser.Status,
        profile_picture: undefined as File | undefined,
      };
      if (profilePreview && profilePreview.startsWith("data:")) {
        function dataURLtoFile(dataurl: string, filename: string) {
          const arr = dataurl.split(",");
          const match = arr[0].match(/:(.*?);/);
          const mime = match ? match[1] : "image/jpeg";
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          return new File([u8arr], filename, { type: mime });
        }
        payload.profile_picture = dataURLtoFile(profilePreview, "profile.jpg");
      }
      try {
        const res = await ApiService.adminRegister(payload);
        if (res.success && res.data) {
          setUsers((prev) => [
            ...prev,
            {
              user_id: prev.length + 1,
              ...newUser,
              create_at: new Date().toISOString().slice(0, 10),
              update_at: new Date().toISOString().slice(0, 10),
            },
          ]);
          showAlert(
            "Admin account created successfully.",
            "success",
            "Success"
          );
        } else {
          showAlert(
            res.message || "Failed to create admin account.",
            "error",
            "Error",
            null
          );
        }
      } catch (err: any) {
        showAlert(
          err.message || "Failed to create admin account.",
          "error",
          "Error",
          null
        );
      }
    }
    setNewUser({
      username: "",
      first_name: "",
      last_name: "",
      phone_number: "",
      birthday: "",
      password: "",
      email: "",
      role: "Customer",
      permission: "Customer",
      profile_picture: "",
      client_type: "Retail",
      Status: "active",
    });
    setProfilePreview("");
  };

  // Handle file input for profile picture
  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewUser((prev) => ({
          ...prev,
          profile_picture: reader.result as string,
        }));
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Edit User
  const handleEditClick = (user: any) => {
    setEditUserId(user.user_id);
    setNewUser({
      ...user,
      birthday: user.birthday || "",
      profile_picture: user.profile_picture || "",
    });
    setProfilePreview(user.profile_picture || "");
  };

  const handleEditCancel = () => {
    setEditUserId(null);
    setNewUser({
      username: "",
      first_name: "",
      last_name: "",
      phone_number: "",
      birthday: "",
      password: "",
      email: "",
      role: "Customer",
      permission: "Customer",
      profile_picture: "",
      client_type: "Retail",
      Status: "active",
    });
    setProfilePreview("");
  };

  // Delete User
  const handleDeleteUser = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await ApiService.deleteUser(id);
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u.user_id !== id));
        if (editUserId === id) {
          setEditUserId(null);
          setEditUser(null);
        }
      } else {
        showAlert(
          res.message || "Failed to delete user.",
          "error",
          "Error",
          null
        );
      }
    } catch (err: any) {
      showAlert(
        err.message || "Failed to delete user.",
        "error",
        "Error",
        null
      );
    }
  };

  return (
    <div className="w-full max-w-8xl mx-auto bg-white dark:bg-gray-900  p-8 mt-30 mb-30">
      <h2 className="text-2xl font-extrabold text-red-700 dark:text-red-300 mb-6 text-center">
        {t.manageUsers}
      </h2>
      {/* Add User Container */}
      <div className="mb-8 p-6 bg-red-50 dark:bg-gray-800 rounded-xl shadow">
        <h3 className="text-lg font-bold mb-4 text-red-700 dark:text-red-300">
          {editUserId !== null ? t.editUser : t.addNewUser}
        </h3>
        <form className="space-y-4" onSubmit={handleAddOrEditUser}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col md:col-span-2 items-center mb-2">
              <label className="mb-1 font-semibold text-gray-700 dark:text-gray-200">
                {t.profilePicture}
              </label>
              <label style={{ display: "block", cursor: "pointer" }}>
                <div className="relative w-20 h-20">
                  <Image
                    src={profilePreview || "/400x400_user.png"}
                    alt="Preview"
                    className="w-20 h-20 rounded-full object-cover border border-red-200 dark:border-red-400 bg-gray-100 dark:bg-gray-800"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/default-profile.jpg";
                    }}
                    width={80}
                    height={80}
                  />
                  <span className="absolute bottom-1 right-1 bg-white dark:bg-gray-700 rounded-full p-1 shadow flex items-center justify-center">
                    {editUserId === null ? (
                      // Plus icon
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    ) : (
                      // Pencil icon
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-yellow-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h12"
                        />
                      </svg>
                    )}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    style={{ display: "none" }}
                    aria-label="Change profile picture"
                  />
                </div>
              </label>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-gray-700 dark:text-gray-200">
                {t.username}
              </label>
              <input
                type="text"
                placeholder={t.username}
                className="px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value={safeValue(newUser.username)}
                onChange={(e) =>
                  setNewUser({ ...newUser, username: e.target.value })
                }
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-gray-700 dark:text-gray-200">
                {t.firstName}
              </label>
              <input
                type="text"
                placeholder={t.firstName}
                className="px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value={safeValue(newUser.first_name)}
                onChange={(e) =>
                  setNewUser({ ...newUser, first_name: e.target.value })
                }
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-gray-700 dark:text-gray-200">
                {t.lastName}
              </label>
              <input
                type="text"
                placeholder={t.lastName}
                className="px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value={safeValue(newUser.last_name)}
                onChange={(e) =>
                  setNewUser({ ...newUser, last_name: e.target.value })
                }
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-gray-700 dark:text-gray-200">
                {t.phoneNumber}
              </label>
              <input
                type="text"
                placeholder={t.phoneNumber}
                className="px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value={safeValue(newUser.phone_number)}
                onChange={(e) =>
                  setNewUser({ ...newUser, phone_number: e.target.value })
                }
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-gray-700 dark:text-gray-200">
                {t.email}
              </label>
              <input
                type="email"
                placeholder={t.email}
                className="px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value={safeValue(newUser.email)}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                required
              />
            </div>
            {/* Phone field replaced by Phone Number above */}
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-gray-700 dark:text-gray-200">
                {t.Password}
              </label>
              <input
                type="text"
                placeholder={t.Password}
                className="px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value={safeValue(newUser.password)}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                {...(editUserId === null ? { required: true } : {})}
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-gray-700 dark:text-gray-200">
                {t.permission}
              </label>
              <select
                value={safeValue(newUser.permission)}
                onChange={(e) =>
                  setNewUser({ ...newUser, permission: e.target.value })
                }
                className="px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                disabled={optionsLoading}
              >
                {optionsLoading ? (
                  <option value="">Loading...</option>
                ) : permissions.length > 0 ? (
                  permissions.map((perm) => (
                    <option
                      key={String(perm.permission_id)}
                      value={perm.permission_name}
                    >
                      {perm.permission_name} - {perm.description}
                    </option>
                  ))
                ) : (
                  <option value="">No permissions</option>
                )}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-gray-700 dark:text-gray-200">
                {t.clientType}
              </label>
              <select
                value={safeValue(newUser.client_type)}
                onChange={(e) =>
                  setNewUser({ ...newUser, client_type: e.target.value })
                }
                className="px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                disabled={optionsLoading}
              >
                {optionsLoading ? (
                  <option value="">Loading...</option>
                ) : clientTypes.length > 0 ? (
                  clientTypes.map((ct) => (
                    <option
                      key={String(ct.client_type_id)}
                      value={ct.client_type_name}
                    >
                      {ct.client_type_name} - {ct.description}
                    </option>
                  ))
                ) : (
                  <option value="">No client types</option>
                )}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-gray-700 dark:text-gray-200">
                {t.table.birth_of_date}
              </label>
              <input
                type="date"
                placeholder="Birthday"
                className="px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value={safeValue(newUser.birthday)}
                onChange={(e) =>
                  setNewUser({ ...newUser, birthday: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-gray-700 dark:text-gray-200">
                {t.status}
              </label>
              <select
                value={safeValue(newUser.Status)}
                onChange={(e) =>
                  setNewUser({ ...newUser, Status: e.target.value })
                }
                className="px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="active">{t.active}</option>
                <option value="inactive">{t.inactive}</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="w-full px-6 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition mt-2"
            >
              {editUserId !== null ? t.saveChanges : t.addNewUser}
            </button>
            {editUserId !== null && (
              <button
                type="button"
                className="w-full px-6 py-2 rounded-lg bg-gray-400 text-white font-bold hover:bg-gray-600 transition mt-2"
                onClick={handleEditCancel}
              >
                {t.cancel}
              </button>
            )}
          </div>
        </form>
      </div>
      <div className="flex gap-4 mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="all">{t.all}</option>
          <option value="active">{t.active}</option>
          <option value="inactive">{t.inactive}</option>
        </select>
      </div>
      <div>
        {optionsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
                    <div className="h-3 w-3/4 bg-gray-300 dark:bg-gray-700 rounded" />
                  </div>
                </div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
                <div className="h-3 w-1/2 bg-gray-300 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedUsers.map((u) => (
              <div
                key={u.user_id}
                className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow hover:shadow-lg transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 relative rounded-full overflow-hidden">
                      <Image
                        src={u.profile_picture || "/default-profile.jpg"}
                        alt={u.username || "profile"}
                        className="object-cover"
                        width={56}
                        height={56}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/default-profile.jpg";
                        }}
                      />
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 dark:text-gray-100">
                        {u.username}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {u.first_name} {u.last_name}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs">
                    <span
                      className={
                        u.Status === "active"
                          ? "px-2 py-1 rounded-full text-green-700 bg-green-100 dark:bg-green-900/30"
                          : "px-2 py-1 rounded-full text-gray-600 bg-gray-100 dark:bg-gray-800"
                      }
                    >
                      {u.Status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <div>
                    <strong className="text-gray-700 dark:text-gray-200">
                      {t.phoneNumber}:
                    </strong>{" "}
                    {u.phone_number || "-"}
                  </div>
                  <div>
                    <strong className="text-gray-700 dark:text-gray-200">
                      {t.email}:
                    </strong>{" "}
                    {u.email || "-"}
                  </div>
                  <div>
                    <strong className="text-gray-700 dark:text-gray-200">
                      {t.permission}:
                    </strong>{" "}
                    {u.permission || "-"}
                  </div>
                  <div>
                    <strong className="text-gray-700 dark:text-gray-200">
                      {t.clientType}:
                    </strong>{" "}
                    {u.client_type || "-"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t.table.createdAt}: {u.create_at} • {t.table.updatedAt}:{" "}
                    {u.update_at}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  {u.permission !== "Admin" && (
                    <>
                      <button
                        className="flex-1 px-3 py-2 rounded bg-blue-500 text-white text-sm font-bold hover:bg-blue-700 transition"
                        onClick={() => handleEditClick(u)}
                        type="button"
                      >
                        {t.edit}
                      </button>
                      <button
                        className="px-3 py-2 rounded bg-red-500 text-white text-sm font-bold hover:bg-red-700 transition"
                        onClick={() => handleDeleteUser(u.user_id)}
                        type="button"
                      >
                        {t.delete}
                      </button>
                      <button
                        className="px-3 py-2 rounded bg-gray-500 text-white text-sm font-bold hover:bg-gray-700 transition"
                        onClick={() => handleToggleStatus(u.user_id, u.Status)}
                        type="button"
                      >
                        {u.Status === "active" ? t.deactivate : t.activate}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex justify-center items-center mt-6">
          <nav className="inline-flex gap-2">
            <button
              type="button"
              className={`px-3 py-1 rounded-lg font-bold border border-red-300 dark:border-gray-700 text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 ${
                currentPage === 1
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-red-100 dark:hover:bg-gray-800"
              }`}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              {t.prev}
            </button>
            {[...Array(Math.max(totalPages, 1))].map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`px-3 py-1 rounded-lg font-bold border border-red-300 dark:border-gray-700 ${
                  currentPage === idx + 1
                    ? "bg-red-700 text-white"
                    : "bg-white dark:bg-gray-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-gray-800"
                }`}
                onClick={() => setCurrentPage(idx + 1)}
              >
                {idx + 1}
              </button>
            ))}
            <button
              type="button"
              className={`px-3 py-1 rounded-lg font-bold border border-red-300 dark:border-gray-700 text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 ${
                currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-red-100 dark:hover:bg-gray-800"
              }`}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              {t.next}
            </button>
          </nav>
          <span className="ml-4 text-sm text-gray-700 dark:text-gray-200">
            {t.perPage} 10 {t.table.action}
          </span>
        </div>
      </div>
      {/* Alert modal host */}
      <AlertModal
        open={alertOpen}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        autoCloseMs={alertAutoCloseMs}
        onClose={() => setAlertOpen(false)}
      />
    </div>
  );
}
