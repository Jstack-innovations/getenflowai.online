import { useNavigate } from "react-router-dom";
import "./Css/SubscriptionSuccess.css";

export default function SubscriptionSuccess() {
  const navigate = useNavigate();

  const saved = localStorage.getItem("subscriptionSuccess");

  if (!saved) {
    return <h2 style={{ textAlign: "center", marginTop: 100 }}>Invalid Session</h2>;
  }

  const { planTitle, amount, formData, subscriptionCode, renewal_date } = JSON.parse(saved);

  const handlePrint = () => window.print();

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-header">
          <div className="success-icon">✓</div>
          <h4>Subscription Activated</h4>
          <p className="success-subtext">Your {planTitle} is now active.</p>
        </div>

        <div className="success-section">
          <h3>Plan Details</h3>
          <div className="row"><span>Plan</span><strong>{planTitle}</strong></div>
          <div className="row"><span>Amount Paid</span><strong>₦{amount}</strong></div>
          <div className="row"><span>Status</span><strong className="active">Active</strong></div>
          
          {renewal_date && (
  <div className="row">
    <span>Renews On</span>
    <strong>{renewal_date}</strong>
  </div>
)}

        </div>

        <div className="success-section">
          <h3>Subscriber Information</h3>
          <div className="row"><span>Full Name</span><strong>{formData.fullname}</strong></div>
          <div className="row"><span>Email</span><strong>{formData.email}</strong></div>
          <div className="row"><span>Phone</span><strong>{formData.phone}</strong></div>
          <div className="row"><span>Business</span><strong>{formData.businessName}</strong></div>
        </div>

        <div className="subscription-code-box">
          <p>Subscription Code</p>
          <h5>{subscriptionCode}</h5>
        </div>

        <div className="button-group">
          <button className="dashboard-btn" onClick={() => {
            localStorage.removeItem("subscriptionSuccess");
            navigate("/plan", { replace: true });
          }}>
            Go to Dashboard
          </button>

          <button className="print-btn" onClick={handlePrint}>
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
