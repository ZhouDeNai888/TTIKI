import React from "react";

const Footer: React.FC = () => (
  <footer className="py-10 bg-gradient-to-r from-red-700 via-red-600 to-red-700 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-white text-center text-base shadow-inner">
    <div className="mb-2 font-bold tracking-wide">
      TT (I.K.I.) Autoparts Co., Ltd.
    </div>
    <div>&copy; {new Date().getFullYear()} All rights reserved.</div>
  </footer>
);

export default Footer;
