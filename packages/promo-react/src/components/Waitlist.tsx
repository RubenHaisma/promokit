import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Share2, Gift, Mail } from 'lucide-react';
import { WaitlistProps, WaitlistEntry } from '../types';
import { WaitlistStats, PromoClient } from '@promokit/js';
import { clsx } from 'clsx';

export function Waitlist({
  projectId,
  apiKey,
  baseUrl,
  theme = 'dark',
  referralReward = 'Skip the line',
  customStyles,
  onSignup,
  onError,
  className
}: WaitlistProps) {
  const promoClient = useMemo(() => new PromoClient({ apiKey, baseUrl }), [apiKey, baseUrl]);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [waitlistEntry, setWaitlistEntry] = useState<WaitlistEntry | null>(null);
  const [stats, setStats] = useState<WaitlistStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const waitlistStats = await promoClient.waitlist.getStats(projectId);
        setStats(waitlistStats);
      } catch (error) {
        console.error('Failed to fetch waitlist stats:', error);
      }
    };

    if (projectId) {
      fetchStats();
    }
  }, [projectId, promoClient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;

    setIsLoading(true);
    
    try {
      const data = await promoClient.waitlist.create({
        projectId,
        email,
        metadata: {
          source: 'react-component',
          theme,
        },
      });

      setWaitlistEntry(data);
      setIsSubmitted(true);
      onSignup?.(email, data.referralCode);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      onError?.(err);
      console.error('Waitlist signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (waitlistEntry?.referralUrl) {
      navigator.clipboard.writeText(waitlistEntry.referralUrl);
    }
  };

  const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const baseClasses = clsx(
    'w-full max-w-md mx-auto rounded-lg border p-6',
    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-200 text-gray-900',
    className
  );

  if (isSubmitted && waitlistEntry) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={baseClasses}
        style={customStyles}
      >
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center mx-auto">
            <Users className="w-8 h-8 text-white" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-2">You're on the list!</h2>
            <div className="text-lg font-semibold text-purple-500 mb-2">
              Position #{waitlistEntry.position}
            </div>
            <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
              You're ahead of {Math.max(0, (stats?.totalSignups || 0) - waitlistEntry.position)} people
            </p>
          </div>

          <div className={clsx(
            'p-4 rounded-lg',
            isDark ? 'bg-slate-700' : 'bg-gray-50'
          )}>
            <div className="flex items-center mb-2">
              <Gift className="w-5 h-5 text-purple-400 mr-2" />
              <span className="font-medium">{referralReward}</span>
            </div>
            <p className={clsx(
              'text-sm mb-3',
              isDark ? 'text-slate-400' : 'text-gray-600'
            )}>
              Share your referral link and move up the list for each signup
            </p>
            
            <div className="flex space-x-2">
              <input
                value={waitlistEntry.referralUrl}
                readOnly
                className={clsx(
                  'flex-1 text-xs px-3 py-2 rounded border',
                  isDark ? 'bg-slate-600 border-slate-500 text-slate-300' : 'bg-white border-gray-300'
                )}
              />
              <button
                onClick={copyReferralLink}
                className="px-3 py-2 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white rounded"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className={clsx(
            'text-xs',
            isDark ? 'text-slate-500' : 'text-gray-500'
          )}>
            Powered by Promo
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={baseClasses}
      style={customStyles}
    >
      <div className="text-center space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Join the Waitlist</h2>
          <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
            Be the first to know when we launch
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={clsx(
              'w-full px-4 py-3 rounded-lg border',
              isDark 
                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                : 'bg-white border-gray-300 placeholder-gray-500'
            )}
          />
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              'Join Waitlist'
            )}
          </button>
        </form>
        
        <div className="flex items-center justify-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>
              {stats ? `${stats.totalSignups.toLocaleString()} joined` : '...'}
            </span>
          </div>
          <div className="flex items-center">
            <Gift className="w-4 h-4 text-purple-400 mr-1" />
            <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>
              Refer & skip ahead
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}