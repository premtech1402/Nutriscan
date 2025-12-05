import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, X, SwitchCamera } from 'lucide-react';

interface ScannerProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const startCamera = useCallback(async () => {
    // Stop any existing streams first
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      setHasPermission(false);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Mirror image if using front camera for natural feel
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.95);
        stopCamera();
        onCapture(imageData);
      }
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  if (hasPermission === false) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white p-6 z-50">
        <p className="text-xl mb-4 text-center">Camera access denied.</p>
        <button onClick={onClose} className="px-6 py-2 bg-gray-700 rounded-full">Close</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
        <button onClick={onClose} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors">
          <X size={24} />
        </button>
        
        <span className="text-white font-medium text-sm bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
          Scan Item
        </span>

        <button onClick={toggleCamera} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors">
          <SwitchCamera size={24} />
        </button>
      </div>

      {/* Video Stream */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
        />
        
        {/* Scanning Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-72 h-48 border-2 border-white/50 rounded-lg relative overflow-hidden bg-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] scanner-frame">
             <div className="scan-line"></div>
             {/* Corner Markers */}
             <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-500 -mt-0.5 -ml-0.5"></div>
             <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-500 -mt-0.5 -mr-0.5"></div>
             <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-500 -mb-0.5 -ml-0.5"></div>
             <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-500 -mb-0.5 -mr-0.5"></div>
             
             {/* Center Guide */}
             <div className="absolute top-1/2 left-1/2 w-4 h-0.5 bg-white/30 -translate-x-1/2 -translate-y-1/2"></div>
             <div className="absolute top-1/2 left-1/2 w-0.5 h-4 bg-white/30 -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="p-8 pb-12 bg-black flex justify-center items-center">
        <button 
          onClick={handleCapture}
          className="group w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/10 active:bg-white/30 transition-all hover:scale-105"
        >
          <div className="w-16 h-16 bg-white rounded-full group-active:scale-90 transition-transform"></div>
        </button>
      </div>
    </div>
  );
};

export default Scanner;