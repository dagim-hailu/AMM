"use client";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GoogleReCaptchaProvider reCaptchaKey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI">
      {children}
    </GoogleReCaptchaProvider>
  );
}