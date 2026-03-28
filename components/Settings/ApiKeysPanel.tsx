'use client';

import React from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Copy, Plus, Key as KeyIcon, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface ApiKey {
    id: string;
    name: string;
    key: string;
    createdAt: string;
    lastUsedAt: string | null;
    keyPreview: string;
}

export function ApiKeysPanel() {
    const { user } = useUser();
    const [keys, setKeys] = React.useState<ApiKey[]>([]);
    const [newKeyName, setNewKeyName] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(true);
    const [isCreating, setIsCreating] = React.useState(false);
    const [recentlyCreatedKey, setRecentlyCreatedKey] = React.useState<string | null>(null);

    const fetchKeys = async () => {
        if (!user) return;
        try {
            const response = await fetch(`/api/user/${user.id}/api-keys`);
            if (response.ok) {
                const data = await response.json();
                setKeys(data);
            }
        } catch (error) {
            console.error('Failed to fetch keys', error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchKeys();
    }, [user]);

    const handleCreateKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newKeyName) return;

        setIsCreating(true);
        try {
            const response = await fetch(`/api/user/${user.id}/api-keys`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newKeyName })
            });

            if (response.ok) {
                const newKey = await response.json();
                setRecentlyCreatedKey(newKey.key);
                setNewKeyName('');
                fetchKeys();
                toast.success('API Key generated successfully');
            } else {
                toast.error('Failed to generate API Key');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsCreating(false);
        }
    };

    const handleRevokeKey = async (keyId: string) => {
        if (!user) return;
        if (!confirm('Are you sure you want to revoke this API key? Applications using it will lose access.')) return;

        try {
            const response = await fetch(`/api/user/${user.id}/api-keys/${keyId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setKeys(keys.filter(k => k.id !== keyId));
                toast.success('API Key revoked');
            }
        } catch (error) {
            toast.error('Failed to revoke key');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">Developer API Keys</h2>
                    <p className="text-muted-foreground text-sm">Create and manage keys to access the Centropolis API programmatically.</p>
                </div>
            </div>

            {/* New Key Form */}
            <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Generate New Key
                </h3>
                <form onSubmit={handleCreateKey} className="flex flex-col sm:flex-row gap-4">
                    <Input
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="Key description (e.g. My Trading Bot)"
                        className="flex-1 bg-background/50 border-border/50 rounded-xl"
                    />
                    <Button
                        type="submit"
                        disabled={isCreating || !newKeyName}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl px-8"
                    >
                        {isCreating ? 'Generating...' : 'Generate Key'}
                    </Button>
                </form>
            </div>

            {/* Show newly created key once */}
            {recentlyCreatedKey && (
                <div className="bg-secondary/10 border border-secondary/30 rounded-3xl p-6 animate-in zoom-in-95 duration-300">
                    <div className="flex items-center gap-3 text-secondary mb-3">
                        <CheckCircle2 className="w-5 h-5" />
                        <h4 className="font-bold">New API Key Created</h4>
                    </div>
                    <p className="text-sm text-foreground mb-4">
                        Please copy this key now. For your security, <span className="text-secondary font-bold">it will not be shown again.</span>
                    </p>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-background/80 font-mono text-sm p-3 rounded-xl border border-secondary/20 select-all overflow-hidden text-ellipsis">
                            {recentlyCreatedKey}
                        </div>
                        <Button size="icon" variant="outline" onClick={() => copyToClipboard(recentlyCreatedKey)} className="rounded-xl border-secondary/30 text-secondary">
                            <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setRecentlyCreatedKey(null)} className="text-xs h-auto underline">Dismiss</Button>
                    </div>
                </div>
            )}

            {/* Keys List */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold">Active API Keys</h3>
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2].map(i => <div key={i} className="h-20 bg-muted/20 animate-pulse rounded-2xl" />)}
                    </div>
                ) : keys.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-border/50 rounded-3xl">
                        <KeyIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground text-sm">No API keys found. Create one to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {keys.map((k) => (
                            <div key={k.id} className="group bg-card/20 border border-border/50 rounded-2xl p-5 flex items-center justify-between hover:bg-muted/5 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center text-muted-foreground">
                                        <KeyIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-foreground">{k.name}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] font-mono bg-muted/30 px-2 py-0.5 rounded text-muted-foreground">{k.keyPreview}</span>
                                            <span className="text-[10px] text-muted-foreground italic">Created {new Date(k.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRevokeKey(k.id)}
                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
