import { useState } from "react";
import { ArrowRight, Clock3, ShieldCheck, Sparkles } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { BrandLogo } from "../components/BrandLogo";

export const AuthPage = ({ mode }) => {
  const signup = mode === "signup";
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone });
  const [submitting, setSubmitting] = useState(false);
  if (user) return <Navigate to="/" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (signup) await register(form);
      else await login({ email: form.email, password: form.password });
      toast.success(signup ? "Your workspace is ready." : "Welcome back.");
      navigate("/");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <section className="auth-hero">
        <BrandLogo inverse />
        <div className="auth-copy">
          <span className="pill"><Sparkles size={14} /> Intent into momentum</span>
          <h1>Track focused work.<br />Finish what matters.</h1>
          <p>Plan tasks naturally, time every session, and understand your productivity with useful daily insights.</p>
        </div>
        <div className="auth-highlights">
          <div><Clock3 /><strong>Real-time sessions</strong><span>Persistent, accurate tracking</span></div>
          <div><ShieldCheck /><strong>Private by design</strong><span>Your tasks stay yours</span></div>
        </div>
      </section>
      <section className="auth-form-wrap">
        <form className="auth-card" onSubmit={submit}>
          <span className="eyebrow">{signup ? "Get started" : "Welcome back"}</span>
          <h2>{signup ? "Create your account" : "Sign in to Focused Flow"}</h2>
          <p>{signup ? "Build your productivity workspace in seconds." : "Pick up exactly where you left off."}</p>
          {signup && (
            <label>Full name
              <input required minLength={2} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Aarav Chandel" />
            </label>
          )}
          <label>Email address
            <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" />
          </label>
          <label>Password
            <input required minLength={8} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder={signup ? "Minimum 8 characters, include a number" : "Your password"} />
          </label>
          <button className="primary-btn auth-submit" disabled={submitting}>
            {submitting ? "Please wait..." : signup ? "Create account" : "Sign in"} <ArrowRight size={17} />
          </button>
          <p className="switch-auth">
            {signup ? "Already have an account?" : "New to Focused Flow?"}{" "}
            <button type="button" onClick={() => navigate(signup ? "/login" : "/signup")}>{signup ? "Sign in" : "Create account"}</button>
          </p>
        </form>
      </section>
    </div>
  );
};
