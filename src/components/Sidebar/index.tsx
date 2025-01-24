import React, { useEffect, useState } from 'react';
import Logo from '../../images/logo/logo-icon.svg';
import { NavLink } from 'react-router-dom';
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
  const [menuTitles, setMenuTitles] = useState<string[]>([]);

  const userID = '8B904E63-B150-484B-0A66-08DD363B643E';

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
    DocumentUpload: { icon: <FaCloudUploadAlt />, route: '/document-upload' },
    UserManagement: { icon: <FaUsersCog />, route: '#' },
    Offers: { icon: <FaTag />, route: '/offers' },
    FeedBack: { icon: <FaCommentAlt />, route: '/feedback' },
    Settings: { icon: <FaCog />, route: '#' },
    default: { icon: <FaFolder />, route: '/default' },
  };

  useEffect(() => {
    const storedMenuIDs = sessionStorage.getItem('filteredMenuIDs');

    if (storedMenuIDs) {
      try {
        const parsedMenuIDs = JSON.parse(storedMenuIDs);
        console.log('Parsed Filtered Menu IDs:', parsedMenuIDs);

        const fetchUserMenu = async () => {
          try {
            const response = await fetch(`https://predart003-001-site1.anytempurl.com/api/Login/${userID}`);
            if (!response.ok) {
              throw new Error('Failed to fetch user menu data');
            }

            const menuData = await response.json();
            console.log('API Menu Data:', menuData);

            const apiMenuMapping = menuData.data.map((item: any) => ({
              id: item.menuID,
              title: item.title,
            }));

            const apiMenuIDs = apiMenuMapping.map((menu: any) => menu.id);

            const commonMenuIDs = apiMenuIDs.filter((id: number) => parsedMenuIDs.includes(id));
            console.log('Common Menu IDs:', commonMenuIDs);

            const commonMenuTitles = commonMenuIDs.map((id: number) => {
              const menu = apiMenuMapping.find((menuItem: any) => menuItem.id === id);
              return menu ? menu.title : 'Unknown Menu';
            });

            console.log('Common Menu Titles:', commonMenuTitles);
            setMenuTitles(commonMenuTitles);
          } catch (error) {
            console.error('Error fetching or processing user menu data:', error);
          }
        };

        fetchUserMenu();
      } catch (error) {
        console.error('Error parsing stored menu IDs:', error);
      }
    }
  }, [userID]);

  const toggleMenu = (menuID: number) => {
    setExpandedMenus((prev) =>
      prev.includes(menuID) ? prev.filter((id) => id !== menuID) : [...prev, menuID]
    );
  };

  return (
    <aside
      className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center px-4 py-4 lg:py-6">
        <img src={Logo} alt="CarePoint Pro Logo" className="h-6 mr-2" />
        <h1 className="font-semibold text-white text-sm">CarePoint Pro</h1>
      </div>
      <div className="overflow-y-auto">
  <nav>
    {menuTitles.map((title, index) => {
      const { icon, route } = iconMapping[title] || iconMapping.default;
      return (
        <div
        key={index}
        className="p-4 hover:bg-gray-700 rounded-md transition duration-200"
      >
        <NavLink
          to={route}
          className="flex items-center text-white font-semibold text-lg"
        >
          <div className="text-2xl mr-5">{icon}</div>
          <span className="text-x">{title}</span>
        </NavLink>
      </div>
      
      );
    })}
  </nav>
</div>

    </aside>
  );
};

export default Sidebar;
