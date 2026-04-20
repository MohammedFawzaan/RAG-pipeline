'use client';
import * as React from 'react';
import { getMe, logout as logoutApi } from '@/api/api';

interface IUser {
    googleId: string;
    name: string;
    email: string;
    avatar?: string;
}

interface AuthContextType {
    user: IUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    logout: async () => { },
});

export const useAuth = () => React.useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = React.useState<IUser | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const checkAuth = async () => {
            try {
                const data = await getMe();
                if (data.success) {
                    setUser(data.user);
                }
            } catch {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, []);

    const logout = async () => {
        try {
            await logoutApi();
        } finally {
            setUser(null);
            window.location.href = '/';
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
