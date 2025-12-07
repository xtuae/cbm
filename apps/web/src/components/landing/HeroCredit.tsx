import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, Modal } from '../ui';

const HeroCredit = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const steps = [
    { step: 'Create Account', desc: 'Sign up and set up your secure account', icon: '👤' },
    { step: 'Buy Credit Packs', desc: 'Purchase credit packs via our secure payment gateway - you\'re buying credits/services, not crypto', icon: '🛒' },
    { step: 'Credits Added to Balance', desc: 'Credits are instantly added to your platform balance for immediate use', icon: '💰' },
    { step: 'Digital Assets Processed', desc: 'Admins handle all blockchain actions off-chain, processing digital asset rewards securely', icon: '🔐' }
  ];

  return (
    <>
      <section className="grid md:grid-cols-2 gap-12 items-center">
        {/* Left Column */}
        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
            Unlock, Manage, and Grow Your Digital Credits
          </h1>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
            Purchase secure credit packs for games, cloud services, and digital tools. Top up your platform balance and track every transaction with ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/marketplace" className="btn-primary text-lg px-8 py-4">
              Explore Credit Packs
            </Link>
            <button className="btn-secondary text-lg px-8 py-4" onClick={() => setIsModalOpen(true)}>
              How It Works
            </button>
          </div>
        </div>

        {/* Right Column - Featured Card */}
        <div className="flex justify-center">
          <Card className="max-w-sm p-8 relative">
            <Badge className="absolute top-4 left-4">Popular Pack</Badge>
            <div className="text-center space-y-4">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full mx-auto flex items-center justify-center">
                <span className="text-4xl">💳</span>
              </div>
              <div className="space-y-2">
                <div className="text-xl font-semibold text-white">Game Credits Bundle</div>
                <div className="text-2xl font-bold text-indigo-400">From $49</div>
              </div>
              <div className="flex justify-center space-x-2">
                <div className="w-6 h-6 bg-indigo-600 rounded-full"></div>
                <div className="w-6 h-6 bg-purple-600 rounded-full"></div>
                <div className="w-6 h-6 bg-pink-600 rounded-full"></div>
                <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
                <div className="text-xs text-gray-400 ml-2">+12 more</div>
              </div>
              <div className="text-center text-sm text-gray-300">Trusted by thousands of users</div>
            </div>
          </Card>
        </div>
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="How It Works"
        size="lg"
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, index) => (
            <div key={item.step} className="text-center">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                {item.icon}
              </div>
              <div className="text-sm text-indigo-600 mb-2 font-semibold">Step {index + 1}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.step}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default HeroCredit;
