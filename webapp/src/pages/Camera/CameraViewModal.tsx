import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Modal, Switch, useOverlayState } from '@heroui/react';
import { Display } from '@gravity-ui/icons';

interface Props {
  deviceId: string;
  isOpen: boolean;
  onClose: () => void;
}

const SKELETON_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8],
  [9, 10], [11, 12],
  [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
  [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
  [11, 23], [12, 24], [23, 24],
  [23, 25], [24, 26], [25, 27], [26, 28], [27, 29], [28, 30], [29, 31], [30, 32],
];

function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: { x: number; y: number; visibility?: number }[],
  w: number,
  h: number,
) {
  ctx.save();
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 2;
  ctx.fillStyle = '#ff0044';

  for (const [i, j] of SKELETON_CONNECTIONS) {
    const a = landmarks[i];
    const b = landmarks[j];
    if (!a || !b) continue;
    const va = a.visibility ?? 1;
    const vb = b.visibility ?? 1;
    if (va < 0.5 || vb < 0.5) continue;
    ctx.beginPath();
    ctx.moveTo(a.x * w, a.y * h);
    ctx.lineTo(b.x * w, b.y * h);
    ctx.stroke();
  }

  for (const lm of landmarks) {
    if ((lm.visibility ?? 1) < 0.5) continue;
    ctx.beginPath();
    ctx.arc(lm.x * w, lm.y * h, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function CameraViewModal({ deviceId, isOpen, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bodyWire, setBodyWire] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [noPerson, setNoPerson] = useState(false);
  const poseRef = useRef<any>(null);
  const fullLoadedRef = useRef(false);
  const detectingRef = useRef(false);

  const modalState = useMemo(() => ({
    isOpen,
    setOpen: (open: boolean) => { if (!open) onClose(); },
    open: () => {},
    close: onClose,
    toggle: () => { if (isOpen) onClose(); },
  }), [isOpen, onClose]);

  const initPose = useCallback(async () => {
    if (poseRef.current) { setModelReady(true); return; }
    setModelLoading(true);
    try {
      const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm',
      );
      poseRef.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'IMAGE',
        numPoses: 1,
      });
      setModelReady(true);
    } catch {
      setBodyWire(false);
    }
    setModelLoading(false);
  }, []);

  useEffect(() => {
    if (bodyWire) initPose();
  }, [bodyWire, initPose]);

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    const es = new EventSource(`/api/hardware/devices/${deviceId}/stream`);

    const processFrame = (src: string, x: number, y: number, w: number, h: number) => {
      img.onload = async () => {
        ctx.drawImage(img, x, y, w, h);

        if (modelReady && !detectingRef.current) {
          detectingRef.current = true;
          try {
            const result = poseRef.current?.detect(canvas);
            if (result?.landmarks?.length > 0) {
              setNoPerson(false);
              drawSkeleton(ctx, result.landmarks[0], canvas.width, canvas.height);
            } else {
              setNoPerson(true);
            }
          } catch { /* skip */ }
          detectingRef.current = false;
        }
      };
      img.src = src;
    };

    es.addEventListener('frame', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'full') {
          canvas.width = data.width;
          canvas.height = data.height;
          fullLoadedRef.current = true;
          processFrame(`data:image/jpeg;base64,${data.jpeg}`, 0, 0, data.width, data.height);
        } else if (data.jpeg) {
          fullLoadedRef.current = true;
          processFrame(`data:image/jpeg;base64,${data.jpeg}`, 0, 0, canvas.width || 320, canvas.height || 240);
        }
      } catch { /* skip */ }
    });

    es.addEventListener('delta', () => {
      // delta needs frame data; handled in frame event for simplicity
    });

    return () => {
      es.close();
      fullLoadedRef.current = false;
    };
  }, [deviceId, isOpen, modelReady]);

  return (
    <Modal state={modalState}>
      <Modal.Backdrop>
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>
                <span className="flex items-center gap-2">
                  <Display className="size-5" />
                  摄像头画面
                </span>
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="bg-black rounded-lg overflow-hidden relative min-h-[300px]">
                <canvas ref={canvasRef} className="w-full" />
                {noPerson && bodyWire && (
                  <span className="absolute top-2 left-2 text-xs text-white/60 bg-black/40 px-2 py-0.5 rounded">
                    未检测到人体
                  </span>
                )}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Switch
                isSelected={bodyWire}
                onChange={(v) => setBodyWire(v)}
                isDisabled={modelLoading}
              >
                <Switch.Content>
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                  {modelLoading ? '加载模型中...' : '人体线框'}
                </Switch.Content>
              </Switch>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
