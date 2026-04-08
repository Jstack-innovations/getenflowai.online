import { useNavigate } from "react-router-dom";
import "./Plans.css"; // You can style it separately

type Plan = {
  title: string;
  price: string;
  features: string[];
  cta: string;
  isContact?: boolean;
  amount?: number; 
};

const plans: Plan[] = [
  {
    title: "Annual Deal (WEB Only)",
    price: "$300",
    features: [
      "Access all analytics dashboards",
      "Export reports as PDF",
      "View top-selling items",
    ],
    cta: "Pay Now",
    amount: 300, 
  },
  {
    title: "Annual Deal (WEB + MOBILE APP cross platform)",
    price: "$600",
    features: [
      "Access all analytics dashboards",
      "Export reports as PDF",
      "View top-selling items",
    ],
    cta: "Pay Now",
    amount: 600, 
  },
  {
    title: "Monthly Deal Subscription (WEB Only)",
    price: "$20 / month after first installmental fee ($80)",
    features: [
      "Monthly Subscription Plan",
      "Automatic updates & insights",
      "Priority WhatsApp support",
    ],
    cta: "Subscribe",
    amount: 80, 
  },
  {
    title: "Monthly Deal Subscription (WEB + MOBILE APP cross platform)",
    price: "$35 / month after first installmental fee ($150)",
    features: [
      "Monthly Subscription Plan",
      "Automatic updates & insights",
      "Priority WhatsApp support",
    ],
    cta: "Subscribe",
    amount: 150, 
  },
  {
    title: "Custom / Enterprise Plan",
    price: "Contact Us",
    features: [
      "Personalized dashboards",
      "Multiple branch support",
      "Dedicated account manager",
      "Email & WhatsApp support",
    ],
    cta: "Contact Us",
    isContact: true,
  },
];

export default function SubscriptionPage() {
  const navigate = useNavigate();

  const handleCTA = (plan: Plan) => {
  if (plan.isContact) {
    window.open("mailto:support@artisan.com", "_blank");
    return;
  }

  navigate("/checkout", { state: { plan } });
};

  return (
    <div className="subscription-page">
      {/* Hero Section */}
      <section className="hero">

  {/* Background Video */}
  <video
    autoPlay
    muted
    loop
    playsInline
    className="hero-video"
  >
    <source src="https://jstack-sigma.vercel.app/artisangrill/unlimited.mp4" type="video/mp4" />
  </video>

  <div className="hero-overlay"></div>

  <div className="hero-text">
    <h1>Unlock Full Business Insights</h1>
    <p>Try 5 Days Free – No Credit Card Required</p>
    <button className="primary-btn" onClick={() => navigate("/payment")}>
      Start Free Trial
    </button>
  </div>

  <div className="hero-image">
    <img src="/images/dashboard-preview.png" alt="Dashboard Preview" />
  </div>

</section>

      {/* Plans Section */}
      <section className="plans-section">
        <h2>Choose Your Plan</h2>
        <div className="plans-cards">
          {plans.map((plan, index) => (
            <div key={index} className="plan-card">
              <h3>{plan.title}</h3>
              <p className="price">{plan.price}</p>
              <ul>
                {plan.features.map((feat, idx) => (
                  <li key={idx}>{feat}</li>
                ))}
              </ul>
              <button
                className="primary-btn"
                onClick={() => handleCTA(plan)}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Why Upgrade Section */}
      <section className="why-upgrade">
        <h2>Why Upgrade?</h2>
        <div className="benefits">
          <div className="benefit-card">
            <h4>Gain Full Control</h4>
            <p>Access unlimited reports and insights.</p>
          </div>
          <div className="benefit-card">
            <h4>Save Time</h4>
            <p>No manual tracking. Everything automated.</p>
          </div>
          <div className="benefit-card">
            <h4>Grow Revenue</h4>
            <p>Optimize menu, tables, and sales for maximum profit.</p>
          </div>
        </div>
      </section>

      {/* Free Trial Reminder */}
      <section className="trial-reminder">
        <h3>Your 5-Day Free Trial Ends Soon – Keep Going!</h3>
        <p>
          Experience full analytics without interruption. Upgrade to continue
          seamlessly.
        </p>
        <button className="primary-btn" onClick={() => navigate("/payment")}>
          Upgrade Now
        </button>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <h2>FAQ</h2>
        <div className="faq-item">
          <h4>What happens after free trial?</h4>
          <p>Access is limited until you upgrade to a paid plan.</p>
        </div>
        <div className="faq-item">
          <h4>Can I switch plans?</h4>
          <p>Yes, one-time or subscription anytime.</p>
        </div>
        <div className="faq-item">
          <h4>Payment methods?</h4>
          <p>Card, bank transfer, USSD via Flutterwave.</p>
        </div>
        <div className="faq-item">
          <h4>Need a custom plan?</h4>
          <p>Email us or WhatsApp for enterprise solutions.</p>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <p>© 2026 Artisan Grills. All rights reserved.</p>
      </footer>
    </div>
  );
      }
