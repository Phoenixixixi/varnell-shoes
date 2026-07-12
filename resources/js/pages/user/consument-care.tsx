import UserLayoutApp from '@/layouts/user-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import { MessageSquare, Send, Check } from 'lucide-react';

export default function ConsumentCare() {
    const { auth } = usePage<any>().props;
    const user = auth?.user;

    const { data, setData, post, errors, processing, recentlySuccessful, reset } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        messages: '',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('consument-care.store'), {
            onSuccess: () => {
                reset('messages');
            }
        });
    };

    return (
        <UserLayoutApp>
            <Head title="Consument Care - Varnell" />

            <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 bg-surface">
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="text-center space-y-4">
                        <span className="text-secondary font-label font-bold tracking-[0.2em] uppercase text-sm flex items-center justify-center gap-2 animate-fade-in">
                            <MessageSquare className="w-4 h-4" />
                            Consument Care
                        </span>
                        <h1 className="text-4xl md:text-6xl font-headline text-primary">Inquiries & Assistance</h1>
                        <p className="text-on-surface-variant font-body text-base max-w-xl mx-auto">
                            Have questions about our heritage processes, custom fittings, or care instructions? Send us a message and our artisans will guide you.
                        </p>
                    </div>

                    <div className="bg-surface-container-low rounded-3xl border border-outline-variant p-8 md:p-12 editorial-shadow relative overflow-hidden">
                        {recentlySuccessful ? (
                            <div className="py-16 text-center space-y-6 animate-fade-in">
                                <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto animate-pulse">
                                    <Check className="w-8 h-8" strokeWidth={2.5} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-headline text-primary">Message Sent Successfully</h3>
                                    <p className="text-on-surface-variant font-body max-w-md mx-auto">
                                        Thank you for reaching out. A Varnell representative will review your message and reply via email within 24 hours.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {user ? (
                                    <div className="p-5 rounded-2xl bg-surface border border-outline-variant/60 flex items-center gap-4 animate-fade-in">
                                        <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-headline font-bold text-sm uppercase">
                                            {user.name.slice(0, 2)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-label tracking-wider uppercase text-primary/50">Signed in as</p>
                                            <p className="font-headline text-base text-primary">{user.name}</p>
                                            <p className="text-xs font-body text-on-surface-variant">{user.email}</p>
                                        </div>
                                        <span className="text-[10px] font-label font-bold uppercase tracking-widest text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                                            Verified Account
                                        </span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-xs font-label uppercase tracking-widest text-primary/70">Full Name</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="Enter your name"
                                                className="bg-surface border-outline-variant focus-visible:ring-secondary/40 focus-visible:border-secondary h-12 rounded-xl"
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-xs font-label uppercase tracking-widest text-primary/70">Email Address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="Enter your email"
                                                className="bg-surface border-outline-variant focus-visible:ring-secondary/40 focus-visible:border-secondary h-12 rounded-xl"
                                            />
                                            <InputError message={errors.email} />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="messages" className="text-xs font-label uppercase tracking-widest text-primary/70">Your Inquiry</Label>
                                    <Textarea
                                        id="messages"
                                        rows={6}
                                        value={data.messages}
                                        onChange={(e) => setData('messages', e.target.value)}
                                        placeholder="Write your message here. Be as detailed as possible..."
                                        className="bg-surface border-outline-variant focus-visible:ring-secondary/40 focus-visible:border-secondary rounded-2xl p-4 min-h-[150px]"
                                    />
                                    <InputError message={errors.messages} />
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center gap-3 bg-primary text-on-primary hover:bg-primary/95 font-label text-xs font-bold tracking-[0.2em] uppercase px-8 py-4 rounded-full transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none hover:shadow-lg"
                                    >
                                        {processing ? 'Submitting...' : (
                                            <>
                                                Send Message
                                                <Send className="w-3.5 h-3.5 animate-pulse" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </main>
        </UserLayoutApp>
    );
}
