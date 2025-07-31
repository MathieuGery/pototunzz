'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { User } from '@/types/auth'

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    
    getUser()

    // Configurer un écouteur pour les changements d&apos;authentification
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe()
      }
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setIsMenuOpen(false)
    router.push('/')
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <header className="w-full bg-black text-white shadow mb-8">
      <nav className="max-w-3xl mx-auto flex justify-between items-center py-4 px-4">
        <Link href="/" className="text-xl font-bold text-white">Le Potocoin</Link>
        
        {/* Menu hamburger pour mobile */}
        <button 
          onClick={toggleMenu}
          className="md:hidden flex flex-col justify-center items-center w-6 h-6 space-y-1"
          aria-label="Menu"
        >
          <span className={`block w-6 h-0.5 bg-white transition-transform ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-white transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-white transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>

        {/* Menu desktop */}
        <div className="hidden md:flex space-x-4">
          {!loading && (
            <>
              {user ? (
                <>
                  <span className="text-gray-300 mr-2 flex items-center">
                    {user.user_metadata?.username || 'Utilisateur'}
                  </span>
                  <Link href="/create-annonce" className="px-4 py-2 rounded bg-white text-black hover:bg-gray-200 transition-colors">
                    Créer une annonce
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="px-4 py-2 rounded border border-white text-white hover:bg-gray-800 transition-colors"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="px-4 py-2 rounded bg-white text-black hover:bg-gray-200 transition-colors">
                    Connexion
                  </Link>
                  <Link href="/register" className="px-4 py-2 rounded border border-white text-white hover:bg-gray-800 transition-colors">
                    Inscription
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </nav>

      {/* Menu mobile dropdown */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-4 pb-4 space-y-3">
          {!loading && (
            <>
              {user ? (
                <>
                  <div className="text-gray-300 py-2 border-b border-gray-700">
                    Connecté en tant que: {user.user_metadata?.username || 'Utilisateur'}
                  </div>
                  <Link 
                    href="/create-annonce" 
                    onClick={closeMenu}
                    className="block w-full px-4 py-3 rounded bg-white text-black hover:bg-gray-200 transition-colors text-center"
                  >
                    Créer une annonce
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="block w-full px-4 py-3 rounded border border-white text-white hover:bg-gray-800 transition-colors"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    onClick={closeMenu}
                    className="block w-full px-4 py-3 rounded bg-white text-black hover:bg-gray-200 transition-colors text-center"
                  >
                    Connexion
                  </Link>
                  <Link 
                    href="/register" 
                    onClick={closeMenu}
                    className="block w-full px-4 py-3 rounded border border-white text-white hover:bg-gray-800 transition-colors text-center"
                  >
                    Inscription
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
