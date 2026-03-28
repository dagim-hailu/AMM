"use client";

import { useState, useEffect } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import QRCode from "react-qr-code";
import type { RequestorDetailsDTO } from "@amm/api-contracts";
import { getTranslation, getInitialLanguage, type Language } from "../lib/i18n";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showQR, setShowQR] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [referenceId, setReferenceId] = useState<string>("");

  const [showForm, setShowForm] = useState(false);

  // Language State - Initialize to 'en' for SSR, update after mount
  const [language, setLanguage] = useState<Language>('en');

  // Handle language change
  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', newLang);
    }
  };

  // Update language from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language');
      if (saved === 'en' || saved === 'am') {
        setLanguage(saved);
      }
    }
  }, []);

  // Generate a unique reference ID for QR code
  useEffect(() => {
    setMounted(true);
    const id = `APP-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setReferenceId(id);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget; // Capture form element before any await
    setLoading(true);
    setErrorMsg("");
    setSuccess(false);

    if (!executeRecaptcha) {
      setErrorMsg("CAPTCHA not loaded. Please refresh the page.");
      setLoading(false);
      return;
    }

    try {
      // Execute reCAPTCHA
      const token = await executeRecaptcha("appointment_submission");

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      const payload: RequestorDetailsDTO = {
        name: data.name as string,
        organization: data.organization as string || undefined,
        country: data.country as string,
        city: data.city as string,
        issueDescription: data.issueDescription as string,
        mobile: data.mobile as string,
        altMobile: data.altMobile as string || undefined,
        email: data.email as string,
        suggestedTime: new Date(data.suggestedTime as string).toISOString(),
      };

      // Include CAPTCHA token in the request
      const res = await fetch("http://localhost:3002/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Recaptcha-Token": token
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Submission failed");
      }

      await res.json();
      setSuccess(true);
      form.reset();

      // Show QR code after successful submission
      setShowQR(true);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const currentUrl = typeof window !== "undefined" ? window.location.origin : "";
  const qrValue = `${currentUrl}?ref=${referenceId}`;

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-4 bg-slate-950 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600 opacity-10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600 opacity-10 blur-[150px]" />
      </div>

      {/* Language Selector */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-1 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-1 shadow-2xl">
        <button
          onClick={() => handleLanguageChange('en')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${language === 'en' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-300 hover:bg-slate-800'}`}
        >
          EN
        </button>
        <button
          onClick={() => handleLanguageChange('am')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${language === 'am' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-300 hover:bg-slate-800'}`}
        >
          AM
        </button>
      </div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col items-center">
        {!showForm ? (
          <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-10 rounded-3xl shadow-2xl text-center transform transition-all duration-500 hover:scale-[1.02]">
            <div className="mb-8">
              <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4">
                {getTranslation('title.main', language)}
              </h1>
              <p className="text-slate-400">
                {getTranslation('title.subtitle', language)}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center mb-10">
              <div className="bg-white p-6 rounded-3xl mb-6 shadow-[0_0_50px_rgba(52,211,153,0.2)]">
                {mounted ? (
                  <QRCode
                    value={qrValue}
                    size={220}
                    level="H"
                  />
                ) : (
                  <div className="w-[220px] h-[220px] bg-slate-200 animate-pulse rounded-xl" />
                )}
              </div>
              <p className="text-slate-300 font-medium mb-2">{getTranslation('status.scanToAccess', language)}</p>
              <p className="text-xs text-slate-500 font-mono">REF: {referenceId || "..."}</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setShowForm(true)}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold py-4 rounded-xl shadow-lg transform transition-all hover:-translate-y-1 active:scale-95"
              >
                {getTranslation('button.goToForm', language)}
              </button>

              <div className="pt-6 border-t border-slate-800">
                <p className="text-sm text-slate-500">
                  Or scan the QR code to continue on your mobile device.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Left side: QR Code and Info (Minimzed) */}
            <div className="w-full lg:w-1/3 bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl self-start">
              <button
                onClick={() => setShowForm(false)}
                className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {getTranslation('button.backToQR', language)}
              </button>

              <div className="text-center">
                <div className="flex flex-col items-center justify-center mb-6">
                  <div className="bg-white p-3 rounded-2xl mb-4">
                    {mounted && (
                      <QRCode
                        value={qrValue}
                        size={140}
                        level="H"
                      />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Stay Connected</h3>
                  <p className="text-xs text-slate-500 font-mono">{referenceId}</p>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-xl text-left">
                  <h3 className="font-bold text-slate-300 text-sm mb-2 uppercase tracking-wider">{getTranslation('title.quickInstructions', language)}</h3>
                  <ul className="text-xs text-slate-400 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500">✓</span>
                      {getTranslation('status.completeFields', language)}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500">✓</span>
                      {getTranslation('status.submitAndWait', language)}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500">✓</span>
                      {getTranslation('status.keepPage', language)}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right side: Form */}
            <div className="w-full lg:w-2/3 bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl">
              <div className="mb-10">
                <h2 className="text-4xl font-extrabold tracking-tight text-white mb-3">
                  Request an <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Appointment</span>
                </h2>
                <p className="text-slate-400">
                  Fill in your details to schedule a meeting with our experts.
                </p>
              </div>

              {success && (
                <div className="mb-6 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 flex items-center gap-4 animate-in zoom-in-95 duration-300">
                  <div className="bg-emerald-500/20 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-lg">Submission Successful!</p>
                    <p className="text-sm opacity-80">Reference ID: <span className="font-mono font-bold">{referenceId}</span></p>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 animate-in shake-1 duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">{getTranslation('label.fullName', language)}</label>
                    <input required name="name" className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder={getTranslation('placeholder.name', language)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">{getTranslation('label.organization', language)}</label>
                    <input name="organization" className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder={getTranslation('placeholder.organization', language)} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">{getTranslation('label.email', language)}</label>
                    <input required type="email" name="email" className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder={getTranslation('placeholder.email', language)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">{getTranslation('label.suggestedTime', language)}</label>
                    <input required type="datetime-local" name="suggestedTime" className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all style-color-scheme-dark" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">{getTranslation('label.mobile', language)}</label>
                    <input required name="mobile" className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder={getTranslation('placeholder.mobile', language)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">{getTranslation('label.altMobile', language)}</label>
                    <input name="altMobile" className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder={getTranslation('placeholder.altMobile', language)} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">{getTranslation('label.country', language)}</label>
                    <input required name="country" className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder={getTranslation('placeholder.country', language)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">{getTranslation('label.city', language)}</label>
                    <input required name="city" className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder={getTranslation('placeholder.city', language)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">{getTranslation('label.issueDescription', language)}</label>
                  <textarea required name="issueDescription" rows={4} minLength={10} className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none" placeholder={getTranslation('placeholder.issueDescription', language)} />
                </div>

                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="text-slate-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="text-xs text-slate-400">
                      Protected by reCAPTCHA. Google
                      <a href="https://policies.google.com/privacy" className="text-emerald-400 hover:text-emerald-300 mx-1">Privacy</a> and
                      <a href="https://policies.google.com/terms" className="text-emerald-400 hover:text-emerald-300 mx-1">Terms</a> apply.
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold py-4 rounded-xl shadow-lg transform transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {getTranslation('button.submitting', language)}
                    </span>
                  ) : getTranslation('button.submitRequest', language)}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
