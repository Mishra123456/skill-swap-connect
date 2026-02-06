import React, { useRef, useState, useEffect } from 'react';
import { Save, Eraser, Pen, Undo, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CollaborativeWhiteboardProps {
    matchId: string;
    initialSnapshot?: string;
}

const CollaborativeWhiteboard: React.FC<CollaborativeWhiteboardProps> = ({ matchId, initialSnapshot }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#fff');
    const [lineWidth, setLineWidth] = useState(2);
    const { toast } = useToast();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set initial background
        ctx.fillStyle = '#1e293b'; // slate-800
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (initialSnapshot) {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0);
            };
            img.src = initialSnapshot;
        }

        const handleResize = () => {
            // In a real app we'd handle resize better to not lose data
            // For now we assume fixed size or responsive parent
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [initialSnapshot]);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { offsetX, offsetY } = getCoordinates(e, canvas);
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { offsetX, offsetY } = getCoordinates(e, canvas);
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx?.closePath();
    };

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        return {
            offsetX: clientX - rect.left,
            offsetY: clientY - rect.top
        };
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const saveCanvas = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const snapshot = canvas.toDataURL();
        try {
            await api.sessions.updateWhiteboard(matchId, snapshot);
            toast({ title: 'Whiteboard saved' });
        } catch (error) {
            toast({ title: 'Failed to save', variant: 'destructive' });
        }
    };

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex items-center gap-2 p-2 bg-slate-800 rounded-lg border border-white/5">
                <Button
                    size="sm"
                    variant={color === '#fff' ? 'secondary' : 'ghost'}
                    onClick={() => setColor('#fff')}
                    className="w-8 h-8 p-0"
                >
                    <div className="w-4 h-4 rounded-full bg-white border border-gray-600" />
                </Button>
                <Button
                    size="sm"
                    variant={color === '#f87171' ? 'secondary' : 'ghost'}
                    onClick={() => setColor('#f87171')}
                    className="w-8 h-8 p-0"
                >
                    <div className="w-4 h-4 rounded-full bg-red-400" />
                </Button>
                <Button
                    size="sm"
                    variant={color === '#60a5fa' ? 'secondary' : 'ghost'}
                    onClick={() => setColor('#60a5fa')}
                    className="w-8 h-8 p-0"
                >
                    <div className="w-4 h-4 rounded-full bg-blue-400" />
                </Button>
                <Button
                    size="sm"
                    variant={color === '#4ade80' ? 'secondary' : 'ghost'}
                    onClick={() => setColor('#4ade80')}
                    className="w-8 h-8 p-0"
                >
                    <div className="w-4 h-4 rounded-full bg-green-400" />
                </Button>

                <div className="w-px h-6 bg-white/10 mx-2" />

                <Button size="sm" variant="ghost" onClick={clearCanvas}>
                    <Trash2 className="h-4 w-4" />
                </Button>
                <Button size="sm" onClick={saveCanvas} className="ml-auto">
                    <Save className="h-4 w-4 mr-2" /> Save
                </Button>
            </div>

            <div className="flex-1 bg-slate-800 rounded-xl overflow-hidden border border-white/5 relative touch-none">
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    className="w-full h-full cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
            </div>
        </div>
    );
};

export default CollaborativeWhiteboard;
