import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { clsx } from 'clsx';

// Create a simple PromoError interface for components that don't have access to the JS package version
export interface ComponentPromoError extends Error {
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

export interface ErrorDisplayProps {
  error: ComponentPromoError | Error;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  isDark?: boolean;
  className?: string;
}

export function ErrorDisplay({ 
  error, 
  onRetry, 
  onDismiss, 
  showDetails = false, 
  isDark = true,
  className
}: ErrorDisplayProps) {
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
          : isDark ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-300',
        className
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