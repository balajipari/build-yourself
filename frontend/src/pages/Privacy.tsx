import React from 'react';
import { Helmet } from 'react-helmet-async';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Privacy Policy - Build Yourself</title>
        <meta name="description" content="Privacy policy for Build Yourself - AI-powered bike customization platform" />
      </Helmet>

      <div className="max-w-3xl mx-auto prose prose-indigo">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="mb-8">
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

        <section className="mb-8">
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

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data Storage and Security</h2>
          <p>We implement industry-standard security measures to protect your data:</p>
          <ul>
            <li>Secure storage of bike designs and personal information</li>
            <li>Encrypted data transmission</li>
            <li>Regular security audits</li>
            <li>Secure authentication processes</li>
          </ul>
        </section>

        <section className="mb-8">
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

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact us at:</p>
          <p>Email: parimelazhaganbalaji@gmail.com</p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
