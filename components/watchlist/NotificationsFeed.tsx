"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { toast } from 'sonner';
import { BellRing, CheckCircle2, Trash2 } from 'lucide-react';

export default function NotificationsFeed() {
    const queryClient = useQueryClient();
    const [busyId, setBusyId] = useState<string | 'all' | null>(null);

    const { data: notificationsRes, isLoading } = useQuery({
        queryKey: ['notifications-feed'],
        queryFn: async () => {
            const res = await axios.get('/api/notifications');
            return res.data;
        },
        refetchInterval: 10000,
    });

    const notifications = notificationsRes?.notifications || [];

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['notifications-feed'] });
        queryClient.invalidateQueries({ queryKey: ['notifications-nav'] });
    };

    const markAsRead = async (id?: string) => {
        try {
            await axios.patch('/api/notifications', { id });
            invalidate();
        } catch {
            toast.error('Could not mark as read');
        }
    };

    const deleteNotification = async (id?: string) => {
        const key = id || 'all';
        if (!id && !window.confirm('Clear all notifications? This cannot be undone.')) return;
        setBusyId(key);
        try {
            await axios.delete(`/api/notifications${id ? `?id=${id}` : ''}`);
            invalidate();
            toast.success(id ? 'Notification deleted' : 'All notifications cleared');
        } catch (e: any) {
            toast.error(e?.response?.data?.error || 'Failed to delete');
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mt-6">
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <BellRing className="w-4 h-4" /> Activity Feed
                </h3>
                {notifications.length > 0 && (
                    <div className="flex gap-3">
                        <button
                            onClick={() => markAsRead()}
                            className="text-[10px] text-primary hover:text-primary/80 font-medium"
                        >
                            Mark all read
                        </button>
                        <button
                            onClick={() => deleteNotification()}
                            disabled={busyId === 'all'}
                            className="text-[10px] text-red-400 hover:text-red-300 font-medium disabled:opacity-50"
                        >
                            {busyId === 'all' ? 'Clearing…' : 'Clear all'}
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {isLoading ? (
                    <div className="text-center text-gray-500 text-sm py-4">Loading notifications...</div>
                ) : notifications.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-4 bg-white/5 rounded-xl">No recent notifications.</div>
                ) : (
                    notifications.map((notif: any) => {
                        const busy = busyId === notif.id;
                        return (
                            <div
                                key={notif.id}
                                onClick={() => !notif.read && markAsRead(notif.id)}
                                className={`p-3 rounded-xl border transition-all cursor-pointer ${notif.read ? 'bg-white/5 border-white/10 opacity-70' : 'bg-primary/10 border-primary/30'}`}
                            >
                                <div className="flex justify-between items-start mb-1 gap-2">
                                    <span className={`text-xs font-bold flex items-center gap-1 min-w-0 ${notif.read ? 'text-gray-400' : 'text-white'}`}>
                                        {notif.type === 'ALARM' ? <BellRing className="w-3 h-3 text-orange-400 shrink-0" /> : <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />}
                                        <span className="truncate">{notif.title}</span>
                                    </span>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-[10px] text-gray-500">
                                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(notif.id);
                                            }}
                                            disabled={busy}
                                            aria-label="Delete notification"
                                            title="Delete notification"
                                            className="p-1 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                                <p className={`text-sm ${notif.read ? 'text-gray-500' : 'text-gray-300'}`}>
                                    {notif.message}
                                </p>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
