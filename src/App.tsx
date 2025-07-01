import React, { useState, useEffect, useRef } from 'react'
import { Zap, Globe, Users, Clock, RotateCcw, Sparkles, Volume2, VolumeX } from 'lucide-react'

interface ChaosEvent {
  id: number
  message: string
  location: string
  timestamp: Date
  severity: 'mild' | 'moderate' | 'intense'
}

const chaosEvents = [
  // Mild chaos
  { message: "All traffic lights turned purple for 3 seconds", location: "Tokyo, Japan", severity: 'mild' as const },
  { message: "Every cat in the city meowed simultaneously", location: "Paris, France", severity: 'mild' as const },
  { message: "All elevators played elevator music backwards", location: "New York, USA", severity: 'mild' as const },
  { message: "Street lamps flickered in perfect synchronization", location: "London, UK", severity: 'mild' as const },
  { message: "All pigeons started walking in circles", location: "Rome, Italy", severity: 'mild' as const },
  { message: "Every doorbell rang the same tune", location: "Berlin, Germany", severity: 'mild' as const },
  { message: "All digital clocks displayed rainbow colors", location: "Seoul, South Korea", severity: 'mild' as const },
  { message: "Street performers switched acts mid-performance", location: "Barcelona, Spain", severity: 'mild' as const },
  
  // Moderate chaos
  { message: "All fountains started flowing upwards", location: "Dubai, UAE", severity: 'moderate' as const },
  { message: "Every phone played the same ringtone", location: "Mumbai, India", severity: 'moderate' as const },
  { message: "All statues turned their heads 90 degrees", location: "Athens, Greece", severity: 'moderate' as const },
  { message: "Street art came to life for 10 seconds", location: "São Paulo, Brazil", severity: 'moderate' as const },
  { message: "All car horns harmonized into a symphony", location: "Cairo, Egypt", severity: 'moderate' as const },
  { message: "Every escalator reversed direction", location: "Singapore", severity: 'moderate' as const },
  { message: "All weather vanes spun like pinwheels", location: "Amsterdam, Netherlands", severity: 'moderate' as const },
  { message: "Street musicians played in perfect harmony", location: "Nashville, USA", severity: 'moderate' as const },
  
  // Intense chaos
  { message: "The aurora borealis appeared over the equator", location: "Quito, Ecuador", severity: 'intense' as const },
  { message: "All mirrors showed reflections from other cities", location: "Venice, Italy", severity: 'intense' as const },
  { message: "Gravity decreased by 10% for 30 seconds", location: "Sydney, Australia", severity: 'intense' as const },
  { message: "All shadows danced independently", location: "Marrakech, Morocco", severity: 'intense' as const },
  { message: "Time moved backwards for exactly one minute", location: "Reykjavik, Iceland", severity: 'intense' as const },
  { message: "All buildings swayed gently like trees", location: "Hong Kong", severity: 'intense' as const },
  { message: "The sky turned into a kaleidoscope", location: "Rio de Janeiro, Brazil", severity: 'intense' as const },
  { message: "All water turned temporarily luminescent", location: "Stockholm, Sweden", severity: 'intense' as const },
]

function App() {
  const [chaosLevel, setChaosLevel] = useState(0)
  const [totalClicks, setTotalClicks] = useState(0)
  const [recentEvents, setRecentEvents] = useState<ChaosEvent[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [globalChaosScore, setGlobalChaosScore] = useState(42847)
  const [activeUsers, setActiveUsers] = useState(1337)
  const [isMuted, setIsMuted] = useState(false)
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioBufferRef = useRef<AudioBuffer | null>(null)

  // Initialize audio context and create sound
  useEffect(() => {
    const initAudio = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        
        // Create a synthetic sound effect
        const sampleRate = audioContextRef.current.sampleRate
        const duration = 0.3 // 300ms
        const frameCount = sampleRate * duration
        const arrayBuffer = audioContextRef.current.createBuffer(2, frameCount, sampleRate)
        
        // Generate a satisfying "zap" sound
        for (let channel = 0; channel < arrayBuffer.numberOfChannels; channel++) {
          const channelData = arrayBuffer.getChannelData(channel)
          for (let i = 0; i < frameCount; i++) {
            const t = i / sampleRate
            // Create a zap sound with frequency sweep and decay
            const frequency = 800 - (t * 600) // Sweep from 800Hz to 200Hz
            const envelope = Math.exp(-t * 8) // Exponential decay
            const noise = (Math.random() - 0.5) * 0.1 // Add some noise
            channelData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3 + noise
          }
        }
        
        audioBufferRef.current = arrayBuffer
      } catch (error) {
        console.log('Audio initialization failed:', error)
      }
    }

    initAudio()
  }, [])

  const playSound = () => {
    if (isMuted || !audioContextRef.current || !audioBufferRef.current) return
    
    try {
      // Resume audio context if suspended (required by some browsers)
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume()
      }
      
      const source = audioContextRef.current.createBufferSource()
      const gainNode = audioContextRef.current.createGain()
      
      source.buffer = audioBufferRef.current
      source.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)
      
      // Add some variation to the volume based on chaos level
      const volume = 0.3 + (chaosLevel / 50) * 0.4
      gainNode.gain.setValueAtTime(volume, audioContextRef.current.currentTime)
      
      source.start()
    } catch (error) {
      console.log('Sound playback failed:', error)
    }
  }

  const getRandomEvent = () => {
    let availableEvents = chaosEvents
    
    if (chaosLevel < 10) {
      availableEvents = chaosEvents.filter(e => e.severity === 'mild')
    } else if (chaosLevel < 25) {
      availableEvents = chaosEvents.filter(e => e.severity === 'mild' || e.severity === 'moderate')
    }
    
    return availableEvents[Math.floor(Math.random() * availableEvents.length)]
  }

  const handleChaosClick = () => {
    playSound()
    setIsAnimating(true)
    setTotalClicks(prev => prev + 1)
    setChaosLevel(prev => Math.min(prev + 1, 50))
    setGlobalChaosScore(prev => prev + Math.floor(Math.random() * 10) + 1)
    
    const eventTemplate = getRandomEvent()
    const newEvent: ChaosEvent = {
      id: Date.now(),
      message: eventTemplate.message,
      location: eventTemplate.location,
      timestamp: new Date(),
      severity: eventTemplate.severity
    }
    
    setRecentEvents(prev => [newEvent, ...prev.slice(0, 4)])
    
    setTimeout(() => setIsAnimating(false), 300)
  }

  const resetChaos = () => {
    setChaosLevel(0)
    setTotalClicks(0)
    setRecentEvents([])
  }

  const toggleMute = () => {
    setIsMuted(prev => !prev)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => prev + Math.floor(Math.random() * 3) - 1)
      setGlobalChaosScore(prev => prev + Math.floor(Math.random() * 5))
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'text-green-600 bg-green-100'
      case 'moderate': return 'text-yellow-600 bg-yellow-100'
      case 'intense': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getChaosButtonStyle = () => {
    if (chaosLevel < 10) return 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
    if (chaosLevel < 25) return 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700'
    return 'bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          >
            <Sparkles className="w-4 h-4 text-purple-400 opacity-30" />
          </div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header with Mute Button */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4 relative">
            <Zap className="w-12 h-12 text-yellow-400 mr-3" />
            <h1 className="text-5xl font-bold text-white">The Chaos Summoner</h1>
            
            {/* Mute Button */}
            <button
              onClick={toggleMute}
              className={`
                absolute right-0 top-0 p-3 rounded-full transition-all duration-200
                ${isMuted 
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                  : 'bg-white/10 text-white hover:bg-white/20'
                }
              `}
              title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            >
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Unleash harmless chaos across the world with each button press. Watch as reality bends to your will!
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <Globe className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{globalChaosScore.toLocaleString()}</div>
            <div className="text-sm text-gray-300">Global Chaos Score</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{activeUsers.toLocaleString()}</div>
            <div className="text-sm text-gray-300">Active Summoners</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{totalClicks}</div>
            <div className="text-sm text-gray-300">Your Summons</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <Clock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{chaosLevel}</div>
            <div className="text-sm text-gray-300">Chaos Level</div>
          </div>
        </div>

        {/* Main Chaos Button */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-red-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${(chaosLevel / 50) * 100}%` }}
              ></div>
            </div>
            <p className="text-gray-300">Chaos Intensity: {chaosLevel}/50</p>
          </div>
          
          <button
            onClick={handleChaosClick}
            className={`
              ${getChaosButtonStyle()}
              ${isAnimating ? 'scale-110 rotate-3' : 'scale-100'}
              text-white font-bold py-6 px-12 rounded-full text-2xl
              transform transition-all duration-300 shadow-2xl
              hover:scale-105 active:scale-95
              relative overflow-hidden
            `}
          >
            <span className="relative z-10 flex items-center">
              <Zap className="w-8 h-8 mr-3" />
              SUMMON CHAOS
              {!isMuted && (
                <Volume2 className="w-5 h-5 ml-3 opacity-60" />
              )}
            </span>
            {isAnimating && (
              <div className="absolute inset-0 bg-white/20 animate-ping rounded-full"></div>
            )}
          </button>
          
          {totalClicks > 0 && (
            <button
              onClick={resetChaos}
              className="mt-4 ml-4 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center mx-auto"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Chaos
            </button>
          )}
        </div>

        {/* Recent Events */}
        {recentEvents.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Recent Chaos Events</h2>
            <div className="space-y-4">
              {recentEvents.map((event, index) => (
                <div
                  key={event.id}
                  className={`
                    bg-white/10 backdrop-blur-sm rounded-xl p-6 transform transition-all duration-500
                    ${index === 0 ? 'scale-105 border-2 border-yellow-400/50' : 'scale-100'}
                  `}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                          {event.severity.toUpperCase()}
                        </span>
                        <span className="text-gray-400 text-sm ml-3">{event.location}</span>
                      </div>
                      <p className="text-white text-lg">{event.message}</p>
                      <p className="text-gray-400 text-sm mt-2">
                        {event.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    <Sparkles className="w-6 h-6 text-yellow-400 ml-4 flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {totalClicks === 0 && (
          <div className="max-w-2xl mx-auto text-center mt-12">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8">
              <h3 className="text-xl font-bold text-white mb-4">How to Summon Chaos</h3>
              <div className="text-gray-300 space-y-2">
                <p>• Click the button to cause harmless chaos events worldwide</p>
                <p>• Higher chaos levels unlock more intense events</p>
                <p>• Watch your global impact grow with each summon</p>
                <p>• Use the mute button to toggle sound effects</p>
                <p>• Reset anytime to start fresh</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
