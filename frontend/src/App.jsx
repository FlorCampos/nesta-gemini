import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import TabBar from './components/TabBar'
import ConsentModal from './components/ConsentModal'
import NestaChatPage from './pages/NestaChatPage'
import AgendaPage from './pages/AgendaPage'
import SpeakersPage from './pages/SpeakersPage'
import ResourcesPage from './pages/ResourcesPage'
import ShowcasePage from './pages/ShowcasePage'

const CONSENT_KEY = 'aati_consent_given'  // updated from nesta_consent_given

function App() {
  const [activeTab, setActiveTab] = useState('agenda')

  const [consentGiven, setConsentGiven] = useState(() =>
    localStorage.getItem(CONSENT_KEY) === 'true'
  )
  const [isLeaving, setIsLeaving] = useState(false)

  const showConsent = activeTab === 'nesta' && !consentGiven

  const handleAccept = () => {
    setIsLeaving(true)
    setTimeout(() => {
      localStorage.setItem(CONSENT_KEY, 'true')
      setConsentGiven(true)
      setIsLeaving(false)
    }, 420)
  }

  const handleDecline = () => {
    setIsLeaving(true)
    setTimeout(() => {
      setActiveTab('agenda')
      setIsLeaving(false)
    }, 280)
  }

  const [appStyle, setAppStyle] = useState({
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
  })

  const updateLayout = useCallback(() => {
    if (window.visualViewport) {
      const isMobile = window.visualViewport.width < 480
      setAppStyle({
        position: 'fixed',
        top:       `${window.visualViewport.offsetTop}px`,
        left:      isMobile ? 0 : '50%',
        transform: isMobile ? 'none' : 'translateX(-50%)',
        width:     isMobile ? `${window.visualViewport.width}px` : '100%',
        maxWidth:  isMobile ? 'none' : '448px',
        height:    `${window.visualViewport.height}px`,
      })
    }
  }, [])

  useEffect(() => {
    updateLayout()
    window.visualViewport?.addEventListener('resize', updateLayout)
    window.visualViewport?.addEventListener('scroll', updateLayout)
    window.addEventListener('resize', updateLayout)
    return () => {
      window.visualViewport?.removeEventListener('resize', updateLayout)
      window.visualViewport?.removeEventListener('scroll', updateLayout)
      window.removeEventListener('resize', updateLayout)
    }
  }, [updateLayout])

  const renderPage = () => {
    switch (activeTab) {
      case 'agenda':    return <AgendaPage />
      case 'speakers':  return <SpeakersPage />
      case 'nesta':     return <NestaChatPage consentGiven={consentGiven} />
      case 'resources': return <ResourcesPage />
      case 'showcase':  return <ShowcasePage />
      default:          return <AgendaPage />
    }
  }

  return (
    <div className="flex flex-col" style={{ ...appStyle, background: '#faf7f5' }}>
      <Header />
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {showConsent || isLeaving ? (
          <ConsentModal
            isLeaving={isLeaving}
            onAccept={handleAccept}
            onDecline={handleDecline}
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