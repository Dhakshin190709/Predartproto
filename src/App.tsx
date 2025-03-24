import { useEffect, useState } from 'react';
import React from "react";
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import Calendar from './pages/Calendar';
import ECommerce from './pages/Dashboard/Dashboard';
import FormElements from './pages/Form/FormElements';
import FormLayout from './pages/Form/FormLayout';
import LovMasters from './pages/Masters/LovMasters';
import Specialization from './pages/Masters/Specialization';
import EventMaster from './pages/Masters/EventMaster';
import CampMaster from './pages/Masters/CampMaster';
import SurveyMaster from './pages/Masters/SurveyMaster';
import FeedBackMaster from './pages/Masters/FeedBackMaster';
import OffersMaster from './pages/Masters/OffersMaster';
import Users from '../src/pages/UsersManagement/Users';
import Role from '../src/pages/UsersManagement/Role';
import Rights from '../src/pages/UsersManagement/Rights';
import Menus from './pages/UsersManagement/Menus';
import ManageAvailability from './pages/ManageAvailability';
import Settings from './pages/Settings';
import Tables from './pages/Tables';
import Alerts from './pages/UiElements/Alerts';
import Buttons from './pages/UiElements/Buttons';
import DefaultLayout from './layout/DefaultLayout';
import MultiSteps from './components/MultiSteps';
import FileUpload from './pages/DocumentUpload';
import DocumentViewPage from './pages/DocumentViewPage';
import LandingPageLayout from './layout/LandingPageLayout';
import LandingPage from './pages/LandingPage';
import LabRegistration from './pages/Registration/LabRegistration';
import Dashboard from './pages/Dashboard/Dashboard';
import { useSelector } from 'react-redux';
import Profile from './pages/Profile';
import Assignrole from './pages/UsersManagement/Assignrole';
import PaymentGateway from './pages/PaymentGateway';
import ViewAvailableSlots from './pages/ViewAvailableSlots';
import TemplateUI from './pages/TemplateUI/TemplateUI';
import Login from './pages/LoginPage';
import ApiResponsePage from './pages/ApiResponsePage';
import BookAppointment from './pages/BookAppointment';
import QuickAppointment from './pages/QuickAppointment';
import DoctorFormWizard from './pages/Profile/DoctorFormWizard';
import DoctorRegistration from './pages/Registration/DoctorRegistration';
import Membership from './pages/Membership';
import PatientRegistration from './pages/Registration/PatientRegistration';
import PatientFormWizard from './pages/Profile/PatientFormWizard';
import MedicalPrescription from './pages/MedicalPrescription';
import PrescriptionAnswers from './pages/PrescriptionAnswers';
import SearchPatient from './pages/Search/SearchPatient';
import SearchAppointment from './pages/Search/SearchAppointment';
import SearchDoctors from './pages/Search/SearchDoctors';
import SearchHospital from './pages/Search/SearchHospital';
import SearchLab from './pages/Search/SearchLab';
import SearchMedicals from './pages/Search/SearchMedicals';
import CheckInCheckOut from './pages/CheckInCheckOut';
import AppointmentHistory from './pages/History/AppointmentHistory';
import PatientHistory from './pages/History/PatientHistory';
import PaymentHistory from './pages/History/PaymentHistory';
import FamilyMedicalHistory from './pages/History/FamilyMedicalHistory';
import TreatmentDetails from './pages/TreatmentDetails';
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
import FeedBack from './pages/FeedBack';
import Offers from './pages/Offers';
import Chart from './pages/Chart';
import HomePage from './pages/HomePage';
import VisitorPass from './pages/VisitorPass';
import AdmissionPage from './pages/AdmissionPage';
import AdmissionDetails from './pages/AdmissionDetails';
import RoomBooking from './pages/RoomBooking';
import OrderTracking from './pages/OrderTracking';
import Barcode from './pages/Barcode';
import Facilities from './pages/Facilities';
import QrCode from './pages/QrCode';
import Tenant from './pages/Tenant';
import Hospital from './pages/Registration/HospitalPage';
import MenuRights from './pages/MenuRights';
import LabProfile from './pages/Profile/LabProfile';
import Timeslot from './pages/Timeslot';
import Notification from './pages/Settings/Notifications';
import MainDoctor from './pages/DoctorProfile/MainDoctor';
import BasicDetails from './pages/DoctorProfile/BasicDetails';
import Education from './pages/DoctorProfile/Education';
import Awards from './pages/DoctorProfile/Awards';
import Skills from './pages/DoctorProfile/Skills';
import Experience from './pages/DoctorProfile/Experience';
import Address from './pages/DoctorProfile/Address';
import Language from './pages/DoctorProfile/Language';
import DocumentUpload from './pages/DoctorProfile/DocumentUpload';
import BookAppoByPatient from './pages/BookAppointment/BookAppoByPatient';
import BookAppoByHospital from './pages/BookAppointment/BookAppoByHospital';
import BookAppoByDoctor from './pages/BookAppointment/BookAppoByDoctor';
import RescheduleModel from './pages/RescheduleModel';
interface RootState {
  auth: {
    isAuthenticated: boolean;
  };
}

//import TenantRegistration from './pages/TenantRegistration/TenantRegistration';

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();

  // const PrivateRoute = ({ children }: any) => {
  //   const isAuthenticated = useSelector((state:any) => state.auth.isAuthenticated);
  //   return isAuthenticated ? children : <Navigate to="/AppointmentBooking" />;
  // };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader />
  ) : (
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
          path="/barcode"
          element={
            <>
              <PageTitle title="Barcode | CarePoint Pro" />
              <Barcode />
            </>
          }
        />
        <Route
          path="/signin"
          element={
            <>
              <PageTitle title="Signin | CarePoint Pro" />
              <SignIn />
            </>
          }
        />
        
        <Route
          path="/homepage"
          element={
            <>
              <PageTitle title="HomePage | CarePoint Pro" />
              <HomePage />
            </>
          }
        />
        
         <Route
          path="/chart"
          element={
            <>
              <PageTitle title="Chart | CarePoint Pro" />
              <Chart />
            </>
          }
        />
        
         
        <Route
          path="/signup"
          element={
            <>
              <PageTitle title="Signup | CarePoint Pro" />
              <SignUp />
            </>
          }
        />
        <Route
          path="/forgotpassword" 
          element={
            <>
              <PageTitle title="Forgot Password | CarePoint Pro" />
              <ForgotPassword />
              </>
          }
          />
        <Route
          path="/admissionpage" 
          element={
            <>
              <PageTitle title="AdmissionPage | CarePoint Pro" />
              <AdmissionPage />
              </>
          }
          />
        <Route
          path="/admissionDetails" 
          element={
            <>
              <PageTitle title="AdmissionDetails | CarePoint Pro" />
              <AdmissionDetails />
              </>
          }
          />
        
          

        <Route
          path="/LoginPage"
          element={
            <>
              <PageTitle title="Login page | CarePoint Pro" />
              <Login />
            </>
            
          }
        />
         <Route path="/api-response" element={<ApiResponsePage />} />
        <Route
          path="/ResetPassword" 
          element={
            <>
              <PageTitle title="Reset Password | CarePoint Pro" />
              <ResetPassword />
            </>
          }
        />
         <Route
          path="/appointment/booking"

          element={
            <>
              <PageTitle title="BookAppointment | CarePoint Pro" />
              <BookAppointment />
            </>
          }
        />
         <Route
          path="/Registration/LabRegistration"

          element={
            <>
              <PageTitle title="LabRegistration | CarePoint Pro" />
              <LabRegistration />
            </>
          }
        />
         
         
        
        <Route
          path="/QuickAppointment"
          element={
            <>
              <PageTitle title="QuickAppointment | CarePoint Pro" />
              <QuickAppointment />
            </>
          }
        />
        <Route
          path="/MultiSteps"
          element={
            <>
              <PageTitle title="MultiSteps | CarePoint Pro" />
              <MultiSteps />
            </>
          }
        />
        

       
        <Route
          path="/DoctorRegistration"
          element={
            <>
              <PageTitle title="DoctorRegistration | CarePoint Pro" />
              <DoctorRegistration />
            </>
          }
        />
        <Route
          path="/PatientRegistration"
          element={
            <>
              <PageTitle title="PatientRegistration | CarePoint Pro" />
              <PatientRegistration />
            </>
          }
        />
        
        <Route
          path="/qrCode"
          element={
            <>
              <PageTitle title="QrCode | CarePoint Pro" />
              <QrCode />
            </>
          }
        />

        <Route
          path="/templateui"
          element={
            <>
              <PageTitle title="TemplateUI | CarePoint Pro" />
              <TemplateUI />
            </>
          }
        />
      </Route>

      <Route
          path="/BookAppointment/BookAppoByPatient"
          element={
            <>
              <PageTitle title="BookAppoByPatient | CarePoint Pro" />
              <BookAppoByPatient />
            </>
          }
          />
      <Route
          path="/BookAppointment/BookAppoByHospital"
          element={
            <>
              <PageTitle title="BookAppoByHospital | CarePoint Pro" />
              <BookAppoByHospital />
            </>
          }
          />
      <Route
          path="/BookAppointment/BookAppoByDoctor"
          element={
            <>
              <PageTitle title="BookAppoByDoctor | CarePoint Pro" />
              <BookAppoByDoctor />
            </>
          }
          />
     
      {/* Default Layout */}
      <Route element={<DefaultLayout />}>
        <Route
          path="/dashboard"
          element={
            <>
              <PageTitle title="Dashboard | CarePoint Pro" />
              
                <Dashboard />
             
            </>
          }
        />
        <Route
          path="/reschedule"
          element={
            <>
              <PageTitle title="RescheduleModel | CarePoint Pro" />
              
                <RescheduleModel isOpen={false} onClose={function (): void {
                throw new Error('Function not implemented.');
              } } details={null} onSave={function (updatedDetails: Record<string, any>): void {
                throw new Error('Function not implemented.');
              } } />
             
            </>
          }
        />
        <Route
          path="/roombooking" 
          element={
            <>
              <PageTitle title="RoomBooking | CarePoint Pro" />
              <RoomBooking />
              </>
          }
          />
        <Route
          path="/ordertracking" 
          element={
            <>
              <PageTitle title="OrderTracking | CarePoint Pro" />
              <OrderTracking />
              </>
          }
          />
        <Route
          path="/tenant" 
          element={
            <>
              <PageTitle title="Tenant | CarePoint Pro" />
              <Tenant />
              </>
          }
          />
        <Route
          path="/Settings" 
          element={
            <>
              <PageTitle title="Settings | CarePoint Pro" />
              <Settings />
              </>
          }
          />
         
        <Route
          path="/doctorProfile" 
          element={
            <>
              <PageTitle title="DoctorProfile | CarePoint Pro" />
              <MainDoctor />
              </>
          }
          />
        <Route
          path="doctorProfile/BasicDetails" 
          element={
            <>
              <PageTitle title="BasicDetails | CarePoint Pro" />
              <BasicDetails />
              </>
          }
          />
        <Route
          path="doctorProfile/Education" 
          element={
            <>
              <PageTitle title="Education | CarePoint Pro" />
              <Education />
              </>
          }
          />
        <Route
          path="doctorProfile/Awards" 
          element={
            <>
              <PageTitle title="Awards | CarePoint Pro" />
              <Awards />
              </>
          }
          />
        <Route
          path="doctorProfile/Experience" 
          element={
            <>
              <PageTitle title="Experience | CarePoint Pro" />
              <Experience />
              </>
          }
          />
        <Route
          path="doctorProfile/Address" 
          element={
            <>
              <PageTitle title="Address | CarePoint Pro" />
              <Address />
              </>
          }
          />
        <Route
          path="doctorProfile/Language" 
          element={
            <>
              <PageTitle title="Language | CarePoint Pro" />
              <Language />
              </>
          }
          />
        <Route
          path="doctorProfile/Skills" 
          element={
            <>
              <PageTitle title="Skills | CarePoint Pro" />
              <Skills />
              </>
          }
          />
        <Route
          path="doctorProfile/DocumentUpload" 
          element={
            <>
              <PageTitle title="DocumentUpload | CarePoint Pro" />
              <DocumentUpload />
              </>
          }
          />
        <Route
          path="/usersmanagement/users"
          element={
            <>
              <PageTitle title="Users | CarePoint Pro" />
                <Users />
            </>
          }
        />
        <Route
          path="/usersmanagement/roles"
          element={
            <>
              <PageTitle title="Role | CarePoint Pro" />
                <Role />
            </>
          }
        />
        <Route
          path="/usersmanagement/rights"
          element={
            <>
              <PageTitle title="Rights | CarePoint Pro" />
                <Rights />
            </>
          }
        />
        <Route
          path="/Masters/LovMasters"
          element={
            <>
              <PageTitle title="LovMasters | CarePoint Pro" />
                <LovMasters />
            </>
          }
        />
        <Route
          path="/menuRights"
          element={
            <>
              <PageTitle title="MenuRights | CarePoint Pro" />
                <MenuRights />
            </>
          }
        />
        <Route
          path="/hospital"
          element={
            <>
              <PageTitle title="Hospital| CarePoint Pro" />
                <Hospital />
            </>
          }
        />
        <Route
          path="/usersmanagement/assignrole"
          element={
            <>
              <PageTitle title="Assignrole | CarePoint Pro" />
                <Assignrole />
            </>
          }
        />
        <Route
          path="/usersmanagement/menus"
          element={
            <>
              <PageTitle title="Menus | CarePoint Pro" />
                <Menus />
            </>
          }
        />
        <Route
          path="/document-upload"
          element={
            <>
              <PageTitle title="DocumentUpload | CarePoint Pro" />
                <FileUpload />
            </>
          }
        />
        <Route
          path="/documentViewPage"
          element={
            <>
              <PageTitle title="DocumentViewPage | CarePoint Pro" />
                <DocumentViewPage />
            </>
          }
        />
        <Route
          path="/appointment/view-available-slots"

          element={
            <>
              <PageTitle title="ViewAvailableSlots | CarePoint Pro" />
              <ViewAvailableSlots />
            </>
          }
        />
        <Route
          path="/manage-availability"
          element={
            <>
              <PageTitle title="ManageAvailability | CarePoint Pro" />
                <ManageAvailability />
            </>
          }
        />
        <Route
          path="Notification"
          element={
            <>
              <PageTitle title="Notification | CarePoint Pro" />
                <Notification />
            </>
          }
        />
        <Route
          path="/payment"
          element={
            <>
              <PageTitle title="PaymentGateway | CarePoint Pro" />
                <PaymentGateway />
            </>
          }
        />
        <Route
          path="/check-in-check-out"
          element={
            <>
              <PageTitle title="CheckInCheckOut | CarePoint Pro" />
                <CheckInCheckOut />
            </>
          }
        />
        <Route
          path="/labProfile"

          element={
            <>
              <PageTitle title="LabProfile | CarePoint Pro" />
              <LabProfile />
            </>
          }
        />
        <Route
          path="/timeslot"

          element={
            <>
              <PageTitle title="Timeslot | CarePoint Pro" />
              <Timeslot />
            </>
          }
        />
        <Route
          path="/DoctorFormWizard"
          element={
            <>
              <PageTitle title="DoctorFormWizard | CarePoint Pro" />
              <DoctorFormWizard />
            </>
          }
        />
        <Route
          path="/Facilities"
          element={
            <>
              <PageTitle title="Facilities | CarePoint Pro" />
              <Facilities />
            </>
          }
        />
        <Route
          path="/PatientFormWizard"
          element={
            <>
              <PageTitle title="PatientFormWizard | CarePoint Pro" />
              <PatientFormWizard />
            </>
          }
        />
        <Route
          path="/subscription"
          element={
            <>
              <PageTitle title="Membership | CarePoint Pro" />
              <Membership />
            </>
          }
        />
        <Route
          path="/visitorplan"
          element={
            <>
              <PageTitle title="VisitorPass | CarePoint Pro" />
              <VisitorPass />
            </>
          }
        />
        
        
        
        <Route
          path="/eventcreation"
          element={
            <>
              <PageTitle title="EventCreation | CarePoint Pro" />
              <EventCreation />
            </>
          }
        />
        <Route
          path="/events/conference"
          element={
            <>
              <PageTitle title="ConferenceRegistration | CarePoint Pro" />
              <ConferenceRegistration />
            </>
          }
        />
        
        <Route
          path="/events/medicalcamp"
          element={
            <>
              <PageTitle title="MedicalCampRegistration | CarePoint Pro" />
              <MedicalCampRegistration />
            </>
          }
        />
        <Route
          path="/events/survey"
          element={
            <>
              <PageTitle title="Survey | CarePoint Pro" />
              <Survey />
            </>
          }
        />
        <Route
          path="/masters/eventmaster"
          element={
            <>
              <PageTitle title="EventMaster | CarePoint Pro" />
              <EventMaster />
            </>
          }
        />
        <Route
          path="masters/campmaster"
          element={
            <>
              <PageTitle title="CampMaster | CarePoint Pro" />
              <CampMaster />
            </>
          }
        />
        <Route
          path="/campcreation"
          element={
            <>
              <PageTitle title="CampCreation | CarePoint Pro" />
              <CampCreation />
            </>
          }
        />
        <Route
          path="/masters/surveymaster"
          element={
            <>
              <PageTitle title="SurveyMaster | CarePoint Pro" />
              <SurveyMaster />
            </>
          }
        />
        <Route
          path="/surveycreation"
          element={
            <>
              <PageTitle title="SurveyCreation | CarePoint Pro" />
              <SurveyCreation />
            </>
          }
        />
        <Route
          path="/masters/feedback"
          element={
            <>
              <PageTitle title="FeedBackMaster | CarePoint Pro" />
              <FeedBackMaster />
            </>
          }
        />
        <Route
          path="/offers"
          element={
            <>
              <PageTitle title="Offers | CarePoint Pro" />
              <Offers />
            </>
          }
        />
        <Route
          path="/masters/offersmaster"
          element={
            <>
              <PageTitle title="OffersMaster | CarePoint Pro" />
              <OffersMaster />
            </>
          }
        />
        <Route
          path="/offerscreation"
          element={
            <>
              <PageTitle title="OffersCreation | CarePoint Pro" />
              <OffersCreation />
            </>
          }
        />
        <Route
          path="reports/doctorreport"
          element={
            <>
              <PageTitle title="DoctorReport | CarePoint Pro" />
              <DoctorReport />
            </>
          }
        />
        <Route
          path="reports/appointmentreport"
          element={
            <>
              <PageTitle title="AppointmentReport | CarePoint Pro" />
              <AppointmentReport />
            </>
          }
        />
        <Route
          path="reports/paymentreport"
          element={
            <>
              <PageTitle title="PaymentReport | CarePoint Pro" />
              <PaymentReport />
            </>
          }
        />
        <Route
          path="reports/chargereport"
          element={
            <>
              <PageTitle title="DischargeReport | CarePoint Pro" />
              <DischargeReport />
            </>
          }
        />
        <Route
          path="reports/surveyreport"
          element={
            <>
              <PageTitle title="SurveyReport | CarePoint Pro" />
              <SurveyReport />
            </>
          }
        />
        <Route
          path="reports/eventreport"
          element={
            <>
              <PageTitle title="EventReport | CarePoint Pro" />
              <EventReport />
            </>
          }
        />
        <Route
          path="/feedback"
          element={
            <>
              <PageTitle title="FeedBack | CarePoint Pro" />
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
              <PageTitle title="Profile | CarePoint Pro" />
                <Profile />
            </>
          }
        />
         <Route
          path="/masters/lovmaster" 
          element={
            <>
              <PageTitle title="LovMasters | CarePoint Pro" />
              <LovMasters />
            </>
          }
        />
         <Route
          path="/masters/specialization" 
          element={
            <>
              <PageTitle title="Specialization | CarePoint Pro" />
              <Specialization />
            </>
          }
        />
         <Route
          path="/search/patient" 
          element={
            <>
              <PageTitle title="SearchPatient | CarePoint Pro" />
              <SearchPatient />
            </>
          }
        />
         <Route
          path="/search/appointment" 
          element={
            <>
              <PageTitle title="SearchAppointment | CarePoint Pro" />
              <SearchAppointment />
            </>
          }
        />
         <Route
          path="/search/hospital" 
          element={
            <>
              <PageTitle title="SearchHospital | CarePoint Pro" />
              <SearchHospital />
            </>
          }
        />
         <Route
          path="/search/doctors" 
          element={
            <>
              <PageTitle title="SearchDoctors | CarePoint Pro" />
              <SearchDoctors />
            </>
          }
        />
        
         <Route
          path="/search/lab" 
          element={
            <>
              <PageTitle title="SearchLab | CarePoint Pro" />
              <SearchLab />
            </>
          }
        />
         <Route
          path="/search/medicals" 
          element={
            <>
              <PageTitle title="SearchMedicals | CarePoint Pro" />
              <SearchMedicals />
            </>
          }
        />
         
         <Route
          path="/history/appointmenthistory" 
          element={
            <>
              <PageTitle title="AppointmentHistory | CarePoint Pro" />
              <AppointmentHistory />
            </>
          }
        />
         <Route
          path="/history/patienthistory" 
          element={
            <>
              <PageTitle title="PatientHistory | CarePoint Pro" />
              <PatientHistory />
            </>
          }
        />
         <Route
          path="/history/paymenthistory" 
          element={
            <>
              <PageTitle title="PaymentHistory | CarePoint Pro" />
              <PaymentHistory />
            </>
          }
        />
         <Route
          path="/history/FamilyMedicalHistory" 
          element={
            <>
              <PageTitle title="FamilyMedicalHistory | CarePoint Pro" />
              <FamilyMedicalHistory />
            </>
          }
        />
         <Route
          path="/patient-record" 
          element={
            <>
              <PageTitle title="TreatmentDetails | CarePoint Pro" />
              <TreatmentDetails />
            </>
          }
        />
         
        <Route
          path="/calendar" 
          element={
            <>
              <PageTitle title="Calendar | CarePoint Pro" />
              <Calendar />
            </>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
