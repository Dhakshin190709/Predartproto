import React from 'react';
import ChartOne from '../components/Charts/ChartOne';
import ChartThree from '../components/Charts/ChartThree';
import ChartTwo from '../components/Charts/ChartTwo';
import ChartFour from '../components/Charts/ChartFour';
import QuickAccess from '../components/Charts/QuickAccess';
import UpcomingAppointments from '../components/Charts/upcomingAppointment';

const HomePage: React.FC = () => {
  return (
    <div className="dashboard-container p-5">
      <div>
        <UpcomingAppointments />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Row 1: ChartOne & ChartTwo (Increase ChartTwo Height) */}
        <div className="w-full flex">
          <div className="w-full p-3 bg-white rounded-lg shadow-md">
            <ChartOne />
          </div>
        </div>
        <div className="w-full flex">
          <div className="w-full min-h-[400px] p-3 bg-white rounded-lg shadow-md">
            <ChartTwo />
          </div>
        </div>

        {/* Row 2: ChartThree & ChartFour */}
        <div className="w-full flex">
          <div className="w-full p-3 bg-white rounded-lg shadow-md">
            <ChartThree />
          </div>
        </div>
        <div className="w-full flex">
          <div className="w-full p-3 bg-white rounded-lg shadow-md">
            <ChartFour />
          </div>
        </div>

        {/* Row 3: QuickAccess (All Boxes Same Size) */}
        <div className="col-span-1 md:col-span-2 flex">
          <div className="w-full p-3 bg-white rounded-lg shadow-md">
            <QuickAccess />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
