import { redirect } from 'next/navigation';

// This page is no longer the primary auth method.
// We redirect to the home page, where the auth dialog can be opened.
export default function AuthPage() {
  redirect('/');
}
