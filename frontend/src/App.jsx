import { useState, useEffect, useCallback } from 'react'
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
  const [appStyle, setAppStyle] = useState({
    position: 'fixed',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '448px',
    height: '100%',
  })

  const updateLayout = useCallback(() => {
    if (window.visualViewport) {
      const isMobile = window.visualViewport.width < 480
      setAppStyle({
        position: 'fixed',
        top: `${window.visualViewport.offsetTop}px`,
        left: isMobile ? 0 : '50%',
        transform: isMobile ? 'none' : 'translateX(-50%)',
        width: isMobile ? `${window.visualViewport.width}px` : '100%',
        maxWidth: isMobile ? 'none' : '448px',
        height: `${window.visualViewport.height}px`,
      })
    }
  }, [])

  useEffect(() => {
    updateLayout()

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateLayout)
      window.visualViewport.addEventListener('scroll', updateLayout)
    }
    window.addEventListener('resize', updateLayout)

    // Prevent horizontal scroll on iOS Safari
    document.addEventListener('touchmove', (e) => {
      if (Math.abs(e.touches[0].clientX) > window.innerWidth) {
        e.preventDefault()
      }
    }, { passive: false })

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateLayout)
        window.visualViewport.removeEventListener('scroll', updateLayout)
      }
      window.removeEventListener('resize', updateLayout)
    }
  }, [updateLayout])

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
    <div
      className="mx-auto max-w-md bg-white flex flex-col overflow-hidden"
      style={appStyle}
    >
      <Header />
      <LiveBar />
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {renderPage()}
      </main>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

export default App