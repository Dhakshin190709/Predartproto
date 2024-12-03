import React, { useState } from 'react'; 

 

const Dashboard: React.FC = () => {
  const [isFormVisible, setFormVisible] = useState(false);
  const [paymentType, setPaymentType] = useState('');  // Default payment type is empty
    const [billAmount, setBillAmount] = useState('');  // Default bill amount is empty
    const [paymentDate, setPaymentDate] = useState('');  // Default payment date is empty
    const [transactionNumber, setTransactionNumber] = useState('');  // Default transaction number is empty
    const [balance, setBalance] = useState('');  // Default balance is empty



  // Function to show the form
  const handleCollectClick = () => {
    setFormVisible(true);
  };

      
    const handlePaymentTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      setPaymentType(event.target.value);
    };
  
    const handleCancel = () => {
      setFormVisible(false);
    };
  
    const handleSave = () => {
      // Handle save logic here
      console.log({
        billAmount,
        paymentDate,
        paymentType,
        transactionNumber,
        balance,
      });
      setFormVisible(false);
    };
  

  return (
    <>
      <div className="container">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1 - Patient 1 */}
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">John Doe</h3>
                <p className="text-gray-600 mb-1">
                  <strong>Age:</strong> 45
                </p>
                <p className="text-gray-600 mb-1">
                  <strong>Condition:</strong> Hypertension
                </p>
                <p className="text-gray-600 mb-4">
                  <strong>Last Visit:</strong> 12th Sept 2024
                </p>
                <span className="text-green-500 font-bold">
                  Next Appointment: 20th Sept 2024
                </span>
              </div>
              <div className="mt-4 flex justify-between">
                <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                  Approve
                </button>
                <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                  Reject
                </button>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                  onClick={handleCollectClick} // Show the form when clicked
                >
                  Collect
                </button>
              </div>
            </div>
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">John Doe</h3>
                <p className="text-gray-600 mb-1">
                  <strong>Age:</strong> 45
                </p>
                <p className="text-gray-600 mb-1">
                  <strong>Condition:</strong> Hypertension
                </p>
                <p className="text-gray-600 mb-4">
                  <strong>Last Visit:</strong> 12th Sept 2024
                </p>
                <span className="text-green-500 font-bold">
                  Next Appointment: 20th Sept 2024
                </span>
              </div>
              <div className="mt-4 flex justify-between">
                <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                  Approve
                </button>
                <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                  Reject
                </button>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                  onClick={handleCollectClick} // Show the form when clicked
                >
                  Collect
                </button>
              </div>
            </div>

            {/* Card 2 - Patient 2 */}
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">Jane Smith</h3>
                <p className="text-gray-600 mb-1">
                  <strong>Age:</strong> 30
                </p>
                <p className="text-gray-600 mb-1">
                  <strong>Condition:</strong> Diabetes
                </p>
                <p className="text-gray-600 mb-4">
                  <strong>Last Visit:</strong> 5th Sept 2024
                </p>
                <span className="text-yellow-500 font-bold">
                  Next Appointment: Pending
                </span>
              </div>
              <div className="mt-4 flex justify-between">
                <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                  Approve
                </button>
                <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                  Reject
                </button>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                  onClick={handleCollectClick} // Show the form when clicked
                >
                  Collect
                </button>
              </div>
            </div>

            {/* Card 3 - Patient 3 */}
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">Michael Lee</h3>
                <p className="text-gray-600 mb-1">
                  <strong>Age:</strong> 62
                </p>
                <p className="text-gray-600 mb-1">
                  <strong>Condition:</strong> Arthritis
                </p>
                <p className="text-gray-600 mb-4">
                  <strong>Last Visit:</strong> 1st Sept 2024
                </p>
                <span className="text-red-500 font-bold">
                  Next Appointment: 25th Sept 2024
                </span>
              </div>
              <div className="mt-4 flex justify-between">
                <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                  Approve
                </button>
                <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                  Reject
                </button>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                  onClick={handleCollectClick} // Show the form when clicked
                >
                  Collect
                </button>
              </div>
            </div>

            {/* Card 4 - Patient 4 */}
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">Emily Clark</h3>
                <p className="text-gray-600 mb-1">
                  <strong>Age:</strong> 52
                </p>
                <p className="text-gray-600 mb-1">
                  <strong>Condition:</strong> Asthma
                </p>
                <p className="text-gray-600 mb-4">
                  <strong>Last Visit:</strong> 8th Sept 2024
                </p>
                <span className="text-green-500 font-bold">
                  Next Appointment: 18th Sept 2024
                </span>
              </div>
              <div className="mt-4 flex justify-between">
                <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                  Approve
                </button>
                <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                  Reject
                </button>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                  onClick={handleCollectClick} // Show the form when clicked
                >
                  Collect
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isFormVisible && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-xl p-8">
            <h3 className="text-xl font-bold mb-4 text-black">Payment Details</h3>
            <form>
              {/* Line 1: Bill Amount and Date */}
              <div className="flex gap-4 mb-4">
                <div className="w-full md:w-1/2">
                  <input
                    type="number"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    placeholder="Bill Amount"
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 text-black outline-none focus:border-primary focus-visible:shadow-none"
                  />
                </div>
                <div className="w-full md:w-1/2">
                  <input
                    type="date"                   
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    placeholder="Payment Date"
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none"
                  />
                </div>
              </div>

              {/* Line 2: Payment Type and Transaction Number (conditionally rendered) */}
              <div className="flex gap-4 mb-4">
                <div className="w-full">
                  <select
                    id="paymentType"
                    value={paymentType}
                    onChange={handlePaymentTypeChange}
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none"
                  >
                    <option value="">Payment Type</option>
                    <option value="Cash">Cash</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="GPay">GPay</option>
                    <option value="PhonePay">PhonePay</option>
                    <option value="UPI">UPI ID</option>
                    <option value="Net Banking">Net Banking</option>
                  </select>
                </div>

                {/* Conditionally render Transaction Number only when 'Cash' is NOT selected */}
                {paymentType !== 'Cash' && (
                  <div className="w-full">
                    <input
                      type="text"
                      value={transactionNumber}
                      onChange={(e) => setTransactionNumber(e.target.value)}
                      placeholder="Transaction Number"
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none"
                    />
                  </div>
                )}
              </div>

              {/* Line 3: Balance */}
              <div className="mb-4 w-full">
                <input
                  type="number"
                   value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="Balance"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-between mt-6 gap-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gradient-to-b from-[#004A99] to-[#007BFF] text-white rounded px-5 py-2 mt-2"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="bg-gradient-to-b from-[#004A99] to-[#007BFF] text-white rounded px-5 py-2 mt-2"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </>
  );
};

export default Dashboard;
