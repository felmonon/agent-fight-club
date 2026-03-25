import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';

interface CountUpProps {
  value: number;
  duration?: number;
  className?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

export function CountUp({ 
  value, 
  duration = 1, 
  className = '', 
  decimals = 0,
  prefix = '',
  suffix = ''
}: CountUpProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    return prefix + latest.toFixed(decimals) + suffix;
  });
  const prevValue = useRef(0);

  useEffect(() => {
    const controls = animate(prevValue.current, value, {
      duration,
      onUpdate: (latest) => count.set(latest),
      ease: "easeOut"
    });
    
    prevValue.current = value;
    return controls.stop;
  }, [value, duration, count]);

  return <motion.span className={className}>{rounded}</motion.span>;
}
