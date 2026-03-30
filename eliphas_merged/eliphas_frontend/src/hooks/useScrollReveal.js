import { useEffect } from 'react'

export default function useScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
          }
        })
      },
      { threshold: 0.1 }
    )

    const elements = document.querySelectorAll('.rv, .rvl, .rvr')
    elements.forEach((el) => io.observe(el))

    return () => io.disconnect()
  }, [])
}
