'use client';

import { useEffect, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isSigningOut, setIsSigningOut] = useState(false);

    const handleSignOut = async () => {
        setIsSigningOut(true);
        try {
            await signOut({
                callbackUrl: '/login',
                redirect: true,
            });
        } catch (error) {
            console.error('Sign out error:', error);
            setIsSigningOut(false);
        }
    };

    // Show loading state while checking authentication
    if (!status || status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-slate-100 mx-auto"></div>
                    <p className="mt-4 text-slate-600 dark:text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            {session?.user?.image && (
                                <img
                                    src={session.user.image}
                                    alt={session.user.name || 'User'}
                                    className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700"
                                />
                            )}
                            <div className="text-right">
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    {session?.user?.name || 'User'}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {session?.user?.email}
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={handleSignOut}
                            disabled={isSigningOut}
                            variant="destructive"
                        >
                            {isSigningOut ? 'Signing out...' : 'Sign Out'}
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                            Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}! 👋
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            Here's what's happening with your account today.
                        </p>
                    </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Total Users
                            </CardTitle>
                            <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">1,234</div>
                            <p className="text-sm text-green-600 dark:text-green-400 mt-1">↑ 12% from last month</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Revenue
                            </CardTitle>
                            <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-full">
                                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">$45,231</div>
                            <p className="text-sm text-green-600 dark:text-green-400 mt-1">↑ 8% from last month</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Active Projects
                            </CardTitle>
                            <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-full">
                                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">24</div>
                            <p className="text-sm text-green-600 dark:text-green-400 mt-1">↑ 3 new this week</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { action: 'New user registered', time: '2 minutes ago', icon: '👤', color: 'bg-blue-50 dark:bg-blue-900/20' },
                                { action: 'Project "Website Redesign" completed', time: '1 hour ago', icon: '✅', color: 'bg-green-50 dark:bg-green-900/20' },
                                { action: 'Invoice #1234 paid', time: '3 hours ago', icon: '💰', color: 'bg-yellow-50 dark:bg-yellow-900/20' },
                                { action: 'New comment on "Mobile App"', time: '5 hours ago', icon: '💬', color: 'bg-purple-50 dark:bg-purple-900/20' },
                            ].map((activity, index) => (
                                <div key={index} className={`flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${activity.color}`}>
                                    <div className="text-2xl">{activity.icon}</div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{activity.action}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}