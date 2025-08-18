
// import React, { useState } from 'react';
// import { IoMdAdd, IoMdRemove } from 'react-icons/io';
// import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

// const faqs = [
//   {
//     question: 'How can I book an appointment with a doctor?',
//     answer:
//       'You can book an appointment online by visiting the doctor’s profile and selecting an available time slot.',
//   },
//   {
//     question: 'Can I consult with doctors online?',
//     answer:
//       'Yes, we offer both in-person and online video consultations with certified doctors.',
//   },
//   {
//     question: 'How do I access my medical reports?',
//     answer:
//       'After logging in, you can go to your profile and view or download your reports under the “My Reports” section.',
//   },
// ];

// const Contact: React.FC = () => {
//   const [openIndex, setOpenIndex] = useState<number | null>(null);

//   const toggleFAQ = (index: number) => {
//     setOpenIndex(openIndex === index ? null : index);
//   };

//   return (
//     <div id="Contact" className="p-6 bg-blue-50 min-h-[400px]">
//       <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 p-8 rounded-lg items-start">
//         {/* Left: Contact Info */}
//         <div className="flex flex-col items-center md:items-start">
//           <h3 className="text-black text-4xl mb-6 text-center md:text-left">
//             Contact Info
//           </h3>

//           <div className="flex items-start gap-4 text-gray-700 mb-4 w-full max-w-sm">
//             <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-400 text-white text-lg mt-1">
//               <FaMapMarkerAlt />
//             </span>
//             <span>
//               455 West Orchard Street <br />
//               Kings Mountain, NC 280867
//             </span>
//           </div>

//           <div className="flex items-center gap-4 text-gray-700 mb-3 w-full max-w-sm">
//             <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-400 text-white text-lg">
//               <FaPhoneAlt />
//             </span>
//             <span>123-456-789</span>
//           </div>

//           <div className="flex items-center gap-4 text-gray-700 w-full max-w-sm">
//             <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-400 text-white text-lg">
//               <FaEnvelope />
//             </span>
//             <a
//               href="mailto:uivisionaries@gmail.com"
//               className="hover:underline"
//             >
//               uivisionaries@gmail.com
//             </a>
//           </div>
//         </div>

//         {/* Right: FAQ Section */}
//         <div className="flex flex-col items-center md:items-start">
//           <h2 className="text-black text-4xl mb-6 text-center md:text-left">
//             Frequently Asked Questions
//           </h2>
//           <div className="space-y-4 w-full">
//             {faqs.map((faq, index) => (
//               <div
//                 key={index}
//                 className="bg-gray-50 border border-black rounded-lg shadow-sm transition-all duration-300"
//               >
//                 <button
//                   onClick={() => toggleFAQ(index)}
//                   className="flex justify-between items-center w-full p-4 text-left text-gray-800 hover:bg-gray-100 rounded-lg"
//                 >
//                   <span className="text-base font-medium">{faq.question}</span>
//                   <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white text-xl">
//                     {openIndex === index ? <IoMdRemove /> : <IoMdAdd />}
//                   </span>
//                 </button>
//                 {openIndex === index && (
//                   <div className="p-4 pt-0 text-gray-600 text-sm">
//                     {faq.answer}
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Contact;

























import React, { useState } from 'react';
import { IoMdAdd, IoMdRemove } from 'react-icons/io';
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
} from 'react-icons/fa';

const faqs = [
  {
    question: 'How can I book an appointment with a doctor?',
    answer:
      'You can book an appointment online by visiting the doctor’s profile and selecting an available time slot.',
  },
  {
    question: 'Can I consult with doctors online?',
    answer:
      'Yes, we offer both in-person and online video consultations with certified doctors.',
  },
  {
    question: 'How do I access my medical reports?',
    answer:
      'After logging in, you can go to your profile and view or download your reports under the “My Reports” section.',
  },
];

const Contact: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div id="Contact" className="p-6 bg-blue-50 min-h-[400px]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 p-8 rounded-lg items-start">
        {/* Left: Contact Info */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="text-black text-4xl mb-6 text-center md:text-left">
            Contact Info
          </h3>

          <div className="flex items-start gap-4 text-gray-700 mb-4 w-full max-w-sm">
            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-400 text-white text-lg mt-1">
              <FaMapMarkerAlt />
            </span>
            <span>
              455 West Orchard Street <br />
              Kings Mountain, NC 280867
            </span>
          </div>

          <div className="flex items-center gap-4 text-gray-700 mb-3 w-full max-w-sm">
            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-400 text-white text-lg">
              <FaPhoneAlt />
            </span>
            <span>123-456-789</span>
          </div>

          <div className="flex items-center gap-4 text-gray-700 w-full max-w-sm">
            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-400 text-white text-lg">
              <FaEnvelope />
            </span>
            <a
              href="mailto:uivisionaries@gmail.com"
              className="hover:underline"
            >
              uivisionaries@gmail.com
            </a>
          </div>

          {/* Social Media Icons */}
          <div className="flex gap-4 mt-12">
            <a
              href="#"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600"
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>
            <a
              href="#"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-pink-500 text-white hover:bg-pink-600"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="#"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-700 text-white hover:bg-blue-800"
              aria-label="LinkedIn"
            >
              <FaLinkedinIn />
            </a>
            <a
              href="#"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600"
              aria-label="WhatsApp"
            >
              <FaWhatsapp />
            </a>
          </div>
        </div>

        {/* Right: FAQ Section */}
        <div className="flex flex-col items-center md:items-start">
          <h2 className="text-black text-4xl mb-6 text-center md:text-left">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4 w-full">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-50 border border-black rounded-lg shadow-sm transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="flex justify-between items-center w-full p-4 text-left text-gray-800 hover:bg-gray-100 rounded-lg"
                >
                  <span className="text-base font-medium">{faq.question}</span>
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white text-xl">
                    {openIndex === index ? <IoMdRemove /> : <IoMdAdd />}
                  </span>
                </button>
                {openIndex === index && (
                  <div className="p-4 pt-0 text-gray-600 text-sm">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
