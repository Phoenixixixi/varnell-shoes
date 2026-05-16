import React from 'react';
import UserLayoutApp from '@/layouts/user-layout';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Props {
    email: string;
    type: 'registration' | 'password_reset';
}

export default function VerifyOTP({ email, type }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        email: email,
        otp: '',
        type: type,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('otp.verify'));
    };

    const resendOTP = () => {
        post(route('otp.resend'), {
            preserveScroll: true,
        });
    };

    return (
        <UserLayoutApp>
            <Head title="Verify OTP" />

            <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 flex items-center justify-center bg-surface">
                <div className="w-full max-w-md bg-surface-container-low p-10 rounded-2xl border border-outline-variant shadow-lg editorial-shadow">

                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-headline text-primary mb-3">Verification</h1>
                        <p className="text-on-surface-variant font-body text-sm">
                            We've sent a 6-digit verification code to <span className="font-bold text-primary">{email}</span>.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-label font-bold tracking-widest uppercase text-primary text-center block">
                                Enter Code
                            </label>
                            <input
                                type="text"
                                maxLength={6}
                                value={data.otp}
                                onChange={(e) => setData('otp', e.target.value.replace(/[^0-9]/g, ''))}
                                className="w-full text-center text-3xl tracking-[0.5em] px-4 py-4 bg-surface border border-outline-variant rounded-xl font-headline text-primary focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                                placeholder="000000"
                                required
                                autoFocus
                            />
                            {errors.otp && <span className="text-xs font-label text-red-500 mt-1 text-center block">{errors.otp}</span>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full btn-primary py-4 rounded-xl mt-4 text-sm font-label font-bold tracking-[0.15em] hover:opacity-90 transition-all flex justify-center items-center gap-2"
                        >
                            {processing && <LoaderCircle className="w-4 h-4 animate-spin" />}
                            Verify Code
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-outline-variant text-center">
                        <p className="text-sm font-body text-on-surface-variant mb-2">
                            Didn't receive the code?
                        </p>
                        <button 
                            onClick={resendOTP}
                            className="text-sm font-label font-bold tracking-wider text-secondary border-b border-secondary pb-0.5 hover:opacity-80 transition-opacity"
                        >
                            Resend Code
                        </button>
                    </div>
                </div>
            </main>
        </UserLayoutApp>
    );
}
