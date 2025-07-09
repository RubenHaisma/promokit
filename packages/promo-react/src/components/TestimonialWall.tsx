import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, User, AlertCircle, RefreshCw, X } from 'lucide-react';
import { TestimonialWallProps, Testimonial } from '../types';
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

export function TestimonialWall({
  productId,
  apiKey,
  layout = 'grid',
  theme = 'dark',
  autoRefresh = false,
  maxItems = 12,
  showRating = true,
  onTestimonialClick,
  onError,
  showDetailedErrors = false,
  enableRetry = true,
  className
}: TestimonialWallProps) {
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
      throw new Error('Either use PromoProvider or provide apiKey prop to TestimonialWall component');
    }
    return new PromoClient({ apiKey });
  }, [contextClient, apiKey]);

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ComponentPromoError | Error | null>(null);

  const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const fetchTestimonials = React.useCallback(async () => {
    if (!productId) return;
    try {
      setError(null);
      const data = await promoClient.testimonial.get(productId, {
        limit: maxItems,
        status: 'APPROVED',
      });
      setTestimonials(data.testimonials || []);
    } catch (error) {
      const err = error as ComponentPromoError | Error;
      setError(err);
      onError?.(err);
      console.error('Failed to fetch testimonials:', err);
    } finally {
      setIsLoading(false);
    }
  }, [productId, maxItems, promoClient, onError]);

  useEffect(() => {
    fetchTestimonials();
    
    if (autoRefresh) {
      const interval = setInterval(fetchTestimonials, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [productId, maxItems, autoRefresh, fetchTestimonials]);

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    fetchTestimonials();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={clsx(
          'w-4 h-4',
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        )}
      />
    ));
  };

  const gridClasses = clsx(
    'grid gap-6',
    layout === 'grid' && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    layout === 'masonry' && 'columns-1 md:columns-2 lg:columns-3',
    className
  );

  if (isLoading) {
    return (
      <div className={gridClasses}>
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className={clsx(
              'p-6 rounded-lg animate-pulse',
              isDark ? 'bg-slate-800' : 'bg-gray-100'
            )}
          >
            <div className={clsx(
              'h-4 rounded mb-4',
              isDark ? 'bg-slate-700' : 'bg-gray-200'
            )}></div>
            <div className={clsx(
              'h-4 rounded mb-4 w-3/4',
              isDark ? 'bg-slate-700' : 'bg-gray-200'
            )}></div>
            <div className={clsx(
              'h-4 rounded w-1/2',
              isDark ? 'bg-slate-700' : 'bg-gray-200'
            )}></div>
          </div>
        ))}
      </div>
    );
  }

  // Show error state if we have an error and no testimonials
  if (error && testimonials.length === 0) {
    return (
      <div className={clsx('space-y-6', className)}>
        <ErrorDisplay
          error={error}
          onRetry={enableRetry ? handleRetry : undefined}
          onDismiss={() => setError(null)}
          showDetails={showDetailedErrors}
          isDark={isDark}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Show error for fetch if we have testimonials (partial error state) */}
      <AnimatePresence mode="wait">
        {error && testimonials.length > 0 && (
          <ErrorDisplay
            error={error}
            onRetry={enableRetry ? handleRetry : undefined}
            onDismiss={() => setError(null)}
            showDetails={showDetailedErrors}
            isDark={isDark}
          />
        )}
      </AnimatePresence>

      <div className={gridClasses}>
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onTestimonialClick?.(testimonial)}
            className={clsx(
              'p-6 rounded-lg border cursor-pointer transition-all duration-300 hover:scale-105',
              isDark 
                ? 'bg-slate-800 border-slate-700 hover:border-purple-500/50' 
                : 'bg-white border-gray-200 hover:border-purple-300',
              layout === 'masonry' && 'break-inside-avoid mb-6'
            )}
          >
            {showRating && (
              <div className="flex items-center mb-4">
                {renderStars(testimonial.rating)}
              </div>
            )}
            
            <blockquote className={clsx(
              'text-lg leading-relaxed mb-4',
              isDark ? 'text-slate-300' : 'text-gray-700'
            )}>
              "{testimonial.content}"
            </blockquote>
            
            <div className="flex items-center space-x-3">
              {testimonial.avatar ? (
                <img
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className={clsx(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  isDark ? 'bg-slate-700' : 'bg-gray-200'
                )}>
                  <User className="w-5 h-5 text-gray-400" />
                </div>
              )}
              <div>
                <div className={clsx(
                  'font-medium',
                  isDark ? 'text-white' : 'text-gray-900'
                )}>
                  {testimonial.author}
                </div>
                {(testimonial.role || testimonial.company) && (
                  <div className={clsx(
                    'text-sm',
                    isDark ? 'text-slate-400' : 'text-gray-600'
                  )}>
                    {testimonial.role}
                    {testimonial.role && testimonial.company && ' at '}
                    {testimonial.company}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {testimonials.length === 0 && !error && (
        <div className={clsx(
          'text-center py-12',
          isDark ? 'text-slate-400' : 'text-gray-600'
        )}>
          <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No testimonials found.</p>
        </div>
      )}
    </div>
  );
}