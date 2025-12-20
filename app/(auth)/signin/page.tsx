import SignInForm from "./components/SignInForm";

export default function SignInPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center font-display p-4 text-slate-900 dark:text-white antialiased selection:bg-primary/30">
      <SignInForm />
    </div>
  );
}

