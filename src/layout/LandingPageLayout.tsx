import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import LogoIcon from '../images/carepointpro/main__logo.png';
import '../scss/landingpage.scss';
import Auth from '../js/auth';
import { Outlet } from 'react-router-dom';

const LandingPageLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div>
      <div className="cpp__wrapper">
        <div className="cpp__container ">
          <header className="bg-[#deeeff]">
            <div className="container mx-auto">
              <nav className="border-gray-200 dark:bg-gray-900">
                <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto px-0 py-4">
                  <Link
                    className="flex items-center space-x-3 rtl:space-x-reverse"
                    to="/"
                  >
                    <img
                      src={LogoIcon}
                      className="h-14"
                      alt="CarePointPro Logo"
                    />
                  </Link>
                  <button
                    data-collapse-toggle="navbar-default"
                    type="button"
                    className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                    aria-controls="navbar-default"
                    aria-expanded="false"
                  >
                    <span className="sr-only">Open main menu</span>
                    <svg
                      className="w-5 h-5"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 17 14"
                    >
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M1 1h15M1 7h15M1 13h15"
                      />
                    </svg>
                  </button>
                  <div
                    className="hidden w-full md:block md:w-auto"
                    id="navbar-default"
                  >
                    <ul className="font-medium flex flex-col items-center p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0  dark:border-gray-700">
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
                      <li>
                        <Auth />
                      </li>
                    </ul>
                  </div>
                </div>
              </nav>
            </div>
          </header>
          <main><Outlet /></main>
          <footer className="bg-[#deeeff]">
            <div className="container">
              <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto">
                <div className="rounded-lg dark:bg-gray-900 w-full">
                  <div className="w-full max-w-screen-xl mx-auto py-4 md:py-8">
                    <div className="sm:flex sm:items-center sm:justify-between">
                      <Link
                      className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse"
                      to="/">
                        <img
                          src={LogoIcon}
                          className="h-8"
                          alt="CarePointPro Logo"
                        />
                      </Link>
                      <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 dark:text-gray-400">
                        <li>
                          <a href="#" className="hover:underline me-4 md:me-6">
                            About
                          </a>
                        </li>
                        <li>
                          <a href="#" className="hover:underline me-4 md:me-6">
                            Privacy Policy
                          </a>
                        </li>
                        <li>
                          <a href="#" className="hover:underline me-4 md:me-6">
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
                    <hr className="my-6 border-gray-400 sm:mx-auto dark:border-gray-700 lg:mt-4 lg:mb-2" />
                    <span className="block text-sm text-gray-500 dark:text-gray-400">
                      © 2024{' '}
                      <a
                        href="https://carepointpro.in/"
                        className="hover:underline"
                      >
                        carepointpro.in
                      </a>
                      . All Rights Reserved.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default LandingPageLayout;
