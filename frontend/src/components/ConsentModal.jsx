export default function ConsentModal({ onAccept, onDecline, isLeaving }) {
  return (
    <div
      className={`flex-1 flex flex-col bg-[#faf6f3] transition-all duration-500 ease-in-out ${
        isLeaving ? 'opacity-0 -translate-y-8 pointer-events-none' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm flex flex-col">
          <div className="text-center mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#b69088] flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
              N
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Before we chat</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Nesta learns from conversations to improve programs for women like you.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 mb-5">
            <div className="flex gap-2.5 items-start">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">
                Your questions help shape future programs — used to understand what women in tech care about
              </p>
            </div>

            <div className="flex gap-2.5 items-start">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">
                Everything is anonymised — your name, email and personal details are removed before anything is stored
              </p>
            </div>

            <div className="flex gap-2.5 items-start">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">
                No one will know it's you — no login, no tracking, and no way to identify you from your questions
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={onAccept}
              className="w-full py-3 rounded-xl bg-[#8b6f68] text-white text-sm font-semibold active:opacity-80"
            >
              Start chatting with Nesta
            </button>
            <button
              onClick={onDecline}
              className="w-full py-3 rounded-xl border-2 border-[#b69088] bg-transparent text-[#8b6f68] text-sm font-semibold active:opacity-80"
            >
              No thanks — I'll just browse
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}