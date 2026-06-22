// Accepted payment methods — simple, recognizable SVG marks (live DOM, so
// fonts render fine). Kept minimal/generic rather than exact logo artwork.
export default function PaymentMarks() {
  return (
    <div className="pay-marks" role="list" aria-label="Moyens de paiement acceptés">
      {/* Visa */}
      <svg className="pay-mark" viewBox="0 0 40 26" role="listitem" aria-label="Visa">
        <rect width="40" height="26" rx="4" fill="#fff" stroke="#E7E7E7" />
        <text x="20" y="17.5" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontStyle="italic" fontSize="11" fill="#1A1F71">VISA</text>
      </svg>

      {/* Mastercard */}
      <svg className="pay-mark" viewBox="0 0 40 26" role="listitem" aria-label="Mastercard">
        <rect width="40" height="26" rx="4" fill="#fff" stroke="#E7E7E7" />
        <circle cx="16.5" cy="13" r="6.5" fill="#EB001B" />
        <circle cx="23.5" cy="13" r="6.5" fill="#F79E1B" fillOpacity="0.85" />
      </svg>

      {/* American Express */}
      <svg className="pay-mark" viewBox="0 0 40 26" role="listitem" aria-label="American Express">
        <rect width="40" height="26" rx="4" fill="#1F72CF" />
        <text x="20" y="16" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="7.5" fill="#fff">AMEX</text>
      </svg>

      {/* PayPal */}
      <svg className="pay-mark" viewBox="0 0 40 26" role="listitem" aria-label="PayPal">
        <rect width="40" height="26" rx="4" fill="#fff" stroke="#E7E7E7" />
        <text x="20" y="17" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontStyle="italic" fontSize="8.5">
          <tspan fill="#003087">Pay</tspan><tspan fill="#009CDE">Pal</tspan>
        </text>
      </svg>

      {/* Apple Pay */}
      <svg className="pay-mark" viewBox="0 0 40 26" role="listitem" aria-label="Apple Pay">
        <rect width="40" height="26" rx="4" fill="#000" />
        <path d="M11.7 9.9c-.3.4-.8.7-1.3.6-.1-.5.1-1 .4-1.4.3-.4.8-.6 1.3-.7.1.5-.1 1-.4 1.5Zm.4.8c-.7 0-1.3.4-1.7.4-.4 0-.9-.4-1.5-.4-.8 0-1.5.5-1.9 1.2-.8 1.4-.2 3.4.6 4.5.4.6.8 1.2 1.4 1.1.6 0 .8-.4 1.5-.4.7 0 .9.4 1.5.4.6 0 1-.5 1.4-1.1.3-.4.4-.7.6-1.1-1.5-.6-1.7-2.7-.2-3.5-.4-.6-1.1-.9-1.7-.9Z" fill="#fff" />
        <text x="25" y="16.5" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="600" fontSize="8" fill="#fff">Pay</text>
      </svg>

      {/* Google Pay */}
      <svg className="pay-mark" viewBox="0 0 40 26" role="listitem" aria-label="Google Pay">
        <rect width="40" height="26" rx="4" fill="#fff" stroke="#E7E7E7" />
        <text x="20" y="17" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="600" fontSize="8.5">
          <tspan fill="#4285F4">G</tspan><tspan fill="#5F6368"> Pay</tspan>
        </text>
      </svg>
    </div>
  )
}
