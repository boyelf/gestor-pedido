"use client";

import { getUser } from "@/actions/auth/get-user";
import { User } from "@/interfaces/user";
import { createClient } from "@/lib/supabase/client";

import {createContext, useContext, useEffect, useState}  from "react";

export interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    getUserData: () => Promise<void>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    
    const getUserData = async () => {
        setIsLoading(true);
        try {
            const userData = await getUser()
            if(userData) {
                setUser(userData);
            }

        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setIsLoading(false);
        }

    }

    const logout = async () => {
        try {
            const supabase = await createClient()
            await supabase.auth.signOut()
            setUser(null)
        } catch (error) {
            console.error("Error signing out:", error);
            throw error
        }
    }

    const eventTypes = [
        "INITIAL_SESSION",
        "TOKEN_REFRESHED",
        "USER_UPDATED",
        "PASSWORD_RECOVERY",
        "SIGNED_OUT",

    ]


    const authState = async () => {
        const supabase = await createClient()
        supabase.auth.onAuthStateChange((event, session) => {
            
        if(eventTypes.includes(event)) {

        if (session) {
                getUserData();
            } else {
                setUser(null);
            }
            
        }


        });
    }



    useEffect(() => {
       authState()
    }, [])

    return (
        <AuthContext.Provider value={{ user, isLoading, error: null, getUserData, logout }}>
            {children}
        </AuthContext.Provider>
    );

}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}