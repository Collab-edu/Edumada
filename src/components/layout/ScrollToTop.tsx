'use client'
import { useEffect, useState } from 'react'

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false)

    // Top: 0 takes us all the way back to the top of the page
    // Behavior: smooth keeps it smooth!
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }

    useEffect(() => {
        // Button is displayed after scrolling for 500 pixels
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        window.addEventListener('scroll', toggleVisibility)

        return () => window.removeEventListener('scroll', toggleVisibility)
    }, [])

    return (
        <div className='scroll-to-top fixed bottom-4 right-4 z-999 sm:bottom-8 sm:right-8'>
            <div className='flex items-center gap-2.5'>
                {isVisible && (
                    <button
                        type='button'
                        onClick={scrollToTop}
                        aria-label='Revenir en haut de la page'
                        className='back-to-top flex h-11 w-11 cursor-pointer items-center justify-center rounded-md bg-secondary text-white shadow-md transition duration-300 ease-in-out hover:bg-primary'>
                        <span className='mt-[6px] h-3 w-3 rotate-45 border-l border-t border-white'></span>
                    </button>
                )}
            </div>
        </div>
    )
}
