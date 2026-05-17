export default function MessageBubble({ message }) {
  const isNesta = message.sender === 'nesta'

  // Don't render empty Nesta bubbles (shown as typing indicator instead)
  if (isNesta && !message.text) return null

  return (
    <div className={`flex ${isNesta ? 'justify-start items-end' : 'justify-end'} px-1`}>
      {isNesta && (
        <div className="w-7 h-7 rounded-full bg-[#b69088] flex items-center justify-center text-white text-xs font-medium mr-2 mb-0.5 shrink-0">
          N
        </div>
      )}
      <div
        className={`max-w-[75%] px-4 py-2.5 text-sm leading-relaxed break-words overflow-hidden ${
          isNesta
            ? 'bg-[#f5f0ee] text-gray-800 rounded-2xl rounded-bl-sm'
            : 'bg-[#b69088] text-white rounded-2xl rounded-br-sm'
        }`}
      >
        {message.text}
      </div>
    </div>
  )
}