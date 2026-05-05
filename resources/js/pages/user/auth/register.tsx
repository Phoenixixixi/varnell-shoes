import React from 'react';
import UserLayoutApp from '@/layouts/user-layout';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function UserRegister() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <UserLayoutApp>
            <Head title="Create Account" />

            <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 flex items-center justify-center bg-surface">
                <div className="w-full max-w-md bg-surface-container-low p-10 rounded-2xl border border-outline-variant shadow-lg editorial-shadow">

                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-headline text-primary mb-3">Join the Atelier</h1>
                        <p className="text-on-surface-variant font-body text-sm">
                            Create an account to gain early access to drops and track your collections.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-label font-bold tracking-widest uppercase text-primary">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl font-body text-primary focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                                required
                            />
                            {errors.name && <span className="text-xs font-label text-red-500 mt-1 block">{errors.name}</span>}
                        </div>

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
                            <label className="text-xs font-label font-bold tracking-widest uppercase text-primary">
                                Password
                            </label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl font-body text-primary focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                                required
                            />
                            {errors.password && <span className="text-xs font-label text-red-500 mt-1 block">{errors.password}</span>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-label font-bold tracking-widest uppercase text-primary">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl font-body text-primary focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                                required
                            />
                            {errors.password_confirmation && <span className="text-xs font-label text-red-500 mt-1 block">{errors.password_confirmation}</span>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full btn-primary py-4 rounded-xl mt-4 text-sm font-label font-bold tracking-[0.15em] hover:opacity-90 transition-all flex justify-center items-center gap-2"
                        >
                            {processing && <LoaderCircle className="w-4 h-4 animate-spin" />}
                            Create Account
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-outline-variant text-center">
                        <span className="text-sm font-body text-on-surface-variant">
                            Already have an account?{' '}
                        </span>
                        <a href={route('user.login')} className="text-sm font-label font-bold tracking-wider text-secondary border-b border-secondary pb-0.5 hover:opacity-80 transition-opacity">
                            Sign In
                        </a>
                    </div>
                </div>
            </main>
        </UserLayoutApp>
    );
}
