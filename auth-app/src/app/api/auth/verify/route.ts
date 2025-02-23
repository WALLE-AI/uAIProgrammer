import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(req: NextRequest) {
  console.log('Starting token verification request')
  const authHeader = req.headers.get('authorization')
  console.log(`Authorization header: ${authHeader?.slice(0, 15)}...`) // 截取部分内容避免泄露敏感信息

  const token = authHeader?.split(' ')[1]
  console.log(token ? 'Token found in headers' : 'No token found in headers')

  if (!token) {
    console.warn('Token verification failed: Missing token')
    return NextResponse.json({ valid: false }, { status: 401 })
  }

  try {
    console.log('Attempting JWT verification')
    const decoded = jwt.verify(token, SECRET)
    console.log('Token verification successful', { userId: (decoded as any).userId })
    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error('Token verification failed:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ valid: false }, { status: 401 })
  }
}