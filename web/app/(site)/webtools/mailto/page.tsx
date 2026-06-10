'use client';

import { useState } from 'react';

export default function MailtoGenerator() {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-3xl font-bold">
          Mailto Generator
        </h1>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full rounded-xl border p-3"
          />

          <input
            type="text"
            placeholder="Betreff"
            value={subject}
            onChange={(e) =>
              setSubject(e.target.value)
            }
            className="w-full rounded-xl border p-3"
          />

          <textarea
            placeholder="Nachricht"
            value={body}
            onChange={(e) =>
              setBody(e.target.value)
            }
            rows={6}
            className="w-full rounded-xl border p-3"
          />
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-sm font-medium text-slate-600">
            Generierter Link
          </label>

          <div className="rounded-xl bg-slate-100 p-4 break-all font-mono text-sm">
            {mailtoLink}
          </div>
        </div>

        {email && (
          <a
            href={mailtoLink}
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            E-Mail öffnen
          </a>
        )}
      </div>
    </div>
  );
}
