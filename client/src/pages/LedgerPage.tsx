import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import type { LedgerDonation } from '@/types';
import { Copy, Check } from 'lucide-react';

const truncateMiddle = (value: string, start = 10, end = 6) => {
  if (!value) return '-';
  if (value.length <= start + end + 3) return value;
  return `${value.slice(0, start)}...${value.slice(-end)}`;
};

export default function LedgerPage() {
  const selectedTx = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tx')?.toLowerCase() || '';
  }, []);

  const [copiedTxHash, setCopiedTxHash] = useState<string | null>(null);

  useEffect(() => {
    if (!copiedTxHash) return;

    const timeout = window.setTimeout(() => setCopiedTxHash(null), 2000);
    return () => window.clearTimeout(timeout);
  }, [copiedTxHash]);

  const { data: ledgerData = { entries: [], totalCount: 0 }, isLoading, error } = useQuery<{ entries: LedgerDonation[]; totalCount: number }>({
    queryKey: ['ledger-donations'],
    queryFn: async () => {
      const result = await fetchApi<{ entries: LedgerDonation[]; totalCount: number }>('/donations/ledger');
      return result;
    },
  });

  const ledgerEntries = ledgerData.entries ?? [];
  const totalCount = ledgerData.totalCount ?? ledgerEntries.length;

  const handleCopyTxHash = async (txHash: string) => {
    try {
      await navigator.clipboard.writeText(txHash);
      setCopiedTxHash(txHash);
    } catch {
      setCopiedTxHash(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-4xl font-display font-bold mb-2">Public Donation Ledger</h1>
        <div className="rounded-full border border-border bg-muted/40 px-4 py-2 text-sm font-semibold text-foreground shadow-sm">
          {totalCount} donations recorded on-chain
        </div>
      </div>

      <p className="text-muted-foreground text-lg mb-8">
        Verified donation entries with blockchain references.
      </p>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 p-4 font-medium">
          Failed to load ledger entries.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Tx Hash</th>
                <th className="px-4 py-3 text-left font-semibold">Donor Address</th>
                <th className="px-4 py-3 text-left font-semibold">NGO Name</th>
                <th className="px-4 py-3 text-left font-semibold">Amount</th>
                <th className="px-4 py-3 text-left font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {ledgerEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    No ledger entries found.
                  </td>
                </tr>
              ) : (
                ledgerEntries.map((entry) => {
                  const isHighlighted = selectedTx && entry.txHash?.toLowerCase() === selectedTx;
                  const isCopied = copiedTxHash === entry.txHash;

                  return (
                    <tr
                      key={entry.donationId}
                      className={isHighlighted ? 'bg-green-50 ring-1 ring-green-300' : 'border-t border-border'}
                    >
                      <td className="px-4 py-3 font-mono">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyTxHash(entry.txHash)}
                            className="inline-flex items-center gap-2 rounded-lg border border-transparent px-2 py-1 text-left transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
                            title={isCopied ? 'Copied!' : 'Copy full hash'}
                            aria-label={isCopied ? 'Copied full transaction hash' : 'Copy full transaction hash'}
                          >
                            <span>{truncateMiddle(entry.txHash)}</span>
                            {isCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                          </button>
                          {isCopied && (
                            <span className="rounded-full bg-green-100 px-2 py-1 text-[11px] font-semibold text-green-700">
                              Copied!
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono">{entry.donorAddress ? truncateMiddle(entry.donorAddress) : '-'}</td>
                      <td className="px-4 py-3">{entry.ngoName}</td>
                      <td className="px-4 py-3">{formatCurrency(entry.amount)}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
