'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutButton({ priceId, label, isHighlight = false, styleOverride = {} }: { priceId: string, label: string, isHighlight?: boolean, styleOverride?: any }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    setLoading(true);
    try {
       const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priceId })
       });
       
       const data = await res.json();
       
       // Handle explicitly rejecting anonymous visitors without a JWT Profile active
       if (res.status === 401 || data.error?.includes('Unauthorized')) {
           alert("Please log in or create an account first to subscribe!");
           router.push('/signup');
           return;
       }

       if (data.url) {
           window.location.href = data.url; // Trigger actual Stripe Domain redirection
       } else {
           alert(data.error || 'Failed to initialize secure Edge Stripe Tunnel.');
       }
    } catch(err: any) {
        console.error(err);
        alert('Network connection to Stripe failed.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <button 
      className={`button ${isHighlight ? 'highlight' : ''}`} 
      onClick={handleCheckout} 
      disabled={loading}
      style={{ marginTop: '2rem', textAlign: 'center', width: '100%', padding: '1rem', cursor: loading ? 'not-allowed' : 'pointer', ...styleOverride }}
    >
      {loading ? 'CONNECTING...' : label}
    </button>
  );
}
