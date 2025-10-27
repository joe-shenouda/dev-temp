"use client";

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, X, Download, Maximize, RefreshCw } from "lucide-react";

interface ImageModalProps {
  src: string;
  alt: string;
  format: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ src, alt, format }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 5));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.2));
  
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.min(Math.max(prev + delta, 0.2), 5));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `data:image/${format};base64,${src}`;
    link.download = `venice-generated-image.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFullscreen = () => {
    if (imageContainerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        imageContainerRef.current.requestFullscreen();
      }
    }
  };

  const onOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setTimeout(handleReset, 300); // Reset after close animation
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white">
          <ZoomIn className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="max-w-none w-screen h-screen sm:max-w-5xl sm:h-[90vh] p-0 overflow-hidden bg-transparent border-none"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div ref={imageContainerRef} className="relative w-full h-full bg-black/80 flex items-center justify-center">
          <div 
            className="absolute inset-0 overflow-hidden"
            onWheel={handleWheel}
          >
            <img
              src={`data:image/${format};base64,${src}`}
              alt={alt}
              className="absolute top-0 left-0 block"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                cursor: isDragging ? 'grabbing' : 'grab',
              }}
            />
          </div>
          
          <div className="absolute top-4 right-4 flex flex-col sm:flex-row gap-2 z-10">
            <Button variant="secondary" size="icon" onClick={handleZoomIn} className="bg-black/50 hover:bg-black/70 text-white" title="Zoom In">
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button variant="secondary" size="icon" onClick={handleZoomOut} className="bg-black/50 hover:bg-black/70 text-white" title="Zoom Out">
              <ZoomOut className="h-5 w-5" />
            </Button>
            <Button variant="secondary" size="icon" onClick={handleReset} className="bg-black/50 hover:bg-black/70 text-white" title="Reset View">
              <RefreshCw className="h-5 w-5" />
            </Button>
            <Button variant="secondary" size="icon" onClick={handleDownload} className="bg-black/50 hover:bg-black/70 text-white" title="Download Image">
              <Download className="h-5 w-5" />
            </Button>
            <Button variant="secondary" size="icon" onClick={handleFullscreen} className="bg-black/50 hover:bg-black/70 text-white hidden sm:inline-flex" title="Toggle Fullscreen">
              <Maximize className="h-5 w-5" />
            </Button>
            <Button variant="secondary" size="icon" onClick={() => onOpenChange(false)} className="bg-black/50 hover:bg-black/70 text-white" title="Close">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageModal;