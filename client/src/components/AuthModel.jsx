import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { FaTimes } from 'react-icons/fa';
import Auth from '../pages/Auth';

function AuthModel({ onClose }) {
  const { userData } = useSelector((state) => state.user)

  useEffect(() => {
    if (userData) {
      onClose()
    }
  }, [userData, onClose])

  return (
    <div className='fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4'> {/* Fixed insert-0 to inset-0 */}
      <div className='relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl'> {/* Added background/padding so Auth has a container */}
        <button 
          onClick={onClose} 
          className='absolute top-4 right-4 text-gray-800 hover:text-black text-xl z-10'
        >
          <FaTimes size={18} />
        </button> {/* Removed the stray quote here */}

        <Auth isModel={true} />
      </div>
    </div>
  )
}

export default AuthModel;