import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  title: "Privacy Policy — EasyFetcher",
  description: "Learn how EasyFetcher collects, uses, and protects your personal and marketing data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SiteNav />

      {/* Header */}
      <section className="pt-20 pb-12 px-4 sm:px-6 text-center border-b border-gray-100" style={{ background: "linear-gradient(180deg, #fffbeb 0%, #ffffff 100%)" }}>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500">
            Last Updated: May 30, 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto prose prose-gray">
          <p className="text-gray-600 leading-relaxed mb-6">
            At EasyFetcher (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <a href="https://easyfetcher.com" className="text-amber-600 hover:underline">easyfetcher.com</a> and use our Model Context Protocol (MCP) integrations to connect your marketing data sources (such as Google Search Console, Google Analytics 4, and Google My Business) to AI clients.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            To provide our services, we collect two types of information:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-600">
            <li>
              <strong>Account Information:</strong> When you sign up for an account, we collect basic details such as your name, email address, and billing information (handled securely through our payment provider).
            </li>
            <li>
              <strong>Connected Account Credentials (OAuth Tokens):</strong> To retrieve your marketing data, we request access to your Google Search Console, Google Analytics 4, or other marketing accounts via OAuth 2.0. We store the resulting OAuth access and refresh tokens.
            </li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. How We Handle Your Marketing Data</h2>
          <div className="bg-amber-50/50 border border-amber-100 p-5 rounded-xl mb-6">
            <p className="text-sm text-gray-700 leading-relaxed font-medium">
              <strong>CRITICAL PRIVACY NOTE:</strong> EasyFetcher does not copy, store, or cache your actual marketing, SEO, or analytics data on our servers. When you query your data through an AI client (such as Claude Desktop or Cursor) using the EasyFetcher MCP server, our service securely fetches the data from the Google APIs in real-time and streams it directly to your AI client. We only store the encrypted credentials necessary to authenticate with Google on your behalf.
            </p>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. How We Use Your Information</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-600">
            <li>Authenticate your requests to Google APIs and authorized data sources.</li>
            <li>Provide, maintain, and improve the EasyFetcher service and MCP servers.</li>
            <li>Process your payments and manage your subscription.</li>
            <li>Respond to your customer support inquiries and send administrative notices.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Data Security</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            We prioritize the security of your credentials and personal information:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-600">
            <li>All stored OAuth credentials (refresh and access tokens) are stored in our database using industry-standard AES-256 encryption.</li>
            <li>All transmissions between your browser, our servers, Google APIs, and your local AI client are encrypted using Secure Socket Layer (SSL/HTTPS) technology.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Sharing of Your Information</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            We do not sell, trade, or otherwise rent your personal information or connected account data to third parties. We may share information with trusted third-party service providers (such as hosting and payment processors) solely to operate our service, subject to strict confidentiality agreements.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">6. Third-Party Services and API Data</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            EasyFetcher&apos;s use of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">Google API Services User Data Policy</a>, including the Limited Use requirements. Your data accessed through Google OAuth will not be shared with or used for training AI/ML models without your explicit consent.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">7. Data Retention and Deletion</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            We retain your encrypted credentials for as long as your EasyFetcher account is active. You can revoke access and delete your account at any time through your dashboard. Upon account deletion, all stored Google OAuth tokens, settings, and personal data will be permanently and immediately removed from our active databases.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">8. Changes to This Privacy Policy</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date at the top.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">9. Contact Us</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us at:
          </p>
          <p className="font-semibold text-gray-800">
            Email: <a href="mailto:support@easyfetcher.com" className="text-amber-600 hover:underline">support@easyfetcher.com</a>
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
