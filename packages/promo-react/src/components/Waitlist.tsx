import React, { useState, useEffect } from 'react';
import { usePromo } from './PromoProvider';
import { WaitlistProps } from '../types';

export function Waitlist({
  projectId,
  theme = 'auto',
  referralReward = 'Skip the line',
  customStyles,
  onSignup,
  onError,
  className = ''
}: WaitlistProps) {
  const { client } = usePromo();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState<number | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const entry = await client.waitlist.create({
        projectId,
        email,
        metadata: {
          source: 'react-component',
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      });

      setPosition(entry.position);
      setReferralCode(entry.referralCode || null);
      setIsSubmitted(true);
      onSignup?.(email, entry.referralCode);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
      setError(errorMessage);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const shareUrl = referralCode 
    ? `${window.location.origin}${window.location.pathname}?ref=${referralCode}`
    : window.location.href;

  const themeClass = theme === 'dark' ? 'promo-dark' : theme === 'light' ? 'promo-light' : 'promo-auto';

  if (isSubmitted) {
    return (
      <div className={`promo-waitlist ${themeClass} ${className}`} style={customStyles}>
        <div className="promo-success">
          <div className="promo-icon">🎉</div>
          <h2>You're on the list!</h2>
          <div className="promo-position">
            Position #{position}
          </div>
          <p>You're ahead of {Math.max(0, 1000 - (position || 0))} people</p>
          
          {referralCode && (
            <div className="promo-referral">
              <h3>🎁 {referralReward}</h3>
              <p>Share your referral link and move up the list</p>
              <div className="promo-share">
                <input 
                  type="text" 
                  value={shareUrl} 
                  readOnly 
                  className="promo-share-input"
                />
                <button 
                  onClick={() => copyToClipboard(shareUrl)}
                  className="promo-share-button"
                  type="button"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`promo-waitlist ${themeClass} ${className}`} style={customStyles}>
      <div className="promo-form">
        <h2>Join the Waitlist</h2>
        <p>Be the first to know when we launch</p>
        
        {error && (
          <div className="promo-error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="promo-input"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading || !email}
            className="promo-button"
          >
            {isLoading ? 'Joining...' : 'Join Waitlist'}
          </button>
        </form>
        
        <div className="promo-stats">
          <span>🟢 1,247 joined</span>
          <span>🎁 Refer & skip ahead</span>
        </div>
      </div>
    </div>
  );
}