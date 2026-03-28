'use client';

import React from 'react';
import { useUser } from '@clerk/nextjs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function ProfileSettings() {
    const { user, isLoaded } = useUser();
    const [firstName, setFirstName] = React.useState(user?.firstName || '');
    const [lastName, setLastName] = React.useState(user?.lastName || '');
    const [isUpdating, setIsUpdating] = React.useState(false);

    React.useEffect(() => {
        if (user) {
            setFirstName(user.firstName || '');
            setLastName(user.lastName || '');
        }
    }, [user]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsUpdating(true);
        try {
            await user.update({
                firstName,
                lastName,
            });
            toast.success('Profile updated successfully');
        } catch (error: any) {
            console.error(error);
            toast.error(error.errors?.[0]?.message || 'Failed to update profile');
        } finally {
            setIsUpdating(false);
        }
    };

    if (!isLoaded) return <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-32 bg-muted rounded-xl" />
    </div>;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">Profile Settings</h2>
                <p className="text-muted-foreground text-sm">Manage your personal information and how it appears to others.</p>
            </div>

            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">First Name</label>
                    <Input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter first name"
                        className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Last Name</label>
                    <Input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter last name"
                        className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                    />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-foreground">Email Address</label>
                    <Input
                        value={user?.primaryEmailAddress?.emailAddress || ''}
                        disabled
                        className="bg-muted/30 border-border/50 cursor-not-allowed opacity-70"
                    />
                    <p className="text-xs text-muted-foreground mt-1">To change your email, please use the security verification flow.</p>
                </div>

                <div className="pt-2">
                    <Button
                        type="submit"
                        disabled={isUpdating}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-2 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
                    >
                        {isUpdating ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
