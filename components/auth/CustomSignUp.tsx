"use client";

import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { Eye, EyeOff, ArrowRight, Check, Loader2 } from "lucide-react";

export default function CustomSignUp() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [code, setCode] = useState("");
  const [step, setStep] = useState<"form" | "verification">("form");

  const [localError, setLocalError] = useState("");

  const isPasswordValid = password.length >= 8;
  const isFetching = fetchStatus === "fetching";

  const passwordMessage = useMemo(() => {
    if (!password) return "At least 8 characters";
    return isPasswordValid
      ? "Password meets the requirements"
      : "Password must contain 8 or more characters.";
  }, [password, isPasswordValid]);

  const getErrorMessage = () => {
    if (localError) return localError;

    if (errors?.fields?.password?.message) {
      return errors.fields.password.message;
    }

    if (errors?.fields?.emailAddress?.message) {
      return errors.fields.emailAddress.message;
    }

    return "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError("");

    // Critical: do not even contact Clerk if password is invalid.
    if (password.length < 8) {
      setLocalError("Password must contain 8 or more characters.");
      return;
    }

    if (!email.trim()) {
      setLocalError("Please enter your email address.");
      return;
    }

    if (!firstName.trim()) {
      setLocalError("Please enter your first name.");
      return;
    }

    const { error } = await signUp.password({
      emailAddress: email.trim(),
      password,
      firstName: firstName.trim(),
      ...(lastName.trim() ? { lastName: lastName.trim() } : {}),
    });

    if (error) {
      setLocalError(error.message);
      return;
    }

    const verificationResult =
      await signUp.verifications.sendEmailCode();

    if (verificationResult.error) {
      setLocalError(verificationResult.error.message);
      return;
    }

    setStep("verification");
  };

  const handleVerification = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setLocalError("");

    if (!code.trim()) {
      setLocalError("Please enter the verification code.");
      return;
    }

    const { error } =
      await signUp.verifications.verifyEmailCode({
        code: code.trim(),
      });

    if (error) {
      setLocalError(error.message);
      return;
    }

    if (signUp.status === "complete") {
      const { error: finalizeError } = await signUp.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl("/");

          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url);
          }
        },
      });

      if (finalizeError) {
        setLocalError(finalizeError.message);
      }
    }
  };

  const handleGoogle = async () => {
    setLocalError("");

    const { error } = await signUp.sso({
      strategy: "oauth_google",
      redirectUrl: "/",
      redirectCallbackUrl: "/sign-up",
    });

    if (error) {
      setLocalError(error.message);
    }
  };

  const handleResendCode = async () => {
    setLocalError("");

    const { error } =
      await signUp.verifications.sendEmailCode();

    if (error) {
      setLocalError(error.message);
    }
  };

  if (step === "verification") {
    return (
      <div
        className="w-full max-w-[440px] rounded-2xl border p-8 shadow-xl"
        style={{
          background: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
        <div className="text-center">
          <h1
            className="text-2xl font-semibold"
            style={{ color: "var(--text-hi)" }}
          >
            Check your email
          </h1>

          <p
            className="mt-2 text-sm leading-6"
            style={{ color: "var(--text-lo)" }}
          >
            We sent a verification code to
          </p>

          <p
            className="mt-1 text-sm font-medium"
            style={{ color: "var(--text-hi)" }}
          >
            {email}
          </p>
        </div>

        <form onSubmit={handleVerification} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="verification-code"
              className="mb-2 block text-xs font-semibold uppercase tracking-wide"
              style={{ color: "var(--text-mid)" }}
            >
              Verification code
            </label>

            <input
              id="verification-code"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              placeholder="Enter 6-digit code"
              className="w-full rounded-xl border px-4 py-3 text-center text-lg tracking-[0.35em] outline-none transition"
              style={{
                background: "var(--input)",
                borderColor: "var(--border)",
                color: "var(--text-hi)",
              }}
            />
          </div>

          {getErrorMessage() && (
            <p
              className="text-sm"
              style={{ color: "var(--danger, #ef4444)" }}
            >
              {getErrorMessage()}
            </p>
          )}

          <button
            type="submit"
            disabled={isFetching || code.length < 6}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: "var(--accent)",
              color: "var(--accent-contrast, #000)",
            }}
          >
            {isFetching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                Verify email
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResendCode}
          disabled={isFetching}
          className="mt-5 w-full text-center text-sm transition hover:underline disabled:opacity-50"
          style={{ color: "var(--accent)" }}
        >
          Didn't receive the code? Resend
        </button>

        <button
          type="button"
          onClick={() => {
            setStep("form");
            setCode("");
            setLocalError("");
          }}
          className="mt-3 w-full text-center text-sm"
          style={{ color: "var(--text-lo)" }}
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-[440px] rounded-2xl border p-8 shadow-xl"
      style={{
        background: "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      <div className="text-center">
        <h1
          className="text-2xl font-semibold"
          style={{ color: "var(--text-hi)" }}
        >
          Create your account
        </h1>

        <p
          className="mt-2 text-sm"
          style={{ color: "var(--text-lo)" }}
        >
          Welcome! Please fill in the details to get started.
        </p>
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={isFetching}
        className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
        style={{
          background: "var(--input)",
          borderColor: "var(--border)",
          color: "var(--text-hi)",
        }}
      >
        <span className="text-base font-bold">G</span>
        Continue with Google
      </button>

      <div className="my-7 flex items-center gap-4">
        <div
          className="h-px flex-1"
          style={{ background: "var(--border)" }}
        />
        <span
          className="text-xs"
          style={{ color: "var(--text-lo)" }}
        >
          or
        </span>
        <div
          className="h-px flex-1"
          style={{ background: "var(--border)" }}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field
            id="first-name"
            label="First name"
            value={firstName}
            onChange={setFirstName}
            optional
          />

          <Field
            id="last-name"
            label="Last name"
            value={lastName}
            onChange={setLastName}
            optional
          />
        </div>

        <Field
          id="email"
          label="Email address"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-xs font-semibold uppercase tracking-wide"
            style={{ color: "var(--text-mid)" }}
          >
            Password
          </label>

          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setLocalError("");
              }}
              autoComplete="new-password"
              className="w-full rounded-xl border px-4 py-3 pr-12 text-sm outline-none transition"
              style={{
                background: "var(--input)",
                borderColor:
                  password && !isPasswordValid
                    ? "var(--danger, #ef4444)"
                    : "var(--border)",
                color: "var(--text-hi)",
              }}
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
              style={{ color: "var(--text-lo)" }}
              aria-label={
                showPassword ? "Hide password" : "Show password"
              }
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          <div
            className="mt-2 flex items-start gap-2 text-xs"
            style={{
              color: isPasswordValid
                ? "var(--success, #22c55e)"
                : "var(--text-mid)",
            }}
          >
            {isPasswordValid ? (
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            ) : (
              <span className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border" />
            )}

            <span>{passwordMessage}</span>
          </div>
        </div>

        {/* Required by Clerk when bot sign-up protection is enabled */}
        <div id="clerk-captcha" />

        {getErrorMessage() && (
          <p
            className="text-sm leading-5"
            style={{ color: "var(--danger, #ef4444)" }}
          >
            {getErrorMessage()}
          </p>
        )}

        <button
          type="submit"
          disabled={
            isFetching ||
            !isPasswordValid ||
            !email.trim() ||
            !firstName.trim()
          }
          className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            background: "var(--accent)",
            color: "var(--accent-contrast, #000)",
          }}
        >
          {isFetching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <p
        className="mt-6 text-center text-sm"
        style={{ color: "var(--text-lo)" }}
      >
        Already have an account?{" "}
        <a
          href="/sign-in"
          className="font-medium hover:underline"
          style={{ color: "var(--accent)" }}
        >
          Sign in
        </a>
      </p>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  optional = false,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  optional?: boolean;
  autoComplete?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide"
        style={{ color: "var(--text-mid)" }}
      >
        <span>{label}</span>
        {optional && (
          <span
            className="normal-case font-normal tracking-normal"
            style={{ color: "var(--text-lo)" }}
          >
            Optional
          </span>
        )}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition"
        style={{
          background: "var(--input)",
          borderColor: "var(--border)",
          color: "var(--text-hi)",
        }}
      />
    </div>
  );
}