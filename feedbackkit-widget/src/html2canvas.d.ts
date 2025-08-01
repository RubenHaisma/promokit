declare module 'html2canvas' {
  const html2canvas: (
    element: HTMLElement | Document,
    options?: any
  ) => Promise<HTMLCanvasElement>;
  export default html2canvas;
} 