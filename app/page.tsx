'use client'

import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../lib/firebase'
import SignInUp from './components/Sign'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { motion } from 'framer-motion'
// Update this import path if necessary
import { Button } from "../components/ui/button"

export default function Home() {
  const [user] = useAuthState(auth)
  const [imageError, setImageError] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {!imageError ? (
          <Image
            src="/logo.png"
            alt="Logo"
            width={200}
            height={200}
            className="mb-8 rounded-full shadow-lg"
            onError={() => setImageError(true)}
            priority
          />
        ) : (
          <div className="text-3xl font-bold mb-8 bg-blue-600 p-6 rounded-full shadow-lg">
            FSW
          </div>
        )}
        <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Form Submission Website
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Streamline your form submissions with ease
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {user ? (
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-200 ease-in-out transform hover:scale-105">
            <Link href="/dashboard">
              Go to Dashboard
            </Link>
          </Button>
        ) : (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 shadow-xl">
            <SignInUp />
          </div>
        )}
      </motion.div>
    </div>
  )
}