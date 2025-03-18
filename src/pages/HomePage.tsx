import React from 'react';
import ChartOne from '../components/Charts/ChartOne';
import ChartThree from '../components/Charts/ChartThree';
import ChartTwo from '../components/Charts/ChartTwo';
import ChartFour from '../components/Charts/ChartFour';
import QuickAccess from '../components/Charts/QuickAccess';
import UpcomingAppointments from '../components/Charts/upcomingAppointment';
const HomePage: React.FC = () => {
  
  return (
    <div className="dashboard-container">
      <div>
        <UpcomingAppointments />
      </div>

      {/* Charts Section */}
      <div className="charts grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-5">
        {/* Chart One */}
        <div className="col-span-2">
          <ChartOne />
        </div>
        {/* Chart Two */}
        <div>
          <ChartTwo />
        </div>
        {/* Chart Three */}
        <div className="col-span-3 md:col-span-1">
          <ChartThree />
        </div>
        {/* Chart Four */}
        <div className="col-span-3 md:col-span-1">
          <ChartFour />
        </div>
        {/* QuickAccess */}
        <div className="col-span-3 md:col-span-1">
          <QuickAccess />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
