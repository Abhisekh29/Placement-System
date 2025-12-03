import React, { useEffect, useState } from "react";

const Header = () => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000); // update every second
    return () => clearInterval(timer); // cleanup on unmount
  }, []);

  return (
    <nav className="flex justify-between items-center py-2 px-10 bg-blue-500 text-white">
      <div className="w-50">
        <img src="logo.png" alt="" />
      </div>

      <div className="flex flex-col items-center text-center">
        <a href="https://gauhati.ac.in/" className="text-sm hover:underline">
          Gauhati University Home
        </a>
        <span className="text-xs mt-1">
          {dateTime.toLocaleDateString()} {dateTime.toLocaleTimeString()}
        </span>
      </div>
    </nav>
  );
};

export default Header;
