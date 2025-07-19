import { getServerSession } from "next-auth/next"
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            company: user.company || undefined,
          }
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, 
  },
  jwt: {
    maxAge: 24 * 60 * 60, 
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.company = user.company || undefined
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.company = token.company || undefined
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}


export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user || null
}


export async function requireAuth() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/login')
  }
  
  return session.user
}


export async function getCurrentUserFromDb() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return null
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        createdAt: true,
        updatedAt: true,
      }
    })
    
    return user
  } catch (error) {
    console.error('Error fetching user from database:', error)
    return null
  }
}


export async function userOwnsForm(formId: string, userId?: string) {
  if (!userId) {
    const user = await getCurrentUser()
    if (!user) return false
    userId = user.id
  }

  try {
    const form = await prisma.form.findFirst({
      where: {
        id: formId,
        userId: userId,
      }
    })
    
    return !!form
  } catch (error) {
    console.error('Error checking form ownership:', error)
    return false
  }
}

export async function validateSession(): Promise<string> {
  const user = await getCurrentUser()
  
  if (!user?.id) {
    throw new Error('Unauthorized: No valid session')
  }
  
  return user.id
}

