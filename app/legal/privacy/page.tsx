import { LegalShell } from "../_components/legal-shell";

export const metadata = {
  title: "Privacy Policy — InstaBoost",
};

const COMPANY = "InstaBoost";
const CONTACT = "privacy@instaboost.app";

export default function PrivacyPage() {
  return (
    <LegalShell eyebrow="Legal" title="Privacy Policy" updated="May 28, 2026">
      <h2>1. Overview</h2>
      <p>
        This Privacy Policy explains what information {COMPANY} (&ldquo;we,&rdquo;
        &ldquo;us&rdquo;) collects, how we use it, and the choices you have. By
        using the Service you consent to the practices described here.
      </p>

      <h2>2. Information We Collect</h2>
      <h3>Information you provide</h3>
      <ul>
        <li>
          <strong>Account info</strong> — email address and basic profile
          fields received from Google when you sign in.
        </li>
        <li>
          <strong>Instagram handle</strong> — the public Instagram username you
          enter during onboarding and use when placing orders.
        </li>
        <li>
          <strong>Order details</strong> — the type of action, target URL or
          handle, quantity, and timestamps.
        </li>
        <li>
          <strong>Optional verification</strong> — screenshots you upload as
          proof that an action was completed. These are used only to encourage
          honest behaviour and are not stored unless explicitly required for a
          dispute.
        </li>
      </ul>

      <h3>Information collected automatically</h3>
      <ul>
        <li>Device, browser, and OS information.</li>
        <li>IP address and approximate geographic region.</li>
        <li>Pages and features you use within the Service.</li>
        <li>
          Essential cookies and local storage entries required to keep you
          signed in.
        </li>
      </ul>

      <h2>3. How We Use Information</h2>
      <ul>
        <li>To provide, secure, and maintain the Service.</li>
        <li>
          To process coin top-ups and detect fraudulent purchases or activity.
        </li>
        <li>
          To match your account to the engagement actions you perform or
          request.
        </li>
        <li>
          To communicate important service updates, security alerts, and (if
          you opt in) marketing messages.
        </li>
        <li>To comply with legal obligations.</li>
      </ul>

      <h2>4. Sharing</h2>
      <p>
        We do not sell your personal information. We share data only with the
        following categories of recipients:
      </p>
      <ul>
        <li>
          <strong>Authentication provider</strong> — Google, for sign-in.
        </li>
        <li>
          <strong>Database &amp; hosting</strong> — Supabase (auth), Neon
          (Postgres database), and Vercel (application hosting).
        </li>
        <li>
          <strong>Payment processor</strong> — 2Checkout (Verifone) or its
          successors, for processing coin purchases. We do not store full card
          numbers.
        </li>
        <li>
          <strong>Legal recipients</strong> — courts, regulators, or law
          enforcement when required by law.
        </li>
      </ul>

      <h2>5. International Transfers</h2>
      <p>
        Your information may be processed in countries outside your country of
        residence, including the United States and the European Union. Where
        required, we rely on Standard Contractual Clauses or equivalent
        safeguards.
      </p>

      <h2>6. Data Retention</h2>
      <p>
        We retain personal information for as long as your account is active or
        as needed to fulfil the purposes described in this Policy. After
        deletion, residual records (e.g. transaction logs required for
        accounting and fraud prevention) may be retained for up to seven (7)
        years.
      </p>

      <h2>7. Your Rights</h2>
      <p>
        Depending on your jurisdiction, you may have the right to access,
        rectify, port, or delete your personal data, and to object to or
        restrict certain processing. You can exercise most of these rights
        directly from the Settings page. For other requests, email{" "}
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>

      <h2>8. Children</h2>
      <p>
        The Service is not directed at children under 13. If we learn that we
        have collected personal information from a child under 13 without
        parental consent, we will delete it as soon as possible.
      </p>

      <h2>9. Security</h2>
      <p>
        We use industry-standard safeguards including HTTPS, encryption at
        rest, restricted access, and secure password practices. No method of
        electronic transmission or storage is completely secure, so we cannot
        guarantee absolute security.
      </p>

      <h2>10. Changes</h2>
      <p>
        We will post material changes to this Policy on this page and update
        the &ldquo;Last updated&rdquo; date above. We encourage you to review
        it periodically.
      </p>

      <h2>11. Contact</h2>
      <p>
        Email us at <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>
    </LegalShell>
  );
}
