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
import Masters from './pages/Masters/Masters';
import Users from '../src/pages/UsersManagement/Users';
import Role from '../src/pages/UsersManagement/Role';


import Settings from './pages/Settings';
import Tables from './pages/Tables';
import Alerts from './pages/UiElements/Alerts';
import Buttons from './pages/UiElements/Buttons';
import DefaultLayout from './layout/DefaultLayout';
import MultiSteps from './components/MultiSteps';

import LandingPageLayout from './layout/LandingPageLayout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard/Dashboard';
import { useSelector } from 'react-redux';
import Profile from './pages/Profile';
import Assignrole from './pages/UsersManagement/Assignrole';
import PaymentGateway from './pages/Payment Gateway/PaymentGateway';
import Tenant from './pages/Tenant/Tenant';
import TemplateUI from './pages/TemplateUI/TemplateUI';
import Login from './pages/LoginPage';
import BookAppointment from './pages/BookAppointment';
import QuickAppointment from './pages/QuickAppointment';
import DoctorFormWizard from './pages/DoctorFormWizard';
import DoctorRegistration from './pages/DoctorRegistration';
import Membership from './pages/Membership';
import PatientRegistration from './pages/PatientRegistration';
import PatientFormWizard from './pages/PatientFormWizard';

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
          path="/BookAppointment"
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
          path="/tenant"
          element={
            <>
              <PageTitle title="Tenant | CarePoint Pro" />
              <Tenant />
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
          path="/usersmanagement/role"
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
          path="/paymentgateway"
          element={
            <>
              <PageTitle title="PaymentGateway | CarePoint Pro" />
                <PaymentGateway />
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
          path="/Membership"
          element={
            <>
              <PageTitle title="Membership | CarePoint Pro" />
              <Membership />
            </>
          }
        />
        
        <Route
          path="/Membership/Free"
          element={
            <>
              <PageTitle title="Membership | CarePoint Pro" />
              <Membership />
            </>
          }
        />
        <Route
          path="/Membership/silver"
          element={
            <>
              <PageTitle title="Membership | CarePoint Pro" />
              <Membership />
            </>
          }
        />
        <Route
          path="/Membership/gold"
          element={
            <>
              <PageTitle title="Membership | CarePoint Pro" />
              <Membership />
            </>
          }
        />
        <Route
          path="/Membership/premium"
          element={
            <>
              <PageTitle title="Membership | CarePoint Pro" />
              <Membership />
            </>
          }
        />
        <Route
          path="/Membership/elite"
          element={
            <>
              <PageTitle title="Membership | CarePoint Pro" />
              <Membership />
            </>
          }
        />
        
        
        
      
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
          path="/masters" 
          element={
            <>
              <PageTitle title="Masters | CarePoint Pro" />
              <Masters />
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
