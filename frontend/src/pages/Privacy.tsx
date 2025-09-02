import React from 'react';
import { Helmet } from 'react-helmet-async';

const Privacy: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Privacy Policy - Build Yourself</title>
        <meta name="description" content="Privacy policy for Build Yourself - AI-powered bike customization platform" />
      </Helmet>

      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <a href="/" className="text-[#8c52ff] hover:text-gray-600 font-medium">← Back to Home</a>
            <h1 className="text-xl font-semibold text-gray-900">Privacy Policy</h1>
            <div className="w-20"></div> {/* Spacer for alignment */}
          </div>
        </div>
      </nav>

      {/* Quick Links */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex space-x-4 overflow-x-auto whitespace-nowrap pb-2">
            {['Information We Collect', 'How We Use Information', 'Data Storage', 'Your Rights', 'Contact Us'].map((section, index) => (
              <button
                key={section}
                onClick={() => scrollToSection(`section-${index + 1}`)}
                className="text-sm px-4 py-2 rounded-full bg-gray-100 hover:bg-[#8c52ff] hover:text-white transition-colors"
              >
                {section}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 prose prose-indigo">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <section id="section-1" className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
          <h3 className="text-xl font-medium mb-2">1.1 Account Information</h3>
          <p>When you create an account, we collect:</p>
          <ul>
            <li>Email address</li>
            <li>Name</li>
            <li>Authentication data (Google OAuth information if used)</li>
          </ul>

          <h3 className="text-xl font-medium mb-2 mt-4">1.2 Project Data</h3>
          <p>When you use our services, we collect:</p>
          <ul>
            <li>Bike customization preferences</li>
            <li>Generated images</li>
            <li>Project settings and configurations</li>
            <li>Usage patterns and interactions</li>
          </ul>

          <h3 className="text-xl font-medium mb-2 mt-4">1.3 Payment Information</h3>
          <p>For premium features, we collect:</p>
          <ul>
            <li>Payment method details (processed securely by our payment provider)</li>
            <li>Transaction history</li>
            <li>Billing address</li>
          </ul>
        </section>

        <section id="section-2" className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
          <ul>
            <li>To provide and improve our bike customization services</li>
            <li>To generate and store your bike designs</li>
            <li>To process payments and maintain your subscription</li>
            <li>To communicate about your account and updates</li>
            <li>To provide customer support</li>
            <li>To analyze and improve our services</li>
          </ul>
        </section>

        <section id="section-3" className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data Storage and Security</h2>
          <p>We implement industry-standard security measures to protect your data:</p>
          <ul>
            <li>Secure storage of bike designs and personal information</li>
            <li>Encrypted data transmission</li>
            <li>Regular security audits</li>
            <li>Secure authentication processes</li>
          </ul>
        </section>

        <section id="section-4" className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your project data</li>
            <li>Opt-out of marketing communications</li>
          </ul>
        </section>

        <section id="section-5" className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact us at:</p>
          <p>Email: parimelazhaganbalaji@gmail.com</p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
