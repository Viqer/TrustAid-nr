import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { HeartHandshake, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Explore Campaigns', href: '/' },
  ];

  if (user) {
    if (user.role === 'DONOR') navLinks.push({ label: 'My Donations', href: '/donor-dashboard' });
    if (user.role === 'NGO') navLinks.push({ label: 'NGO Dashboard', href: '/ngo-dashboard' });
    if (user.role === 'ADMIN') navLinks.push({ label: 'Admin Panel', href: '/admin' });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <span className="font-display font-bold text-2xl tracking-tight text-foreground">TrustAid</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} className={`text-sm font-medium transition-colors hover:text-primary ${location === link.href ? 'text-primary' : 'text-muted-foreground'}`}>
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold">{user.name || user.email}</span>
                    <span className="text-xs text-muted-foreground capitalize">{user.role.toLowerCase()}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => logout()} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">Log in</Link>
                  <Link href="/register">
                    <Button>Get Started</Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button className="md:hidden p-2 text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-b border-border bg-background overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4 flex flex-col">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className={`text-lg font-medium ${location === link.href ? 'text-primary' : 'text-foreground'}`}>
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-border mt-4">
                {user ? (
                  <Button variant="outline" className="w-full justify-start text-destructive" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </Button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                      <Button variant="outline" className="w-full">Log in</Button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="w-full">
                      <Button className="w-full">Get Started</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-muted mt-20 py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <HeartHandshake className="w-8 h-8 mx-auto mb-4 text-primary/50" />
          <p className="font-display font-bold text-xl text-foreground mb-2">TrustAid</p>
          <p className="text-sm max-w-md mx-auto">Transparent, blockchain-backed fundraising for the causes that matter most.</p>
          <p className="text-xs mt-8">&copy; {new Date().getFullYear()} TrustAid. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
