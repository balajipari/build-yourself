import React from 'react';
import { Helmet } from 'react-helmet-async';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Terms and Conditions - Build Yourself</title>
        <meta name="description" content="Terms and conditions for Build Yourself - AI-powered bike customization platform" />
      </Helmet>

      <div className="max-w-3xl mx-auto prose prose-indigo">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms and Conditions</h1>
        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
          <p>By accessing and using Build Yourself ("the Service"), you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access the Service.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
          <p>Build Yourself provides:</p>
          <ul>
            <li>AI-powered bike customization tools</li>
            <li>Design storage and management</li>
            <li>Image generation services</li>
            <li>Project sharing capabilities</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
          <ul>
            <li>You must maintain accurate account information</li>
            <li>You are responsible for maintaining account security</li>
            <li>You must not share account credentials</li>
            <li>We reserve the right to terminate accounts for violations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Intellectual Property</h2>
          <h3 className="text-xl font-medium mb-2">4.1 Your Content</h3>
          <p>You retain rights to your custom designs, but grant us license to:</p>
          <ul>
            <li>Store and display your designs</li>
            <li>Use designs for service improvement</li>
            <li>Feature designs (with attribution) in marketing</li>
          </ul>

          <h3 className="text-xl font-medium mb-2 mt-4">4.2 Our Content</h3>
          <p>We retain all rights to:</p>
          <ul>
            <li>Our AI models and algorithms</li>
            <li>Platform features and functionality</li>
            <li>Service branding and content</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Payment Terms</h2>
          <ul>
            <li>Subscription fees are billed in advance</li>
            <li>Refunds are provided according to our refund policy</li>
            <li>We may modify pricing with notice</li>
            <li>Failed payments may result in service interruption</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Usage Guidelines</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Violate any laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Share inappropriate or harmful content</li>
            <li>Attempt to breach system security</li>
            <li>Resell or redistribute our services</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
          <p>We provide the service "as is" and are not liable for:</p>
          <ul>
            <li>Service interruptions or errors</li>
            <li>Data loss or corruption</li>
            <li>Third-party content or services</li>
            <li>Indirect or consequential damages</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Changes to Terms</h2>
          <p>We may modify these terms at any time. Continued use of the Service constitutes acceptance of new terms.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Information</h2>
          <p>For questions about these Terms, contact us at:</p>
          <p>Email: parimelazhaganbalaji@gmail.com</p>
        </section>
      </div>
    </div>
  );
};

export default Terms;
