import React, { useState, useEffect } from 'react';
import { usePromo } from './PromoProvider';
import { ChangelogFeedProps } from '../types';
import { ChangelogEntry } from '@promokit/js';

export function ChangelogFeed({
  projectId,
  theme = 'auto',
  showSubscribe = true,
  compact = false,
  maxItems = 10,
  customStyles,
  className = ''
}: ChangelogFeedProps) {
  const { client } = usePromo();
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');

  useEffect(() => {
    loadEntries();
  }, [projectId, maxItems]);

  const loadEntries = async () => {
    try {
      const data = await client.changelog.getAll(projectId, {
        limit: maxItems
      });
      setEntries(data);
    } catch (error) {
      console.error('Failed to load changelog entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement subscription logic
    console.log('Subscribe:', email);
    setEmail('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const themeClass = theme === 'dark' ? 'promo-dark' : theme === 'light' ? 'promo-light' : 'promo-auto';
  const compactClass = compact ? 'promo-compact' : '';

  if (isLoading) {
    return (
      <div className={`promo-changelog ${themeClass} ${className}`} style={customStyles}>
        <div className="promo-loading">Loading changelog...</div>
      </div>
    );
  }

  return (
    <div className={`promo-changelog ${themeClass} ${compactClass} ${className}`} style={customStyles}>
      {showSubscribe && (
        <div className="promo-subscribe">
          <h3>Stay Updated</h3>
          <p>Get notified about new releases and updates</p>
          <form onSubmit={handleSubscribe} className="promo-subscribe-form">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="promo-input"
            />
            <button type="submit" className="promo-button">
              Subscribe
            </button>
          </form>
        </div>
      )}

      <div className="promo-entries">
        {entries.map((entry) => (
          <article key={entry.id} className="promo-entry">
            <header className="promo-entry-header">
              <div className="promo-version">{entry.version}</div>
              <h2 className="promo-title">{entry.title}</h2>
              <time className="promo-date">
                {formatDate(entry.publishedAt || entry.createdAt)}
              </time>
            </header>
            
            <div className="promo-entry-content">
              <p>{entry.content}</p>
              
              {entry.changes && entry.changes.length > 0 && (
                <ul className="promo-changes">
                  {entry.changes.map((change, index) => (
                    <li key={index}>{change}</li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}