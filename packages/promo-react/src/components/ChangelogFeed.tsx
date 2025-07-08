import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Tag, Bell } from 'lucide-react';
import { ChangelogFeedProps, ChangelogEntry } from '../types';
import { usePromo } from './PromoProvider';
import { clsx } from 'clsx';

export function ChangelogFeed({
  projectId,
  theme = 'dark',
  showSubscribe = true,
  compact = false,
  maxItems = 10,
  onVersionClick,
  className
}: ChangelogFeedProps) {
  const config = usePromo();
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    fetchChangelog();
  }, [projectId, maxItems]);

  const fetchChangelog = async () => {
    try {
      const response = await fetch(
        `${config.baseUrl || 'https://promokit.pro'}/changelog/${projectId}?limit=${maxItems}`,
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error('Failed to fetch changelog:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      const response = await fetch(
        `${config.baseUrl || 'https://promokit.pro'}/changelog/${projectId}/subscribe`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      );

      if (response.ok) {
        setIsSubscribed(true);
        setEmail('');
      }
    } catch (error) {
      console.error('Failed to subscribe:', error);
    }
  };

  const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

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

  return (
    <div className={clsx('space-y-6', className)}>
      {showSubscribe && !isSubscribed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={clsx(
            'p-6 rounded-lg border',
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
          <form onSubmit={handleSubscribe} className="flex space-x-2">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={clsx(
                'flex-1 px-3 py-2 rounded border',
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                  : 'bg-white border-gray-300 placeholder-gray-500'
              )}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white rounded font-medium"
            >
              Subscribe
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
                <h2 className={clsx(
                  'text-xl font-semibold',
                  isDark ? 'text-white' : 'text-gray-900'
                )}>
                  {entry.title}
                </h2>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(entry.publishedAt).toLocaleDateString()}
              </div>
            </header>

            {!compact && (
              <div className={clsx(
                'prose prose-sm mb-4',
                isDark ? 'prose-invert' : ''
              )}>
                <p className={isDark ? 'text-slate-300' : 'text-gray-700'}>
                  {entry.content}
                </p>
              </div>
            )}

            {entry.changes && entry.changes.length > 0 && (
              <div>
                <h3 className={clsx(
                  'font-medium mb-2',
                  isDark ? 'text-white' : 'text-gray-900'
                )}>
                  What's New:
                </h3>
                <ul className="space-y-1">
                  {entry.changes.map((change, changeIndex) => (
                    <li
                      key={changeIndex}
                      className={clsx(
                        'text-sm flex items-start',
                        isDark ? 'text-slate-300' : 'text-gray-700'
                      )}
                    >
                      <span className="text-green-400 mr-2">•</span>
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.article>
        ))}
      </div>
    </div>
  );
}