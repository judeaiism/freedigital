import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
// Update this import path if necessary
import { Button } from "../../components/ui/button"

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

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
    setIsSignUp(!isSignUp);
  };

  return (
    <div className="w-80">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={page}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
        >
          <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-center text-white">
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </h2>
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
            <Button type="submit" className="w-full mb-2">
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>
        </motion.div>
      </AnimatePresence>
      <div className="flex justify-between mt-4">
        <Button
          onClick={() => paginate(-1)}
          variant="outline"
          className="w-full mr-2 text-black"
        >
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </Button>
      </div>
    </div>
  );
}