import { useEffect, useRef } from "react";
import { API_BASE } from "../Config/enflowApi";
import { useNavigate, useLocation } from "react-router-dom";
import "./Css/Subscription.css";

export default function SubscriptionPayment() {
  const location = useLocation();
  const navigate = useNavigate();
  const paymentStarted = useRef(false);

  const { amount, planTitle, formData } = location.state || {};

  if (!amount || !formData) {
    return <h2>Invalid Payment Session</h2>;
  }

  useEffect(() => {
    async function loadKeyAndScript() {
      try {
        const res = await fetch(`${API_BASE}/flutterwave`);
        const data = await res.json();

        if (!data.publicKey) {
          alert("Failed to load payment key");
          return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.flutterwave.com/v3.js";
        script.async = true;

        script.onload = () => {
          setTimeout(() => startPayment(data.publicKey), 500);
        };

        document.body.appendChild(script);
      } catch {
        alert("Unable to load payment configuration");
      }
    }

    loadKeyAndScript();
  }, []);

  function startPayment(key: string) {
    if (paymentStarted.current) return;
    paymentStarted.current = true;

    (window as any).FlutterwaveCheckout({
      public_key: key,
      tx_ref: "SUB_" + Date.now(),
      amount,
      currency: "NGN",
      payment_options: "card,banktransfer,ussd,account",
      customer: {
        email: formData.email,
        phone_number: formData.phone,
        name: formData.fullname,
      },
      customizations: {
        title: "Artisan Grill Subscription",
        description: planTitle,
      },

      // ✅ No status check — send straight to backend just like confirmOrder
      callback: async function (data: any) {
        paymentStarted.current = false;

        try {
          const res = await fetch(`${API_BASE}/subPlans`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...formData,
              plan: planTitle,
              amount,
              transaction_id: data.transaction_id,
            }),
          });
          
        

          const result = await res.json();

          if (result.status === "success") {
            localStorage.setItem(
              "subscriptionSuccess",
              JSON.stringify({
                planTitle,
                amount,
                formData,
                subscriptionCode: result.subscription_code,
                renewal_date: result.renewal_date,
                zara_credits: result.zara_credits, // ← add this
              })
            );

            window.location.href = "/subscriptionSuccess";
          } else {
            alert(result.message || "Subscription activation failed");
          }
        } catch {
          alert("Payment succeeded but activation failed. Contact support.");
        }

      },

      onclose: function () {
        navigate("/plan", { replace: true });
      },
    });
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        flexDirection: "column",
      }}
    >
      <div className="loader"></div>
      <p style={{ marginTop: 20, fontSize: 16, color: "#333" }}>
        Initializing Payment...
      </p>
    </div>
  );
}
