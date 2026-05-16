import { useState } from 'react'
import Header from './components/Header'
import LiveBar from './components/LiveBar'
import TabBar from './components/TabBar'
import NestaChatPage from './pages/NestaChatPage'
import AgendaPage from './pages/AgendaPage'
import SpeakersPage from './pages/SpeakersPage'
import ResourcesPage from './pages/ResourcesPage'
import ShowcasePage from './pages/ShowcasePage'

function App() {
  const [activeTab, setActiveTab] = useState('nesta')

  const renderPage = () => {
    switch (activeTab) {
      case 'agenda': return <AgendaPage />
      case 'speakers': return <SpeakersPage />
      case 'nesta': return <NestaChatPage />
      case 'resources': return <ResourcesPage />
      case 'showcase': return <ShowcasePage />
      default: return <NestaChatPage />
    }
  }

  return (
    <div className="mx-auto max-w-md min-h-screen bg-white flex flex-col">
      <Header />
      <LiveBar />
      <main className="flex-1 overflow-y-auto">
        {renderPage()}
      </main>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

export default App