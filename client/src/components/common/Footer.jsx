import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-forest-700 text-forest-100 border-t border-forest-600">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-gold-500 text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">⛳</span> Golf for Good
            </h3>
            <p className="text-sm leading-relaxed max-w-xs text-forest-100/80">
              The premier charity subscription platform combining your passion for golf with meaningful global impact. Let's make every swing count.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 tracking-wide text-sm uppercase">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/charities" className="hover:text-gold-500 transition-colors">Featured Charities</Link></li>
              <li><Link to="/subscribe" className="hover:text-gold-500 transition-colors">Start Subscription</Link></li>
              <li><Link to="/login" className="hover:text-gold-500 transition-colors">Subscriber Login</Link></li>
              <li><Link to="#" className="hover:text-gold-500 transition-colors">How the Draw Works</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 tracking-wide text-sm uppercase">Legal & Help</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="#" className="hover:text-gold-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to="#" className="hover:text-gold-500 transition-colors">Terms of Service</Link></li>
              <li><Link to="#" className="hover:text-gold-500 transition-colors">Contact Support</Link></li>
              <li><Link to="#" className="hover:text-gold-500 transition-colors">FAQ</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-forest-600/50 flex flex-col md:flex-row justify-between items-center text-xs text-forest-100/60">
          <p>&copy; {new Date().getFullYear()} Golf for Good Inc. All rights reserved.</p>
          <p className="mt-2 md:mt-0">100% Secure Payments via Stripe</p>
        </div>
      </div>
    </footer>
  );
}
