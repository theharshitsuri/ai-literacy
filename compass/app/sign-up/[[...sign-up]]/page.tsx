// Clerk drop-in sign-up. Same shape as sign-in.
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center p-6">
      <div className="font-serif text-2xl font-medium tracking-tight mb-8">
        Compass<span className="text-accent">.</span>
      </div>
      <SignUp />
    </main>
  );
}
