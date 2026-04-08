import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Css/Checkout.css";

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const plan = location.state?.plan;

  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    phone: "",
    country: "",
    dob: "",
    gender: "",
    businessType: "",
    businessName: "",
  });

  const businessOptions = [
    "Artisan Grills",
    "Artisan Cafe",
    "Artisan Lounge",
    "Artisan Restaurant",
  ];

  if (!plan) {
    return <h2>No Plan Selected</h2>;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  // Extract numeric amount correctly
  const numericAmount = Number(
    plan.price.match(/\(\$(\d+)\)/)?.[1] || plan.amount || 0
  );

  navigate("/subscription-payment", {
    state: {
      amount: numericAmount,
      planTitle: plan.title,
      formData
    }
  });
};

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        
        <div className="plan-summary">
          <h2>{plan.title}</h2>
          <p className="price">{plan.price}</p>
          <ul>
            {plan.features.map((f: string, i: number) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>

        <form className="checkout-form" onSubmit={handleSubmit}>
          <h3>Complete Your Purchase</h3>

          <div className="form-group">
            <label>Full Name</label>
            <input name="fullname" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Username</label>
            <input name="username" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              name="email"
              type="email"
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input name="phone" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Country</label>
            <input name="country" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Date of Birth</label>
            <input
              name="dob"
              type="date"
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select name="gender" onChange={handleChange} required>
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>

          <div className="form-group">
            <label>Business Type</label>
            <input
              name="businessType"
              placeholder="Restaurant, Cafe, Lounge..."
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Business Name</label>
            <select
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              required
            >
              <option value="">Select Business</option>
              {businessOptions.map((business, index) => (
                <option key={index} value={business}>
                  {business}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="primary-btn">
            Proceed To Payment
          </button>
        </form>
      </div>
    </div>
  );
      }
