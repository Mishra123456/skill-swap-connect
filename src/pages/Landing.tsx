import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import { BookOpen, Users, Sparkles, ArrowRight, Zap, Shield, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = () => {
  // Framer Motion animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const features = [
    {
      icon: BookOpen,
      title: 'Teach What You Know',
      description: 'Share your expertise with others who are eager to learn. Your knowledge is valuable.',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      icon: Sparkles,
      title: 'Learn What You Want',
      description: 'Discover new skills from passionate teachers. No cost, just mutual growth.',
      gradient: 'from-indigo-500 to-purple-500',
    },
    {
      icon: Users,
      title: 'Match With the Right People',
      description: 'Our platform connects you with compatible skill partners based on what you offer and seek.',
      gradient: 'from-purple-500 to-pink-500',
    },
  ];


  const features_highlights = [
    { icon: Users, label: 'Connect with Learners', description: 'Find like-minded people' },
    { icon: Zap, label: 'Instant Matching', description: 'Smart skill pairing' },
    { icon: Shield, label: 'Safe & Secure', description: 'Verified community' },
    { icon: Globe, label: 'Learn Anywhere', description: 'No barriers to knowledge' },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center bg-gradient-to-br from-slate-900 via-slate-900 to-neutral-950">
        {/* Animated background */}
        <div className="absolute inset-0 gradient-mesh opacity-60" />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: 'easeOut' }}
          className="absolute top-20 left-10 w-72 h-72 blur-circle blur-circle-primary animate-float"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, delay: 0.5, ease: 'easeOut' }}
          className="absolute bottom-20 right-10 w-96 h-96 blur-circle blur-circle-accent animate-float"
          style={{ animationDelay: '1s' }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-circle blur-circle-secondary opacity-30" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="container mx-auto px-4 py-20 md:py-32 relative"
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div variants={itemVariants}>
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                The Future of Skill Exchange
              </motion.span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl font-bold text-gray-100 mb-6 leading-tight"
            >
              Exchange Skills.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400">
                Learn Together.
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto"
            >
              Connect with people who want to share their knowledge. Teach what you know,
              learn what you want—no money involved, just mutual growth.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/signup">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="w-full sm:w-auto px-8 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-lg shadow-indigo-500/25 group">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </Link>
              <Link to="/login">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 bg-transparent border-gray-600 text-gray-300 hover:bg-white/5 hover:border-indigo-500/50">
                    Sign In
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Floating avatars */}
            <motion.div variants={itemVariants} className="mt-16 flex items-center justify-center gap-4">
              <div className="flex -space-x-3">
                {['A', 'B', 'C', 'D', 'E'].map((letter, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.1, duration: 0.3 }}
                    whileHover={{ scale: 1.2, zIndex: 10 }}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-sm font-medium border-2 border-slate-900 cursor-pointer shadow-lg shadow-indigo-500/20"
                  >
                    {letter}
                  </motion.div>
                ))}
              </div>
              <p className="text-sm text-gray-400">
                <span className="font-semibold text-gray-200">Join our growing community</span> of skill exchangers
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Highlights Section */}
      <section className="py-16 border-y border-white/10 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {features_highlights.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className="text-center group cursor-pointer"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center group-hover:from-indigo-500/30 group-hover:to-cyan-500/30 transition-all">
                  <item.icon className="h-7 w-7 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                </div>
                <div className="text-lg font-semibold text-gray-100 mb-1">
                  {item.label}
                </div>
                <div className="text-sm text-gray-400">{item.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-slate-900 to-neutral-950">
        <div className="absolute top-0 right-0 w-96 h-96 blur-circle blur-circle-primary opacity-30" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16 animate-fade-in-up">
            <span className="text-indigo-400 text-sm font-semibold uppercase tracking-wider">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mt-4 mb-6">
              Simple Steps to
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400"> Start Learning</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-lg">
              SkillSwap makes it easy to exchange knowledge with others in your community.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group relative"
              >
                <div className="glass p-8 rounded-3xl shadow-card border border-white/10 h-full overflow-hidden">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-100 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto rounded-[2.5rem] p-12 md:p-16 text-center relative overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-600 animate-gradient" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6 animate-pulse-glow">
                <Zap className="h-4 w-4" />
                Start for free today
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in-up">
                Ready to Start
                <br />
                Swapping Skills?
              </h2>

              <p className="text-white/80 mb-10 max-w-xl mx-auto text-lg animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                Join our community of learners and teachers. Create your profile,
                list your skills, and start connecting today.
              </p>

              <Link to="/signup">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    className="px-10 py-6 text-lg bg-white text-indigo-600 hover:bg-white/90 shadow-elevated group"
                  >
                    Create Free Account
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Landing;
