'use client'

import { supabase } from '@/lib/supabaseClient'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    
    if (!username.trim()) {
      setError('Le nom d&apos;utilisateur est requis')
      return
    }

    try {
      // Vérifier si le nom d&apos;utilisateur existe déjà (cette étape sera gérée par la contrainte UNIQUE dans Supabase)
      
      const { error, data } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            username: username.trim()
          }
        }
      })
      
      console.log('Inscription:', { error, data })
      
      if (error) {
        setError(typeof error === 'object' && error !== null && 'message' in error ? error.message as string : 'Erreur d&apos;inscription')
      } else {
        setSuccess('Compte créé ! Vérifiez vos emails pour valider votre compte.')
        setTimeout(() => router.push('/'), 2000)
      }
    } catch (err) {
      console.error('Erreur d&apos;inscription:', err)
      setError('Une erreur est survenue lors de l&apos;inscription')
    }
    
    if (error) setError(error)
    else {
      setSuccess('Compte créé ! Vérifiez vos emails pour valider votre compte.')
      setTimeout(() => router.push('/'), 2000)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4 border border-black">
        <h1 className="text-2xl font-bold mb-4 text-black">Créer un compte</h1>
        <input
          type="text"
          placeholder="Nom d&apos;utilisateur"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full p-2 border border-gray-800 rounded focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-2 border border-gray-800 rounded focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full p-2 border border-gray-800 rounded focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
          required
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-black font-medium text-sm">{success}</div>}
        <button type="submit" className="w-full bg-black text-white p-2 rounded hover:bg-gray-800 transition-colors">Créer un compte</button>
      </form>
    </div>
  )
}
