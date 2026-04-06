import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const VIT_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@vitstudent\.ac\.in$/;
const DEMO_ACCOUNTS_KEY = "vit-shuttle-demo-accounts";

const isGitHubPagesHost = () => window.location.hostname.endsWith("github.io");

const readDemoAccounts = () => {
  try {
    return JSON.parse(localStorage.getItem(DEMO_ACCOUNTS_KEY) || "[]");
  } catch {
    return [];
  }
};

const writeDemoAccounts = (accounts) => {
  localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(accounts));
};

const getDemoSessionToken = (email) => {
  return `demo-${btoa(`${email}:${Date.now()}`)}`;
};

const createDemoAccount = ({ name, email, password }) => {
  const accounts = readDemoAccounts();
  if (accounts.some((account) => account.email === email)) {
    throw new Error("User with this email already exists");
  }

  const user = { id: Date.now(), name, email };
  accounts.push({ ...user, password });
  writeDemoAccounts(accounts);

  const token = getDemoSessionToken(email);
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  return { token, user };
};

const loginDemoAccount = ({ email, password }) => {
  const account = readDemoAccounts().find(
    (entry) => entry.email === email && entry.password === password,
  );
  if (!account) {
    throw new Error("Invalid email or password");
  }

  const user = { id: account.id, name: account.name, email: account.email };
  const token = getDemoSessionToken(email);
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  return { token, user };
};

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(false);

  const validateEmail = (email) => {
    if (!email) return "";
    if (!VIT_EMAIL_REGEX.test(email)) {
      return "Use a valid VIT email (@vitstudent.ac.in)";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "email") setEmailError(validateEmail(value));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const emailValidation = validateEmail(formData.email);
    if (emailValidation) {
      setEmailError(emailValidation);
      return;
    }
    if (isRegister && !formData.name.trim()) {
      setError("Name is required");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const payload = isRegister
        ? formData
        : { email: formData.email, password: formData.password };
      const { data } = await api.post(endpoint, payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      const apiError = err.response?.data?.error;
      const isUnavailableOnPages =
        isGitHubPagesHost() &&
        (!err.response ||
          err.response.status === 404 ||
          err.response.status >= 500);

      if (isUnavailableOnPages) {
        try {
          const authResult = isRegister
            ? createDemoAccount(formData)
            : loginDemoAccount({
                email: formData.email,
                password: formData.password,
              });

          localStorage.setItem("token", authResult.token);
          localStorage.setItem("user", JSON.stringify(authResult.user));
          navigate("/dashboard");
          return;
        } catch (demoError) {
          setError(demoError.message);
          return;
        }
      }

      setError(apiError || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-brand">
        <div className="login-brand-icon">
          <img
            src={`${import.meta.env.BASE_URL}logo.svg`}
            alt="VIT Shuttle"
            className="login-brand-logo"
          />
        </div>
        <div className="login-brand-title">VIT Shuttle</div>
        <div className="login-brand-sub">Smart Campus Initiative</div>
      </div>

      <div className="login-card">
        <h2>{isRegister ? "Create Account" : "Welcome Back"}</h2>
        <p className="sub">
          {isRegister
            ? "Join the Smart Campus Initiative today."
            : "Access your real-time campus transit dashboard."}
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="login-form-group">
              <label className="login-label">Full Name</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">👤</span>
                <input
                  className="login-input"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div className="login-form-group">
            <label className="login-label">University Email</label>
            <div className="login-input-wrap">
              <span className="login-input-icon">✉</span>
              <input
                className="login-input"
                type="email"
                name="email"
                placeholder="name@vitstudent.ac.in"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
            {emailError && (
              <div
                className="error-message"
                style={{ marginTop: "6px", marginBottom: 0 }}
              >
                {emailError}
              </div>
            )}
          </div>

          <div className="login-form-group">
            <label className="login-label">
              Password
              {!isRegister && <a href="#forgot">Forgot?</a>}
            </label>
            <div className="login-input-wrap">
              <span className="login-input-icon">🔒</span>
              <input
                className="login-input"
                type={showPass ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-input-action"
                onClick={() => setShowPass(!showPass)}
                tabIndex={-1}
              >
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {!isRegister && (
            <div className="login-checkbox-group">
              <input
                className="login-checkbox"
                type="checkbox"
                id="stay"
                checked={staySignedIn}
                onChange={(e) => setStaySignedIn(e.target.checked)}
              />
              <label htmlFor="stay">Stay signed in for 30 days</label>
            </div>
          )}

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? (
              <span className="spinner" />
            ) : isRegister ? (
              "Create Account"
            ) : (
              "Sign In to Dashboard"
            )}
          </button>
        </form>

        {!isRegister && (
          <>
            <div className="login-divider">Or continue with</div>
            <div className="login-social">
              <button className="btn-social">
                <span>🔍</span> Google
              </button>
              <button className="btn-social">
                <span>🎓</span> V-TOP
              </button>
            </div>
          </>
        )}

        <p className="login-toggle">
          {isRegister ? "Already have an account? " : "New to the campus? "}
          <button
            className="login-toggle-btn"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
              setEmailError("");
            }}
          >
            {isRegister ? "Sign In" : "Create an account"}
          </button>
        </p>
      </div>

      <div className="login-footer">
        <a href="#privacy">Privacy Policy</a>
        <a href="#status">System Status</a>
        <a href="#help">Help Desk</a>
        <br />
        <span style={{ display: "block", marginTop: "6px" }}>
          © 2026 VIT Shuttle. Smart Campus Initiative.
        </span>
      </div>
    </div>
  );
}
