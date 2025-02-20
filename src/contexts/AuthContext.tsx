"use client"
import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"

interface AuthContextType { 
    token: string | null
    userId: string | null
    login: (token: string, userId: string) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"))
    const [userId, setUserId] = useState<string | null>(localStorage.getItem("userId"))


    const login = (token: string, userId: string) => {
        setToken(token)
        setUserId(userId)
        localStorage.setItem("token", token)
        localStorage.setItem("userId", userId)
    }
    const logout = () => {
        setToken(null)
        setUserId(null)
        localStorage.removeItem('token')
        localStorage.removeItem('userId')
    }

    useEffect(() => {

    })
 }