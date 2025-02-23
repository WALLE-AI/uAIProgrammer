import { NextRequest, NextResponse } from 'next/server'
// import prisma from '@/prisma/client' 
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(req: NextRequest) {
  console.log('Starting auth request processing...')
  
  try {
    const requestBody = await req.text()
    console.log('Raw request body:', requestBody)
    
    const { action, ...data } = JSON.parse(requestBody)
    console.log('Parsed action:', action)
    console.log('Data fields:', Object.keys(data))

    if (action === 'register') {
      const { name, email, password } = data
      console.log(`Registration attempt: ${name} <${email}>`)

      // 增强字段验证
      if (!name || !email || !password) {
        console.error('Missing required fields')
        return NextResponse.json(
          { message: 'All fields are required' },
          { status: 400 }
        )
      }

      const existingUser = await prisma.user.findUnique({
        where: { email },
      })
      console.log('Existing user check result:', existingUser)

      if (existingUser) {
        return NextResponse.json(
          { message: 'User already exists' },
          { status: 400 }
        )
      }

      console.log('Starting password hashing...')
      const hashedPassword = await bcrypt.hash(password, 10)
      console.log('Password hashed successfully')

      console.log('Creating user...')
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword
        }
      })
      console.log('User created:', user)

      // 生成 JWT
      console.log('Generating JWT...')
      const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '1h' })
      console.log('JWT generated')

      // 设置 Cookie
      const response = NextResponse.json(
        { message: 'Registration successful' },
        { status: 201 }
      )
      response.cookies.set({
        name: 'token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600 // 1小时
      })
      
      console.log('Response prepared')
      return response
    }
    if (action === 'login') {
      const { email, password } = data
      
      console.log('Looking up user...')
      const user = await prisma.user.findUnique({ where: { email } })
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        console.log('Invalid login attempt')
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
      }

      console.log('Generating JWT...')
      const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '1h' })
      console.log('JWT generated')

      const response = NextResponse.json({ message: 'Login successful' })
      response.cookies.set({
        name: 'token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600 // 1小时
      })

      console.log('Login successful')
      return response
    }
    return NextResponse.json({ message: 'Invalid action' }, { status: 400 })

    // 其他 action 处理...

  } catch (error) {
    console.error('Error details:', error)
    
    let errorMessage = 'An error occurred'
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`
      
      // 处理 Prisma 错误
      if (error.message.includes('prisma')) {
        return NextResponse.json(
          { message: 'Database connection error' },
          { status: 500 }
        )
      }
      
      // 处理 JWT 错误
      if (error.message.includes('jwt')) {
        return NextResponse.json(
          { message: 'Authentication configuration error' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    )
  }
}