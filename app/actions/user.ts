// app/actions/user.ts
'use server'

import { prisma } from '@/lib/prisma'

export async function getUsers() {
  const users = await prisma.user.findMany()
  return users
}

export async function createUser(email: string, name: string) {
  const user = await prisma.user.create({
    data: {
      email,
      name,
    }
  })
  return user
}