import React, { useState } from 'react';
import { ArrowLeft, Mail, MessageSquare, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { PageRoute } from '../types';

interface ContactViewProps {
  onBack: () => void;
  onNavigate?: (page: PageRoute) => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ onBack, onNavigate }) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  // Default configured support contact (can be overridden via environment or site config)
  const SUPPORT_EMAIL = 'support@reprompt.app';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to submit inquiry. Please check your inputs or try again.');
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg('Network or server error submitting message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="contact-page" className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Back button */}
      <a
        href="/"
        id="contact-back-button"
        onClick={(e) => {
          e.preventDefault();
          onBack();
        }}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Generator</span>
      </a>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-xs font-medium mb-3 border border-neutral-200">
          <Mail className="w-3.5 h-3.5 text-neutral-700" />
          <span>Support & Feedback</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight mb-3">
          Contact & Inquiries
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
          Have feedback on prompt generation, questions about our privacy architecture, or want to report an issue? Get in touch with our team.
        </p>
      </div>

      {/* Direct email card */}
      <div className="p-5 rounded-2xl border border-neutral-200 bg-white mb-8 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800 shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-semibold">
              Direct Contact Address
            </div>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-base font-bold text-neutral-900 hover:text-blue-600 underline font-mono transition-colors"
            >
              {SUPPORT_EMAIL}
            </a>
            <p className="text-xs text-neutral-500 mt-0.5">
              Inquiries regarding prompt generation, account access, or technical support.
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Form */}
      <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-xs">
        <h2 className="text-base font-bold text-neutral-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-neutral-700" />
          <span>Send a Quick Message</span>
        </h2>

        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold">Message recorded</p>
              <p className="text-xs text-emerald-800 mt-0.5">
                Thank you for your feedback! You can also contact us directly at {SUPPORT_EMAIL}.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label htmlFor="contact-email" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Your Email Address
              </label>
              <input
                id="contact-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Message or Bug Report
              </label>
              <textarea
                id="contact-message"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your question or suggestion..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm transition-colors shadow-xs"
            >
              {loading ? 'Submitting...' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
