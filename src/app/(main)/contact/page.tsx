"use client";
import React, { useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faLine } from "@fortawesome/free-brands-svg-icons";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/utils/translation";
import AlertModal from "@/component/AlertModal";

export default function ContactPage() {
  const { language } = useLanguage();
  const t = translations[language].contact;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSent(true);
          setName("");
          setEmail("");
          setMessage("");
          showAlert("ส่งข้อความเรียบร้อย", "success", "สำเร็จ", 2000);
        } else {
          showAlert(
            "ส่งข้อความไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
            "error",
            "ข้อผิดพลาด",
            null
          );
        }
      })
      .catch(() => {
        showAlert(
          "เกิดข้อผิดพลาดในการส่ง กรุณาลองใหม่อีกครั้ง",
          "error",
          "ข้อผิดพลาด",
          null
        );
      });
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-red-50 to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-[90vw] max-w-6xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 flex flex-col items-center">
        <Image
          src="/Logo.png"
          alt="TTKI Logo"
          width={80}
          height={45}
          className="mb-4 rounded-lg"
        />
        <h1 className="text-3xl font-extrabold text-red-700 dark:text-red-300 mb-2">
          {t.contactUs}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
          {t.haveQuestions}
        </p>
        <div className="w-full flex flex-col md:flex-row gap-8 mb-8">
          <div className="flex-1 px-8 md:px-16">
            <h2 className="text-lg font-bold text-red-700 dark:text-red-300 mb-2">
              {t.companyInfo}
            </h2>
            <p className="text-gray-700 dark:text-gray-200 mb-1">
              TTKI Autoparts Co., Ltd.
            </p>
            <p className="text-gray-700 dark:text-gray-200 mb-1">
              58/18 Moo 2, Bangphun, Muang, Pathumthani 12000, Thailand
            </p>
            <p className="text-gray-700 dark:text-gray-200 mb-1 ">
              {t.phone}:{" "}
              <a
                href="tel:+6625672814"
                className="text-red-600 dark:text-red-400 font-bold"
              >
                (66) 2567-2814
              </a>
              ,{" "}
              <a
                href="tel:+6625672815"
                className="text-red-600 dark:text-red-400 font-bold"
              >
                (66) 2567-2815
              </a>
              ,{" "}
              <a
                href="tel:+6625672816"
                className="text-red-600 dark:text-red-400 font-bold"
              >
                (66) 2567-2816
              </a>
              , <br />
              <a
                href="tel:+66632240072"
                className="text-red-600 dark:text-red-400 font-bold"
              >
                (66) 63-224-0072
              </a>
            </p>
            <p className="text-gray-700 dark:text-gray-200 mb-1">
              {t.email}:{" "}
              <a
                href="mailto:ttiki.sale02@gmail.com"
                className="text-red-600 dark:text-red-400 font-bold"
              >
                ttiki.sale02@gmail.com
              </a>
              ,{" "}
              <a
                href="mailto:tc.allenchen@hotmail.com"
                className="text-red-600 dark:text-red-400 font-bold"
              >
                tc.allenchen@hotmail.com
              </a>
            </p>
            <div className="flex gap-4 mt-2 mb-1">
              <a
                href="https://www.facebook.com/ttiki.co.th/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-red-600 dark:text-red-400 font-bold hover:scale-110 transition-transform"
                aria-label="TTKI Facebook"
              >
                <FontAwesomeIcon icon={faFacebook} className="" />
              </a>
              <a
                href="https://line.me/ti/p/lUyS38ORuE"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-green-500 dark:text-green-400 font-bold hover:scale-110 transition-transform "
                aria-label="TTKI Line Application"
                title={t.contactUs}
              >
                <FontAwesomeIcon icon={faLine} className="" />
              </a>
            </div>
          </div>
          <form className="flex-1 flex flex-col gap-4" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder={t.fullName}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-4 py-3 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
            />
            <input
              type="email"
              placeholder={t.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
            />
            <textarea
              placeholder={t.yourMessage}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="px-4 py-3 rounded-lg border border-red-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 focus:outline-none text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-[100px]"
              required
            />
            <button
              type="submit"
              className="w-full py-3 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white font-bold rounded-lg shadow-lg transition-all text-lg"
            >
              {t.sendMessage}
            </button>
            {sent && (
              <div className="text-green-600 text-sm font-bold text-center mt-2">
                {t.thankYouMessage}
              </div>
            )}
          </form>
        </div>
        {/* Google Map */}
        <div className="w-full mt-8 rounded-2xl overflow-hidden shadow-lg">
          <iframe
            title="TTKI Autoparts Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3871.568045946214!2d100.5934049758676!3d13.984297691866711!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e281bfe63f99af%3A0x460cec30f7f41d8f!2sTT(I.K.I)%20AUTOPARTS%20CO.%2C%20LTD!5e0!3m2!1szh-TW!2sth!4v1753160143972!5m2!1szh-TW!2sth"
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-[300px] border-0"
          ></iframe>
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
    </main>
  );
}
