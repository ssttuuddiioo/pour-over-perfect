/// <reference types="vite/client" />

interface Window {
  kofiWidgetOverlay?: {
    draw: (id: string, config: any) => void;
    // You can add more specific types for the config if known
  };
}
