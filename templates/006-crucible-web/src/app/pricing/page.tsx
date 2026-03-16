import fs from 'fs';
import path from 'path';
import Markdown from 'react-markdown';
import { BuyMeCoffee } from '@/components/BuyMeCoffee';
import { CheckCircle2, Zap, Sparkles } from 'lucide-react';
import { PricingButton } from '@/components/PricingButtons';

async function getPricingData() {
  const defaults = {
    pricing: [
      {
        name: 'Starter',
        price: 'Free',
        description: 'Get started with basic AI templates.',
        features: ['1 Agent Execution', 'Basic Templates', 'Community Support'],
        targeted_at: 'Individuals'
      },
      {
        name: 'Pro',
        price: '$29/mo',
        description: 'For power users and small teams.',
        features: ['10 Concurrent Agents', 'Premium Blueprints', 'Email Support', 'Custom Integrations'],
        targeted_at: 'Startups'
      },
      {
        name: 'Enterprise Cloud',
        price: 'Custom',
        description: 'Scale your AI orchestration to the cloud.',
        features: ['Unlimited Agents', 'Dedicated Cloud Infrastructure', 'SLA Guarantees', 'White-labeled'],
        targeted_at: 'Enterprises'
      }
    ],
    salesCopy: '# Crucible: AI Agents Made Easy\nAutomate everything in 5 minutes with our Next-Gen AI router.'
  };

  try {
    const dataDir = path.join(process.cwd(), 'data');
    const pricingPath = path.join(dataDir, 'pricing.json');
    const salesPath = path.join(dataDir, 'sales-copy.md');

    let pricing = defaults.pricing;
    let salesCopy = defaults.salesCopy;

    if (fs.existsSync(pricingPath)) {
      const parsed = JSON.parse(fs.readFileSync(pricingPath, 'utf8'));
      if (Array.isArray(parsed)) pricing = parsed;
    }
    if (fs.existsSync(salesPath)) {
      salesCopy = fs.readFileSync(salesPath, 'utf8');
    }

    return { pricing, salesCopy };
  } catch (err) {
    console.error('Error reading pricing data:', err);
    return defaults;
  }
}

export default async function PricingPage() {
  const { pricing, salesCopy } = await getPricingData();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-fuchsia-500/30 font-sans selection:text-fuchsia-200">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[20%] right-[20%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-24">
          <div className="flex flex-col items-center">
            <div className="mb-12">
              <BuyMeCoffee />
            </div>

            <div className="inline-flex items-center space-x-2 bg-neutral-900/50 border border-neutral-800 rounded-full px-4 py-1.5 mb-8 text-sm font-medium text-fuchsia-400 backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              <span>AI-Optimized Strategy</span>
            </div>
          </div>
          
          <div className="prose prose-invert prose-fuchsia mx-auto prose-h1:text-5xl prose-h1:font-bold prose-h1:tracking-tight prose-h1:text-white prose-p:text-xl prose-p:text-neutral-400 prose-p:leading-8">
            <Markdown>{salesCopy}</Markdown>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-start lg:max-w-none max-w-lg mx-auto">
          {pricing.map((tier: any, idx: number) => {
            const isPopular = idx === 1;
            return (
              <div 
                key={tier.name}
                className={`relative flex flex-col p-8 rounded-3xl transition-all duration-300 ${
                  isPopular 
                    ? 'bg-neutral-900 border-2 border-fuchsia-500/50 shadow-2xl shadow-fuchsia-900/20 scale-105 z-10' 
                    : 'bg-neutral-900/50 border border-neutral-800 hover:bg-neutral-900 hover:border-neutral-700'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <span className="bg-fuchsia-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold text-white mb-2">{tier.name}</h3>
                  <p className="text-neutral-400 text-sm h-10">{tier.description}</p>
                </div>
                
                <div className="mb-8 flex items-baseline text-5xl font-extrabold text-white">
                  {tier.price}
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-300 mb-4 uppercase tracking-wider">
                    Targeted at {tier.targeted_at}
                  </p>
                  <ul className="space-y-4">
                    {tier.features.map((feature: string, fIdx: number) => (
                      <li key={fIdx} className="flex items-start">
                        <CheckCircle2 className={`h-5 w-5 shrink-0 mr-3 ${isPopular ? 'text-fuchsia-400' : 'text-neutral-500'}`} />
                        <span className="text-neutral-300 text-sm leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <PricingButton 
                  tierName={tier.name} 
                  price={tier.price} 
                  isPopular={isPopular} 
                />
              </div>
            );
          })}
        </div>

        <div className="mt-32 border border-neutral-800 bg-neutral-900/30 backdrop-blur-xl rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/5 rounded-full blur-[80px]" />
          <div className="relative z-10 md:w-2/3">
            <h4 className="text-2xl font-bold text-white mb-4">Crucible Enterprise Cloud</h4>
            <p className="text-neutral-400 text-lg max-w-2xl">
              Tired of managing local infrastructure? Let us host your Genkit orchestrators and advanced AI swarms with our 99.99% uptime guarantee.
            </p>
          </div>
          <div className="relative z-10 md:w-1/3 flex justify-end w-full">
            <button className="px-8 py-4 bg-white text-neutral-950 hover:bg-neutral-200 font-bold rounded-xl transition-colors flex items-center whitespace-nowrap w-full sm:w-auto justify-center">
              Request Demo <Zap className="w-5 h-5 ml-2 text-fuchsia-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
