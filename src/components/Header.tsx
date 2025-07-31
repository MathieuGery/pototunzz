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
    router.push('/')
  }

  return (
    <header className="w-full bg-black text-white shadow mb-8">
      <nav className="max-w-3xl mx-auto flex justify-between items-center py-4 px-4">
        <Link href="/" className="text-xl font-bold text-white">Le Potocoin</Link>
        
        {/* Menu toujours visible sur tous les écrans */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          {!loading && (
            <>
              {user ? (
                <>
                  <span className="text-gray-300 text-xs sm:text-sm hidden sm:block">
                    {user.user_metadata?.username || 'Utilisateur'}
                  </span>
                  <Link href="/create-annonce" className="px-2 py-1 sm:px-4 sm:py-2 rounded bg-white text-black hover:bg-gray-200 transition-colors text-xs sm:text-sm">
                    Créer une annonce
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="px-2 py-1 sm:px-4 sm:py-2 rounded border border-white text-white hover:bg-gray-800 transition-colors text-xs sm:text-sm"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="px-2 py-1 sm:px-4 sm:py-2 rounded bg-white text-black hover:bg-gray-200 transition-colors text-xs sm:text-sm">
                    Connexion
                  </Link>
                  <Link href="/register" className="px-2 py-1 sm:px-4 sm:py-2 rounded border border-white text-white hover:bg-gray-800 transition-colors text-xs sm:text-sm">
                    Inscription
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
