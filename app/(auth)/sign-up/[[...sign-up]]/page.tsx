"use client";

import { SignUp } from "@clerk/nextjs";
import type { FormEvent } from "react";

export default function SignUpPage() {
  function validateFirstName(event: FormEvent<HTMLElement>) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.closest(".cl-signUp-root")) return;

    const input = form.querySelector<HTMLInputElement>('input[name="firstName"]');
    if (!input) return;

    input.required = true;
    input.setCustomValidity(input.value.trim() ? "" : "First name is required.");
    if (input.value.trim()) return;

    event.preventDefault();
    event.stopPropagation();
    input.reportValidity();
    input.focus();
  }

  function clearFirstNameError(event: FormEvent<HTMLElement>) {
    const input = event.target;
    if (input instanceof HTMLInputElement && input.name === "firstName") {
      input.setCustomValidity("");
    }
  }

  return (
    <main
      className="kharch-signup w-full min-w-0"
      onSubmitCapture={validateFirstName}
      onInputCapture={clearFirstNameError}
    >
      <SignUp
        fallbackRedirectUrl="/onboarding"
        appearance={{
          options: {
            unsafe_disableDevelopmentModeWarnings: true,
            socialButtonsPlacement: "top",
            socialButtonsVariant: "blockButton",
            autoFocus: false,
            showOptionalFields: true,
          },
        }}
      />
    </main>
  );
}
