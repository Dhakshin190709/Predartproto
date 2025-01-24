import React from 'react';
import ChartOne from '../components/Charts/ChartOne';
import ChartThree from '../components/Charts/ChartThree';
import ChartTwo from '../components/Charts/ChartTwo';
import ChartFour from '../components/Charts/ChartFour';
import QuickAccess from '../components/Charts/QuickAccess';

const HomePage: React.FC = () => {
    const patients = [
        {
          id: 1,
          name: "John Doe",
          age: 30,
          contact: "123-456-7890",
          lastVisit: "2024-12-20",
        },
        {
          id: 2,
          name: "Jane Smith",
          age: 25,
          contact: "987-654-3210",
          lastVisit: "2024-12-22",
        },
        {
          id: 3,
          name: "Jack",
          age: 21,
          contact: "937-644-3213",
          lastVisit: "2024-12-22",
        },
      ];
  return (
    <div className="dashboard-container">
      
      {/* Article Section */}
      <article className="mt-5">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {patients.map((patient) => (
      <div
        key={patient.id}
        className="bg-white shadow-lg rounded-lg p-4 flex flex-col" // Added mx-4 for margin on left and right
      >
        <h3 className="text-lg font-semibold mb-2 text-gray-800">
          {patient.name}
        </h3>
        <p className="text-gray-600">Age: {patient.age}</p>
        <p className="text-gray-600">Contact: {patient.contact}</p>
        <p className="text-gray-600">Last Visit: {patient.lastVisit}</p>
        {/* Button Container */} 
        <div className="flex justify-between mt-4">
          <button className="bg-primary text-white px-4 py-2 mr-5 rounded-lg font-medium">
            View Details
          </button>
          <button className="bg-secondary px-4 py-2 rounded-lg text-white font-medium">
            Book Appointment
          </button>
        </div>
      </div>
    ))}
  </div>
</article>



   

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
