import React, { useState, useRef, useCallback, useEffect } from 'react';
import html2canvas from 'html2canvas';

interface ScreenshotCaptureProps {
  onScreenshotCaptured: (screenshot: {
    imageData: string;
    pointerData?: {
      x: number;
      y: number;
      annotation?: string;
    };
  }) => void;
  onClose: () => void;
}

interface Pointer {
  x: number;
  y: number;
  annotation?: string;
}

export const ScreenshotCapture: React.FC<ScreenshotCaptureProps> = ({
  onScreenshotCaptured,
  onClose,
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [pointer, setPointer] = useState<Pointer | null>(null);
  const [paths, setPaths] = useState<{ points: { x: number; y: number }[] }[]>([]);
  const [currentPath, setCurrentPath] = useState<{ points: { x: number; y: number }[] } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [annotation, setAnnotation] = useState('');
  const [zoom, setZoom] = useState(1);

  const zoomIn = () => setZoom((z) => Math.min(z * 1.25, 3));
  const zoomOut = () => setZoom((z) => Math.max(z / 1.25, 0.5));
  // Store the dimensions we finally render the screenshot at so the outer wrapper can size itself accordingly
  const [canvasDims, setCanvasDims] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const captureScreenshot = useCallback(async () => {
    try {
      setIsCapturing(true);
      
      // Close the widget temporarily to capture the actual page content
      const widgetElements = document.querySelectorAll('[data-feedbackkit-widget]');
      const originalDisplay: string[] = [];
      
      // Hide all feedback widget elements
      widgetElements.forEach((element, index) => {
        const htmlElement = element as HTMLElement;
        originalDisplay[index] = htmlElement.style.display;
        htmlElement.style.display = 'none';
      });
      
      // Wait a moment for the DOM to update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get the actual viewport dimensions (excluding scrollbars)
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = document.documentElement.clientHeight;
      
      // Calculate the actual content area to capture
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      // Capture the *full* page first (needed so we can crop it accurately)
      const fullCanvas = await html2canvas(document.body, {
        allowTaint: true,
        useCORS: true,
        scale: 2, // Good quality across devices
        backgroundColor: '#ffffff',
        imageTimeout: 30000,
        removeContainer: true,
        foreignObjectRendering: false,
        logging: false,
        // Ignore elements with problematic CSS
        ignoreElements: (element: HTMLElement): boolean => {
          const style = window.getComputedStyle(element);
          // Ignore elements with oklab or other problematic CSS
          return style.color.includes('oklab') ||
                 style.backgroundColor.includes('oklab') ||
                 style.borderColor.includes('oklab');
        },
        // Custom rendering to handle problematic CSS
        onclone: (clonedDoc: Document): void => {
          // Remove problematic CSS rules
          const styleSheets = Array.from(clonedDoc.styleSheets) as CSSStyleSheet[];
          styleSheets.forEach((sheet: CSSStyleSheet) => {
            try {
              const rules = Array.from(sheet.cssRules) as CSSRule[];
              rules.forEach((rule: CSSRule) => {
                if (rule instanceof CSSStyleRule) {
                  // Replace oklab with fallback colors
                  if (rule.style.cssText.includes('oklab')) {
                    rule.style.cssText = rule.style.cssText
                      .replace(/oklab\([^)]+\)/g, 'rgb(0, 0, 0)')
                      .replace(/oklch\([^)]+\)/g, 'rgb(0, 0, 0)');
                  }
                }
              });
            } catch (e) {
              // Ignore CSS parsing errors for individual stylesheets
            }
          });

          // Also clean up inline styles
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((element: Element) => {
            const style = element.getAttribute('style');
            if (style && style.includes('oklab')) {
              element.setAttribute('style', style
                .replace(/oklab\([^)]+\)/g, 'rgb(0, 0, 0)')
                .replace(/oklch\([^)]+\)/g, 'rgb(0, 0, 0)'));
            }
          });
        }
      });

      // Crop the full canvas to just the viewport that the user currently sees
      const scale = 2; // Keep this in sync with the scale we passed to html2canvas above
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = viewportWidth * scale;
      croppedCanvas.height = viewportHeight * scale;

      const ctx = croppedCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(
          fullCanvas,
          scrollLeft * scale, // Start x position on the source canvas
          scrollTop * scale,  // Start y position on the source canvas
          viewportWidth * scale, // How much width to copy
          viewportHeight * scale, // How much height to copy
          0, // Destination x
          0, // Destination y
          viewportWidth * scale, // Destination width
          viewportHeight * scale // Destination height
        );
      }

      // Restore widget elements
      widgetElements.forEach((element, index) => {
        const htmlElement = element as HTMLElement;
        htmlElement.style.display = originalDisplay[index] || '';
      });

      // Convert the cropped canvas to a data URL and save it
      const imageData = croppedCanvas.toDataURL('image/png', 0.9); // High quality but not maximum
      setScreenshot(imageData);
      
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
      
      // Restore widget elements in case of error
      const widgetElements = document.querySelectorAll('[data-feedbackkit-widget]');
      widgetElements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        htmlElement.style.display = '';
      });
      
      // Fallback: try a simpler approach with minimal options
      try {
        const viewportWidth = document.documentElement.clientWidth;
        const viewportHeight = document.documentElement.clientHeight;
        
        const canvas = await html2canvas(document.body, {
          allowTaint: true,
          useCORS: true,
          scale: 1.5, // Lower scale for better compatibility
          width: viewportWidth,
          height: viewportHeight,
          backgroundColor: '#ffffff',
          imageTimeout: 20000,
          removeContainer: true,
          foreignObjectRendering: false,
          logging: false,
          ignoreElements: (element: HTMLElement): boolean => {
            // Ignore more elements to avoid CSS issues
            const tagName = element.tagName.toLowerCase();
            return tagName === 'script' || tagName === 'style';
          }
        });
        
        const imageData = canvas.toDataURL('image/png', 0.9);
        setScreenshot(imageData);
      } catch (fallbackError) {
        console.error('Fallback screenshot also failed:', fallbackError);
        
        // Final fallback: create a basic screenshot with page info
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          const viewportWidth = document.documentElement.clientWidth;
          const viewportHeight = document.documentElement.clientHeight;
          
          canvas.width = viewportWidth * 2; // Higher resolution
          canvas.height = viewportHeight * 2;
          
          // Enable high-quality rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          ctx.fillStyle = '#000000';
          ctx.font = '32px Arial'; // Larger font for better readability
          ctx.fillText('Screenshot capture failed due to CSS compatibility', 100, 100);
          ctx.fillText(`URL: ${window.location.href}`, 100, 160);
          ctx.fillText(`Time: ${new Date().toLocaleString()}`, 100, 220);
          ctx.fillText('Please describe the issue in detail below', 100, 280);
          
          const imageData = canvas.toDataURL('image/png', 0.9);
          setScreenshot(imageData);
        } else {
          alert('Failed to capture screenshot. Please describe the issue in detail.');
        }
      }
    } finally {
      setIsCapturing(false);
    }
  }, []);

  // Utility to convert mouse event coords to canvas-space coords
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);
    setCurrentPath({ points: [{ x, y }] });
    setIsDrawing(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentPath) return;
    const { x, y } = getCanvasCoords(e);
    setCurrentPath(prev => prev ? { points: [...prev.points, { x, y }] } : prev);
  }, [isDrawing, currentPath]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentPath) {
      if (currentPath.points.length < 2) {
        // Treat as simple pointer click
        const [pt] = currentPath.points;
        setPointer({ x: pt.x, y: pt.y, annotation });
      } else {
        // Save freehand path
        setPaths(prev => [...prev, currentPath]);
      }
    }
    setCurrentPath(null);
  }, [isDrawing, currentPath, annotation]);

  const handleClear = useCallback(() => {
    setPointer(null);
    setPaths([]);
    setCurrentPath(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!canvasRef.current || !screenshot) return;

    const previewCanvas = canvasRef.current;

    // Create a high-res version by drawing on a new canvas at the screenshot's native size
    const annotatedImageData: string = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = img.width;
        finalCanvas.height = img.height;
        const ctx = finalCanvas.getContext('2d');
        if (!ctx) return resolve(screenshot); // fallback to original if no ctx

        // Draw original screenshot
        ctx.drawImage(img, 0, 0);

        const scaleX = img.width / previewCanvas.width;
        const scaleY = img.height / previewCanvas.height;

        // Helper to scale points
        const scalePoint = (p: { x: number; y: number }) => ({
          x: p.x * scaleX,
          y: p.y * scaleY,
        });

        ctx.strokeStyle = 'red';
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        // Draw saved paths
        paths.forEach((path) => {
          if (path.points.length < 2) return;
          ctx.beginPath();
          ctx.lineWidth = 2 * scaleX; // scale line thickness proportionally
          const first = scalePoint(path.points[0]);
          ctx.moveTo(first.x, first.y);
          for (let i = 1; i < path.points.length; i++) {
            const pt = scalePoint(path.points[i]);
            ctx.lineTo(pt.x, pt.y);
          }
          ctx.stroke();
        });

        // Draw current in-progress path (if any)
        if (currentPath && currentPath.points.length > 1) {
          ctx.beginPath();
          ctx.lineWidth = 2 * scaleX;
          const first = scalePoint(currentPath.points[0]);
          ctx.moveTo(first.x, first.y);
          for (let i = 1; i < currentPath.points.length; i++) {
            const pt = scalePoint(currentPath.points[i]);
            ctx.lineTo(pt.x, pt.y);
          }
          ctx.stroke();
        }

        // Draw pointer on top (if any)
        if (pointer) {
          const scaled = scalePoint(pointer);
          ctx.beginPath();
          ctx.fillStyle = 'red';
          ctx.lineWidth = 2 * scaleX;
          ctx.strokeStyle = 'white';
          ctx.arc(scaled.x, scaled.y, 8 * scaleX, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
        }

        resolve(finalCanvas.toDataURL('image/png', 0.95)); // higher quality
      };
      img.src = screenshot;
    });

    onScreenshotCaptured({
      imageData: annotatedImageData,
      pointerData: pointer || undefined,
    });
  }, [screenshot, paths, currentPath, pointer, onScreenshotCaptured]);

  const handleRetake = useCallback(() => {
    setScreenshot(null);
    setPointer(null);
    setAnnotation('');
  }, []);

  // Draw screenshot, pointer, and drawings on canvas when available
  useEffect(() => {
    if (screenshot && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        // Universal dimensions that work across all devices
        const maxHeight = 500; // Reduced for better mobile compatibility
        const maxWidth = 700;  // Reduced for better mobile compatibility
        
        let canvasWidth = img.width;
        let canvasHeight = img.height;
        
        // Scale down if image is too large while maintaining aspect ratio
        if (canvasHeight > maxHeight) {
          const scale = maxHeight / canvasHeight;
          canvasWidth = img.width * scale;
          canvasHeight = maxHeight;
        }
        
        if (canvasWidth > maxWidth) {
          const scale = maxWidth / canvasWidth;
          canvasWidth = maxWidth;
          canvasHeight = img.height * scale;
        }

        // Set canvas intrinsic size
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // And make the displayed size match exactly (no extra CSS scaling)
        canvas.style.width = `${canvasWidth}px`;
        canvas.style.height = `${canvasHeight}px`;

        // Save dims so the wrapper div can shrink to fit
        setCanvasDims({ w: canvasWidth, h: canvasHeight });

        // Enable high-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Clear canvas and draw the image
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
        
        // Draw freehand paths (stored directly in canvas coordinate space)
        paths.forEach(path => {
          if (path.points.length < 2) return;
          ctx.beginPath();
          ctx.strokeStyle = 'red';
          ctx.lineWidth = 2;
          ctx.lineJoin = 'round';
          ctx.lineCap = 'round';
          ctx.moveTo(path.points[0].x, path.points[0].y);
          for (let i = 1; i < path.points.length; i++) {
            ctx.lineTo(path.points[i].x, path.points[i].y);
          }
          ctx.stroke();
        });

        // Draw the path being currently drawn (for live feedback)
        if (currentPath && currentPath.points.length > 1) {
          ctx.beginPath();
          ctx.strokeStyle = 'red';
          ctx.lineWidth = 2;
          ctx.lineJoin = 'round';
          ctx.lineCap = 'round';
          ctx.moveTo(currentPath.points[0].x, currentPath.points[0].y);
          for (let i = 1; i < currentPath.points.length; i++) {
            ctx.lineTo(currentPath.points[i].x, currentPath.points[i].y);
          }
          ctx.stroke();
        }

        // If there's a pointer (single click), draw it last on top
        if (pointer) {
          ctx.beginPath();
          ctx.arc(pointer.x, pointer.y, 8, 0, 2 * Math.PI);
          ctx.fillStyle = 'red';
          ctx.fill();
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      };
      img.src = screenshot;
    }
  }, [screenshot, pointer, paths, currentPath]);

  if (!screenshot) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Capture Screenshot</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Capture a screenshot of the current page to help identify the issue.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={captureScreenshot}
              disabled={isCapturing}
              className="px-4 py-2 bg-[var(--fk-primary)] text-gray-900 rounded hover:opacity-90 disabled:opacity-50"
            >
              {isCapturing ? 'Capturing...' : 'Capture Screenshot'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Add Pointer to Screenshot</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Click on the screenshot to add a pointer showing where the issue is located.
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Annotation (Optional)
          </label>
          <input
            type="text"
            value={annotation}
            onChange={(e) => setAnnotation(e.target.value)}
            placeholder="Describe what you're pointing to..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[var(--fk-primary)] focus:border-[var(--fk-primary)] outline-none dark:bg-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="relative mb-4 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden mx-auto" style={{ width: canvasDims.w * zoom, height: canvasDims.h * zoom }}>
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="cursor-crosshair"
            style={{ 
              display: 'block',
              width: `${canvasDims.w * zoom}px`,
              height: `${canvasDims.h * zoom}px`
            }}
          />
        </div>

        {pointer && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="text-gray-800 dark:text-gray-200">
                Pointer added at: ({Math.round(pointer.x)}, {Math.round(pointer.y)})
              </span>
              {pointer.annotation && (
                <span className="block mt-1">
                  <strong>Annotation:</strong> {pointer.annotation}
                </span>
              )}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[var(--fk-primary)] text-white rounded hover:opacity-90"
          >
            Save Screenshot
          </button>
          <button
            onClick={zoomIn}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            Zoom In
          </button>
          <button
            onClick={zoomOut}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            Zoom Out
          </button>
          <button
            onClick={handleRetake}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            Retake Screenshot
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            Clear
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}; 