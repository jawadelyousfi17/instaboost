import { LegalShell } from "../_components/legal-shell";

export const metadata = {
  title: "Contact — InstaBoost",
};

const COMPANY = "InstaBoost";
const SUPPORT = "support@instaboost.app";
const PRIVACY = "privacy@instaboost.app";
const BILLING = "billing@instaboost.app";

export default function ContactPage() {
  return (
    <LegalShell eyebrow="Help" title="Contact us" updated="May 28, 2026">
      <h2>How to reach us</h2>
      <p>
        We&rsquo;re a small team. The fastest way to get help is by email — we
        reply to most messages within one business day.
      </p>

      <h3>General &amp; technical support</h3>
      <p>
        <a href={`mailto:${SUPPORT}`}>{SUPPORT}</a>
      </p>

      <h3>Billing, refunds, payment disputes</h3>
      <p>
        <a href={`mailto:${BILLING}`}>{BILLING}</a>
      </p>

      <h3>Privacy &amp; data requests</h3>
      <p>
        <a href={`mailto:${PRIVACY}`}>{PRIVACY}</a>
      </p>

      <h2>Response times</h2>
      <ul>
        <li>General questions: within 24 hours (business days).</li>
        <li>Billing &amp; refund requests: within 5 business days.</li>
        <li>
          Urgent security or abuse reports: please write &ldquo;URGENT&rdquo;
          in the subject line.
        </li>
      </ul>

      <h2>Mailing address</h2>
      <p>
        {COMPANY}
        <br />
        [Street address]
        <br />
        [City, postal code]
        <br />
        [Country]
      </p>

      <h2>Before you email</h2>
      <p>
        Many common questions are answered in our{" "}
        <a href="/legal/terms">Terms of Service</a>,{" "}
        <a href="/legal/privacy">Privacy Policy</a>, and{" "}
        <a href="/legal/refund">Refund Policy</a>.
      </p>
    </LegalShell>
  );
}
