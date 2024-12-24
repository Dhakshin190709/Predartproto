import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import Calendar from './pages/Calendar';
import Chart from './pages/Chart';
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
import Menus from './pages/UsersManagement/Menus';
import ManageAvailability from './pages/ManageAvailability';
import Settings from './pages/Settings';
import Tables from './pages/Tables';
import Alerts from './pages/UiElements/Alerts';
import Buttons from './pages/UiElements/Buttons';
import DefaultLayout from './layout/DefaultLayout';
import MultiSteps from './components/MultiSteps';
import DocumentUpload from './pages/DocumentUpload';
import LandingPageLayout from './layout/LandingPageLayout';
import LandingPage from './pages/LandingPage';
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
import DoctorFormWizard from './pages/DoctorFormWizard';
import DoctorRegistration from './pages/DoctorRegistration';
import Membership from './pages/Membership';
import PatientRegistration from './pages/PatientRegistration';
import PatientFormWizard from './pages/PatientFormWizard';
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
interface RootState {
  auth: {
    isAuthenticated: boolean;
  };
}

//import TenantRegistration from './pages/TenantRegistration/TenantRegistration';

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();

  const PrivateRoute = ({ children }) => {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    return isAuthenticated ? children : <Navigate to="/AppointmentBooking" />;
  };

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
          path="/signin"
          element={
            <>
              <PageTitle title="Signin | CarePoint Pro" />
              <SignIn />
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
          path="/templateui"
          element={
            <>
              <PageTitle title="TemplateUI | CarePoint Pro" />
              <TemplateUI />
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
              <PageTitle title="Dashboard | CarePoint Pro" />
              
                <Dashboard />
             
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
                <DocumentUpload />
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
          path="/DoctorFormWizard"
          element={
            <>
              <PageTitle title="DoctorFormWizard | CarePoint Pro" />
              <DoctorFormWizard />
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
