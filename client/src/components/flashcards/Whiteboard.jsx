import React, { useRef, useState, useEffect } from 'react';
import { Pencil, Eraser, Undo, Redo, Trash2 } from 'lucide-react';

export default function Whiteboard({ activeCardId }) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const currentPath = useRef(null);

  const [paths, setPaths] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [tool, setTool] = useState('pen'); // 'pen' or 'eraser'

  // Stylus/Pen configuration
  const penColor = '#c084fc'; // Theme violet accent
  const penWidth = 4;
  const eraserWidth = 32;

  // Redraw the canvas content from history paths
  const redrawCanvas = (pathsList) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear entire canvas to transparent
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pathsList.forEach((path) => {
      if (!path.points || path.points.length === 0) return;
      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);

      if (path.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = path.width || eraserWidth;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineWidth = path.width || penWidth;
        ctx.strokeStyle = path.color || penColor;
      }
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      ctx.stroke();
    });
  };

  // Re-draw canvas whenever the paths history updates
  useEffect(() => {
    redrawCanvas(paths);
  }, [paths]);

  // Clean whiteboard session when a new card is loaded
  useEffect(() => {
    setPaths([]);
    setRedoStack([]);
    setTool('pen');
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [activeCardId]);

  // Translate client event coordinates relative to the scaled canvas physical coordinates
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  };

  const startDrawing = (e) => {
    // Avoid double firing touch/mouse, prevent page scrolling on mobile swipe
    if (e.cancelable) {
      e.preventDefault();
    }
    const { x, y } = getCoordinates(e);
    isDrawing.current = true;

    currentPath.current = {
      points: [{ x, y }],
      tool: tool,
      color: tool === 'pen' ? penColor : null,
      width: tool === 'pen' ? penWidth : eraserWidth,
    };

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (tool === 'eraser') {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.lineWidth = eraserWidth;
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.lineWidth = penWidth;
          ctx.strokeStyle = penColor;
        }
      }
    }
  };

  const draw = (e) => {
    if (!isDrawing.current || !currentPath.current) return;
    if (e.cancelable) {
      e.preventDefault();
    }
    const { x, y } = getCoordinates(e);
    currentPath.current.points.push({ x, y });

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  };

  const endDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    if (currentPath.current && currentPath.current.points.length > 0) {
      setPaths(prev => [...prev, currentPath.current]);
      setRedoStack([]);
    }
    currentPath.current = null;
  };

  const handleUndo = () => {
    if (paths.length === 0) return;
    const newPaths = paths.slice(0, -1);
    const undone = paths[paths.length - 1];
    setPaths(newPaths);
    setRedoStack(prev => [undone, ...prev]);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const restored = redoStack[0];
    setPaths(prev => [...prev, restored]);
    setRedoStack(prev => prev.slice(1));
  };

  const handleClear = () => {
    setPaths([]);
    setRedoStack([]);
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Mini Controls Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
        <span className="text-[11px] font-mono text-zinc-400">Recall Active Whiteboard</span>
        <div className="flex items-center gap-1">
          {/* Pen Toggle */}
          <button
            onClick={() => setTool('pen')}
            className={`p-1.5 rounded transition-all cursor-pointer ${
              tool === 'pen'
                ? 'bg-violet-600/30 text-violet-400 border border-violet-500/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
            title="Pen tool"
            aria-label="Use Pen Tool"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          {/* Eraser Toggle */}
          <button
            onClick={() => setTool('eraser')}
            className={`p-1.5 rounded transition-all cursor-pointer ${
              tool === 'eraser'
                ? 'bg-violet-600/30 text-violet-400 border border-violet-500/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
            title="Eraser tool"
            aria-label="Use Eraser Tool"
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-zinc-800 mx-1" />

          {/* Undo Action */}
          <button
            onClick={handleUndo}
            disabled={paths.length === 0}
            className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
            title="Undo"
            aria-label="Undo last stroke"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>

          {/* Redo Action */}
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
            title="Redo"
            aria-label="Redo last stroke"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-zinc-800 mx-1" />

          {/* Clear Action */}
          <button
            onClick={handleClear}
            className="p-1.5 rounded text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Clear whiteboard"
            aria-label="Clear whiteboard content"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Drawing Canvas */}
      <div className="relative flex-1 rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden cursor-crosshair select-none h-full aspect-[4/3] md:aspect-auto">
        <canvas
          ref={canvasRef}
          width={1200}
          height={900}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
          className="absolute inset-0 w-full h-full touch-none"
        />
        {paths.length === 0 && !isDrawing.current && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-zinc-600 text-xs font-mono select-none">
            Write your answer here...
          </div>
        )}
      </div>
    </div>
  );
}
