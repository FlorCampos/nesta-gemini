const tabs = [
  { id: 'agenda', label: 'Agenda', icon: '📋' },
  { id: 'speakers', label: 'Speakers', icon: '👤' },
  { id: 'nesta', label: 'Nesta', icon: '💬' },
  { id: 'resources', label: 'Resources', icon: '📚' },
  { id: 'showcase', label: 'Showcase', icon: '⭐' },
]

export default function TabBar({ activeTab, onTabChange }) {
  return (
    <div className="flex border-t border-gray-100 py-2 pb-4 bg-white">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 flex flex-col items-center gap-0.5 text-[10px] ${
            activeTab === tab.id ? 'text-[#b69088]' : 'text-gray-400'
          }`}
        >
          <span className="text-lg">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  )
}