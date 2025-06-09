import { useEffect, useState } from 'react';
import React from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { useAxiosInterceptor } from './hook/useAxiosInterceptor';
import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import Calendar from './pages/Calendar';
import MedicineTransfer from './pages/MedicineTransfer';
import ECommerce from './pages/Dashboard/Dashboard';
import FormElements from './pages/Form/FormElements';
import FormLayout from './pages/Form/FormLayout';
import LovMasters from './pages/Masters/LovMasters';
import Specialization from './pages/Masters/Specialization';
import EventMaster from './pages/Masters/EventMaster';
import CampMaster from './pages/Masters/CampMaster';
import SurveyMaster from './pages/Masters/SurveyMaster';
import FeedBackMaster from './pages/Masters/FeedBackMaster';
import MedicineMaster from './pages/Masters/MedicineMaster';
import OffersMaster from './pages/Masters/OffersMaster';
import Users from '../src/pages/UsersManagement/Users';
import Role from '../src/pages/UsersManagement/Role';
import Rights from '../src/pages/UsersManagement/Rights';
import Menus from './pages/UsersManagement/Menus';
// import ManageAvailability from './pages/ManageAvailability';
// import PaymentGateway from './pages/PaymentGateway';
// import CheckInCheckOut from './pages/CheckInCheckOut';
import MedicalPrescription from './pages/MedicalPrescription';
import Settings from './pages/Settings';
import Tables from './pages/Tables';
import Alerts from './pages/UiElements/Alerts';
import Buttons from './pages/UiElements/Buttons';
import DefaultLayout from './layout/DefaultLayout';
import LoginLayout from './layout/LoginLayout';
import FindDoctor from './pages/FindDoctor/FindDoctor';
import Dermatologist from './pages/FindDoctor/Dermatologist';
import Dentist from './pages/FindDoctor/Dentist';
import Pediatrician from './pages/FindDoctor/Pediatrician';
import Medicine from './pages/Medicines/Medicine';
import LabTest from './pages/LabTest/LabTest';

import LandingPageLayout from './layout/LandingPageLayout';
import LandingPage from './pages/LandingPage';
import DiagnosticsCenter from './pages/Registration/DiagnosticsCenter';
import Dashboard from './pages/Dashboard/Dashboard';

import Profile from './pages/Profile';
import Assignrole from './pages/UsersManagement/Assignrole';

import ViewAvailableSlots from './pages/ViewAvailableSlots';
import TemplateUI from './pages/TemplateUI/TemplateUI';
import Login from './pages/LoginPage';

import BookAppointment from './pages/BookAppointment';
import PatientRecord from './pages/PatientRecord';
import ProfilePatient from './pages/ProfilePatient';
import ProfileDoctor from './pages/ProfileDoctor';
import PatientProfile from './pages/PatientProfile';
import DoctorProfile from './pages/DoctorProfile';
import HospitalProfile from './pages/HospitalProfile';
import ProfileHospital from './pages/ProfileHospital';
import PharmacyCreation from './pages/PharmacyDetails/PharmacyCreation';
import PharmacyMedicine from './pages/PharmacyDetails/PharmacyMedicine';
import Pharmacy from './pages/PharmacyDetails/Pharmacy';

import DoctorRegistration from './pages/Registration/DoctorRegistration';
import Membership from './pages/Membership';
import PatientRegistration from './pages/Registration/PatientRegistration';
import PatientFormWizard from './pages/Profile/PatientFormWizard';
import DoctorFormWizard from './pages/DoctorFormWizard';

import HospitalFormWizard from './pages/Profile/HospitalFormWizard';
import DevelopmentInProgress from './pages/DevelopmentInProgress';

import PrescriptionAnswers from './pages/PrescriptionAnswers';
import SearchPatient from './pages/Search/SearchPatient';
import SearchAppointment from './pages/Search/SearchAppointment';
import SearchDoctors from './pages/Search/SearchDoctors';
import SearchHospital from './pages/Search/SearchHospital';
import SearchLab from './pages/Search/SearchLab';
import SearchMedicals from './pages/Search/SearchMedicals';

import AppointmentHistory from './pages/History/AppointmentHistory';
import PatientHistory from './pages/History/PatientHistory';

import EventCreation from './pages/CreationPage/EventCreation';
import CampCreation from './pages/CreationPage/CampCreation';
import SurveyCreation from './pages/CreationPage/SurveyCreation';
import OffersCreation from './pages/CreationPage/OffersCreation';
import ConferenceRegistration from './pages/Event/ConferenceRegistration';
import MedicalCampRegistration from './pages/Event/MedicalCampRegistration';
import Survey from './pages/Event/Survey';
import DoctorReport from './pages/Reports/DoctorReport';
import AppointmentReport from './pages/Reports/AppointmentReport';
import PaymentReport from './pages/Reports/PaymentReport';
import DischargeReport from './pages/Reports/DischargeReport';
import SurveyReport from './pages/Reports/SurveyReport';
import EventReport from './pages/Reports/EventReport';
import ConsolidatedReport from './pages/Reports/ConsolidatedReport';
import MISReport from './pages/Reports/MISReport';
import ExpiringStockReport from './pages/Reports/ExpiringStockReport';
import LowStockReport from './pages/Reports/LowStockReport';
import StockSummaryReport from './pages/Reports/StockSummaryReport';
import RazorPay from './pages/RazorPay';

import FeedBack from './pages/FeedBack';
import Offers from './pages/Offers';
import Chart from './pages/Chart';
import HomePage from './pages/HomePage';

import AdmissionPage from './pages/AdmissionPage';
import AdmissionDetails from './pages/AdmissionDetails';
import RoomBooking from './pages/RoomBooking';
import OrderTracking from './pages/OrderTracking';

import Tenant from './pages/Tenant';
import Hospital from './pages/Registration/HospitalPage';

import LabProfile from './pages/Profile/LabProfile';
import Timeslot from './pages/Timeslot';
import Notification from './pages/Settings/Notifications';
import PrivacyPolicy from './pages/PrivacyPolicy';
import PromoCode from './pages/PromoCode';
import PricePlan from './pages/PricePlan';
import AddOn from './pages/AddOn';
import PlanFeature from './pages/PlanFeature';

// import MedicalDocumentUpload from './pages/DoctorProfile/MedicalDocumentUpload';
import AccountSettings from './pages/AccountSettings';

import RescheduleModel from './pages/RescheduleModel';
import MedicalDocumentUpload from './pages/MedicalDocumentUpload';
import FeedBackForm from './pages/FeedBack/FeedBackForm';
import MyContacts from './pages/MyContacts';
import PatientCardNavigation from './pages/PatientCardNavigation';
interface RootState {
  auth: {
    isAuthenticated: boolean;
  };
}

//import TenantRegistration from './pages/TenantRegistration/TenantRegistration';

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();
  useAxiosInterceptor();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <>
      <Routes>
        {/* Landing Page Layout */}
        <Route element={<LandingPageLayout children={undefined} />}>
          <Route
            index
            element={
              <>
                <PageTitle title="CarePointPro | Landing Page" />
                <LandingPage />
              </>
            }
          />

          <Route
            path="/signin"
            element={
              <>
                <PageTitle title="Signin | PreCare" />
                <SignIn />
              </>
            }
          />

          <Route
            path="/chart"
            element={
              <>
                <PageTitle title="Chart | PreCare" />
                <Chart />
              </>
            }
          />

          <Route
            path="/admissionpage"
            element={
              <>
                <PageTitle title="AdmissionPage | PreCare" />
                <AdmissionPage />
              </>
            }
          />
          <Route
            path="/admissionDetails"
            element={
              <>
                <PageTitle title="AdmissionDetails | PreCare" />
                <AdmissionDetails />
              </>
            }
          />

          <Route
            path="/templateui"
            element={
              <>
                <PageTitle title="TemplateUI | PreCare" />
                <TemplateUI />
              </>
            }
          />
        </Route>

        <Route element={<LoginLayout children={undefined} />}>
          <Route
            path="/signup"
            element={
              <>
                <PageTitle title="Signup | PreCare" />
                <SignUp />
              </>
            }
          />
          <Route
            path="/forgotpassword"
            element={
              <>
                <PageTitle title="Forgot Password | PreCare" />
                <ForgotPassword />
              </>
            }
          />

          <Route
            path="/LoginPage"
            element={
              <>
                <PageTitle title="Login page | PreCare" />
                <Login />
              </>
            }
          />

          <Route
            path="/ResetPassword"
            element={
              <>
                <PageTitle title="Reset Password | PreCare" />
                <ResetPassword />
              </>
            }
          />
        </Route>

        {/* Default Layout */}
        <Route element={<DefaultLayout />}>
          <Route
            path="/dashboard"
            element={
              <>
                <PageTitle title="Dashboard | PreCare" />

                <Dashboard />
              </>
            }
          />
          <Route
            path="/reschedule"
            element={
              <>
                <PageTitle title="RescheduleModel | PreCare" />

                <RescheduleModel
                  isOpen={false}
                  onClose={function (): void {
                    throw new Error('Function not implemented.');
                  }}
                  details={null}
                  onSave={function (updatedDetails: Record<string, any>): void {
                    throw new Error('Function not implemented.');
                  }}
                />
              </>
            }
          />

          <Route
            path="/Registration/DiagnosticsCenter"
            element={
              <>
                <PageTitle title="DiagnosticsCenter | PreCare" />
                <DiagnosticsCenter />
              </>
            }
          />
          <Route
            path="/homepage"
            element={
              <>
                <PageTitle title="HomePage | PreCare" />
                <HomePage />
              </>
            }
          />
          <Route
            path="/roombooking"
            element={
              <>
                <PageTitle title="RoomBooking | PreCare" />
                <RoomBooking />
              </>
            }
          />
          <Route
            path="/ordertracking"
            element={
              <>
                <PageTitle title="OrderTracking | PreCare" />
                <OrderTracking />
              </>
            }
          />
          <Route
            path="/tenant"
            element={
              <>
                <PageTitle title="Tenant | PreCare" />
                <Tenant />
              </>
            }
          />
          <Route
            path="/Settings"
            element={
              <>
                <PageTitle title="Settings | PreCare" />
                <Settings />
              </>
            }
          />

          <Route
            path="/PatientRegistration"
            element={
              <>
                <PageTitle title="PatientRegistration | PreCare" />
                <PatientRegistration />
              </>
            }
          />
          {/* <Route
          path="/doctorProfile" 
          element={
            <>
              <PageTitle title="DoctorProfile | PreCare" />
              <MainDoctor />
              </>
          }
          /> */}
          <Route
            path="/AccountSettings"
            element={
              <>
                <PageTitle title="AccountSettings | PreCare" />
                <AccountSettings />
              </>
            }
          />
          <Route
            path="/DevelopmentInProgress"
            element={
              <>
                <PageTitle title="DevelopmentInProgress | PreCare" />
                <DevelopmentInProgress />
              </>
            }
          />
          <Route
            path="/PrivacyPolicy"
            element={
              <>
                <PageTitle title="PrivacyPolicy | PreCare" />
                <PrivacyPolicy />
              </>
            }
          />

          <Route
            path="/DoctorRegistration"
            element={
              <>
                <PageTitle title="DoctorRegistration | PreCare" />
                <DoctorRegistration />
              </>
            }
          />
          <Route
            path="/MedicineTransfer"
            element={
              <>
                <PageTitle title="MedicineTransfer | PreCare" />
                <MedicineTransfer />
              </>
            }
          />
          {/* <Route
          path="doctorProfile/BasicDetails" 
          element={
            <>
              <PageTitle title="BasicDetails | PreCare" />
              <BasicDetails />
              </>
          }
          />
        <Route
          path="doctorProfile/Education" 
          element={
            <>
              <PageTitle title="Education | PreCare" />
              <Education />
              </>
          }
          />
        <Route
          path="doctorProfile/Awards" 
          element={
            <>
              <PageTitle title="Awards | PreCare" />
              <Awards />
              </>
          }
          /> */}
          {/* <Route
          path="doctorProfile/Experience" 
          element={
            <>
              <PageTitle title="Experience | PreCare" />
              <Experience />
              </>
          }
          />
        <Route
          path="doctorProfile/Address" 
          element={
            <>
              <PageTitle title="Address | PreCare" />
              <Address />
              </>
          }
          />
        <Route
          path="doctorProfile/Language" 
          element={
            <>
              <PageTitle title="Language | PreCare" />
              <Language />
              </>
          }
          />
        <Route
          path="doctorProfile/Skills" 
          element={
            <>
              <PageTitle title="Skills | PreCare" />
              <Skills />
              </>
          }
          />
        <Route
          path="doctorProfile/MedicalDocumentUpload" 
          element={
            <>
              <PageTitle title="MedicalDocumentUpload | PreCare" />
              <MedicalDocumentUpload />
              </>
          }
          /> */}
          <Route
            path="/MedicalDocumentUpload"
            element={
              <>
                <PageTitle title="MedicalDocumentUpload | PreCare" />
                <MedicalDocumentUpload />
              </>
            }
          />
          <Route
            path="/usersmanagement/users"
            element={
              <>
                <PageTitle title="Users | PreCare" />
                <Users />
              </>
            }
          />
          <Route
            path="/usersmanagement/roles"
            element={
              <>
                <PageTitle title="Role | PreCare" />
                <Role />
              </>
            }
          />
          <Route
            path="/usersmanagement/rights"
            element={
              <>
                <PageTitle title="Rights | PreCare" />
                <Rights />
              </>
            }
          />
          <Route
            path="/Masters/LovMasters"
            element={
              <>
                <PageTitle title="LovMasters | PreCare" />
                <LovMasters />
              </>
            }
          />
          <Route
            path="/Masters/MedicineMaster"
            element={
              <>
                <PageTitle title="MedicineMaster | PreCare" />
                <MedicineMaster />
              </>
            }
          />
          <Route
            path="/FeedBack/FeedBackForm"
            element={
              <>
                <PageTitle title="FeedBackForm | PreCare" />
                <FeedBackForm />
              </>
            }
          />

          <Route
            path="/hospital"
            element={
              <>
                <PageTitle title="Hospital| PreCare" />
                <Hospital />
              </>
            }
          />
          <Route
            path="/usersmanagement/assignrole"
            element={
              <>
                <PageTitle title="Assignrole | PreCare" />
                <Assignrole />
              </>
            }
          />
          <Route
            path="/usersmanagement/menus"
            element={
              <>
                <PageTitle title="Menus | PreCare" />
                <Menus />
              </>
            }
          />

          <Route
            path="/appointment/view-available-slots"
            element={
              <>
                <PageTitle title="ViewAvailableSlots | PreCare" />
                <ViewAvailableSlots />
              </>
            }
          />

          {/* <Route
          path="/manage-availability"
          element={
            <>
              <PageTitle title="ManageAvailability | PreCare" />
                <ManageAvailability />
            </>
          }
        /> */}
          <Route
            path="Notification"
            element={
              <>
                <PageTitle title="Notification | PreCare" />
                <Notification />
              </>
            }
          />
          {/* <Route
          path="/payment"
          element={
            <>
              <PageTitle title="PaymentGateway | PreCare" />
                <PaymentGateway />
            </>
          }
        /> */}
          {/* <Route
          path="/check-in-check-out"
          element={
            <>
              <PageTitle title="CheckInCheckOut | PreCare" />
                <CheckInCheckOut />
            </>
          }
        /> */}
          <Route
            path="/labProfile"
            element={
              <>
                <PageTitle title="LabProfile | PreCare" />
                <LabProfile />
              </>
            }
          />
          <Route
            path="/timeslot"
            element={
              <>
                <PageTitle title="Timeslot | PreCare" />
                <Timeslot />
              </>
            }
          />

          <Route
            path="/PatientFormWizard"
            element={
              <>
                <PageTitle title="PatientFormWizard | PreCare" />
                <PatientFormWizard />
              </>
            }
          />
          <Route
            path="/ProfilePatient"
            element={
              <>
                <PageTitle title="ProfilePatient | PreCare" />
                <ProfilePatient />
              </>
            }
          />
          <Route
            path="/PatientProfile"
            element={
              <>
                <PageTitle title="PatientProfile | PreCare" />
                <PatientProfile />
              </>
            }
          />
          <Route
            path="/DoctorProfile"
            element={
              <>
                <PageTitle title="DoctorProfile | PreCare" />
                <DoctorProfile />
              </>
            }
          />
          <Route
            path="/HospitalProfile"
            element={
              <>
                <PageTitle title="HospitalProfile | PreCare" />
                <HospitalProfile />
              </>
            }
          />
          <Route
            path="/ProfileHospital"
            element={
              <>
                <PageTitle title="ProfileHospital | PreCare" />
                <ProfileHospital />
              </>
            }
          />

          <Route
            path="/PatientCardNavigation"
            element={
              <>
                <PageTitle title="PatientCardNavigation | PreCare" />
                <PatientCardNavigation />
              </>
            }
          />
          <Route
            path="/DoctorFormWizard"
            element={
              <>
                <PageTitle title="DoctorFormWizard | PreCare" />
                <DoctorFormWizard />
              </>
            }
          />

          <Route
            path="/HospitalRegister"
            element={
              <>
                <PageTitle title="HospitalFormWizard | PreCare" />
                <HospitalFormWizard />
              </>
            }
          />
          <Route
            path="/Pharmacy"
            element={
              <>
                <PageTitle title="Pharmacy | PreCare" />
                <Pharmacy />
              </>
            }
          />
          <Route
            path="/ProfileDoctor"
            element={
              <>
                <PageTitle title="ProfileDoctor | PreCare" />
                <ProfileDoctor />
              </>
            }
          />
          <Route
            path="/subscription"
            element={
              <>
                <PageTitle title="Membership | PreCare" />
                <Membership />
              </>
            }
          />

          <Route
            path="/eventcreation"
            element={
              <>
                <PageTitle title="EventCreation | PreCare" />
                <EventCreation />
              </>
            }
          />
          <Route
            path="/events/conference"
            element={
              <>
                <PageTitle title="ConferenceRegistration | PreCare" />
                <ConferenceRegistration />
              </>
            }
          />

          <Route
            path="/events/medicalcamp"
            element={
              <>
                <PageTitle title="MedicalCampRegistration | PreCare" />
                <MedicalCampRegistration />
              </>
            }
          />
          <Route
            path="/events/survey"
            element={
              <>
                <PageTitle title="Survey | PreCare" />
                <Survey />
              </>
            }
          />
          <Route
            path="/masters/eventmaster"
            element={
              <>
                <PageTitle title="EventMaster | PreCare" />
                <EventMaster />
              </>
            }
          />
          <Route
            path="masters/campmaster"
            element={
              <>
                <PageTitle title="CampMaster | PreCare" />
                <CampMaster />
              </>
            }
          />
          <Route
            path="/campcreation"
            element={
              <>
                <PageTitle title="CampCreation | PreCare" />
                <CampCreation />
              </>
            }
          />
          <Route
            path="/masters/surveymaster"
            element={
              <>
                <PageTitle title="SurveyMaster | PreCare" />
                <SurveyMaster />
              </>
            }
          />
          <Route
            path="/appointment/booking"
            element={
              <>
                <PageTitle title="BookAppointment | PreCare" />
                <BookAppointment />
              </>
            }
          />
          <Route
            path="/surveycreation"
            element={
              <>
                <PageTitle title="SurveyCreation | PreCare" />
                <SurveyCreation />
              </>
            }
          />
          <Route
            path="/masters/feedback"
            element={
              <>
                <PageTitle title="FeedBackMaster | PreCare" />
                <FeedBackMaster />
              </>
            }
          />
          <Route
            path="/offers"
            element={
              <>
                <PageTitle title="Offers | PreCare" />
                <Offers />
              </>
            }
          />
          <Route
            path="/masters/offersmaster"
            element={
              <>
                <PageTitle title="OffersMaster | PreCare" />
                <OffersMaster />
              </>
            }
          />
          <Route
            path="/offerscreation"
            element={
              <>
                <PageTitle title="OffersCreation | PreCare" />
                <OffersCreation />
              </>
            }
          />
          <Route
            path="/patientRecord"
            element={
              <>
                <PageTitle title="PatientRecord | PreCare" />
                <PatientRecord />
              </>
            }
          />
          <Route
            path="/RazorPay"
            element={
              <>
                <PageTitle title="RazorPay | PreCare" />
                <RazorPay />
              </>
            }
          />
          <Route
            path="/PharmacyDetails/PharmacyCreation"
            element={
              <>
                <PageTitle title="PharmacyCreation | PreCare" />
                <PharmacyCreation />
              </>
            }
          />
          <Route
            path="/PharmacyDetails/PharmacyMedicine"
            element={
              <>
                <PageTitle title="PharmacyMedicine | PreCare" />
                <PharmacyMedicine />
              </>
            }
          />
          <Route
            path="reports/doctorreport"
            element={
              <>
                <PageTitle title="DoctorReport | PreCare" />
                <DoctorReport />
              </>
            }
          />
          <Route
            path="reports/appointmentreport"
            element={
              <>
                <PageTitle title="AppointmentReport | PreCare" />
                <AppointmentReport />
              </>
            }
          />
          <Route
            path="reports/ExpiringStockReport"
            element={
              <>
                <PageTitle title="ExpiringStockReport | PreCare" />
                <ExpiringStockReport />
              </>
            }
          />
          <Route
            path="reports/LowStockReport"
            element={
              <>
                <PageTitle title="LowStockReport | PreCare" />
                <LowStockReport />
              </>
            }
          />
          <Route
            path="reports/StockSummaryReport"
            element={
              <>
                <PageTitle title="StockSummaryReport | PreCare" />
                <StockSummaryReport />
              </>
            }
          />
          <Route
            path="reports/paymentreport"
            element={
              <>
                <PageTitle title="PaymentReport | PreCare" />
                <PaymentReport />
              </>
            }
          />
          <Route
            path="reports/chargereport"
            element={
              <>
                <PageTitle title="DischargeReport | PreCare" />
                <DischargeReport />
              </>
            }
          />
          <Route
            path="/consolidatedReport"
            element={
              <>
                <PageTitle title="ConsolidatedReport | PreCare" />
                <ConsolidatedReport />
              </>
            }
          />
          <Route
            path="/MISReport"
            element={
              <>
                <PageTitle title="MISReport | PreCare" />
                <MISReport />
              </>
            }
          />
          <Route
            path="/PromoCode"
            element={
              <>
                <PageTitle title="PromoCode | PreCare" />
                <PromoCode />
              </>
            }
          />
          <Route
            path="/PricePlan"
            element={
              <>
                <PageTitle title="PricePlan | PreCare" />
                <PricePlan />
              </>
            }
          />
          <Route
            path="/AddOn"
            element={
              <>
                <PageTitle title="AddOn | PreCare" />
                <AddOn />
              </>
            }
          />
          <Route
            path="/PlanFeature"
            element={
              <>
                <PageTitle title="PlanFeature | PreCare" />
                <PlanFeature />
              </>
            }
          />
          <Route
            path="reports/surveyreport"
            element={
              <>
                <PageTitle title="SurveyReport | PreCare" />
                <SurveyReport />
              </>
            }
          />
          <Route
            path="reports/eventreport"
            element={
              <>
                <PageTitle title="EventReport | PreCare" />
                <EventReport />
              </>
            }
          />
          <Route
            path="/feedback"
            element={
              <>
                <PageTitle title="FeedBack | PreCare" />
                <FeedBack />
              </>
            }
          />

          <Route path="/medical" element={<MedicalPrescription />} />
          <Route path="/prescription" element={<PrescriptionAnswers />} />

          <Route
            path="/profile"
            element={
              <>
                <PageTitle title="Profile | PreCare" />
                <Profile />
              </>
            }
          />
          <Route
            path="/myContacts"
            element={
              <>
                <PageTitle title="MyContacts | PreCare" />
                <MyContacts />
              </>
            }
          />
          <Route
            path="/masters/lovmaster"
            element={
              <>
                <PageTitle title="LovMasters | PreCare" />
                <LovMasters />
              </>
            }
          />
          <Route
            path="/masters/specialization"
            element={
              <>
                <PageTitle title="Specialization | PreCare" />
                <Specialization />
              </>
            }
          />
          <Route
            path="/search/patient"
            element={
              <>
                <PageTitle title="SearchPatient | PreCare" />
                <SearchPatient />
              </>
            }
          />
          <Route
            path="/search/appointment"
            element={
              <>
                <PageTitle title="SearchAppointment | PreCare" />
                <SearchAppointment />
              </>
            }
          />
          <Route
            path="/search/hospital"
            element={
              <>
                <PageTitle title="SearchHospital | PreCare" />
                <SearchHospital />
              </>
            }
          />
          <Route
            path="/search/doctors"
            element={
              <>
                <PageTitle title="SearchDoctors | PreCare" />
                <SearchDoctors />
              </>
            }
          />

          <Route
            path="/search/lab"
            element={
              <>
                <PageTitle title="SearchLab | PreCare" />
                <SearchLab />
              </>
            }
          />
          <Route
            path="/search/medicals"
            element={
              <>
                <PageTitle title="SearchMedicals | PreCare" />
                <SearchMedicals />
              </>
            }
          />

          <Route
            path="/history/appointmenthistory"
            element={
              <>
                <PageTitle title="AppointmentHistory | PreCare" />
                <AppointmentHistory />
              </>
            }
          />
          <Route
            path="/history/PatientHistory"
            element={
              <>
                <PageTitle title="PatientHistory | PreCare" />
                <PatientHistory />
              </>
            }
          />

          {/* <Route
          path="/patient-record" 
          element={
            <>
              <PageTitle title="TreatmentDetails | PreCare" />
              <TreatmentDetails />
            </>
          }
        /> */}

          <Route
            path="/FindDoctor"
            element={
              <>
                <PageTitle title="FindDoctor | PreCare" />
                <FindDoctor />
              </>
            }
          />
          <Route
            path="/Dermatologist"
            element={
              <>
                <PageTitle title="Dermatologist | PreCare" />
                <Dermatologist />
              </>
            }
          />
          <Route
            path="/Dentist"
            element={
              <>
                <PageTitle title="Dentist | PreCare" />
                <Dentist />
              </>
            }
          />
          <Route
            path="/Pediatrician"
            element={
              <>
                <PageTitle title="Pediatrician | PreCare" />
                <Pediatrician />
              </>
            }
          />
          <Route
            path="/Medicine"
            element={
              <>
                <PageTitle title="Medicines | PreCare" />
                <Medicine />
              </>
            }
          />
          <Route
            path="/LabTest"
            element={
              <>
                <PageTitle title="LabTest | PreCare" />
                <LabTest />
              </>
            }
          />
          <Route
            path="/calendar"
            element={
              <>
                <PageTitle title="Calendar | PreCare" />
                <Calendar />
              </>
            }
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;
