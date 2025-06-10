import React, { useEffect, useState } from 'react';
import Logo from '../../images/logo/logo-bg (2).png';
import { NavLink } from 'react-router-dom';
import {
  FaBookMedical,
  FaCcMastercard,
  FaChevronDown,
  FaChevronUp,
  FaGooglePay,
  FaMagic,
  FaFileSignature,
  FaGitlab,
  FaCoins,
  FaPlusCircle,
  FaStar,
  FaListAlt,
  FaTicketAlt,
  FaCrown,
  FaMicroscope,
  FaChartLine,
  FaChartBar,
  FaHourglassHalf,
  FaDatabase,
  FaTachometerAlt,
  FaBalanceScale,
  FaStopwatch,
} from 'react-icons/fa';

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
  FaToolbox ,
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
import { MdDateRange, MdDashboard, MdLocalHospital } from 'react-icons/md';
import api from '../../api/request';
import { BiDetail } from 'react-icons/bi';

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
  Calendar: { icon: <MdDateRange />, route: '/calendar' },
  Search: { icon: <FaSearch />, route: '#' },
  'Manage Availablilty': {
    icon: <FaUserCheck />,
    // route: '/manage-availability',
    route: '/dashboard',
  },
  PatientRecord: { icon: <FaUsers />, route: '/patientRecord' },
  'CheckIN/OUT': { icon: <FaUserCheck />, route: '/dashboard' },
  Payment: { icon: <FaCashRegister />, route: '/dashboard' },
  Medical: { icon: <FaFileMedical />, route: '/medical' },
  Priscription: { icon: <FaPills />, route: '/prescription' },
  History: { icon: <FaHistory />, route: '#' },
  VisitorPass: { icon: <FaIdBadge />, route: '/visitorplan' },
  Reports: { icon: <FaFileAlt />, route: '#' },
  Subscriptions: { icon: <FaCreditCard />, route: '/subscription' },
  DocumentUpload: { icon: <FaCloudUploadAlt />, route: '/DocumentUpload' },
  UserManagement: { icon: <FaUsersCog />, route: '#' },
  Events: { icon: <FaCalendarCheck />, route: '#' },
  Offers: { icon: <FaTag />, route: '/offers' },
  PromoCode: { icon: <FaTag />, route: '/PromoCode' },
  PricePlan: { icon: <FaCoins  />, route: '/PricePlan' },
  AddOn: { icon: <FaPlusCircle  />, route: '/AddOn' },
  PlanLimit: { icon: <FaStopwatch    />, route: '/PlanLimit' },
  PlanFeature: { icon: <FaListAlt />, route: '/PlanFeature' },
  FeedBack: { icon: <FaCommentAlt />, route: '/Feedback/FeedBackForm' },
  Settings: { icon: <FaCog />, route: '#' },
  TenantRegister: { icon: <FaClipboardList />, route: '/tenant' },
  Lab: { icon: <FaFlask />, route: '/search/lab' },
  LabProfile: { icon: <FaFlask />, route: '/LabProfile' },
  //UploadedDocument: { icon: <FaCloudUploadAlt />, route: '/document-upload' },
  LOVMasters: { icon: <FaMagic />, route: '/Masters/LovMasters' },
  MedicineMaster: { icon: <FaBookMedical />, route: '/Masters/MedicineMaster' },
  DoctorProfile: { icon: <FaUserMd />, route: '/DoctorProfile' },
  PatientProfile: { icon: <FaUserInjured />, route: '/PatientProfile' },
  HospitalRegister: { icon: <FaBuilding />, route: '/hospitalRegister' },
  HospitalProfile: { icon: <FaBuilding />, route: '/HospitalProfile' },
  Diagnosis: { icon: <FaBuilding />, route: '/DiagnosisPage' },
  // Submenus
  Booking: { icon: <FaClipboardList />, route: '/appointment/booking' },
  'View Available Slot': {
    icon: <FaStethoscope />,
    route: '/appointment/view-available-slots',
  },
  Patient: { icon: <FaUserInjured />, route: '/search/patient' },
  Appointments: { icon: <FaHospital />, route: '/search/appointment' },
  DiagnosticsCenter: {
    icon: <FaFlask />,
    route: '/Registration/DiagnosticsCenter',
  },
  DoctorRegister: { icon: <FaUserMd />, route: '/DoctorRegistration' },
  Hospital: { icon: <MdLocalHospital />, route: '/search/hospital' },
  Hospitals: { icon: <MdLocalHospital />, route: '/hospital' },
  Doctors: { icon: <FaUserMd />, route: '/search/doctors' },
  Medicals: { icon: <FaFirstAid />, route: '/search/medicals' },
  Diagnostics: { icon: <FaGitlab />, route: '#' },
  PharmacyRegister: {
    icon: <FaFirstAid />,
    route: '/PharmacyDetails/PharmacyCreation',
  },
  Pharmacy: { icon: <FaFirstAid />, route: '/Pharmacy' },
  PharmacyMedicine: {
    icon: <FaFirstAid />,
    route: '/PharmacyDetails/PharmacyMedicine',
  },
  PatientHistory: { icon: <FaUser />, route: '/history/patienthistory' },
  ConsolidatedReport: { icon: <FaFileMedical />, route: '/consolidatedReport' },
  MISReport: { icon: <FaFileExport />, route: '/MISReport' },
  ExpiringStockReport: {
    icon: <FaHourglassHalf  />,
    route: '/reports/ExpiringStockReport',
  },
  LowStockReport: { icon: <FaChartLine />, route: '/reports/LowStockReport' },
  MedicineTransferReport: { icon: <FaExchangeAlt />, route: '#' },
  StockSummaryReport: {
    icon: <FaChartBar />,
    route: '/reports/StockSummaryReport',
  },
  RazorPay: { icon: <FaGooglePay />, route: '/RazorPay' },
  MedicineTransfer: { icon: <FaFileExport />, route: '/MedicineTransfer' },
  Registration: { icon: <FaFileSignature />, route: '#' },
  DiagnosticsRegister: { icon: <FaMicroscope />, route: '#' },

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
  Profile: { icon: <FaUserCircle />, route: '#' },
  Menus: { icon: <FaListUl />, route: '/usersmanagement/menus' },
  Roles: { icon: <FaUserShield />, route: '/usersmanagement/roles' },
  Rights: { icon: <FaKey />, route: '/usersmanagement/rights' },
  AssignRole: { icon: <FaIdBadge  />, route: '/usersmanagement/assignrole' },
  Transfer: { icon: <FaExchangeAlt />, route: '/usersmanagement/transfer' },
  Conference: { icon: <FaVideo />, route: '/events/conference' },
  MedicalCamp: { icon: <FaHeartbeat />, route: '/events/medicalcamp' },
  Survey: { icon: <FaPoll />, route: '/events/survey' },
  //Profile: { icon: <FaUserCircle />, route: '/settings/profile' },
  Communication: { icon: <FaCommentAlt />, route: '/settings/communication' },
  Privacy: { icon: <FaShieldAlt />, route: '/settings/privacy' },
  Family: { icon: <FaUsers />, route: '/settings/family' },
  Masters: { icon: <FaDatabase  />, route: '#' },
  TenantMaster: { icon: <FaUsers />, route: '#' },
  TenantAddOn: { icon: <FaToolbox  />, route: '/TenantAddOn' },
  TenantSubscription: { icon: <FaCrown  />, route: '/TenantSubscription' },
  TenantPromoUsage: { icon: <FaTicketAlt  />, route: '/TenantPromoUsage' },
  Notification: { icon: <FaBell />, route: '/settings/notification' },
  MedicalDocument: {
    icon: <FaCloudUploadAlt />,
    route: '/MedicalDocumentUpload',
  },
  default: { icon: <FaFolder />, route: '/default' },
};

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const storedUserID = sessionStorage.getItem('userID');

    if (storedUserID) {
      console.log('Stored User ID:', storedUserID);

      const fetchUserMenu = async () => {
        try {
          const response = await api.get(`/Login/${storedUserID}`);

          console.log('API Response:', response.data);

          if (response.data?.data && Array.isArray(response.data.data)) {
            setMenuItems(response.data.data);
          } else {
            console.warn('Unexpected data format:', response.data);
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
      className={`absolute left-0 top-0 z-9999 flex h-screen flex-col overflow-y-auto
  bg-gradient-to-b from-[#002B5B] to-[#004A99] text-white transition-all duration-300 ease-linear
  ${isCollapsed ? 'w-20' : 'w-72.5'} 
  lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <img
            src={Logo}
            alt="CarePoint Pro Logo"
            className={`h-10 transition-all ${isCollapsed ? 'w-10' : 'w-12'}`}
          />
          {!isCollapsed && (
            <span className="text-white text-xl font-semibold">Precare</span>
          )}
        </div>

        <button
          className="text-white text-2xl focus:outline-none"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          ☰
        </button>
      </div>

      <div className="sidebar-menu overflow-y-auto flex-1">
        <nav>
          {rootItems.map((parent) => (
            <div key={parent.menuID} className="p-4">
              <NavLink
                to={iconMapping[parent.title]?.route || '#'}
                className={`flex items-center text-white font-semibold text-base cursor-pointer rounded-lg px-3 py-2
  ${activeMenu === parent.menuID ? 'bg-white text-blue-700 shadow-md' : ''}
`}
                onClick={() => {
                  setActiveMenu(parent.menuID); // set active menu
                  if (menuTree[parent.menuID]) {
                    toggleDropdown(parent.menuID);
                  }
                }}
              >
                <div
                  className={`text-xl mr-5 ${activeMenu === parent.menuID ? 'text-blue-700' : 'text-white'}`}
                >
                  {iconMapping[parent.title]?.icon || <FaFolder />}
                </div>

                <span
                  className={`text-xl transition-all ${isCollapsed ? 'hidden' : 'inline'} ${activeMenu === parent.menuID ? 'text-blue-700' : 'text-white'}`}
                >
                  {parent.title}
                </span>

                {!isCollapsed && menuTree[parent.menuID] && (
                  <span className="ml-auto text-x">
                    {openMenus.includes(parent.menuID) ? (
                      <FaChevronUp />
                    ) : (
                      <FaChevronDown />
                    )}
                  </span>
                )}
              </NavLink>

              {!isCollapsed &&
                openMenus.includes(parent.menuID) &&
                menuTree[parent.menuID] && (
                  <div className="ml-6 mt-2 space-y-2">
                    {menuTree[parent.menuID].map((child) => (
                      <NavLink
                        key={child.menuID}
                        to={iconMapping[child.title]?.route || '#'}
                        onClick={() => setActiveMenu(child.menuID)}
                        className={`flex items-center text-white text-md ml-5 rounded-lg px-3 py-2
        ${activeMenu === child.menuID ? 'bg-white text-blue-700 shadow-md' : ''}`}
                      >
                        <div
                          className={`text-xl mr-3 ${activeMenu === child.menuID ? 'text-blue-700' : 'text-white'}`}
                        >
                          {iconMapping[child.title]?.icon || <FaFolder />}
                        </div>

                        <span
                          className={`text-x ${isCollapsed ? 'hidden' : 'inline'} ${activeMenu === child.menuID ? 'text-blue-700' : 'text-white'}`}
                        >
                          {child.title}
                        </span>
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
          background-color: rgba(
            255,
            255,
            255,
            0.3
          ); /* Light-colored scrollbar */
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
