import React from 'react';
import UserLayoutApp from '@/layouts/user-layout';
import { Head, Link } from '@inertiajs/react';
import { User, Lock } from 'lucide-react';

interface Props {
    user: {
        name: string;
        email: string;
    };
}

export default function Account({ user }: Props) {
    return (
        <UserLayoutApp>
            <Head title="Account Details" />

            <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 flex items-center justify-center bg-surface">
                <div className="w-full max-w-md bg-surface-container-low p-10 rounded-2xl border border-outline-variant shadow-lg editorial-shadow">

                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-headline text-primary mb-3">Account Details</h1>
                        <p className="text-on-surface-variant font-body text-sm">
                            Your personal information and security.
                        </p>
                    </div>

                    <div className="space-y-8">
                        {/* Username / Name Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 border-b border-outline-variant pb-2">
                                <User className="w-5 h-5 text-secondary" strokeWidth={1.5} />
                                <h2 className="text-xs font-label font-bold tracking-widest uppercase text-primary">Username</h2>
                            </div>
                            <div className="bg-surface p-4 rounded-xl border border-outline-variant">
                                <p className="font-body text-primary text-lg font-medium">{user.name}</p>
                                <p className="font-body text-primary/60 text-sm">{user.email}</p>
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 border-b border-outline-variant pb-2">
                                <Lock className="w-5 h-5 text-secondary" strokeWidth={1.5} />
                                <h2 className="text-xs font-label font-bold tracking-widest uppercase text-primary">Password</h2>
                            </div>
                            <div className="bg-surface p-4 rounded-xl border border-outline-variant flex justify-between items-center">
                                <p className="font-body text-primary tracking-widest text-lg">••••••••••••</p>
                                <button className="text-xs font-label font-bold tracking-widest uppercase text-secondary hover:text-primary transition-colors underline underline-offset-4">
                                    Change
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-outline-variant">
                        <Link 
                            href={route('logout')} 
                            method="post" 
                            as="button" 
                            className="w-full py-4 text-center text-sm font-label font-bold tracking-widest uppercase text-red-500 hover:bg-red-50 rounded-xl transition-all border border-red-100"
                        >
                            Log Out
                        </Link>
                    </div>
                </div>
            </main>
        </UserLayoutApp>
    );
}
