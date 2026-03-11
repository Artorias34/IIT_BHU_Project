import { useState } from "react";
import "./login.css";
import { auth } from "./firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";
import doctorGif from "./Doctor walking.gif";

// Generate 20 falling pills dynamically ONCE outside the component
const fallingPills = Array.from({ length: 20 }).map((_, i) => (
  <span 
    key={i} 
    className="pill" 
    style={{
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 5 + 4}s`,
      animationDelay: `${Math.random() * 5}s`,
      fontSize: `${Math.random() * 20 + 20}px`
    }}
  >
    💊
  </span>
));

function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  
  // Auth states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      alert("Account Created successfully!");
      setIsSignup(false);
      setEmail("");
      setPassword("");
      setName("");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin(); 
    } catch (error) {
      setError("Invalid Email or Password");
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      alert("Password reset link sent to your email!");
      setShowForgot(false);
      setResetEmail("");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="bg-animation-container">
        <div className="falling-pills">
          {fallingPills}
        </div>
        <img 
          src={doctorGif} 
          alt="Walking Doctor Background" 
          className="walking-doctor-gif" 
        />
      </div>

      <div className={`auth-container ${isSignup ? "right-panel-active" : ""}`}>
        
        <div className="form-container sign-up-container">
          <form onSubmit={handleSignup}>
            <h2>Create Account</h2>
            <p className="subtitle">Join our healthcare platform</p>
            {error && isSignup && <div className="error-message">{error}</div>}
            
            <input 
              type="text" 
              placeholder="Full Name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              minLength="6"
            />
            <button type="submit" className="action-btn">Sign Up</button>
          </form>
        </div>

        <div className="form-container sign-in-container">
          <form onSubmit={handleLogin}>
            <h2>Welcome Back</h2>
            <p className="subtitle">To keep connected with us please login</p>
            {error && !isSignup && <div className="error-message">{error}</div>}
            
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <span className="forgot-password" onClick={() => setShowForgot(true)}>
              Forgot your password?
            </span>
            <button type="submit" className="action-btn">Sign In</button>
          </form>
        </div>

        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h2>Welcome Back!</h2>
              <p>To keep connected with us please login with your personal info</p>
              <button className="ghost-btn" onClick={() => { setIsSignup(false); setError(""); }}>
                Sign In
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h2>Hello, Friend!</h2>
              <p>Enter your personal details and start your journey with us</p>
              <button className="ghost-btn" onClick={() => { setIsSignup(true); setError(""); }}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>

      {showForgot && (
        <div className="forgot-modal-overlay">
          <div className="forgot-modal">
            <h3>Reset Password</h3>
            <p>Enter your email to receive a password reset link.</p>
            <form onSubmit={handleReset} style={{ padding: "0 20px" }}>
              <input 
                type="email" 
                placeholder="Email Address" 
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
              <button type="submit" className="action-btn" style={{ width: "100%" }}>
                Send Reset Link
              </button>
              <button type="button" className="close-ghost-btn" onClick={() => setShowForgot(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
