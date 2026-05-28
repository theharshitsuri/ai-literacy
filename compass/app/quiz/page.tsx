// /quiz — entry point. Renders the QuizClient, which is a client component
// because the quiz is interactive state-machine work. Server-side rendering
// is not useful here. We DO mark this page route as public in middleware.ts
// so anonymous visitors can take the quiz without signing up first.
import { QuizClient } from './QuizClient';

export const metadata = {
  title: 'Compass — placement quiz',
  description: 'A 5-minute adaptive placement quiz to find your AI level.',
};

export default function QuizPage() {
  return <QuizClient />;
}
