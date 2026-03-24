import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useAuthStore } from "@/store/useAuthStore";

export const useCurrentUser = () => {
    const { user: clerkUser, isLoaded, isSignedIn } = useUser();
    const { user: dbUser, isAuthenticated, isLoading, setAuth, setLoading } = useAuthStore();

    useEffect(() => {
        let isMounted = true;

        const syncUser = async () => {
            if (!isLoaded) return;

            if (!isSignedIn || !clerkUser) {
                if (isMounted) setAuth(null, false);
                return;
            }

            try {
                setLoading(true);
                const response = await fetch("/api/auth/sync-user");
                if (!response.ok) {
                    throw new Error("Failed to sync user");
                }

                const data = await response.json();

                if (isMounted) {
                    setAuth(data, true);
                }
            } catch (error) {
                console.error("Error in user sync:", error);
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        syncUser();

        return () => {
            isMounted = false;
        };
    }, [clerkUser, isLoaded, isSignedIn, setAuth, setLoading]);

    return {
        user: dbUser,
        clerkUser,
        isAuthenticated,
        isLoading: isLoaded ? isLoading : true,
    };
};
