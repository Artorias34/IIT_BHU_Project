import { useState } from "react";
import "./login.css";

function Login({ onLogin }) {

const [isSignup, setIsSignup] = useState(false);
const [showForgot, setShowForgot] = useState(false);

const handleSignup = (e) => {
e.preventDefault();
alert("Account Created!");
setIsSignup(false);
};

const handleReset = (e) => {
e.preventDefault();
alert("Password reset link sent!");
setShowForgot(false);
};

return (
<>

```
  {/* BACKGROUND FLOATING MEDICAL TEXT */}

  <div className="bg-animation">
    <span>💊 Paracetamol</span>
    <span>💉 Insulin</span>
    <span>🩺 Healing begins with care</span>
    <span>💊 Aspirin</span>
    <span>💊 Amoxicillin</span>
    <span>💊 Ibuprofen</span>
    <span>❤️ Care Saves Lives</span>
    <span>🧬 Healthcare Innovation</span>
  </div>


  {/* MAIN LOGIN CONTAINER */}

  <div className={`main-container ${isSignup ? "active" : ""}`}>

    {/* LOGIN FORM */}

    <div className="form-box login">

      <h2>Login</h2>

      <div className="input-box">
        <input type="text" required />
        <label>Username</label>
      </div>

      <div className="input-box">
        <input type="password" required />
        <label>Password</label>
      </div>

      <button className="btn" onClick={onLogin}>
        Login
      </button>

      <p className="forgot" onClick={() => setShowForgot(true)}>
        Forgot Password?
      </p>

      <p>
        Don't have an account?{" "}
        <span className="switch-link" onClick={() => setIsSignup(true)}>
          Sign Up
        </span>
      </p>

    </div>


    {/* SIGN UP FORM */}

    <div className="form-box signup">

      <h2>Sign Up</h2>

      <form onSubmit={handleSignup}>

        <div className="input-box">
          <input type="text" required />
          <label>Name</label>
        </div>

        <div className="input-box">
          <input type="text" required />
          <label>User ID</label>
        </div>

        <div className="input-box">
          <input type="password" required />
          <label>Password</label>
        </div>

        <div className="input-box">
          <input type="password" required />
          <label>Confirm Password</label>
        </div>

        <button className="btn">
          Create Account
        </button>

        <p>
          Already have an account?{" "}
          <span className="switch-link" onClick={() => setIsSignup(false)}>
            Login
          </span>
        </p>

      </form>

    </div>

  </div>


  {/* FORGOT PASSWORD POPUP */}

  {showForgot && (

    <div className="forgot-popup">

      <div className="forgot-box">

        <h3>Reset Password</h3>

        <form onSubmit={handleReset}>

          <input
            type="email"
            placeholder="Enter your email"
            required
          />

          <button className="btn">
            Send Reset Link
          </button>

        </form>

        <p
          className="close-btn"
          onClick={() => setShowForgot(false)}
        >
          Close
        </p>

      </div>

    </div>

  )}

</>


);
}

export default Login;
