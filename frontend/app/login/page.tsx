"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Brain, Lock, Mail, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api";

type Step = "credentials" | "mfa";

interface LoginForm {
  email: string;
  password: string;
  totp_code?: string;
}

export default function LoginPage() {
  const [step, setStep] = useState<Step>("credentials");
  const [tempToken, setTempToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onCredentials = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const result = await authApi.login(data.email, data.password);
      if (result.requires_mfa) {
        setTempToken(result.access_token);
        setStep("mfa");
      } else {
        localStorage.setItem("tbi_access_token", result.access_token);
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const onMFA = async (data: LoginForm) => {
    if (!data.totp_code) return;
    setIsLoading(true);
    try {
      const result = await authApi.verifyMFA(tempToken, data.totp_code);
      localStorage.setItem("tbi_access_token", result.access_token);
      router.push("/dashboard");
    } catch {
      toast.error("Invalid authentication code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] to-[#0e1a2d] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Brain className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">TBI Clinic Platform</h1>
          <p className="text-white/60 mt-1 text-sm">HIPAA-Compliant Clinical Workflow</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          {step === "credentials" ? (
            <>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Sign In</h2>
              <p className="text-sm text-slate-500 mb-6">Enter your credentials to access the platform</p>

              <form onSubmit={handleSubmit(onCredentials)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      {...register("email", { required: "Email required" })}
                      type="email"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="physician@clinic.com"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      {...register("password", { required: "Password required" })}
                      type="password"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="••••••••••••"
                    />
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#1e3a5f] text-white py-2.5 rounded-lg font-medium text-sm hover:bg-[#162a47] transition-colors disabled:opacity-60"
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                  <Shield size={18} className="text-brand-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Two-Factor Auth</h2>
                  <p className="text-sm text-slate-500">Enter your authenticator code</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onMFA)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    6-Digit Code
                  </label>
                  <input
                    {...register("totp_code", { required: "Code required" })}
                    type="text"
                    maxLength={6}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="000000"
                    autoFocus
                  />
                  <p className="text-xs text-slate-500 mt-1">Open your authenticator app (Google Authenticator, Authy)</p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#1e3a5f] text-white py-2.5 rounded-lg font-medium text-sm hover:bg-[#162a47] transition-colors disabled:opacity-60"
                >
                  {isLoading ? "Verifying..." : "Verify"}
                </button>

                <button type="button" onClick={() => setStep("credentials")} className="w-full text-sm text-slate-500 hover:text-slate-700">
                  ← Back to login
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          HIPAA-Compliant • AES-256 Encrypted • Audit Logged
        </p>
      </div>
    </div>
  );
}