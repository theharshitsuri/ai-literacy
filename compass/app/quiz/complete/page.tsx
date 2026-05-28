// /quiz/complete — the result page. Renders the compass rose with the needle
// pointing at the user's actual theta + their level + strengths/gaps + a CTA
// to either sign up (anonymous flow) or see the feed (signed-in flow).
//
// This is a client component because it reads the quiz state from localStorage
// (the quiz can be taken anonymously) and triggers a server action to persist
// once the user signs in.
import { CompleteClient } from './CompleteClient';

export const metadata = {
  title: 'Compass — your result',
};

export default function QuizCompletePage() {
  return <CompleteClient />;
}
