import { useState, useRef, useCallback } from "react";
import { Project } from "../types";

export function usePanZoom(
  project: Project,
  selectedComponentKey: string | null
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [worldSize, setWorldSize] = useState({ width: 2000, height: 2000 });

  const isPanningRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    isPanningRef.current = true;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    try { (e.target as Element).setPointerCapture?.(e.pointerId); } catch {}
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanningRef.current || !lastPointerRef.current) return;
    const dx = e.clientX - lastPointerRef.current.x;
    const dy = e.clientY - lastPointerRef.current.y;
    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onPointerUp = useCallback((e?: React.PointerEvent) => {
    isPanningRef.current = false;
    lastPointerRef.current = null;
    if (e) try { (e.target as Element).releasePointerCapture?.(e.pointerId); } catch {}
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const pointerX = e.clientX - containerRect.left;
    const pointerY = e.clientY - containerRect.top;

    const worldX = (pointerX - offset.x) / scale;
    const worldY = (pointerY - offset.y) / scale;

    const delta = -e.deltaY;
    const zoomFactor = Math.exp(delta * 0.0012);
    const newScale = Math.max(0.2, Math.min(5, scale * zoomFactor));
    setOffset({ x: pointerX - worldX * newScale, y: pointerY - worldY * newScale });
    setScale(newScale);
  }, [scale, offset]);

  return {
    containerRef,
    canvasRef,
    scale,
    offset,
    worldSize,
    setWorldSize,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onWheel
  };
}
