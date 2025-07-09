import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Share2, Gift, Mail, AlertCircle, RefreshCw, X } from 'lucide-react';
import { WaitlistProps, WaitlistEntry } from '../types';
import { WaitlistStats, PromoClient } from '@promokit/js';
import { clsx } from 'clsx';
import { usePromo } from './PromoProvider';

// Create a simple PromoError interface for components that don't have access to the JS package version
interface ComponentPromoError extends Error {
  status: number;
  statusText: string;
  details?: any;
  endpoint?: string;
  timestamp: string;
  isNetworkError: boolean;
  isClientError: boolean;
  isConflictError: boolean;
  isUnauthorizedError: boolean;
  isForbiddenError: boolean;
  isNotFoundError: boolean;
  isRateLimitError: boolean;
  getUserFriendlyMessage(): string;
}

// Error Display Component
function ErrorDisplay({ 
  error, 
  onRetry, 
  onDismiss, 
  showDetails = false, 
  isDark = true 
}: { 
  error: ComponentPromoError | Error; 
  onRetry?: () => void; 
  onDismiss?: () => void; 
  showDetails?: boolean;
  isDark?: boolean;
}) {
  const [showFullDetails, setShowFullDetails] = useState(false);
  
  const isPromoError = 'status' in error && 'getUserFriendlyMessage' in error;
  const userMessage = isPromoError ? (error as ComponentPromoError).getUserFriendlyMessage() : error.message;
  const isConflictError = isPromoError && (error as ComponentPromoError).isConflictError;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={clsx(
        'border rounded-lg p-4 mb-4',
        isConflictError 
          ? isDark ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-300'
          : isDark ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-300'
      )}
    >
      <div className="flex items-start space-x-3">
        <AlertCircle className={clsx(
          'w-5 h-5 mt-0.5 flex-shrink-0',
          isConflictError ? 'text-yellow-500' : 'text-red-500'
        )} />
        
        <div className="flex-1 min-w-0">
          <p className={clsx(
            'text-sm font-medium',
            isConflictError
              ? isDark ? 'text-yellow-200' : 'text-yellow-800'
              : isDark ? 'text-red-200' : 'text-red-800'
          )}>
            {userMessage}
          </p>
          
          {showDetails && isPromoError && (
            <div className="mt-2 space-y-2">
              <div className="text-xs space-y-1">
                <div className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                  <strong>Status:</strong> {(error as ComponentPromoError).status} ({(error as ComponentPromoError).statusText})
                </div>
                <div className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                  <strong>Endpoint:</strong> {(error as ComponentPromoError).endpoint}
                </div>
                <div className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                  <strong>Time:</strong> {new Date((error as ComponentPromoError).timestamp).toLocaleString()}
                </div>
              </div>
              
              {(error as ComponentPromoError).details && (
                <div>
                  <button
                    onClick={() => setShowFullDetails(!showFullDetails)}
                    className={clsx(
                      'text-xs underline',
                      isDark ? 'text-slate-300 hover:text-slate-200' : 'text-gray-600 hover:text-gray-700'
                    )}
                  >
                    {showFullDetails ? 'Hide' : 'Show'} technical details
                  </button>
                  
                  {showFullDetails && (
                    <pre className={clsx(
                      'mt-2 p-2 rounded text-xs overflow-auto max-h-32',
                      isDark ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-700'
                    )}>
                      {JSON.stringify((error as ComponentPromoError).details, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {onRetry && !isConflictError && (
            <button
              onClick={onRetry}
              className={clsx(
                'p-1 rounded transition-colors',
                isDark 
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
              )}
              title="Retry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          
          {onDismiss && (
            <button
              onClick={onDismiss}
              className={clsx(
                'p-1 rounded transition-colors',
                isDark 
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
              )}
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function Waitlist({
  projectId,
  apiKey,
  theme = 'dark',
  referralReward = 'Skip the line',
  referralCode,
  customStyles,
  onSignup,
  onError,
  showDetailedErrors = false,
  enableRetry = true,
  className
}: WaitlistProps) {
  // Try to get PromoClient from context first
  let contextClient: PromoClient | null = null;
  try {
    contextClient = usePromo();
  } catch {
    // Not within PromoProvider, will create own client
  }

  // Create PromoClient either from context or from props
  const promoClient = useMemo(() => {
    if (contextClient) {
      return contextClient;
    }
    if (!apiKey) {
      throw new Error('Either use PromoProvider or provide apiKey prop to Waitlist component');
    }
    return new PromoClient({ apiKey });
  }, [contextClient, apiKey]);

  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [waitlistEntry, setWaitlistEntry] = useState<WaitlistEntry | null>(null);
  const [stats, setStats] = useState<WaitlistStats | null>(null);
  const [error, setError] = useState<ComponentPromoError | Error | null>(null);
  const [statsError, setStatsError] = useState<ComponentPromoError | Error | null>(null);

  const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Construct referral URL - all referral links point to promokit.pro since it's centrally managed
  const getReferralUrl = (entry: WaitlistEntry): string => {
    if (entry.referralUrl) {
      return entry.referralUrl;
    }
    
    if (entry.referralCode) {
      return `https://promokit.pro?ref=${entry.referralCode}`;
    }
    
    return '';
  };

  const fetchStats = async () => {
    try {
      setStatsError(null);
      const waitlistStats = await promoClient.waitlist.getStats(projectId);
      setStats(waitlistStats);
    } catch (error) {
      const err = error as ComponentPromoError | Error;
      setStatsError(err);
      console.error('Failed to fetch waitlist stats:', err);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchStats();
    }
  }, [projectId, promoClient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await promoClient.waitlist.create({
        projectId,
        email,
        referralCode, // Pass the referral code from props
        metadata: {
          source: 'react-component',
          theme,
        },
      });

      setWaitlistEntry(data);
      setIsSubmitted(true);
      onSignup?.(email, data.referralCode);
    } catch (error) {
      const err = error as ComponentPromoError | Error;
      setError(err);
      onError?.(err);
      console.error('Waitlist signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    handleSubmit(new Event('submit') as any);
  };

  const copyReferralLink = () => {
    if (waitlistEntry) {
      const referralUrl = getReferralUrl(waitlistEntry);
      if (referralUrl) {
        navigator.clipboard.writeText(referralUrl);
      }
    }
  };

  const baseClasses = clsx(
    'w-full max-w-md mx-auto rounded-lg border p-6',
    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-200 text-gray-900',
    className
  );

  if (isSubmitted && waitlistEntry) {
    const referralUrl = getReferralUrl(waitlistEntry);
    
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
                value={referralUrl}
                readOnly
                placeholder={referralUrl ? undefined : "Referral link will appear here"}
                className={clsx(
                  'flex-1 text-xs px-3 py-2 rounded border',
                  isDark ? 'bg-slate-600 border-slate-500 text-slate-300 placeholder-slate-500' : 'bg-white border-gray-300 placeholder-gray-400'
                )}
              />
              <button
                onClick={copyReferralLink}
                disabled={!referralUrl}
                className={clsx(
                  'px-3 py-2 rounded transition-colors',
                  referralUrl 
                    ? 'bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white'
                    : isDark ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                )}
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
            
            {!referralUrl && (
              <p className={clsx(
                'text-xs mt-2',
                isDark ? 'text-slate-500' : 'text-gray-500'
              )}>
                Referral link is being generated...
              </p>
            )}
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

        <AnimatePresence mode="wait">
          {error && (
            <ErrorDisplay
              error={error}
              onRetry={enableRetry ? handleRetry : undefined}
              onDismiss={() => setError(null)}
              showDetails={showDetailedErrors}
              isDark={isDark}
            />
          )}
        </AnimatePresence>
        
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
            <div className={clsx(
              'w-2 h-2 rounded-full mr-2',
              statsError ? 'bg-red-500' : 'bg-green-500'
            )}></div>
            <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>
              {statsError 
                ? 'Stats unavailable' 
                : stats 
                  ? `${stats.totalSignups.toLocaleString()} joined` 
                  : '...'
              }
            </span>
          </div>
          <div className="flex items-center">
            <Gift className="w-4 h-4 text-purple-400 mr-1" />
            <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>
              Refer & skip ahead
            </span>
          </div>
        </div>

        {statsError && showDetailedErrors && (
          <div className="mt-4">
            <ErrorDisplay
              error={statsError}
              onRetry={fetchStats}
              onDismiss={() => setStatsError(null)}
              showDetails={showDetailedErrors}
              isDark={isDark}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}