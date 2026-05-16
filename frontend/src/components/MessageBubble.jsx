export default function MessageBubble({ message }) {
  const isNesta = message.sender === 'nesta'

  return (
    <div className={`flex ${isNesta ? 'justify-start' : 'justify-end'}`}>
      {isNesta && (
        <div className="w-7 h-7 rounded-lg bg-[#b69088] flex items-center justify-center text-white text-xs font-medium mr-2 mt-1 shrink-0">
          N
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed ${
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