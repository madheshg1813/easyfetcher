import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  title: "Terms of Service — EasyFetcher",
  description: "Read the Terms of Service for using EasyFetcher and our MCP integrations.",
};

const termsBreadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.easyfetcher.com" },
    { "@type": "ListItem", position: 2, name: "Terms of Service", item: "https://www.easyfetcher.com/terms" },
  ],
};

export default function TermsPage() {
  return (
    <>
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SiteNav />

      {/* Header */}
      <section className="pt-20 pb-12 px-4 sm:px-6 text-center border-b border-gray-100" style={{ background: "linear-gradient(180deg, #fffbeb 0%, #ffffff 100%)" }}>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
            Terms of Service
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
            Welcome to EasyFetcher! These Terms of Service (&quot;Terms&quot;) govern your access to and use of our website <a href="https://easyfetcher.com" className="text-amber-600 hover:underline">easyfetcher.com</a> and our Model Context Protocol (MCP) integrations (collectively, the &quot;Service&quot;). Please read these Terms carefully before using the Service.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            By creating an account, accessing, or using the Service, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not access or use the Service.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Description of Service</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            EasyFetcher provides an integration layer that allows users to authorize and connect third-party marketing and SEO data sources (such as Google Search Console and Google Analytics 4) to local AI clients via the Model Context Protocol (MCP). We facilitate the secure exchange of authentication tokens and API calls between your AI client and third-party data providers.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. User Accounts</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            To use certain features of the Service, you must register for an account. You agree to:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-600">
            <li>Provide accurate, current, and complete information during registration.</li>
            <li>Maintain the security of your password and credentials.</li>
            <li>Promptly update your account information if any details change.</li>
            <li>Accept responsibility for all activities that occur under your account.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Third-Party Integrations and OAuth</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            The Service enables you to grant EasyFetcher access to your accounts on third-party platforms (like Google) via OAuth. By linking these accounts, you authorize us to retrieve information from those platforms in real-time on your behalf, solely to serve your queries through the MCP client. You acknowledge that your use of third-party platforms is governed by their respective terms of service and privacy policies.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Billing, Subscriptions, and Refunds</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-600">
            <li>
              <strong>Subscriptions:</strong> Certain features of the Service are billed on a subscription basis. You will be billed in advance on a recurring monthly or annual cycle.
            </li>
            <li>
              <strong>Cancellations:</strong> You can cancel your subscription at any time through your billing settings. Your subscription will remain active until the end of the current billing period.
            </li>
            <li>
              <strong>Refunds:</strong> We offer a 30-day money-back guarantee for all new subscriptions. If you are unsatisfied, contact us within 30 days of your initial purchase for a full refund.
            </li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">6. Acceptable Use and Restrictions</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            You agree not to:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-600">
            <li>Use the Service for any illegal, unauthorized, or fraudulent purpose.</li>
            <li>Abuse, spam, or overload our servers or API endpoints.</li>
            <li>Attempt to bypass, disable, or interfere with security features of the Service.</li>
            <li>Decompile, reverse-engineer, or attempt to extract the source code of the Service.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">7. Intellectual Property</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            EasyFetcher and its original content, features, designs, and logos are and will remain the exclusive property of EasyFetcher and its licensors. You may not copy, modify, or use our branding or assets without our prior written consent.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">8. Limitation of Liability and Disclaimers</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            <strong>Disclaimers:</strong> The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. We disclaim all warranties of any kind, whether express or implied, including the accuracy of marketing data retrieved from third-party APIs.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            <strong>Limitation of Liability:</strong> In no event shall EasyFetcher be liable for any indirect, incidental, special, consequential, or punitive damages, or loss of profits or data, resulting from your use or inability to use the Service. Our total liability for any claim shall not exceed the amount paid by you to us in the preceding 12 months.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">9. Termination</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            We reserve the right to terminate or suspend your account and access to the Service at our sole discretion, without prior notice, if you violate these Terms or engage in conduct that harms our service or other users.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">10. Governing Law</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            These Terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law principles.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">11. Contact Us</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            If you have any questions or feedback regarding these Terms, please contact us at:
          </p>
          <p className="font-semibold text-gray-800">
            Email: <a href="mailto:support@easyfetcher.com" className="text-amber-600 hover:underline">support@easyfetcher.com</a>
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(termsBreadcrumb) }}
    />
    </>
  );
}
