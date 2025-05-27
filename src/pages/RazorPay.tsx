import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../api/request';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Razorpay: React.FC = () => {
  const [amount, setAmount] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);

  const patientID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (document.getElementById('razorpay-sdk')) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.id = 'razorpay-sdk';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initiatePayment = async () => {
    if (amount <= 0) {
      toast.warning('Please enter a valid amount');
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error('Failed to load Razorpay SDK');
      return;
    }

    try {
      const response = await api.post('/RazorPay/CreateOrder', { patientID, amount });

      const orderId = response?.data?.data?.orderId;
      if (!orderId) {
        toast.error('Order ID not received');
        return;
      }

      const options = {
        key: 'rzp_test_xyMFM5Y7nGr0Uk',
        amount: amount * 100,
        currency: 'INR',
        name: 'PreCare',
        description: 'Doctor Consultation',
        order_id: orderId,
        handler: async function (response: any) {
          setIsLoading(true); // Show loading spinner

          try {
            const verifyRes = await api.post('/RazorPay/VerifyOrder', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data?.success) {
              setTimeout(() => {
                setIsLoading(false);
                setIsVerified(true);
              }, 2000); // simulate processing delay
            } else {
              setIsLoading(false);
              toast.error(`Verification failed: ${verifyRes.data?.data}`);
            }
          } catch (err) {
            setIsLoading(false);
            toast.error('Error verifying payment');
            console.error('Verification error:', err);
          }
        },
        prefill: {
          name: 'BanuPriya',
          email: 'banu291002@gmail.com',
          contact: '9500123179',
        },
        theme: {
          color: '#1976d2',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Order creation failed:', error);
      toast.error('❌ Failed to create order. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 p-6 relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
          <div className="border-4 border-blue-500 border-t-transparent rounded-full w-16 h-16 animate-spin"></div>
        </div>
      )}

      {isVerified ? (
        <div className="bg-green-100 border border-green-400 text-green-800 px-8 py-6 rounded-2xl shadow-xl text-center">
          <h2 className="text-2xl font-bold mb-2">Payment Verified</h2>
          <p className="text-lg">Thank you for your payment!</p>
        </div>
      ) : (
        <div className={`w-full max-w-md bg-white shadow-lg rounded-2xl p-8 space-y-6 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
          <h2 className="text-2xl font-bold text-center text-blue-800">Razorpay Payment</h2>

          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            placeholder="Enter amount in ₹"
          />

          <button
            className="w-full bg-blue-600 text-white font-medium px-4 py-3 rounded-lg hover:bg-blue-700 transition-all"
            onClick={initiatePayment}
          >
            Pay ₹{amount}
          </button>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Razorpay;
