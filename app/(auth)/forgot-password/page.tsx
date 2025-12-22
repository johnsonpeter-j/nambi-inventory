import ForgotPasswordForm from "@/components/forgot-password/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center font-display p-4 text-slate-900 dark:text-white antialiased selection:bg-primary/30">
      <ForgotPasswordForm />
    </div>
  );
}

