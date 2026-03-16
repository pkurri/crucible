'use client';

import { useState } from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import { logConversionEvent } from '@/lib/analytics';

interface PricingButtonProps {
  tierName: string;
  price: string;
  isPopular?: boolean;
}

export function PricingButton({ tierName, price, isPopular }: PricingButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (price === 'Custom') {
      window.location.href = 'mailto:sales@crucible.dev';
      return;
    }

    setLoading(true);
    await logConversionEvent('checkout_start', { tierName });
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierName }),
      });
      
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Checkout error:', data);
        alert('Payment initialization failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleCheckout}
      disabled={loading}
      className={`mt-10 w-full py-3.5 px-4 rounded-xl flex items-center justify-center font-medium transition-all duration-200 ${
        isPopular 
          ? 'bg-gradient-to-r from-fuchsia-500 to-indigo-500 hover:from-fuchsia-400 hover:to-indigo-400 text-white shadow-lg shadow-fuchsia-500/25'
          : 'bg-neutral-800 hover:bg-neutral-700 text-white'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {price === 'Custom' ? 'Contact Sales' : 'Get Started'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </>
      )}
    </button>
  );
}
