import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Share2, Gift, Mail, Twitter, Linkedin, Facebook, Copy, Check, TrendingUp, Clock } from 'lucide-react';
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
  className,
  showSocialShare = true,
  socialShareMessage = "I just joined the waitlist! Join me and skip ahead with my referral link",
  launchGoal,
  estimatedLaunchDate
}: WaitlistProps) {
  const promoClient = useMemo(() => new PromoClient({ apiKey, baseUrl }), [apiKey, baseUrl]);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [waitlistEntry, setWaitlistEntry] = useState<WaitlistEntry | null>(null);
  const [stats, setStats] = useState<WaitlistStats | null>(null);
  const [copied, setCopied] = useState(false);
  const [recentSignups, setRecentSignups] = useState<string[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const waitlistStats = await promoClient.waitlist.getStats(projectId);
        setStats(waitlistStats);
        
        // Simulate recent signups for social proof
        const recentEmails = ['sarah@example.com', 'john@startup.co', 'emma@tech.io'];
        setRecentSignups(recentEmails.slice(0, 3));
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
          hasSharing: showSocialShare,
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

  const copyReferralLink = async () => {
    if (waitlistEntry?.referralUrl) {
      try {
        await navigator.clipboard.writeText(waitlistEntry.referralUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy link:', error);
      }
    }
  };

  const shareOnTwitter = () => {
    if (waitlistEntry?.referralUrl) {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(socialShareMessage)}&url=${encodeURIComponent(waitlistEntry.referralUrl)}`;
      window.open(url, '_blank', 'width=550,height=420');
    }
  };

  const shareOnLinkedIn = () => {
    if (waitlistEntry?.referralUrl) {
      const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(waitlistEntry.referralUrl)}`;
      window.open(url, '_blank', 'width=550,height=420');
    }
  };

  const shareOnFacebook = () => {
    if (waitlistEntry?.referralUrl) {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(waitlistEntry.referralUrl)}`;
      window.open(url, '_blank', 'width=550,height=420');
    }
  };

  const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const baseClasses = clsx(
    'w-full max-w-md mx-auto rounded-lg border p-6',
    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-200 text-gray-900',
    className
  );

  const progressPercentage = launchGoal && stats ? Math.min((stats.totalSignups / launchGoal) * 100, 100) : 0;

  if (isSubmitted && waitlistEntry) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={baseClasses}
        style={customStyles}
      >
        <div className="text-center space-y-6">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center mx-auto"
          >
            <Users className="w-8 h-8 text-white" />
          </motion.div>
          
          <div>
            <h2 className="text-2xl font-bold mb-2">You're on the list!</h2>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg font-semibold text-purple-500 mb-2"
            >
              Position #{waitlistEntry.position}
            </motion.div>
            <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
              You're ahead of {Math.max(0, (stats?.totalSignups || 0) - waitlistEntry.position)} people
            </p>
            
            {estimatedLaunchDate && (
              <div className={clsx(
                'mt-3 flex items-center justify-center text-sm',
                isDark ? 'text-slate-400' : 'text-gray-600'
              )}>
                <Clock className="w-4 h-4 mr-1" />
                Expected launch: {new Date(estimatedLaunchDate).toLocaleDateString()}
              </div>
            )}
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
            
            <div className="space-y-3">
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
                  className={clsx(
                    'px-3 py-2 rounded transition-all duration-200',
                    copied 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white'
                  )}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {showSocialShare && (
                <div className="flex space-x-2 justify-center">
                  <button
                    onClick={shareOnTwitter}
                    className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                    title="Share on Twitter"
                  >
                    <Twitter className="w-4 h-4" />
                  </button>
                  <button
                    onClick={shareOnLinkedIn}
                    className="p-2 bg-blue-700 hover:bg-blue-800 text-white rounded transition-colors"
                    title="Share on LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </button>
                  <button
                    onClick={shareOnFacebook}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    title="Share on Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={clsx(
            'text-xs',
            isDark ? 'text-slate-500' : 'text-gray-500'
          )}>
            Powered by PromoKit
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

        {/* Progress bar for launch goal */}
        {launchGoal && stats && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                Progress to launch
              </span>
              <span className="font-medium">
                {stats.totalSignups} / {launchGoal}
              </span>
            </div>
            <div className={clsx(
              'w-full bg-gray-200 rounded-full h-2',
              isDark ? 'bg-slate-700' : 'bg-gray-200'
            )}>
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-violet-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={clsx(
              'w-full px-4 py-3 rounded-lg border transition-all duration-200',
              'focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none',
              isDark 
                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:bg-slate-600' 
                : 'bg-white border-gray-300 placeholder-gray-500 focus:bg-white'
            )}
          />
          
          <button
            type="submit"
            disabled={isLoading}
            className={clsx(
              'w-full py-3 bg-gradient-to-r from-purple-500 to-violet-500',
              'hover:from-purple-600 hover:to-violet-600 text-white rounded-lg font-medium',
              'disabled:opacity-50 transition-all duration-200',
              'focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
            )}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              'Join Waitlist'
            )}
          </button>
        </form>
        
        <div className="space-y-3">
          <div className="flex items-center justify-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
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

          {/* Recent signups social proof */}
          {recentSignups.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={clsx(
                'text-xs p-2 rounded',
                isDark ? 'bg-slate-700/50 text-slate-400' : 'bg-gray-50 text-gray-600'
              )}
            >
              <div className="flex items-center justify-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                Recent: {recentSignups[0]?.split('@')[0]}, {recentSignups[1]?.split('@')[0]} +{recentSignups.length - 2} more joined
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}