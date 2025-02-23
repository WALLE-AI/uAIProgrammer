"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()

  // useEffect(() => {
  //   // 更完善的验证逻辑 
  //   const checkAuth = async () => {
  //     const token = document.cookie
  //       .split('; ')
  //       .find(row => row.startsWith('token=test_tokens'))
  //       ?.split('=')[1]
  //     console.log("tokens",token)
  //     if (!token) {
  //       router.push('/auth/login')
  //       return
  //     }

  //     // 可以添加额外的验证请求
  //     try {
  //       const res = await fetch('/api/auth/verify', {
  //         headers: {
  //           Authorization: `Bearer ${token}`
  //         }
  //       })
  //       if (!res.ok) throw new Error('Invalid token')
  //     } catch (error) {
  //       document.cookie = 'token=; Max-Age=0'
  //       router.push('/auth/login')
  //     }
  //   }

  //   checkAuth()
  // }, [router])

  const handleLogout = () => {
   document.cookie = "token=test_token; Path=/; SameSite=Strict; Max-Age=3600"
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
        <p className="mt-2 text-gray-600">Welcome to your dashboard!</p>
      </div>
    </div>
  )
}