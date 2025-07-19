'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AuthNav() {
  const { data: session, status } = useSession()
  const userName = session?.user.name

  if (status === 'loading') {
    return (
      <div className="flex items-center space-x-3">
        <div className="w-16 h-8 bg-gray-200 rounded animate-pulse" />
        <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  if (session?.user) {
    return (
      <div className="flex items-center space-x-3">
        <span className="text-sm text-gray-600 hidden sm:block">
          Welcome, {userName}
        </span>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/forms/create">Create Form</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-3">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/login">Sign in</Link>
      </Button>
      <Button size="sm" asChild>
        <Link href="/register">Get started</Link>
      </Button>
    </div>
  )
} 