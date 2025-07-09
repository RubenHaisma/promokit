import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, User } from 'lucide-react';
import { TestimonialWallProps, Testimonial } from '../types';
import { PromoClient } from '@promokit/js';
import { clsx } from 'clsx';

export function TestimonialWall({
  productId,
  apiKey,
  baseUrl,
  layout = 'grid',
  theme = 'dark',
  autoRefresh = false,
  maxItems = 12,
  showRating = true,
  onTestimonialClick,
  className
}: TestimonialWallProps) {
  const promoClient = useMemo(() => new PromoClient({ apiKey, baseUrl }), [apiKey, baseUrl]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTestimonials = React.useCallback(async () => {
    if (!productId) return;
    try {
      const data = await promoClient.testimonial.get(productId, {
        limit: maxItems,
        status: 'APPROVED',
      });
      setTestimonials(data.testimonials || []);
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
    } finally {
      setIsLoading(false);
    }
  }, [productId, maxItems, promoClient]);

  useEffect(() => {
    fetchTestimonials();
    
    if (autoRefresh) {
      const interval = setInterval(fetchTestimonials, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [productId, maxItems, autoRefresh, fetchTestimonials]);

  const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

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

  return (
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
  );
}