import { Suspense } from "react";
import RegisterForm from "@/components/register/RegisterForm";

function RegisterFormWrapper() {
  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center font-display p-4 text-slate-900 dark:text-white antialiased selection:bg-primary/30">
      <RegisterForm />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center font-display p-4 text-slate-900 dark:text-white antialiased selection:bg-primary/30">
        <div className="text-slate-500 dark:text-[#92adc9]">Loading...</div>
      </div>
    }>
      <RegisterFormWrapper />
    </Suspense>
  );
}






