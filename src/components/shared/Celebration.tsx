import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
    id: number;
    x: number;
    y: number;
    color: string;
    rotation: number;
    scale: number;
}

export const Celebration = ({ isVisible, onComplete }: { isVisible: boolean, onComplete?: () => void }) => {
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        if (isVisible) {
            const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];
            const newParticles = Array.from({ length: 50 }).map((_, i) => ({
                id: i,
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                scale: Math.random() * 0.5 + 0.5,
            }));
            setParticles(newParticles);

            const timer = setTimeout(() => {
                setParticles([]);
                onComplete?.();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isVisible, onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
                    {particles.map((particle) => (
                        <motion.div
                            key={particle.id}
                            initial={{
                                x: particle.x,
                                y: particle.y,
                                opacity: 1,
                                scale: 0
                            }}
                            animate={{
                                x: particle.x + (Math.random() - 0.5) * 800,
                                y: particle.y + (Math.random() - 0.5) * 800,
                                opacity: 0,
                                scale: particle.scale,
                                rotate: particle.rotation + 360 * 2
                            }}
                            transition={{
                                duration: 2.5,
                                ease: "easeOut"
                            }}
                            className="absolute w-3 h-3 rounded-sm"
                            style={{ backgroundColor: particle.color }}
                        />
                    ))}

                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                        <div className="bg-slate-900/90 backdrop-blur-xl border border-indigo-500/50 p-8 rounded-3xl shadow-2xl text-center">
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="text-6xl mb-4"
                            >
                                🎉
                            </motion.div>
                            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-500 mb-2">
                                It's a Match!
                            </h2>
                            <p className="text-gray-400">
                                You've started a new skill exchange.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
