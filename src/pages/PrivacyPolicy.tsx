import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="bg-white shadow-xl border border-gray-200 rounded-3xl p-10">
        <h1 className="text-4xl font-bold text-blue-700 mb-6 text-center">
          Privacy Policy
        </h1>

        <p className="text-lg leading-relaxed mb-4">
          At <strong>Precare</strong>, we take your privacy and the security of your personal information seriously. This Privacy Policy outlines how we collect, use, disclose, and protect your information when you visit our website or use our services.
        </p>
        <p className="text-lg leading-relaxed mb-8">
          By using our website or services, you consent to the practices described in this policy.
        </p>

        {/* Section 1 */}
        <Section title="1. Information We Collect">
          <p className="mb-2">
            <strong>Personal Information:</strong> When you interact with our website or use our services, we may collect personal information such as your name, email address, contact details, and any other information you provide voluntarily.
          </p>
          <p className="mb-2">
            <strong>Usage Information:</strong> We collect information about how you use our website, including your IP address, browser type, referring pages, access times, and other similar data.
          </p>
          <p>
            <strong>Cookies and Tracking Technologies:</strong> We may use cookies and similar tracking technologies to enhance your browsing experience, personalize content, and gather information about how you use our website.
          </p>
        </Section>

        {/* Section 2 */}
        <Section title="2. How We Use Your Information">
          <p className="mb-2">
            <strong>Provide and Improve Services:</strong> We use your information to deliver and improve our services, respond to your inquiries, and provide you with relevant information.
          </p>
          <p className="mb-2">
            <strong>Communication:</strong> We may use your contact information to send you updates, newsletters, or promotional materials related to our services. You can opt out of receiving these communications at any time.
          </p>
          <p>
            <strong>Analytics and Personalization:</strong> We analyze user behavior and preferences to improve our website, tailor content to your interests, and enhance your overall experience.
          </p>
        </Section>

        {/* Section 3 */}
        <Section title="3. Information Sharing and Disclosure">
          <p className="mb-2">
            <strong>Service Providers:</strong> We may share your information with trusted third-party service providers who assist us in operating our website and delivering our services.
          </p>
          <p>
            <strong>Legal Compliance:</strong> We may disclose your information if required to do so by law or if we believe that such action is necessary to comply with legal obligations or protect our rights and safety.
          </p>
        </Section>

        {/* Section 4 */}
        <Section title="4. Data Security">
          <p className="mb-2">
            We implement appropriate security measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction.
          </p>
          <p>
            However, please note that no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security of your information.
          </p>
        </Section>

        {/* Section 5 */}
        <Section title="5. Third-Party Links">
          <p>
            Our website may contain links to third-party websites. Please note that we are not responsible for the privacy practices or content of these websites. We encourage you to review their privacy policies before providing any personal information.
          </p>
        </Section>

        {/* Section 6 */}
        <Section title="6. Children's Privacy">
          <p>
            Our website and services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected personal information from a child without parental consent, we will take steps to remove that information.
          </p>
        </Section>

        {/* Section 7 */}
        <Section title="7. Your Rights">
          <p>
            You have the right to access, update, and delete your personal information. If you would like to exercise these rights or have any questions or concerns about our privacy practices, please contact us using the information provided below.
          </p>
        </Section>

        {/* Section 8 */}
        <Section title="8. Changes to this Privacy Policy">
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We encourage you to review this page periodically for any updates.
          </p>
        </Section>

        {/* Contact Info */}
        <div className="mt-10 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <h3 className="text-xl font-semibold text-blue-600 mb-2">Contact Us</h3>
          <p className="text-base text-gray-700 mb-1">
            If you have any questions or require further information regarding our Privacy Policy, please contact us at{" "}
            <a
              href="mailto:info@predart.in"
              className="text-blue-600 underline hover:text-blue-800"
            >
              info@predart.in
            </a>{" "}
            or through the contact form on our website.
          </p>
        </div>

        <p className="mt-8 text-center text-base text-gray-600">
          Thank you for trusting Precare. We are committed to protecting your privacy and providing you with a secure and informative experience.
        </p>
      </div>
    </div>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-semibold text-blue-500 mb-4">{title}</h2>
      <div className="text-base text-gray-800 leading-relaxed">{children}</div>
    </div>
  );
};

export default PrivacyPolicy;
