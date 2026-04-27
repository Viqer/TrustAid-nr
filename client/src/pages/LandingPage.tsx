import { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useCampaigns } from '@/hooks/use-campaigns';
import { Button, Card, Badge, Progress, Input } from '@/components/ui';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { Search, MapPin, Users, Loader2, ReceiptText, ArrowRight, Copy } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import type { LedgerDonation } from '@/types';

const CATEGORIES = ["All", "education", "health", "environment", "disaster-relief", "poverty", "human-rights", "arts", "animal-welfare", "other"];

export default function LandingPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  
  const { data: campaigns, isLoading } = useCampaigns({
    search: search || undefined,
    category: category !== 'All' ? category : undefined
  });

  const activeCampaigns = campaigns?.filter(c => c.status === 'ACTIVE') || [];

  const { data: ledgerData } = useQuery<{ entries: LedgerDonation[]; totalCount: number }>({
    queryKey: ['ledger-donations', 'landing'],
    queryFn: () => fetchApi<{ entries: LedgerDonation[]; totalCount: number }>('/donations/ledger?limit=8'),
  });

  const recentLedgerEntries = ledgerData?.entries ?? [];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 text-sm py-1 px-4">Transparent Giving</Badge>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 max-w-4xl mx-auto leading-tight">
              Fund the Future with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Confidence</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Discover verified NGOs and track your donations in real-time. Join thousands making a transparent impact globally.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" onClick={() => document.getElementById('campaigns')?.scrollIntoView({ behavior: 'smooth' })}>
                Explore Campaigns
              </Button>
              <Link href="/ledger">
                <Button variant="outline" size="lg">
                  <ReceiptText className="w-5 h-5 mr-2" />
                  View Ledger
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg">Create account</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ledger Preview */}
      <section className="py-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Latest On-Chain Activity</h2>
            <p className="text-muted-foreground">A live preview of the most recent ledger donations.</p>
          </div>
          <Link href="/ledger" className="hidden sm:inline-flex">
            <Button variant="ghost" className="text-primary hover:text-primary">
              Open full ledger <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentLedgerEntries.length === 0 ? (
            <Card className="col-span-full p-8 text-center text-muted-foreground bg-muted/20 border-dashed">
              <ReceiptText className="w-10 h-10 mx-auto mb-3 text-primary/40" />
              <p>No on-chain donations yet. Check back shortly.</p>
            </Card>
          ) : (
            recentLedgerEntries.map((entry) => (
              <Card key={entry.donationId} className="p-5 flex flex-col gap-3 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="success">On-chain</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(entry.amount)}</p>
                  <p className="text-sm text-muted-foreground mt-1">{entry.ngoName}</p>
                </div>
                <div className="rounded-xl bg-muted/50 border border-border px-3 py-2 text-xs font-mono text-muted-foreground flex items-center justify-between gap-2">
                  <span>{entry.txHash.slice(0, 10)}...{entry.txHash.slice(-6)}</span>
                  <Copy className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{entry.donorAddress ? `${entry.donorAddress.slice(0, 8)}...${entry.donorAddress.slice(-6)}` : 'Anonymous'}</span>
                  <Link href="/ledger" className="text-primary font-semibold hover:underline">View</Link>
                </div>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Campaigns Section */}
      <section id="campaigns" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">Active Campaigns</h2>
            <p className="text-muted-foreground">Support causes you care about</p>
          </div>
          <div className="flex w-full md:w-auto gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search campaigns..." 
                className="pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto pb-4 mb-8 gap-2 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                category === cat 
                  ? 'bg-foreground text-background shadow-md' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : activeCampaigns.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-2xl border border-border border-dashed">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold">No campaigns found</h3>
            <p className="text-muted-foreground">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeCampaigns.map((campaign, idx) => (
              <motion.div 
                key={campaign._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <Link href={`/campaign/${campaign._id}`}>
                  <Card className="h-full flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer border-border/50 bg-background/50 backdrop-blur-sm">
                    {/* landing page abstract warm texture placeholder */}
                    <div className="h-48 bg-gradient-to-tr from-muted to-secondary relative overflow-hidden">
                      <img 
                        src={`https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop`} 
                        alt={campaign.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 mix-blend-multiply"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-background/90 text-foreground backdrop-blur-md border-none uppercase tracking-wider text-[10px]">
                          {campaign.category.replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="text-sm font-semibold text-primary mb-2 flex items-center gap-1">
                        <Users className="w-4 h-4" /> {campaign.ngo?.name || 'NGO'}
                      </div>
                      <h3 className="text-xl font-bold mb-2 line-clamp-2">{campaign.title}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-1">{campaign.description}</p>
                      
                      <div className="mt-auto space-y-4">
                        <div>
                          <div className="flex justify-between text-sm font-medium mb-2">
                            <span>{formatCurrency(campaign.raisedAmount)}</span>
                            <span className="text-muted-foreground">Goal: {formatCurrency(campaign.goalAmount)}</span>
                          </div>
                          <Progress value={(campaign.raisedAmount / campaign.goalAmount) * 100} />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
