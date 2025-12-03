import React from "react";

const Footer = () => {
  return (
    <>
      <footer className="flex justify-between items-center py-2 px-10 bg-gray-600 text-white">
        {/* Left - Logo */}
        <div className="w-50">
          <img src="/logo.png" alt="Logo" />
        </div>

        <div>
          <p>© Gauhati University 2025. All Rights Reserved</p>
        </div>

        {/* Right - Contact Us */}
        <div className="flex flex-col items-center text-center text-sm">
          <h3 className="font-semibold">Contact Us</h3>
          <p>Department of Information Technology</p>
          <p>Gauhati University, Guwahati 14, Assam, India</p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
