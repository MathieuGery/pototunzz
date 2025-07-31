'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export interface AnnonceAvecAuteur {
  id: string;
  titre: string;
  description: string;
  prix: number;
  created_at: string;
  user_id: string;
  username: string;
  image_base64?: string;
  sold: boolean;
}

export default function HomeClient() {
  const router = useRouter()
  const [annonces, setAnnonces] = useState<AnnonceAvecAuteur[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string; user_metadata?: { username?: string } } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentUsername, setCurrentUsername] = useState<string | null>(null)

  // Fonction pour marquer une annonce comme vendue
  const handleDelete = async (id: string) => {
    if (!currentUsername) return
    
    try {
      setIsDeleting(true)
      
      // Récupérer l'annonce
      const { data: annonceData } = await supabase
        .from('annonces')
        .select('*')
        .eq('id', id)
        .single()
      
      if (!annonceData) {
        throw new Error('Annonce introuvable')
      }
      // Marquer l'annonce comme vendue si le username correspond
      const { error } = await supabase
        .from('annonces')
        .update({ sold: true })
        .eq('id', id)
      
      if (error) throw error
      
      // Mettre à jour la liste des annonces dans l'interface
      setAnnonces(annonces.map(annonce => 
        annonce.id === id ? { ...annonce, sold: true } : annonce
      ))
    } catch (error) {
      console.error('Erreur lors du marquage de l\' ;annonce comme vendue:', error)
      alert('Erreur lors du marquage de l\' ;annonce comme vendue.')
    } finally {
      setIsDeleting(false)
    }
  }

  useEffect(() => {
    // Récupérer l'utilisateur connecté et son username
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
      if (user) {
        if (user.user_metadata) {
          setCurrentUsername(user.user_metadata?.username)
        }
      }
    }
    getUser()
    const fetchAnnonces = async () => {
      try {
        // Récupérer toutes les annonces
        const { data: annonceData, error: annonceError } = await supabase
          .from('annonces')
          .select('*')
          .order('created_at', { ascending: false })

        if (annonceError) throw annonceError

        // Pour chaque annonce, récupérer les informations utilisateur
        const annoncesAvecAuteurs = await Promise.all(
          annonceData.map(async (annonce) => {
            // Récupérer l'utilisateur qui a créé l'annonce
            const { data: userData } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', annonce.user_id)
              .single()

            return {
              ...annonce,
              username: annonce?.username || userData?.username || 'Utilisateur anonyme',
              sold: annonce?.sold || false
            }
          })
        )

        setAnnonces(annoncesAvecAuteurs)
      } catch (error) {
        console.error('Erreur lors du chargement des annonces:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnnonces()
  }, [])

  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-black">Annonces en ligne</h1>
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-10">Chargement des annonces...</div>
        ) : annonces.length > 0 ? (
          annonces.map((annonce) => (
            <div key={annonce.id} className={`bg-white rounded shadow p-6 border ${annonce.sold ? 'border-gray-400 bg-gray-50' : 'border-gray-300 hover:border-black'} transition-colors relative`}>
              {annonce.sold && (
                <div className="absolute top-2 right-2">
                  <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">Vendu</span>
                </div>
              )}
              {annonce.image_base64 && (
                <div className="mb-4">
                  <img 
                    src={annonce.image_base64} 
                    alt={annonce.titre} 
                    className={`w-full max-h-60 object-contain rounded mb-2 ${annonce.sold ? 'opacity-70' : ''}`}
                  />
                </div>
              )}
              <h2 className="text-xl font-semibold text-black">{annonce.titre}</h2>
              <p className="text-gray-800 mb-2">{annonce.description}</p>
              {annonce.prix && (
                <p className="text-lg font-semibold text-black mb-2">{annonce.prix.toFixed(2)} Potothune(s)</p>
              )}
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">Publié le {new Date(annonce.created_at).toLocaleDateString()}</div>
                <div className="text-sm font-medium">Par: {annonce.username}</div>
              </div>
              {!annonce.sold && currentUsername && currentUsername === annonce.username && (
                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={() => handleDelete(annonce.id)} 
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                  >
                    Cliquez pour marquer comme vendu
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white p-8 rounded shadow text-center border border-gray-300">
            Aucune annonce pour le moment.
            <div className="mt-4">
              <Link href="/register" className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800 transition-colors">
                Créer un compte
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
