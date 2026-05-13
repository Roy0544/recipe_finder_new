import AuthForm from '@/components/auth-form';
import LogoutButton from '@/components/logout-button';
export default function AuthPage() {
  return (
    <main className="container mx-auto py-10">
      <AuthForm />
      <LogoutButton />
    </main>
  );
}
