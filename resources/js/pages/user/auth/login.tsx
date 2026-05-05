import React from 'react';
import UserLayoutApp from '@/layouts/user-layout';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function UserLogin({ status }: { status?: string }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <UserLayoutApp>
            <Head title="Sign In" />

            <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 flex items-center justify-center bg-surface">
                <div className="w-full max-w-md bg-surface-container-low p-10 rounded-2xl border border-outline-variant shadow-lg editorial-shadow">

                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-headline text-primary mb-3">Welcome Back</h1>
                        <p className="text-on-surface-variant font-body text-sm">
                            Sign in to your Varnell atelier account.
                        </p>
                    </div>

                    {status && (
                        <div className="mb-6 text-center text-sm font-label font-bold text-secondary">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-label font-bold tracking-widest uppercase text-primary">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl font-body text-primary focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                                required
                            />
                            {errors.email && <span className="text-xs font-label text-red-500 mt-1 block">{errors.email}</span>}
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-label font-bold tracking-widest uppercase text-primary">
                                    Password
                                </label>
                                <a href={route('password.request')} className="text-xs font-label text-primary/60 hover:text-primary transition-colors underline underline-offset-2">
                                    Forgot Password?
                                </a>
                            </div>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl font-body text-primary focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                                required
                            />
                            {errors.password && <span className="text-xs font-label text-red-500 mt-1 block">{errors.password}</span>}
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    className="w-4 h-4 rounded border-outline-variant text-secondary focus:ring-secondary/20"
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                />
                                <span className="font-label text-sm text-on-surface-variant group-hover:text-primary transition-colors">Remember me</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full btn-primary py-4 rounded-xl text-sm font-label font-bold tracking-[0.15em] hover:opacity-90 transition-all flex justify-center items-center gap-2"
                        >
                            {processing && <LoaderCircle className="w-4 h-4 animate-spin" />}
                            Sign In
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-outline-variant text-center">
                        <span className="text-sm font-body text-on-surface-variant">
                            Don't have an account yet?{' '}
                        </span>
                        <a href={route('user.register')} className="text-sm font-label font-bold tracking-wider text-secondary border-b border-secondary pb-0.5 hover:opacity-80 transition-opacity">
                            Create Account
                        </a>
                    </div>
                </div>
            </main>
        </UserLayoutApp>
    );
}
