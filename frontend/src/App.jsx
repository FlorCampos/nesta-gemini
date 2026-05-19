import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import LiveBar from './components/LiveBar'
import TabBar from './components/TabBar'
import ConsentModal from './components/ConsentModal'
import NestaChatPage from './pages/NestaChatPage'
import AgendaPage from './pages/AgendaPage'
import SpeakersPage from './pages/SpeakersPage'
import ResourcesPage from './pages/ResourcesPage'
import ShowcasePage from './pages/ShowcasePage'

function App() {
  const [activeTab, setActiveTab] = useState('nesta')
  const [consentGiven, setConsentGiven] = useState(null)
  const [showConsent, setShowConsent] = useState(true)
  const [isLeaving, setIsLeaving] = useState(false)
  const [appStyle, setAppStyle] = useState({
    position: 'fixed',
    top: 0,
    left: 0,
    width: `${window.innerWidth}px`,
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

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateLayout)
        window.visualViewport.removeEventListener('scroll', updateLayout)
      }
      window.removeEventListener('resize', updateLayout)
    }
  }, [updateLayout])

  const handleConsent = (accepted) => {
    setConsentGiven(accepted)
    setIsLeaving(true)
    setTimeout(() => {
      setShowConsent(false)
      setIsLeaving(false)
    }, 500)
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'agenda': return <AgendaPage />
      case 'speakers': return <SpeakersPage />
      case 'nesta': return <NestaChatPage consentGiven={consentGiven} />
      case 'resources': return <ResourcesPage />
      case 'showcase': return <ShowcasePage />
      default: return <NestaChatPage consentGiven={consentGiven} />
    }
  }

  return (
    <div
      className="mx-auto max-w-md bg-white flex flex-col overflow-hidden"
      style={appStyle}
    >
      <Header />
      <LiveBar />
      <main className="flex-1 min-h-0 flex flex-col">
        {showConsent && activeTab === 'nesta' ? (
          <ConsentModal
            isLeaving={isLeaving}
            onAccept={() => handleConsent(true)}
            onDecline={() => handleConsent(false)}
          />
        ) : (
          renderPage()
        )}
      </main>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

export default App