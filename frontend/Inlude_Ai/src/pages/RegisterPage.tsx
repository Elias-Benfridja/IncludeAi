import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/auth"

export default function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(username, email, password);
      navigate("/login");
    } catch {
      setError("Couldn't create your account — check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-container-margin">
      <main className="w-full max-w-120 bg-surface-container-lowest rounded-xl p-8 shadow-[0_16px_32px_rgba(0,0,0,0.04)] border border-tertiary-fixed">
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-fixed rounded-full mb-6">
            <span className="material-symbols-outlined text-primary text-[32px]">flowsheet</span>
          </div>
          <h1 className="text-headline-lg-mobile md:text-headline-lg text-on-surface tracking-tight mb-2">
            Start your flow
          </h1>
          <p className="text-on-surface-variant text-body-md">
            Create an account to manage your tasks with ease and clarity.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-stack-gap">
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
              placeholder="Choose a display name"
              className="w-full h-14 px-4 bg-surface border-2 border-tertiary-fixed rounded-lg focus:outline-none focus:border-secondary transition-all text-body-md placeholder:text-outline-variant"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-label-lg text-on-surface-variant block ml-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full h-14 px-4 bg-surface border-2 border-tertiary-fixed rounded-lg focus:outline-none focus:border-secondary transition-all text-body-md placeholder:text-outline-variant"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end px-1">
              <label htmlFor="password" className="text-label-lg text-on-surface-variant block">
                Password
              </label>
              <span className="text-label-sm text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">info</span>
                At least 8 characters
              </span>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a secure password"
                className="w-full h-14 px-4 pr-12 bg-surface border-2 border-tertiary-fixed rounded-lg focus:outline-none focus:border-secondary transition-all text-body-md placeholder:text-outline-variant"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-4 flex items-center text-outline-variant hover:text-on-surface-variant"
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
            className="w-full h-14 bg-secondary text-on-secondary text-label-lg rounded-full shadow-sm active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <footer className="mt-8 pt-6 border-t border-tertiary-fixed text-center">
          <p className="text-on-surface-variant text-body-md">
            Already part of the flow?{" "}
            <Link to="/login" className="text-primary text-label-lg hover:underline underline-offset-4 ml-1">
              Back to login
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
