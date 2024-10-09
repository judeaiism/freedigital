import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export default function SignInUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        // Redirect to dashboard or show success message for sign-up
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        // Redirect to dashboard or show success message for sign-in
      }
    } catch (error) {
      console.error(`Error ${isSignUp ? 'signing up' : 'signing in'}:`, error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
        className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
      />
      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2">
        {isSignUp ? 'Sign Up' : 'Sign In'}
      </button>
      <button
        type="button"
        onClick={() => setIsSignUp(!isSignUp)}
        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
      >
        {isSignUp ? 'Switch to Sign In' : 'Switch to Sign Up'}
      </button>
    </form>
  );
}