"use client";

import { useEffect, useState } from "react";
import {
    Search,
    MoreHorizontal,
    Shield,
    User as UserIcon,
    Loader2,
    Check,
    X
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface User {
    id: string;
    clerkId: string;
    email: string;
    name: string | null;
    role: string;
    plan: string;
    createdAt: string;
    _count: {
        transactions: number;
        sentinelAnalyses: number;
    };
}

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users?page=${page}&search=${search}`);
            const data = await res.json();
            setUsers(data.users);
            setTotalPages(data.totalPages);
        } catch (error) {
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(fetchUsers, 500);
        return () => clearTimeout(timer);
    }, [page, search]);

    const handleUpdateUser = async (id: string, updates: { role?: string; plan?: string }) => {
        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            if (res.ok) {
                toast.success("User updated successfully");
                fetchUsers();
            } else {
                toast.error("Failed to update user");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                <p className="text-muted-foreground">
                    Manage platform users, roles, and subscription plans.
                </p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Badge variant="outline" className="h-10 px-4">
                    Total: {users.length} visible
                </Badge>
            </div>

            <div className="rounded-md border border-border bg-card/50 backdrop-blur-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Activity</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{user.name || "Anonymous"}</span>
                                            <span className="text-xs text-muted-foreground">{user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="border-primary/50 text-primary">
                                            {user.plan}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-4 text-xs text-muted-foreground">
                                            <span>{user._count.transactions} txs</span>
                                            <span>{user._count.sentinelAnalyses} audits</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Manage User</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleUpdateUser(user.id, { role: user.role === "ADMIN" ? "USER" : "ADMIN" })}>
                                                    <Shield className="mr-2 h-4 w-4" />
                                                    {user.role === "ADMIN" ? "Demote to User" : "Promote to Admin"}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuLabel className="text-xs">Change Plan</DropdownMenuLabel>
                                                {["FREE", "PRO", "WHALE"].map((plan) => (
                                                    <DropdownMenuItem
                                                        key={plan}
                                                        onClick={() => handleUpdateUser(user.id, { plan })}
                                                        disabled={user.plan === plan}
                                                    >
                                                        {user.plan === plan && <Check className="mr-2 h-4 w-4" />}
                                                        {plan} Plan
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                >
                    Previous
                </Button>
                <div className="text-sm font-medium">
                    Page {page} of {totalPages}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
