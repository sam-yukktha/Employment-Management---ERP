import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { AnimatedBackground } from "../../components/AnimatedBackground";

const Login = () => {
  const navigate = useNavigate();
  const { login, currentUser, error: authError, isLoading, clearError } = useAuthStore();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [showPass, setShowPass] = useState(false);

  // Already logged in → go to dashboard
  useEffect(() => {
    if (currentUser) navigate("/dashboard");
  }, [currentUser, navigate]);

  useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    clearError();

    if (!email.trim())    return setError("Email address is required.");
    if (!password.trim()) return setError("Password is required.");

    const res = await login(email.trim(), password);
    if (res.success) {
      navigate("/dashboard");
    } else {
      setError(res.message);
    }
  };

  return (
    <>
      <AnimatedBackground />
      <div className="login-page">
      <div className="login-card glass-panel">

        {/* Logo */}
        <div className="login-brand">▲ EMPLOYMENT MANAGEMENT</div>

        {/* Heading */}
        <h1>Welcome Back</h1>
        <p>Sign in to access your ERP workspace.</p>

        {/* Error Banner */}
        {error && (
          <div className="login-error-message">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className="error-icon">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit}>

          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="login-password"
                type={showPass ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="show-pass-btn"
                onClick={() => setShowPass(!showPass)}
                tabIndex={-1}
              >
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "8px" }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner">Signing in...</span>
            ) : "Sign In →"}
          </button>
        </form>

        {/* Signup Link */}
        <div className="login-footer">
          <span>Don't have an account?</span>
          <Link to="/signup" className="signup-link">Create Account</Link>
        </div>

      </div>
      </div>
    </>
  );
};

export default Login;
