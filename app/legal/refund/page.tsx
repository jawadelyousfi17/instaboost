import { LegalShell } from "../_components/legal-shell";

export const metadata = {
  title: "Refund Policy — InstaBoost",
};

const CONTACT = "support@instaboost.app";

export default function RefundPage() {
  return (
    <LegalShell eyebrow="Legal" title="Refund Policy" updated="May 28, 2026">
      <h2>1. Scope</h2>
      <p>
        This Refund Policy applies to all purchases of virtual coins made
        through the Service. By completing a purchase you confirm that you have
        read and accepted this Policy.
      </p>

      <h2>2. Digital Goods Disclosure</h2>
      <p>
        Virtual coins are digital goods. By choosing to receive them
        immediately after purchase, you expressly request immediate performance
        and acknowledge that, under most consumer-protection regimes, this may
        waive any statutory withdrawal period.
      </p>

      <h2>3. When You Can Request a Refund</h2>
      <ul>
        <li>
          <strong>Failed delivery</strong> — coins were charged but never
          credited to your account.
        </li>
        <li>
          <strong>Unauthorized transaction</strong> — your payment method was
          used without your authorization.
        </li>
        <li>
          <strong>Service unavailability</strong> — your purchased coins could
          not be spent because the Service was inoperative for more than 72
          consecutive hours.
        </li>
        <li>
          <strong>Duplicate charge</strong> — you were charged twice for the
          same coin package.
        </li>
      </ul>

      <h2>4. When We Cannot Issue a Refund</h2>
      <ul>
        <li>Coins that have already been spent on orders.</li>
        <li>
          Orders that were fulfilled by other users in accordance with the
          rules of the Service.
        </li>
        <li>
          Account closures or restrictions resulting from violations of our{" "}
          <a href="/legal/terms">Terms of Service</a>.
        </li>
        <li>
          Changes to Instagram&rsquo;s platform, policies, or algorithm that
          affect the perceived value of the engagement received.
        </li>
      </ul>

      <h2>5. How to Request a Refund</h2>
      <p>
        Email <a href={`mailto:${CONTACT}`}>{CONTACT}</a> within 14 days of the
        original charge, including:
      </p>
      <ul>
        <li>The email address on your account.</li>
        <li>The order ID or invoice number from your payment receipt.</li>
        <li>A brief description of the issue.</li>
      </ul>

      <h2>6. Processing Time</h2>
      <p>
        We respond to refund requests within 5 business days. Approved refunds
        are returned to the original payment method and typically appear within
        5&ndash;10 business days, depending on your bank or card issuer.
      </p>

      <h2>7. Chargebacks</h2>
      <p>
        If you initiate a chargeback or payment dispute without first
        contacting us, we may suspend your account pending investigation.
        Please give us the chance to resolve the issue before involving your
        bank.
      </p>

      <h2>8. Contact</h2>
      <p>
        Questions or concerns? Email us at{" "}
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>
    </LegalShell>
  );
}
