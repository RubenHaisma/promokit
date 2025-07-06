import React, { useState, useEffect } from 'react';
import { usePromo } from './PromoProvider';
import { TestimonialWallProps } from '../types';
import { Testimonial } from '@promokit/js';

export function TestimonialWall({
  projectId,
  layout = 'grid',
  theme = 'auto',
  maxItems = 12,
  autoRefresh = false,
  showRating = true,
  customStyles,
  className = ''
}: TestimonialWallProps) {
  const { client } = usePromo();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTestimonials();
    
    if (autoRefresh) {
      const interval = setInterval(loadTestimonials, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [projectId, maxItems, autoRefresh]);

  const loadTestimonials = async () => {
    try {
      setError(null);
      const response = await client.testimonial.getAll(projectId, {
        limit: maxItems,
        status: 'approved'
      });
      setTestimonials(response.testimonials);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load testimonials';
      setError(errorMessage);
      console.error('Failed to load testimonials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const themeClass = theme === 'dark' ? 'promo-dark' : theme === 'light' ? 'promo-light' : 'promo-auto';
  const layoutClass = `promo-layout-${layout}`;

  if (isLoading) {
    return (
      <div className={`promo-testimonials ${themeClass} ${className}`} style={customStyles}>
        <div className="promo-loading">Loading testimonials...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`promo-testimonials ${themeClass} ${className}`} style={customStyles}>
        <div className="promo-error">
          Failed to load testimonials: {error}
        </div>
      </div>
    );
  }

  if (testimonials.length === 0) {
    return (
      <div className={`promo-testimonials ${themeClass} ${className}`} style={customStyles}>
        <div className="promo-empty">
          No testimonials available yet.
        </div>
      </div>
    );
  }

  return (
    <div className={`promo-testimonials ${themeClass} ${layoutClass} ${className}`} style={customStyles}>
      <div className="promo-testimonials-grid">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="promo-testimonial-card">
            {showRating && (
              <div className="promo-rating">
                {renderStars(testimonial.rating)}
              </div>
            )}
            <blockquote className="promo-content">
              "{testimonial.content}"
            </blockquote>
            <div className="promo-author">
              {testimonial.avatar && (
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.author}
                  className="promo-avatar"
                  onError={(e) => {
                    // Hide broken images
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div className="promo-author-info">
                <div className="promo-author-name">{testimonial.author}</div>
                {testimonial.role && testimonial.company && (
                  <div className="promo-author-title">
                    {testimonial.role} at {testimonial.company}
                  </div>
                )}
                {testimonial.role && !testimonial.company && (
                  <div className="promo-author-title">
                    {testimonial.role}
                  </div>
                )}
                {!testimonial.role && testimonial.company && (
                  <div className="promo-author-title">
                    {testimonial.company}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}