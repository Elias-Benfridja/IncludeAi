import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(username, password);
      navigate("/");
    } catch {
      setError("Couldn't log in — check your username and password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-gutter">
      <main className="w-full max-w-110">
        <div className="bg-surface-container-lowest rounded-xl p-8 md:p-12 shadow-[0_16px_32px_rgba(0,0,0,0.04)] border border-tertiary-fixed flex flex-col items-center">
          <div className="mb-8 text-center">
            <span
              className="material-symbols-outlined text-primary text-[40px] block mb-3"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              spa
            </span>
            <h1 className="text-headline-lg text-on-surface mb-2 tracking-tight">FocusFlow</h1>
            <p className="text-body-md text-on-surface-variant">Your space for calm productivity.</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="text-label-lg text-on-surface-variant block ml-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full h-14 px-4 bg-surface rounded-lg border-2 border-surface-variant outline-none transition-all text-body-md focus:border-secondary placeholder:text-outline-variant"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-label-lg text-on-surface-variant block ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-14 pl-4 pr-12 bg-surface rounded-lg border-2 border-surface-variant outline-none transition-all text-body-md focus:border-secondary placeholder:text-outline-variant"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {error && <p className="text-label-sm text-error text-center">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-14 bg-secondary text-on-secondary text-headline-md rounded-lg shadow-sm active:scale-[0.98] transition-all disabled:opacity-70"
            >
              {submitting ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="mt-8 text-body-md text-on-surface-variant text-center">
            New to FocusFlow?{" "}
            <Link to="/register" className="text-secondary font-semibold hover:underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
