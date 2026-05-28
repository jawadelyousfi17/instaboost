import { LegalShell } from "../_components/legal-shell";

export const metadata = {
  title: "Terms of Service — InstaBoost",
};

const COMPANY = "InstaBoost";
const CONTACT = "support@instaboost.app";
const JURISDICTION = "Morocco";

export default function TermsPage() {
  return (
    <LegalShell eyebrow="Legal" title="Terms of Service" updated="May 28, 2026">
      <h2>1. Introduction</h2>
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and
        use of the {COMPANY} website, mobile applications, and related services
        (collectively, the &ldquo;Service&rdquo;). By creating an account or
        otherwise using the Service, you agree to be bound by these Terms. If
        you do not agree, you must stop using the Service.
      </p>

      <h2>2. The Service</h2>
      <p>
        {COMPANY} is a community engagement platform on which users voluntarily
        exchange social media engagement (follows, likes, and views) on
        Instagram. Members earn virtual coins by performing actions on other
        members&rsquo; public Instagram content and may spend coins to receive
        equivalent actions on their own content.
      </p>
      <p>
        Virtual coins have no cash value, cannot be exchanged for legal tender,
        and are not transferable outside the Service.
      </p>

      <h2>3. Eligibility</h2>
      <p>
        You must be at least 13 years old (or the minimum age of digital
        consent in your jurisdiction, whichever is higher) to use the Service.
        By using the Service, you represent that you meet these requirements
        and that all information you provide is accurate.
      </p>

      <h2>4. Your Account</h2>
      <p>
        You are responsible for safeguarding access to your account and for any
        activity that occurs under it. You agree to notify us immediately at{" "}
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a> if you suspect unauthorized
        use.
      </p>

      <h2>5. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use bots, scripts, or automation to interact with the Service.</li>
        <li>
          Create multiple accounts to manipulate the coin economy or fulfill
          your own orders.
        </li>
        <li>
          Use the Service to engage with illegal, defamatory, or harassing
          Instagram content.
        </li>
        <li>
          Attempt to reverse engineer, decompile, or interfere with the
          security of the Service.
        </li>
        <li>
          Sell, sublicense, or transfer your account or virtual coins to
          another party.
        </li>
      </ul>

      <h2>6. Virtual Coins &amp; Purchases</h2>
      <p>
        Coin packages may be purchased through our authorized payment provider.
        All prices are listed in U.S. Dollars and exclude any applicable taxes.
        Once a coin package has been credited to your account, the purchase is
        considered fulfilled.
      </p>
      <p>
        Refund eligibility is governed by our{" "}
        <a href="/legal/refund">Refund Policy</a>, which forms part of these
        Terms.
      </p>

      <h2>7. Third-Party Services</h2>
      <p>
        Instagram is a registered trademark of Meta Platforms, Inc. {COMPANY}{" "}
        is not affiliated with, endorsed by, or sponsored by Instagram or Meta
        Platforms, Inc. You remain solely responsible for complying with
        Instagram&rsquo;s own terms of use.
      </p>

      <h2>8. No Guarantee of Results</h2>
      <p>
        Engagement delivered through the Service is performed by real human
        users on their own devices. We do not guarantee specific delivery
        times, retention of followers, post reach, or impact on Instagram
        algorithms.
      </p>

      <h2>9. Intellectual Property</h2>
      <p>
        All content, branding, software, and design elements of the Service are
        the property of {COMPANY} or its licensors. You receive a limited,
        non-exclusive, non-transferable license to access and use the Service
        for personal, non-commercial purposes.
      </p>

      <h2>10. Termination</h2>
      <p>
        You may close your account at any time from the Settings page. We may
        suspend or terminate your access if you violate these Terms, if your
        activity threatens the security or integrity of the Service, or if
        required by law. Unspent coins are forfeit upon termination caused by a
        material breach.
      </p>

      <h2>11. Disclaimer of Warranties</h2>
      <p>
        The Service is provided on an &ldquo;as is&rdquo; and &ldquo;as
        available&rdquo; basis. To the maximum extent permitted by law, we
        disclaim all warranties, express or implied, including merchantability,
        fitness for a particular purpose, and non-infringement.
      </p>

      <h2>12. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, {COMPANY} shall not be liable
        for any indirect, incidental, special, consequential, or punitive
        damages, or any loss of profits or revenue arising from your use of the
        Service. Our aggregate liability for any claim shall not exceed the
        amount you paid us in the twelve (12) months preceding the event giving
        rise to the claim.
      </p>

      <h2>13. Governing Law</h2>
      <p>
        These Terms are governed by the laws of {JURISDICTION}, without regard
        to its conflict-of-law principles. Any dispute shall be resolved
        exclusively in the courts of {JURISDICTION}.
      </p>

      <h2>14. Changes to These Terms</h2>
      <p>
        We may modify these Terms at any time. Material changes will be
        announced via the Service or by email. Continued use of the Service
        after a change constitutes acceptance of the revised Terms.
      </p>

      <h2>15. Contact</h2>
      <p>
        Questions about these Terms? Email us at{" "}
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>
    </LegalShell>
  );
}
