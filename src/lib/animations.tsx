import { motion, Variants, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

// Standard animation variants for consistent UX
export const fadeIn: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

export const fadeInUp: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
};

export const fadeInDown: Variants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
};

export const fadeInLeft: Variants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
};

export const fadeInRight: Variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
};

export const scaleIn: Variants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
};

export const staggerContainer: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

export const staggerItem: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
};

// Card hover animation
export const cardHover: Variants = {
    initial: { scale: 1, y: 0 },
    hover: {
        scale: 1.02,
        y: -4,
        transition: { type: 'spring', stiffness: 400, damping: 25 },
    },
    tap: { scale: 0.98 },
};

// Button hover animation
export const buttonHover: Variants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
};

// Glow effect on hover
export const glowHover: Variants = {
    initial: { boxShadow: '0 0 0 rgba(99, 102, 241, 0)' },
    hover: {
        boxShadow: '0 0 24px rgba(99, 102, 241, 0.4), 0 0 48px rgba(99, 102, 241, 0.2)',
    },
};

// Modal animation
export const modalOverlay: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

export const modalContent: Variants = {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: 20 },
};

// Page transition wrapper component
interface PageTransitionProps extends HTMLMotionProps<'div'> {
    children: ReactNode;
    className?: string;
}

export function PageTransition({ children, className, ...props }: PageTransitionProps) {
    return (
        <motion.div
            initial= "initial"
    animate = "animate"
    exit = "exit"
    variants = { fadeInUp }
    transition = {{ duration: 0.3, ease: 'easeOut' }
}
className = { className }
{...props }
        >
    { children }
    </motion.div>
    );
}

// Stagger container for lists
interface StaggerContainerProps extends HTMLMotionProps<'div'> {
    children: ReactNode;
    className?: string;
    staggerDelay?: number;
}

export function StaggerContainer({ children, className, staggerDelay = 0.1, ...props }: StaggerContainerProps) {
    return (
        <motion.div
            initial= "initial"
    animate = "animate"
    variants = {{
        initial: { },
        animate: {
            transition: {
                staggerChildren: staggerDelay,
                    delayChildren: 0.1,
                    },
        },
    }
}
className = { className }
{...props }
        >
    { children }
    </motion.div>
    );
}

// Animated card wrapper
interface AnimatedCardProps extends HTMLMotionProps<'div'> {
    children: ReactNode;
    className?: string;
    enableGlow?: boolean;
}

export function AnimatedCard({ children, className, enableGlow = false, ...props }: AnimatedCardProps) {
    return (
        <motion.div
            initial= "initial"
    animate = "initial"
    whileHover = "hover"
    whileTap = "tap"
    variants = { cardHover }
    className = { className }
    {...props }
        >
        { children }
        </motion.div>
    );
}

// Default transition settings
export const defaultTransition = {
    type: 'spring',
    stiffness: 400,
    damping: 30,
};

export const smoothTransition = {
    duration: 0.3,
    ease: [0.25, 0.46, 0.45, 0.94],
};

