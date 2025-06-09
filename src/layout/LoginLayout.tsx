import React from 'react';
import { Outlet } from 'react-router-dom';
import LogoIcon from '../images/carepointpro/logo-bg.png';
import Auth from '../js/auth';

const LoginLayout = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-[70px] bg-[#deeeff] flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center space-x-3">
          <img src={LogoIcon} className="h-14" alt="Logo" />
          <h1 className="text-4xl font-eduHand font-SemiBold-600 tracking-wide">
            <span className="text-[#1e3a8a]">P</span>
            <span className="bg-gradient-to-r from-[#1e3a8a] to-[#fca150] bg-clip-text text-transparent">
              re
            </span>
            <span className="text-[#1e3a8a]">C</span>
            <span className="bg-gradient-to-r from-[#1e3a8a] to-[#fca150] bg-clip-text text-transparent">
              are
            </span>
          </h1>
        </div>
        {/* Nav */}
        <nav className="border-gray-200 dark:bg-gray-900">
          <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto px-0 py-4">
            <div
              className="hidden w-full md:block md:w-auto"
              id="navbar-default"
            >
              <ul className="font-medium flex flex-col items-center p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 dark:border-gray-700">
                <li>
                  <a
                    href="#"
                    className="block py-2 px-3 md:p-0 hover:text-blue-700"
                  >
                    Find Doctors
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="block py-2 px-3 md:p-0 hover:text-blue-700"
                  >
                    Video Consult
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="block py-2 px-3 md:p-0 hover:text-blue-700"
                  >
                    Surgeries
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="block py-2 px-3 md:p-0 hover:text-blue-700"
                  >
                    Medicines
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      {/* Main */}
      <main className="flex-grow overflow-y-auto bg-white">
        <div className="flex items-center justify-center h-full px-4 py-6">
          <div className="w-full max-w-5xl">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-[80px] bg-[#deeeff] px-4 py-4 text-sm text-gray-700 shrink-0 z-10">
        <div className="flex justify-between items-center flex-wrap">
          <div className="flex items-center gap-2">
            <img src={LogoIcon} className="h-8" alt="Logo" />
            <h1 className="text-4xl font-eduHand font-SemiBold-600 tracking-wide">
              <span className="text-[#1e3a8a]">P</span>
              <span className="bg-gradient-to-r from-[#1e3a8a] to-[#fca150] bg-clip-text text-transparent">
                re
              </span>
              <span className="text-[#1e3a8a]">C</span>
              <span className="bg-gradient-to-r from-[#1e3a8a] to-[#fca150] bg-clip-text text-transparent">
                are
              </span>
            </h1>
          </div>
          <ul className="flex gap-4 mt-2 md:mt-0">
            <li>
              <a href="#" className="hover:underline">
                About
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Licensing
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Contact
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
};

export default LoginLayout;
