import { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'motion/react';
import { Widget } from '@components/widget';
import { fadeUpItem, staggerContainer } from '../../shared/lib/animations';

function useAnimatedCounter(end: number, duration = 1.2) {
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0.15 });
  const rounded = useTransform(spring, (v) => Math.round(v));

  useEffect(() => {
    spring.set(end);
  }, [end, spring]);

  return rounded;
}

function AnimatedCounter({ value, className }: { value: number; className?: string }) {
  const count = useAnimatedCounter(value);
  return <motion.span className={className}>{count}</motion.span>;
}

const techStack = [
  { category: 'Framework', items: ['React 19', 'TypeScript', 'Vite 6'] },
  { category: 'Styling', items: ['Tailwind CSS v4', 'tailwind-variants'] },
  { category: 'Accessibility', items: ['React Aria Components'] },
  { category: 'Animation', items: ['Motion'] },
  { category: 'Charts', items: ['Recharts'] },
  { category: 'Carousel', items: ['Embla Carousel'] },
];

export function AboutPage() {

  return (
    <motion.div
      animate="show"
      className="space-y-6"
      initial="hidden"
      variants={staggerContainer}
    >
      <motion.div>
        <Widget>
          <Widget.Header>
            <Widget.Title>About HeroUI Pro</Widget.Title>
          </Widget.Header>
          <Widget.Content>
            <p className="text-sm leading-6 text-neutral-600">
              HeroUI Pro is a premium React component library for enterprise
              applications, built on HeroUI v3 and Tailwind CSS v4. It ships 60+
              production-ready components covering data display, AI messaging,
              form inputs, layout, and surface patterns.
            </p>
          </Widget.Content>
        </Widget>
      </motion.div>

      <motion.div>
        <Widget>
          <Widget.Header>
            <Widget.Title>Tech Stack</Widget.Title>
          </Widget.Header>
          <Widget.Content>
            <motion.div
              animate="show"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              variants={staggerContainer}
            >
              {techStack.map((group) => (
                <motion.div key={group.category}>
                  <h4 className="mb-2 text-sm font-semibold text-neutral-900">
                    {group.category}
                  </h4>
                  <ul className="space-y-1">
                    {group.items.map((item) => (
                      <li key={item} className="text-sm text-neutral-600">
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          </Widget.Content>
        </Widget>
      </motion.div>
    </motion.div>
  );
}
