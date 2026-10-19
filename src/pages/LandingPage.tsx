import { Link } from 'react-router-dom';
import {
  Shirt, Sparkles, Layers, Palette, Camera, ArrowRight,
  CheckCircle, Star, ChevronRight,
} from 'lucide-react';

const features = [
  {
    icon: Shirt,
    title: 'Digital Wardrobe',
    description: 'Upload and categorize your clothing with photos, colors, seasons, and occasions for easy browsing.',
  },
  {
    icon: Layers,
    title: 'Outfit Builder',
    description: 'Mix and match pieces from your wardrobe to create complete outfits and save your favorites.',
  },
  {
    icon: Sparkles,
    title: 'Smart Recommendations',
    description: 'Get personalized outfit suggestions based on the occasion, season, and your style preferences.',
  },
  {
    icon: Palette,
    title: 'Color Matching',
    description: 'Discover compatible color combinations and get accessory suggestions from your own wardrobe.',
  },
  {
    icon: Camera,
    title: 'Virtual Try-On',
    description: 'Preview how outfits look alongside your photo before you get dressed.',
  },
];

const benefits = [
  'Stop standing in front of your wardrobe wondering what to wear',
  'Rediscover clothes you forgot you owned',
  'Reduce impulse purchases by making the most of what you have',
  'Plan outfits in advance for any occasion or season',
  'Get personalized style guidance tailored to your tastes',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-stone-800 rounded-lg flex items-center justify-center">
              <Shirt className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-stone-800">Smart Wardrobe</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-stone-600 hover:text-stone-800 transition-colors">
              Sign in
            </Link>
            <Link
              to="/signup"
              className="bg-stone-800 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-stone-900 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-stone-100 px-4 py-2 rounded-full text-sm text-stone-600 font-medium mb-8">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Personalized Fashion Assistant
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold text-stone-800 leading-tight mb-6">
            Your wardrobe,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-stone-600 to-stone-800">
              reimagined
            </span>
          </h1>
          <p className="text-xl text-stone-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Digitize your closet, discover perfect outfit combinations, and receive personalized recommendations
            for every occasion — all powered by the clothes you already own.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-stone-800 text-white px-8 py-4 rounded-xl font-semibold hover:bg-stone-900 transition-all hover:-translate-y-0.5 shadow-lg shadow-stone-800/20"
            >
              Start for free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-white text-stone-800 px-8 py-4 rounded-xl font-semibold border border-stone-200 hover:border-stone-400 transition-all"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* App preview mockup */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-gradient-to-br from-stone-800 to-stone-900 rounded-3xl p-6 lg:p-10 overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="absolute w-24 h-24 border border-white rounded-full"
                  style={{ left: `${(i % 6) * 20}%`, top: `${Math.floor(i / 6) * 25}%` }} />
              ))}
            </div>
            <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-4 text-white">
              {['Digital Wardrobe', 'Outfit Builder', 'Recommendations', 'Color Matching'].map((label, i) => (
                <div key={label} className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="w-8 h-8 bg-white/20 rounded-xl mb-3 flex items-center justify-center">
                    {i === 0 && <Shirt className="w-4 h-4" />}
                    {i === 1 && <Layers className="w-4 h-4" />}
                    {i === 2 && <Sparkles className="w-4 h-4" />}
                    {i === 3 && <Palette className="w-4 h-4" />}
                  </div>
                  <p className="text-xs font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-stone-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-stone-800 mb-4">Everything you need to dress better</h2>
            <p className="text-stone-500 text-lg max-w-2xl mx-auto">
              Smart Wardrobe brings together all the tools you need to make getting dressed effortless and enjoyable.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-12 h-12 bg-stone-100 group-hover:bg-stone-800 rounded-2xl flex items-center justify-center mb-4 transition-colors">
                  <Icon className="w-6 h-6 text-stone-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-base font-semibold text-stone-800 mb-2">{title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-stone-800 mb-6">Stop wasting time, start looking great</h2>
            <p className="text-stone-500 mb-8 leading-relaxed">
              Smart Wardrobe helps you take control of your style by giving you a clear picture of what you own and how to use it effectively.
            </p>
            <ul className="space-y-3">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-stone-700 text-sm">{benefit}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Wardrobe items', desc: 'Track every piece of clothing' },
              { label: 'Outfit combinations', desc: 'Mix and match endlessly' },
              { label: 'Style occasions', desc: 'Dress right for every event' },
              { label: 'Color harmonies', desc: 'Always look put-together' },
            ].map((item) => (
              <div key={item.label} className="bg-stone-50 rounded-2xl p-5 border border-stone-100">
                <p className="text-xs font-medium text-stone-800 mb-1">{item.label}</p>
                <p className="text-xs text-stone-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-stone-800">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to transform your wardrobe?</h2>
          <p className="text-stone-300 text-lg mb-8">
            Join and start building your digital wardrobe today. It's completely free.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-white text-stone-800 px-8 py-4 rounded-xl font-semibold hover:bg-stone-100 transition-all"
          >
            Get started for free
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-stone-100">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-stone-800 rounded-md flex items-center justify-center">
              <Shirt className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-stone-700">Smart Wardrobe</span>
          </div>
          <p className="text-xs text-stone-400">Personalized Fashion Assistant · Academic Project</p>
        </div>
      </footer>
    </div>
  );
}
