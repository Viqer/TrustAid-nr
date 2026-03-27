import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button, Input, Card } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';
import { HeartHandshake } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { setToken } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res: any = await fetchApi('/auth/login', {
        method: 'POST',
        data: { email, password }
      });
      setToken(res.token);
      toast.success("Welcome back!");
      setLocation('/');
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white shadow-xl mx-auto mb-6">
            <HeartHandshake className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold font-display">Welcome back</h1>
          <p className="text-muted-foreground mt-2">Log in to your TrustAid account</p>
        </div>

        <Card className="p-8 shadow-xl shadow-black/5">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Email Address</label>
              <Input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="you@example.com" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <Input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••" 
                required 
              />
            </div>
            <Button type="submit" className="w-full h-12 text-lg" isLoading={isLoading}>
              Sign In
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary font-bold hover:underline">
              Register here
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
