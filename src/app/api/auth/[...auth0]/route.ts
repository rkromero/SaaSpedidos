import { handleAuth, handleLogin, handleCallback } from '@auth0/nextjs-auth0'
import { upsertUserProfile } from '@/lib/auth'

const afterCallback = async (req: Request, session: any) => {
  if (session.user) {
    // Auto-crear o actualizar perfil del usuario en nuestra base de datos
    await upsertUserProfile(session.user)
  }
  return session
}

export const GET = handleAuth({
  login: handleLogin({
    returnTo: '/dashboard'
  }),
  callback: handleCallback({
    afterCallback
  })
}) 