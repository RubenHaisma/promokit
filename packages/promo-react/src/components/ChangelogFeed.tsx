import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Tag, Bell, AlertCircle, RefreshCw, X } from 'lucide-react';
import { ChangelogFeedProps, ChangelogEntry } from '../types';
import { PromoClient } from '@promokit/js';
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

export function ChangelogFeed({
  projectId,
  apiKey,
  theme = 'dark',
  showSubscribe = true,
  compact = false,
  maxItems = 10,
  onVersionClick,
  onError,
  showDetailedErrors = false,
  enableRetry = true,
  className
}: ChangelogFeedProps) {
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
      throw new Error('Either use PromoProvider or provide apiKey prop to ChangelogFeed component');
    }
    return new PromoClient({ apiKey });
  }, [contextClient, apiKey]);

  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [error, setError] = useState<ComponentPromoError | Error | null>(null);
  const [subscribeError, setSubscribeError] = useState<ComponentPromoError | Error | null>(null);

  const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const fetchChangelog = async () => {
    if (!projectId) return;
    try {
      setError(null);
      const data = await promoClient.changelog.get(projectId, { limit: maxItems });
      setEntries(data.entries || []);
    } catch (error) {
      const err = error as ComponentPromoError | Error;
      setError(err);
      onError?.(err);
      console.error('Failed to fetch changelog:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChangelog();
  }, [projectId, maxItems]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !projectId || isSubscribing) return;

    setIsSubscribing(true);
    setSubscribeError(null);

    try {
      await promoClient.changelog.subscribe(projectId, email);
      setIsSubscribed(true);
      setEmail('');
    } catch (error) {
      const err = error as ComponentPromoError | Error;
      setSubscribeError(err);
      onError?.(err);
      console.error('Failed to subscribe:', err);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleRetryFetch = () => {
    setError(null);
    setIsLoading(true);
    fetchChangelog();
  };

  const handleRetrySubscribe = () => {
    setSubscribeError(null);
    handleSubscribe(new Event('submit') as any);
  };

  if (isLoading) {
    return (
      <div className={clsx('space-y-6', className)}>
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className={clsx(
              'p-6 rounded-lg animate-pulse',
              isDark ? 'bg-slate-800' : 'bg-gray-100'
            )}
          >
            <div className={clsx(
              'h-6 rounded mb-4 w-1/4',
              isDark ? 'bg-slate-700' : 'bg-gray-200'
            )}></div>
            <div className={clsx(
              'h-4 rounded mb-2',
              isDark ? 'bg-slate-700' : 'bg-gray-200'
            )}></div>
            <div className={clsx(
              'h-4 rounded w-3/4',
              isDark ? 'bg-slate-700' : 'bg-gray-200'
            )}></div>
          </div>
        ))}
      </div>
    );
  }

  // Show error state if we have an error and no entries
  if (error && entries.length === 0) {
    return (
      <div className={clsx('space-y-6', className)}>
        <ErrorDisplay
          error={error}
          onRetry={enableRetry ? handleRetryFetch : undefined}
          onDismiss={() => setError(null)}
          showDetails={showDetailedErrors}
          isDark={isDark}
        />
      </div>
    );
  }

  return (
    <div className={clsx('space-y-6', className)}>
      {showSubscribe && !isSubscribed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={clsx(
            'p-6 rounded-lg border relative z-10',
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          )}
        >
          <div className="flex items-center mb-4">
            <Bell className="w-5 h-5 text-purple-400 mr-2" />
            <h3 className={clsx(
              'font-semibold',
              isDark ? 'text-white' : 'text-gray-900'
            )}>
              Stay Updated
            </h3>
          </div>
          <p className={clsx(
            'text-sm mb-4',
            isDark ? 'text-slate-400' : 'text-gray-600'
          )}>
            Get notified when we release new features and updates
          </p>

          <AnimatePresence mode="wait">
            {subscribeError && (
              <ErrorDisplay
                error={subscribeError}
                onRetry={enableRetry ? handleRetrySubscribe : undefined}
                onDismiss={() => setSubscribeError(null)}
                showDetails={showDetailedErrors}
                isDark={isDark}
              />
            )}
          </AnimatePresence>

          <form onSubmit={handleSubscribe} className="flex space-x-2 relative">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={clsx(
                'flex-1 px-3 py-2 rounded border relative z-20 focus:z-30',
                'focus:ring-2 focus:ring-purple-500 focus:border-purple-500',
                'transition-all duration-200 outline-none',
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:bg-slate-600' 
                  : 'bg-white border-gray-300 placeholder-gray-500 focus:bg-white'
              )}
            />
            <button
              type="submit"
              disabled={isSubscribing}
              className={clsx(
                'px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-500',
                'hover:from-purple-600 hover:to-violet-600 text-white rounded font-medium',
                'relative z-20 transition-all duration-200 disabled:opacity-50',
                'focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
              )}
            >
              {isSubscribing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Subscribe'
              )}
            </button>
          </form>
        </motion.div>
      )}

      {isSubscribed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={clsx(
            'p-4 rounded-lg border border-green-500/20',
            isDark ? 'bg-green-500/10' : 'bg-green-50'
          )}
        >
          <p className="text-green-400 text-sm">
            ✓ You're subscribed! We'll notify you about new updates.
          </p>
        </motion.div>
      )}

      {/* Show error for fetch if we have entries (partial error state) */}
      {error && entries.length > 0 && (
        <ErrorDisplay
          error={error}
          onRetry={enableRetry ? handleRetryFetch : undefined}
          onDismiss={() => setError(null)}
          showDetails={showDetailedErrors}
          isDark={isDark}
        />
      )}

      <div className="space-y-6">
        {entries.map((entry, index) => (
          <motion.article
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onVersionClick?.(entry)}
            className={clsx(
              'p-6 rounded-lg border cursor-pointer transition-all duration-300 hover:scale-[1.02]',
              isDark 
                ? 'bg-slate-800 border-slate-700 hover:border-purple-500/50' 
                : 'bg-white border-gray-200 hover:border-purple-300'
            )}
          >
            <header className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-purple-400" />
                  <span className={clsx(
                    'font-mono text-sm font-medium',
                    isDark ? 'text-purple-300' : 'text-purple-600'
                  )}>
                    {entry.version}
                  </span>
                </div>
                <h3 className={clsx(
                  'text-lg font-semibold',
                  isDark ? 'text-white' : 'text-gray-900'
                )}>
                  {entry.title}
                </h3>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(entry.publishedAt).toLocaleDateString()}
              </div>
            </header>
            
            {!compact && (
              <div className={clsx(
                'prose prose-sm max-w-none mb-4',
                isDark ? 'prose-invert' : ''
              )}>
                <div 
                  className={isDark ? 'text-slate-300' : 'text-gray-600'}
                  dangerouslySetInnerHTML={{ __html: entry.content }}
                />
              </div>
            )}
            
            <div className="space-y-2">
              {entry.changes.map((change, changeIndex) => (
                <div 
                  key={changeIndex}
                  className={clsx(
                    'flex items-start space-x-2 text-sm',
                    isDark ? 'text-slate-400' : 'text-gray-600'
                  )}
                >
                  <span className="text-purple-400 mt-1">•</span>
                  <span>{change}</span>
                </div>
              ))}
            </div>
          </motion.article>
        ))}
      </div>

      {entries.length === 0 && !error && (
        <div className={clsx(
          'text-center py-12',
          isDark ? 'text-slate-400' : 'text-gray-600'
        )}>
          <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No changelog entries found.</p>
        </div>
      )}
    </div>
  );
}