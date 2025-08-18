import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PrescriptionAnswers: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const entries = location.state?.entries || [];

  const calculateDiscount = (unitPrice: number, discount: number) => {
    return (unitPrice * discount) / 100; // Calculates discount amount
  };

  const calculateTotalPrice = (quantity: number, unitPrice: number, discount: number) => {
    const discountAmount = calculateDiscount(unitPrice, discount);
    const priceAfterDiscount = unitPrice - discountAmount;
    return quantity * priceAfterDiscount;
  };
// Utility function to convert number to words
const numberToWords = (num) => {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero';
  if (num < 20) return a[num];
  if (num < 100) return b[Math.floor(num / 10)] + (num % 10 ? ' ' + a[num % 10] : '');

  if (num < 1000) {
    return a[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' ' + numberToWords(num % 100) : '');
  }

  if (num < 100000) {
    return numberToWords(Math.floor(num / 1000)) + ' Thousand' +
      (num % 1000 !== 0 ? ' ' + numberToWords(num % 1000) : '');
  }

  return ''; // Extend this for larger numbers if needed
};
  
  
// const calculateTotal = () => {
//   let totalAmount = 0;

  
//   tablets.forEach(() => {
//     const unitPrice = tablet.unitPrice || 10;
//     const totalPrice = tablet.count * unitPrice;
//     totalAmount += totalPrice;
//   });

 
//   tonics.forEach(() => {
//     const unitPrice = tonic.unitPrice || 5;
//     const totalPrice = parseFloat(tonic.ml) * unitPrice;
//     totalAmount += totalPrice;
//   });

 
  // const discount = parseFloat((totalAmount * 0.1).toFixed(2)); 
  // const discountedTotal = totalAmount - discount;

  
  // const gst = parseFloat((discountedTotal * 0.18).toFixed(2));
  // const grandTotal = parseFloat((discountedTotal + gst).toFixed(2));

  // return { totalAmount, discount, discountedTotal, gst, grandTotal };


// Usage
// const { totalAmount, discount, discountedTotal, gst, grandTotal } = calculateTotal();
// const grandTotalInWords = numberToWords(Math.round(grandTotal));

  return (
    <div className="p-6 bg-white">
      {/* Top Section: Back Button aligned left and Print Button aligned right */}
      <div className="flex justify-between items-center mb-6">
        <div
          onClick={() => navigate('/medical')}
          className="text-blue-500 flex items-center cursor-pointer hover:underline"
        >
          <span className="mr-2">←</span>
          Back to Medical Prescription
        </div>

        <button
          onClick={() => window.print()}
          className="bg-gradient-to-b from-[#004A99] to-[#007BFF]
          hover:from-[#007BFF] hover:to-[#004A99]
          text-white transition duration-150 
          ease-out hover:ease-in py-2 px-5 rounded-lg"
        >
          Print
        </button>
      </div>
      {/* Header Section */}
      <div className="text-center font-semibold">
        <h2 className="text-lg">Hospital Name</h2>
        <p>Address: 123 Health Street, Wellness City</p>
        <p>Phone: (123) 456-7890 | Email: contact@hospital.com</p>
      </div>

      <br />

      {/* Patient Details */}
      <div className="w-full">
        {/* Outside Alignments */}
        <div className="flex justify-between px-6 text-gray-400 font-semibold mb-2">
          <span style={{ color: '#bcc2be' }}>Prescription Number: 021</span>
          <span style={{ color: '#bcc2be' }}>Appointment Number: 04</span>
        </div>

        {/* Inside Box */}
        <div className="rounded-lg border border-stroke bg-transparent py-4 px-6 text-gray-400 shadow-md">
          <div className="text-center font-semibold" style={{ color: '#bcc2be' }}>
            Patient Name: Priya | Date: 2024-12-09 | Age: 22 | Gender: Female
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4 mt-4">Prescription Details</h2>
      {entries.length > 0 ? (
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 bg-blue-200 py-2" style={{ width: '10%' }}>S.No</th>
              <th className="border border-gray-300 px-4 bg-blue-200 py-2" style={{ width: '40%' }}>Items</th>
              <th className="border border-gray-300 px-4 bg-blue-200 py-2" style={{ width: '10%' }}>Quantity</th>
              <th className="border border-gray-300 px-4 bg-blue-200 py-2" style={{ width: '10%' }}>Unit Price (MRP)</th>
              <th className="border border-gray-300 px-4 bg-blue-200 py-2" style={{ width: '10%' }}>Discount (%)</th>
              <th className="border border-gray-300 px-4 bg-blue-200 py-2" style={{ width: '10%' }}>Total Price</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => {
              const totalPrice = calculateTotalPrice(entry.quantity, entry.unitPrice, entry.discount);
              return (
                <tr key={entry.id}>
                  <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{entry.items}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{entry.quantity}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{entry.unitPrice}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{entry.discount}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{totalPrice}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>No data available.</p>
      )}

      {/* GST and Total Amount Section aligned to the right */}
      <div className="flex justify-end gap-4 mb-6 mt-4">
  <div className="text-right">
    <div className="flex items-center">
      <span className="w-1/2 text-left pl-4"><strong>Discount</strong></span>
      <span className="text-center w-6">:</span>
      <span className="w-1/2 text-right pr-4">NaN</span>
    </div>
    <div className="flex items-center mt-2">
      <span className="w-1/2 text-left pl-4"><strong>CGST (9%)</strong></span>
      <span className="text-center w-6">:</span>
      <span className="w-1/2 text-right pr-4">NaN</span>
    </div>
    <div className="flex mt-2 items-center">
      <span className="w-1/2 text-left pl-4"><strong>SGST (9%)</strong></span>
      <span className="text-center w-6">:</span>
      <span className="w-1/2 text-right pr-4">NaN</span>
    </div>
    <div className="flex mt-2 items-center">
      <span className="w-1/2 text-left pl-4"><strong>Total Amount</strong></span>
      <span className="text-center w-6">:</span>
      <span className="w-1/2 text-right pr-4">NaN</span>
    </div>
    <div className="border-t border-dashed mt-2"></div> {/* Dotted line divider */}
    <div className="flex mt-2 items-center font-semibold">
      <span className="w-1/2 text-left pl-4"><strong>Grand Total</strong></span>
      <span className="text-center w-6">=</span>
      <span className="w-1/2 text-right pr-4">500</span>
    </div>
    <div className="flex mt-4 items-center"> {/* Adjusted margin for spacing */}
      <span className="w-full text-left pl-4"><b>five hundred Rupees only...</b></span>
    </div>
  </div>
</div>







      {/* Doctor's Signature and Print Button */}
      <div className="mt-8 flex justify-between items-center">
        <div className="flex flex-col items-start">
          <p className="font-semibold">Authorized Signature:</p>
        
        </div>
      </div>
    </div>
  );
};

export default PrescriptionAnswers;
