import React, { useEffect, useState } from 'react';
import Logo from '../../images/logo/image.png';
import { NavLink } from 'react-router-dom';
import { FaCcMastercard, FaChevronDown, FaChevronUp, FaMagic } from 'react-icons/fa';

import {
  FaCog,FaUsers,FaFileAlt,FaUserCircle,FaHome,FaBell,FaUser,FaFolder,FaPills,FaSearch,FaUserCheck,
  FaCashRegister, FaFlask, FaBuilding, FaExchangeAlt, FaShieldAlt, FaVideo, FaListUl, FaUserShield,
  FaKey,FaIdBadge,FaCreditCard,FaCloudUploadAlt,FaUsersCog,FaTag,FaCommentAlt,FaClipboardList,
  FaStethoscope,FaUserInjured,FaHospital,FaUserMd,FaFirstAid,FaHistory,FaClipboardCheck,
  FaMoneyBillWave,FaHeartbeat,FaFileMedical,FaCalendarCheck,FaMoneyCheckAlt,FaFileExport,FaPoll,FaCalendarAlt,
} from 'react-icons/fa';
import { MdDateRange, MdDashboard, MdLocalHospital } from 'react-icons/md';

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
  Home: { icon: <FaHome />, route: '/homePage' },
  Dashboard: { icon: <MdDashboard />, route: '/dashboard' },
  Appointment: { icon: <FaCalendarAlt />, route: '#' },
  Calender: { icon: <MdDateRange />, route: '/calendar' },
  Search: { icon: <FaSearch />, route: '#' },
  'Manage Availablilty': {
    icon: <FaUserCheck />,
    // route: '/manage-availability',
    route: '/dashboard',
  },
  PatientRecord: { icon: <FaUsers />, route: '/patientRecord' ,},
  'CheckIN/OUT': { icon: <FaUserCheck />, route: '/dashboard' },
  Payment: { icon: <FaCashRegister />, route: '/dashboard' },
  Medical: { icon: <FaFileMedical />, route: '/dashboard' },
  Priscription: { icon: <FaPills />, route: '/dashboard' },
  History: { icon: <FaHistory />, route: '#' },
  VisitorPass: { icon: <FaIdBadge />, route: '/visitorplan' },
  Reports: { icon: <FaFileAlt />, route: '#' },
  Subscriptions: { icon: <FaCreditCard />, route: '/subscription' },
  DocumentUpload: { icon: <FaCloudUploadAlt />, route: '/doctorProfile' },
  UserManagement: { icon: <FaUsersCog />, route: '#' },
  Events: { icon: <FaCalendarCheck />, route: '#' },
  Offers: { icon: <FaTag />, route: '/offers' },
  FeedBack: { icon: <FaCommentAlt />, route: '/feedback' },
  Settings: { icon: <FaCog />, route: '#' },
  Tenant: { icon: <FaBuilding />, route: '/tenant' },
  Lab: { icon: <FaFlask />, route: '/search/lab' },
  LabProfile: { icon: <FaFlask />, route: '/LabProfile' },
  UploadedDocument: { icon: <FaCloudUploadAlt />, route: '/document-upload' },
  LOVMasters: { icon: <FaMagic />, route: '/Masters/LovMasters' },
  DoctorProfile: { icon: <FaUserMd />, route: '/doctorProfile' },
  PatientProfile: { icon: <FaUserInjured />, route: '/patientFormWizard' },
  HospitalRegister: { icon: <FaBuilding />, route: '/hospital' },
  // Submenus
  Booking: { icon: <FaClipboardList />, route: '/appointment/booking' },
  'View Available Slot': {
    icon: <FaStethoscope />,
    route: '/appointment/view-available-slots',
  },
  Patient: { icon: <FaUserInjured />, route: '/search/patient' },
  Appointments: { icon: <FaHospital />, route: '/search/appointment' },
  LabRegister: { icon: <FaFlask />, route: '/Registration/LabRegistration' },
  DoctorRegister: { icon: <FaUserMd />, route: '/DoctorRegistration' },
  Hospital: { icon: <MdLocalHospital />, route: '/search/hospital' },
  Doctors: { icon: <FaUserMd />, route: '/search/doctors' },
  Medicals: { icon: <FaFirstAid />, route: '/search/medicals' },
  PatientHistory: { icon: <FaUser />, route: '/history/patienthistory' },
  AppointmentHistory: {
    icon: <FaClipboardCheck />,
    route: '/history/appointmenthistory',
  },
  PaymentHistory: {
    icon: <FaMoneyBillWave />,
    route: '/history/paymenthistory',
  },
  FamilyMedicalHistory: {
    icon: <FaHeartbeat />,
    route: '/history/familymedicalhistory',
  },
  DoctorsReport: { icon: <FaFileMedical />, route: '/reports/doctorreport' },
  AppointmentsReport: {
    icon: <FaCalendarCheck />,
    route: '/reports/appointmentreport',
  },
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
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  useEffect(() => {
    const storedUserID = sessionStorage.getItem('userID');

    if (storedUserID) {
      console.log('Stored User ID:', storedUserID);

      const fetchUserMenu = async () => {
        try {
          const response = await fetch(
            `https://predart003-001-site1.anytempurl.com/api/Login/${storedUserID}`,
          );

          if (!response.ok) {
            throw new Error('Failed to fetch user menu data');
          }

          const apiResponse = await response.json();
          console.log('API Response:', apiResponse);

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

  const buildMenuTree = (items: MenuItem[]) => {
    const menuTree: Record<string, MenuItem[]> = {};
    const rootItems: MenuItem[] = [];

    items.forEach((item) => {
      if (item.parentID === null) {
        rootItems.push(item);
      } else {
        if (!menuTree[item.parentID]) {
          menuTree[item.parentID] = [];
        }
        menuTree[item.parentID].push(item);
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

  const toggleDropdown = (parentID: string) => {
    setOpenMenus((prevState) =>
      prevState.includes(parentID)
        ? prevState.filter((id) => id !== parentID)
        : [...prevState, parentID],
    );
  };

  return (
    <aside
  className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-auto bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
  style={{ scrollbarWidth: 'thin', scrollbarColor: '#555 #222' }} // Custom scrollbar for Firefox
>



<div className="flex items-center px-4 py-4 lg:py-6">
  <img src={Logo} alt="CarePoint Pro Logo" className="h-10 w-10 mr-3" />
  <h1 className="font-semibold text-white text-xl">CarePoint Pro</h1>
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
                    return;
                  }
                  toggleDropdown(parent.menuID);
                }}
              >
                <div className="text-xl mr-5">
                  {iconMapping[parent.title]?.icon || <FaFolder />}
                </div>
                <span className="text-xl">{parent.title}</span>

                {menuTree[parent.menuID] && (
                  <span className="ml-auto text-x">
                    {openMenus.includes(parent.menuID) ? (
                      <FaChevronUp />
                    ) : (
                      <FaChevronDown />
                    )}
                  </span>
                )}
              </NavLink>

              {openMenus.includes(parent.menuID) && menuTree[parent.menuID] && (
                <div className="ml-6 mt-2 space-y-2">
                  {menuTree[parent.menuID].map((child) => (
                    <NavLink
                      key={child.menuID}
                      to={iconMapping[child.title]?.route || '#'}
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
       aside::-webkit-scrollbar {
  width: 6px;
}

aside::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3); /* Light-colored scrollbar */
  border-radius: 10px;
}

aside::-webkit-scrollbar-track {
  background: transparent; /* Removes white background */
}


      `}</style>
    </aside>
  );
};

export default Sidebar;
