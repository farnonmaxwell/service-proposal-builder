import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  onSave: (data: { signerName: string; signatureDataUrl: string; ipAddress: string }) => void;
  onCancel?: () => void;
};

export default function ESignatureCanvas({ onSave, onCancel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [hasSignature, setHasSignature] = useState(false);
  const [ipAddress, setIpAddress] = useState("0.0.0.0");

  useEffect(() => {
    // Stub IP address capture
    fetch("https://api.ipify.org?format=json")
      .then((r) => r.json())
      .then((d) => setIpAddress(d.ip || "0.0.0.0"))
      .catch(() => setIpAddress("0.0.0.0"));
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const touch = e.touches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
    setHasSignature(true);
    e.preventDefault();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    e.preventDefault();
  };

  const stopDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSave = () => {
    if (!signerName.trim()) {
      alert("Please enter your full name.");
      return;
    }
    if (!hasSignature) {
      alert("Please draw your signature.");
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSave({ signerName: signerName.trim(), signatureDataUrl: dataUrl, ipAddress });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-900 mb-1">
          Full Name *
        </label>
        <Input
          value={signerName}
          onChange={(e) => setSignerName(e.target.value)}
          placeholder="Type your full legal name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-900 mb-1">
          Signature *
        </label>
        <div className="border-2 border-slate-300 rounded-lg overflow-hidden bg-white relative">
          <canvas
            ref={canvasRef}
            width={560}
            height={160}
            className="w-full touch-none cursor-crosshair"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
          {!hasSignature && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-slate-300 text-sm">Draw signature here</span>
            </div>
          )}
        </div>
        <div className="flex justify-between mt-1">
          <p className="text-xs text-slate-500">
            Date: {new Date().toLocaleDateString()} - IP: {ipAddress}
          </p>
          <button onClick={clearCanvas} className="text-xs text-slate-500 hover:text-red-500">
            Clear
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          className="bg-green-500 hover:bg-green-600 text-white"
          onClick={handleSave}
          disabled={!signerName || !hasSignature}
        >
          Sign & Accept
        </Button>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>

      <p className="text-xs text-slate-400">
        By signing, you agree to the terms and conditions outlined in this proposal. This electronic signature is legally binding.
      </p>
    </div>
  );
}
