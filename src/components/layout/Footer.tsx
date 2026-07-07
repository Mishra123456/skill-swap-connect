import { Link } from 'react-router-dom';
import { Repeat, Heart, Github, Twitter, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative border-t border-white/10 overflow-hidden bg-slate-900">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 gradient-mesh opacity-30" />

      <div className="container mx-auto px-4 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/25 group-hover:shadow-glow transition-shadow">
                <Repeat className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">SkillSwap</span>
            </Link>
            <p className="text-gray-400 max-w-md leading-relaxed mb-6">
              Exchange skills, learn together. Connect with people who want to share their knowledge
              and learn from yours—no money involved, just mutual growth.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="p-2 rounded-xl bg-slate-800/50 text-gray-400 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all duration-300"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-xl bg-slate-800/50 text-gray-400 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all duration-300"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-100 mb-6 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              Platform
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/browse" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/30 group-hover:bg-indigo-400 transition-colors" />
                  Browse Skills
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/30 group-hover:bg-indigo-400 transition-colors" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/requests" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/30 group-hover:bg-indigo-400 transition-colors" />
                  Requests
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-100 mb-6 flex items-center gap-2">
              <Heart className="h-4 w-4 text-violet-400" />
              Account
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/login" className="text-sm text-gray-400 hover:text-violet-400 transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500/30 group-hover:bg-violet-400 transition-colors" />
                  Log In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-sm text-gray-400 hover:text-violet-400 transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500/30 group-hover:bg-violet-400 transition-colors" />
                  Sign Up
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-sm text-gray-400 hover:text-violet-400 transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500/30 group-hover:bg-violet-400 transition-colors" />
                  Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
