import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  HardHat, 
  Zap, 
  Shield, 
  Smartphone, 
  BarChart3,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-white selection:bg-orange-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-display font-bold text-2xl tracking-tighter">
            <div className="bg-orange-500 p-1.5 rounded-lg">
              <HardHat className="w-6 h-6 text-white" />
            </div>
            <span>Const OS</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
            <a href="#features" className="hover:text-orange-500 transition-colors">Features</a>
            <a href="#solutions" className="hover:text-orange-500 transition-colors">Solutions</a>
            <a href="#pricing" className="hover:text-orange-500 transition-colors">Pricing</a>
          </div>
          <Button 
            onClick={onGetStarted}
            className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-full px-6"
          >
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3 h-3" />
              The Future of Site Management
            </div>
            <h1 className="text-6xl md:text-8xl font-display font-black leading-[0.9] tracking-tighter text-zinc-900">
              Build <br />
              <span className="text-orange-500">Faster.</span> <br />
              Track Better.
            </h1>
            <p className="text-xl text-zinc-500 max-w-lg leading-relaxed">
              The all-in-one operating system for modern construction sites. 
              Manage inventory, labor, and payments with precision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={onGetStarted}
                size="lg" 
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 h-14 text-lg font-bold shadow-xl shadow-orange-500/20 group"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full px-8 h-14 text-lg font-bold border-zinc-200"
              >
                Watch Demo
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-zinc-100 flex items-center justify-center overflow-hidden">
                    <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
              <p className="text-sm text-zinc-500">
                Trusted by <span className="font-bold text-zinc-900">500+</span> site managers in Bangladesh
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-tr from-orange-500/20 to-blue-500/20 blur-3xl rounded-full" />
            <div className="relative premium-card border-zinc-200 aspect-[4/3] bg-zinc-900 p-2">
              <div className="w-full h-full rounded-xl overflow-hidden bg-zinc-800 border border-white/10">
                <img 
                  src="https://picsum.photos/seed/construction-site/1200/900" 
                  alt="Dashboard Preview" 
                  className="w-full h-full object-cover opacity-80"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 space-y-4">
                  <div className="flex gap-4">
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 flex-1">
                      <p className="text-[10px] text-zinc-400 uppercase font-bold">Material Cost</p>
                      <p className="text-xl font-bold text-white">৳ 1.2M</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 flex-1">
                      <p className="text-[10px] text-zinc-400 uppercase font-bold">Labor Attendance</p>
                      <p className="text-xl font-bold text-white">98%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900">
              Everything you need to <br />
              <span className="text-orange-500 text-gradient">manage your site.</span>
            </h2>
            <p className="text-lg text-zinc-500">
              Stop using paper logs. Switch to a digital-first workflow designed for the field.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: BarChart3, 
                title: 'Real-time Costing', 
                desc: 'Track every bag of cement and every labor hour against your budget in real-time.' 
              },
              { 
                icon: Smartphone, 
                title: 'bKash Integration', 
                desc: 'Disburse wages and pay vendors directly through integrated mobile financial services.' 
              },
              { 
                icon: Shield, 
                title: 'Site Security', 
                desc: 'Keep your data safe with enterprise-grade encryption and role-based access control.' 
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="premium-card p-8 bg-white"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-3">{feature.title}</h3>
                <p className="text-zinc-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 border-y border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12 md:gap-24 opacity-40 grayscale">
          <div className="font-display font-black text-2xl">BUILDER CO.</div>
          <div className="font-display font-black text-2xl">SITE TECH</div>
          <div className="font-display font-black text-2xl">URBAN DEV</div>
          <div className="font-display font-black text-2xl">METRO CON</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-zinc-950 text-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
          <div className="col-span-2 space-y-6">
            <div className="flex items-center gap-2 font-display font-bold text-2xl tracking-tighter">
              <div className="bg-orange-500 p-1.5 rounded-lg">
                <HardHat className="w-6 h-6 text-white" />
              </div>
              <span>Const OS</span>
            </div>
            <p className="text-zinc-400 max-w-sm leading-relaxed">
              Empowering construction managers with the tools they need to build the future of Bangladesh.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold">Product</h4>
            <ul className="space-y-2 text-zinc-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold">Company</h4>
            <ul className="space-y-2 text-zinc-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-20 mt-20 border-t border-white/10 text-center text-zinc-500 text-sm">
          © 2026 Construction OS. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
