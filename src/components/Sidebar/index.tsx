import React, { useEffect, useState } from 'react';
import Logo from '../../images/logo/logo-icon.svg';
import { NavLink } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaCog,
  FaUsers,
  FaFileAlt,
  FaUserCircle,
  FaSlidersH,
  FaHome,
  FaBell,
  FaChartBar,
  FaUser,
  FaComments,
  FaFolder,
  FaPills,
  FaSearch,
  FaUserCheck,
  FaCashRegister,
  FaUserCog,
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
  FaFlask,
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
  FaAngleRight,
  FaAngleDown
} from 'react-icons/fa';
import { MdDateRange, MdDashboard } from 'react-icons/md';

// Define types
interface MenuItem {
  menuID: number;
  title: string;
  parentID: number | null;
  route: string;
}

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const [menuData, setMenuData] = useState<MenuItem[]>([]);
  const [expandedMenus, setExpandedMenus] = useState<number[]>([]);

  // Comprehensive icon and route mapping
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
    Events: { icon: <FaCalendarAlt />, route: '#' },
    DocumentUpload: { icon: <FaCloudUploadAlt />, route: '/document-upload' },
    UserManagement: { icon: <FaUsersCog />, route: '#' },
    Offers: { icon: <FaTag />, route: '/offers' },
    FeedBack: { icon: <FaCommentAlt />, route: '/feedback' },
    Settings: { icon: <FaCog />, route: '#' },

    // Submenus
    Booking: { icon: <FaClipboardList />, route: '/appointment/booking' },
    'View Available Slot': { icon: <FaStethoscope />, route: '/appointment/view-available-slots' },
    Patient: { icon: <FaUserInjured />, route: '/search/patient' },
    Appointments: { icon: <FaAddressCard />, route: '/search/appointment' },
    Hospital: { icon: <FaHospital />, route: '/search/hospital' },
    Doctors: { icon: <FaUserMd />, route: '/search/doctors' },
    Lab: { icon: <FaFlask />, route: '/search/lab' },
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
    Menus: { icon: <FaListUl />, route: '/usersmanagement/menus' }, // Menus icon and URL
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

    default: { icon: <FaFolder />, route: '/default' }, // Default icon and URL
  };

  useEffect(() => {
    // Simulated API call (replace with actual API response logic)
    const storedData = sessionStorage.getItem('menuTitles');
    if (storedData) {
      try {
        const parsedData: MenuItem[] = JSON.parse(storedData);
        setMenuData(parsedData);
      } catch (error) {
        console.error('Error parsing menu data:', error);
      }
    }
  }, []);

  const toggleMenu = (menuID: number) => {
    setExpandedMenus((prev) =>
      prev.includes(menuID) ? prev.filter((id) => id !== menuID) : [...prev, menuID]
    );
  };

  const renderMenu = (parentID: number | null): JSX.Element[] => {
    const childMenus = menuData.filter((menu) => menu.parentID === parentID);

    return childMenus.map((menu) => {
      // Get icon and route from iconMapping
      const { icon, route } = iconMapping[menu.title] || iconMapping['default'];

      const menuUrl = menu.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');

      return (
        <div key={menu.menuID} className={`ml-${parentID ? 4 : 0}`}>
          <div
            className="flex justify-between items-center bg-gray-800 text-white p-2 rounded cursor-pointer hover:bg-gray-700"
            onClick={() => toggleMenu(menu.menuID)}
          >
            <div className="flex items-center">
              <div className="text-lg mr-2">{icon}</div>
              <NavLink
                to={route} 
                // className={({ isActive }) =>
                //   `group relative flex items-center rounded-sm font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                //     isActive ? 'bg-graydark dark:bg-meta-4' : ''
                //   }`
                // }
              >
                {menu.title}
              </NavLink>
            </div>
            {menuData.some((child) => child.parentID === menu.menuID) && (
              <span>{expandedMenus.includes(menu.menuID) ? <FaAngleDown /> : <FaAngleRight />}</span>
            )}
          </div>
          {expandedMenus.includes(menu.menuID) && (
            <div className="pl-4">{renderMenu(menu.menuID)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <aside
  className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
  }`}
>
  {/* SIDEBAR HEADER */}
  <div className="flex items-center px-4 py-4 lg:py-6">
    <img src={Logo} alt="CarePoint Pro Logo" className="h-6 mr-2" />
    <h1 className="font-semibold text-white text-sm">CarePoint Pro</h1>

    <button
      onClick={() => setSidebarOpen(!sidebarOpen)}
      aria-controls="sidebar"
      aria-expanded={sidebarOpen}
      className="block lg:hidden ml-auto"
    >
      <svg
        className="fill-current"
        width="20"
        height="18"
        viewBox="0 0 20 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
          fill=""
        />
      </svg>
    </button>
  </div>

  {/* Sidebar Menu */}
  <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
    <nav className="mt-4 py-2 px-4 lg:mt-6 lg:px-6">
      {/* Menu Group */}
      <div>
        <h3 className="mb-3 ml-3 text-xs font-semibold text-bodydark2">MENU</h3>

        {/* Render Menu Items */}
        <nav>
          {menuData.length > 0 ? renderMenu(null) : (
            <p className="text-gray-400">No menu items available</p>
          )}
        </nav>
      </div>
    </nav>
  </div>
</aside>

  );
};

export default Sidebar;
