'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreateAnnoncePage() {
  const router = useRouter()
  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [prix, setPrix] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Vérifier si l'utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Vous devez être connecté pour créer une annonce')
        setLoading(false)
        return
      }

      // Ajouter l'annonce à la base de données
      const { error } = await supabase.from('annonces').insert({
        titre,
        description,
        prix: parseFloat(prix),
        username: user.user_metadata?.username || 'Utilisateur anonyme',
        image_base64: imageBase64
      })

      if (error) throw error
      router.push('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-black">Créer une annonce</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4 border border-black">
        <div>
          <label htmlFor="titre" className="block text-black font-medium mb-1">Titre</label>
          <input
            id="titre"
            type="text"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            className="w-full p-2 border border-gray-800 rounded focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
            required
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-black font-medium mb-1">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-800 rounded h-32 focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
            required
          />
        </div>
        
        <div>
          <label htmlFor="prix" className="block text-black font-medium mb-1">Prix (€)</label>
          <input
            id="prix"
            type="number"
            step="0.01"
            min="0"
            value={prix}
            onChange={(e) => setPrix(e.target.value)}
            className="w-full p-2 border border-gray-800 rounded focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
            required
          />
        </div>
        
        <div>
          <label htmlFor="image" className="block text-black font-medium mb-1">Image (optionnel)</label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                // Convertir l'image en base64
                const reader = new FileReader()
                reader.onloadend = () => {
                  const base64String = reader.result as string
                  setImageBase64(base64String)
                  setImagePreview(base64String)
                }
                reader.readAsDataURL(file)
              }
            }}
            className="w-full p-2 border border-gray-800 rounded focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
          />
        </div>
        
        {imagePreview && (
          <div className="mt-2">
            <p className="text-sm font-medium mb-1">Aperçu de l&apos;image :</p>
            <img 
              src={imagePreview} 
              alt="Aperçu" 
              className="w-full max-h-60 object-contain border border-gray-300 rounded" 
            />
          </div>
        )}

        {error && <div className="text-red-500">{error}</div>}
        
        <div className="flex justify-between pt-4">
          <Link href="/" className="px-4 py-2 rounded border border-black text-black hover:bg-gray-100 transition-colors">Annuler</Link>
          <button 
            type="submit" 
            className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
            disabled={loading}
          >
            {loading ? 'Création en cours...' : 'Publier l\'annonce'}
          </button>
        </div>
      </form>
    </div>
  )
}
