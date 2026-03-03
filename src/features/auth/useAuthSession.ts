import { useCallback, useEffect, useMemo, useState } from 'react'
import { issueToken, verifyToken } from '../../api/auth'
import { setApiAccessToken } from '../../api/tasks'
import type { AuthSession } from '../../types'

const STORAGE_KEY = 'taskforge.auth.session'

function readStoredSession(): AuthSession | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as AuthSession
    if (!parsed.accessToken || !parsed.subject || !parsed.expiresAt) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

function persistSession(session: AuthSession | null): void {
  if (!session) {
    window.localStorage.removeItem(STORAGE_KEY)
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function useAuthSession() {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authBusy, setAuthBusy] = useState(false)
  const [authError, setAuthError] = useState('')
  const [subjectInput, setSubjectInput] = useState('')

  const restoreSession = useCallback(async () => {
    setAuthLoading(true)
    setAuthError('')

    const stored = readStoredSession()
    if (!stored) {
      setApiAccessToken('')
      setSession(null)
      setAuthLoading(false)
      return
    }

    if (stored.expiresAt <= Date.now()) {
      persistSession(null)
      setApiAccessToken('')
      setSession(null)
      setAuthLoading(false)
      return
    }

    try {
      const verification = await verifyToken(stored.accessToken)
      if (!verification.active) {
        persistSession(null)
        setApiAccessToken('')
        setSession(null)
        setAuthLoading(false)
        return
      }

      setApiAccessToken(stored.accessToken)
      setSession(stored)
    } catch {
      persistSession(null)
      setApiAccessToken('')
      setSession(null)
      setAuthError('Session expired. Please sign in again.')
    } finally {
      setAuthLoading(false)
    }
  }, [])

  useEffect(() => {
    void restoreSession()
  }, [restoreSession])

  const signIn = useCallback(async () => {
    const subject = subjectInput.trim()
    if (!subject) {
      setAuthError('Username is required')
      return
    }

    setAuthBusy(true)
    setAuthError('')

    try {
      const token = await issueToken(subject, ['user', 'planner'])
      const verification = await verifyToken(token.access_token)

      if (!verification.active) {
        throw new Error('Issued token could not be verified')
      }

      const nextSession: AuthSession = {
        subject: verification.subject || subject,
        accessToken: token.access_token,
        roles: verification.roles || [],
        expiresAt: Date.now() + token.expires_in * 1000,
      }

      setApiAccessToken(nextSession.accessToken)
      persistSession(nextSession)
      setSession(nextSession)
      setSubjectInput('')
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Failed to sign in')
      setApiAccessToken('')
      persistSession(null)
      setSession(null)
    } finally {
      setAuthBusy(false)
    }
  }, [subjectInput])

  const signOut = useCallback(() => {
    setApiAccessToken('')
    persistSession(null)
    setSession(null)
    setAuthError('')
  }, [])

  const isAuthenticated = useMemo(
    () => Boolean(session && session.expiresAt > Date.now()),
    [session],
  )

  return {
    session,
    isAuthenticated,
    authLoading,
    authBusy,
    authError,
    subjectInput,
    setSubjectInput,
    signIn,
    signOut,
  }
}
