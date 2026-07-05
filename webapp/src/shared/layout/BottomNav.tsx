import { useState, useEffect } from 'react';
import { motion, useAnimation } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavItem {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>> | (() => React.ReactNode);
  id: string;
  path: string;
  isIconOnly: boolean;
}

interface BottomNavProps {
  items: NavItem[];
}

export function BottomNav({ items }: BottomNavProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activeId = items.find((i) => i.path === pathname)?.id ?? items[0]?.id;

  const controls = useAnimation();
  const [hasMounted, setHasMounted] = useState(false);

  const activeIndex = items.findIndex((item) => item.id === activeId);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (activeIndex < 0) return;

    if (!hasMounted) {
      controls.set({
        left: `${(activeIndex / items.length) * 100}%`,
        width: `${100 / items.length}%`,
        top: '4px',
        bottom: '4px',
      });
      return;
    }

    controls.start({
      left: `${(activeIndex / items.length) * 100}%`,
      width: `${100 / items.length}%`,
      scale: [0.9, 1.1, 0.9],
      transition: {
        left: { type: 'spring', stiffness: 320, damping: 28 },
        width: { type: 'spring', stiffness: 320, damping: 28 },
      },
    });
  }, [activeIndex, hasMounted, controls, items.length]);

  return (
    <nav className="sm:hidden fixed bottom-6 left-6 right-6 z-40">
      <div className="relative bg-white/80 dark:bg-surface/50 backdrop-blur-sm rounded-[30px] shadow-lg">
        <motion.div
          className="absolute bg-blue-500/80 rounded-[24px] pointer-events-none"
          animate={controls}
          initial={false}
          style={{ zIndex: 0, top: '4px', bottom: '4px' }}
        />
        <div className="relative z-10 flex justify-around">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex-1 flex flex-col items-center justify-center py-3 transition-colors ${
                activeId === item.id ? 'text-white' : 'text-neutral-500'
              }`}
            >
              <item.icon className="w-6 h-6" />
              {!item.isIconOnly && (
                <span className="text-[12px] leading-none mt-0.5 font-medium">
                  {item.id}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
