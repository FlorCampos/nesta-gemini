export default function Header() {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#b69088] flex items-center justify-center text-white text-sm font-medium">
          N
        </div>
        <div>
          <div className="text-base font-medium text-gray-900">Nesta</div>
          <div className="text-xs text-gray-400 italic">Her Future, Guided.</div>
        </div>
      </div>
      <span className="text-xs px-3 py-1 rounded-full bg-green-50 text-green-700 font-medium">
        Live
      </span>
    </div>
  )
}