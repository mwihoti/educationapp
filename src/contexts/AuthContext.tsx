"use client"

import { ref, inject, provide } from 'vue'
import type { Ref, InjectionKey } from 'vue'
interface AuthContextType {
  token: Ref<string | null>
  userId: Ref<string | null>
  login: (token: string, userId: string) => void
  logout: () => void
}


export const AuthKey = Symbol() as InjectionKey<AuthContextType>

// Provider function to use in parent components
export function provideAuth() {
    const token = ref<string | null>(localStorage.getItem("token"))
    const userId = ref<string | null>(localStorage.getItem('userId'))

    const login = (newToken: string, newUserId: string) => {
        token.value = newToken
        userId.value = newUserId
        localStorage.setItem("token", newToken)
        localStorage.setItem("userId", newUserId)
    }

    const logout = () => {
        token.value = null
        userId.value = null
        localStorage.removeItem("token")
        localStorage.removeItem("userId")
    }

    const authContext = { token, userId, login, logout}
    provide(AuthKey, authContext)

    return authContext

}

export function useAuth(): AuthContextType {
    const auth = inject(AuthKey)
    if (!auth) {
        throw new Error('useAuth() must be used within component that has called provideAuth()')

    }
    return auth
}