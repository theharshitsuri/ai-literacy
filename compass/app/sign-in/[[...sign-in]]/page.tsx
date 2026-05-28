// Clerk drop-in sign-in. Catches /sign-in and any nested routes (callbacks, factor-two, etc).
// Themed via the ClerkProvider in app/layout.tsx — uses the Compass palette.
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center p-6">
      <div className="font-serif text-2xl font-medium tracking-tight mb-8">
        Compass<span className="text-accent">.</span>
      </div>
      <SignIn />
    </main>
  );
}
