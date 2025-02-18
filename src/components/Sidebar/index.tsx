import React, { useEffect, useState } from 'react';
import Logo from '../../images/logo/logo-icon.svg';
import { NavLink } from 'react-router-dom';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

import {
  FaCog,
  FaUsers,
  FaFileAlt,
  FaUserCircle,
  FaHome,
  FaBell,
  FaUser,
  FaFolder,
  FaPills,
  FaSearch,
  FaUserCheck,
  FaCashRegister,
  FaFlask,
  FaBuilding,
  FaExchangeAlt,
  FaShieldAlt,
  FaVideo,
  FaListUl,
  FaUserShield,
  FaKey,
  FaIdBadge,
  FaCreditCard,
  FaCloudUploadAlt,
  FaUsersCog,
  FaTag,
  FaCommentAlt,
  FaClipboardList,
  FaStethoscope,
  FaUserInjured,
  FaAddressCard,
  FaHospital,
  FaUserMd,
 
  FaFirstAid,
  FaHistory,
  FaClipboardCheck,
  FaMoneyBillWave,
  FaHeartbeat,
  FaFileMedical,
  FaCalendarCheck,
  FaMoneyCheckAlt,
  FaFileExport,
  FaPoll,
  FaCalendarAlt,
} from 'react-icons/fa';
import { MdDateRange, MdDashboard,MdLocalHospital} from 'react-icons/md';

// Define types
interface MenuItem {
  roleName: string;
  roleID: string;
  menuID: string;
  parentID: string | null;
  order: number;
  title: string;
}

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

// Define icons and routes
const iconMapping: Record<string, { icon: JSX.Element; route: string }> = {
  Home: { icon: <FaHome />, route: '/' },
  Dashboard: { icon: <MdDashboard />, route: '/dashboard' },
  Appointment: { icon: <FaCalendarAlt />, route: '#' },
  Calender: { icon: <MdDateRange />, route: '/calendar' },
  Search: { icon: <FaSearch />, route: '#' },
  'Manage Availablilty': { icon: <FaUserCheck />, route: '/manage-availability' },
  PatientRecord: { icon: <FaUsers />, route: '/patient-record' },
  'CheckIN/OUT': { icon: <FaUserCheck />, route: '/check-in-check-out' },
  Payment: { icon: <FaCashRegister />, route: '/payment' },
  Medical: { icon: <FaFileMedical />, route: '/medical' },
  Priscription: { icon: <FaPills />, route: '/prescription' },
  History: { icon: <FaHistory />, route: '#' },
  VisitorPass: { icon: <FaIdBadge />, route: '/visitorplan' },
  Reports: { icon: <FaFileAlt />, route: '#' },
  Subscriptions: { icon: <FaCreditCard />, route: '/subscription' },
  DocumentUpload: { icon: <FaCloudUploadAlt />, route: '/document-upload' },
  UserManagement: { icon: <FaUsersCog />, route: '#' },
  Offers: { icon: <FaTag />, route: '/offers' },
  FeedBack: { icon: <FaCommentAlt />, route: '/feedback' },
  Settings: { icon: <FaCog />, route: '#' },
  Tenant: { icon: <FaBuilding />, route: '/tenant' },
  Lab: { icon: <FaFlask />, route: '/labRegistration' },
  // Submenus
  Booking: { icon: <FaClipboardList />, route: '/appointment/booking' },
  'View Available Slot': { icon: <FaStethoscope />, route: '/appointment/view-available-slots' },
  Patient: { icon: <FaUserInjured />, route: '/search/patient' },
  Appointments: { icon: <FaHospital />, route: '/search/appointment' },
  Lab: { icon: <FaFlask />, route: '/search/lab' },
  Hospital: { icon: <MdLocalHospital  />, route: '/search/hospital' },
  Doctors: { icon: <FaUserMd />, route: '/search/doctors' },
  Medicals: { icon: <FaFirstAid />, route: '/search/medicals' },
  PatientHistory: { icon: <FaUser />, route: '/history/patienthistory' },
  AppointmentHistory: { icon: <FaClipboardCheck />, route: '/history/appointmenthistory' },
  PaymentHistory: { icon: <FaMoneyBillWave />, route: '/history/paymenthistory' },
  FamilyMedicalHistory: { icon: <FaHeartbeat />, route: '/history/familymedicalhistory' },
  DoctorsReport: { icon: <FaFileMedical />, route: '/reports/doctorreport' },
  AppointmentsReport: { icon: <FaCalendarCheck />, route: '/reports/appointmentreport' },
  PaymentReport: { icon: <FaMoneyCheckAlt />, route: '/reports/paymentreport' },
  DischargeReport: { icon: <FaFileExport />, route: '/reports/chargereport' },
  SurveyReport: { icon: <FaPoll />, route: '/reports/surveyreport' },
  EventReport: { icon: <FaCalendarAlt />, route: '/reports/eventreport' },
  Users: { icon: <FaUserCircle />, route: '/usersmanagement/users' },
  Menus: { icon: <FaListUl />, route: '/usersmanagement/menus' },
  Roles: { icon: <FaUserShield />, route: '/usersmanagement/roles' },
  Rights: { icon: <FaKey />, route: '/usersmanagement/rights' },
  AssignRole: { icon: <FaUsersCog />, route: '/usersmanagement/assignrole' },
  Transfer: { icon: <FaExchangeAlt />, route: '/usersmanagement/transfer' },
  Conference: { icon: <FaVideo />, route: '/events/conference' },
  MedicalCamp: { icon: <FaHeartbeat />, route: '/events/medicalcamp' },
  Survey: { icon: <FaPoll />, route: '/events/survey' },
  Profile: { icon: <FaUserCircle />, route: '/settings/profile' },
  Communication: { icon: <FaCommentAlt />, route: '/settings/communication' },
  Privacy: { icon: <FaShieldAlt />, route: '/settings/privacy' },
  Family: { icon: <FaUsers />, route: '/settings/family' },
  Notification: { icon: <FaBell />, route: '/settings/notification' },

  default: { icon: <FaFolder />, route: '/default' },
};

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [openMenus, setOpenMenus] = useState<string[]>([]); // To manage open state of dropdowns

  useEffect(() => {
    const storedUserID = sessionStorage.getItem('userID');

    if (storedUserID) {
      console.log('Stored User ID:', storedUserID);

      // Fetch API data using the userID from sessionStorage
      const fetchUserMenu = async () => {
        try {
          const response = await fetch(
            `https://predart003-001-site1.anytempurl.com/api/Login/${storedUserID}`
          );

          if (!response.ok) {
            throw new Error('Failed to fetch user menu data');
          }

          const apiResponse = await response.json();
          console.log('API Response:', apiResponse); // Console log the API response

          if (apiResponse.data && Array.isArray(apiResponse.data)) {
            setMenuItems(apiResponse.data);
          }
        } catch (error) {
          console.error('Error fetching user menu data:', error);
        }
      };

      fetchUserMenu();
    } else {
      console.warn('No User ID found in session storage.');
    }
  }, []);

  // Function to organize the menu items into parent-child structure
  const buildMenuTree = (items: MenuItem[]) => {
    const menuTree: Record<string, MenuItem[]> = {};
    const rootItems: MenuItem[] = [];

    items.forEach((item) => {
      if (item.parentID === null) {
        rootItems.push(item);  // Add to root if no parent
      } else {
        if (!menuTree[item.parentID]) {
          menuTree[item.parentID] = [];
        }
        menuTree[item.parentID].push(item);  // Group under parentID
      }
    });

    // Sort root items and child items
    rootItems.sort((a, b) => a.order - b.order);
    Object.keys(menuTree).forEach((parentID) => {
      if (menuTree[parentID]) {
        menuTree[parentID].sort((a, b) => a.order - b.order);
      }
    });

    return { rootItems, menuTree };
  };

  const { rootItems, menuTree } = buildMenuTree(menuItems);

  // Function to toggle dropdowns for submenus
  const toggleDropdown = (parentID: string) => {
    setOpenMenus((prevState) =>
      prevState.includes(parentID)
        ? prevState.filter((id) => id !== parentID)
        : [...prevState, parentID]
    );
  };

  // Rendering function for the menu tree
  return (
    <aside
      className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="flex items-center px-4 py-4 lg:py-6">
        <img src={Logo} alt="CarePoint Pro Logo" className="h-6 mr-2" />
        <h1 className="font-semibold text-white text-sm">CarePoint Pro</h1>
      </div>
      <div className="sidebar-menu overflow-y-auto flex-1">
        <nav>
          {rootItems.map((parent) => (
            <div key={parent.menuID} className="p-4">
             <NavLink
  to={iconMapping[parent.title]?.route || '#'}
  className="flex items-center text-white font-semibold text-base cursor-pointer"
  onClick={() => {
    if (!menuTree[parent.menuID]) {
      // Only navigate if there are no submenus
      return;
    }
    toggleDropdown(parent.menuID);
  }}
>

                <div className="text-xl mr-5">
                  {iconMapping[parent.title]?.icon || <FaFolder />} {/* Dynamically load the icon */}
                </div>
                <span className="text-xl">{parent.title}</span>

                {/* Dropdown arrow */}
                {menuTree[parent.menuID] && (
                  <span className="ml-auto text-x">
                    {openMenus.includes(parent.menuID) ? <FaChevronUp /> : <FaChevronDown />}
                  </span>
                )}
              </NavLink>

              {/* Render Child Items (Submenus) */}
              {openMenus.includes(parent.menuID) && menuTree[parent.menuID] && (
                <div className="ml-6 mt-2 space-y-2">
                  {menuTree[parent.menuID].map((child) => (
                    <NavLink
                      key={child.menuID}
                      to={iconMapping[child.title]?.route || '#'}  // Dynamically set the route
                      className="flex items-center text-white text-md ml-5"
                    >
                      <div className="text-xl mr-3">
                        {iconMapping[child.title]?.icon || <FaFolder />}
                      </div>
                      <span className="text-x">{child.title}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
      <style jsx>{`
        /* Hide the scrollbar but keep the scrolling */
.sidebar-menu {
  overflow-y: auto;
}

.sidebar-menu::-webkit-scrollbar {
  display: none; /* Hide the scrollbar */
}

.sidebar-menu {
  -ms-overflow-style: none;  /* IE 10+ */
  scrollbar-width: none;  /* Firefox */
}

      `}</style>
    </aside>
  );
};

export default Sidebar;
