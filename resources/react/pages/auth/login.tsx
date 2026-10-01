import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowRight, CircleAlert, CircleCheck, Eye, EyeOff, Info, Loader2, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { store } from '@/actions/App/Http/Controllers/Auth/LoginController';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

const LAST_EMAIL_KEY = 'lastLoginEmail';

/** How long the "Login successful" animation plays before leaving the page. */
const SUCCESS_DELAY_MS = 900;

function readLastEmail(): string {
    try {
        return localStorage.getItem(LAST_EMAIL_KEY) ?? '';
    } catch {
        return '';
    }
}

function rememberEmail(email: string): void {
    try {
        localStorage.setItem(LAST_EMAIL_KEY, email);
    } catch {
        // Storage is blocked (private window, browser policy); prefilling is only a nicety.
    }
}

export default function Login() {
    const { flash } = usePage().props;
    const [showPassword, setShowPassword] = useState(false);
    const [signedIn, setSignedIn] = useState(false);

    const form = useForm({
        email: '',
        password: '',
    });

    useEffect(() => {
        const last = readLastEmail();

        if (last) {
            form.setData('email', last);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // A successful sign-in answers with Inertia::location (a full page load to
    // the Livewire dashboard). Hold that navigation briefly so the success
    // animation can play, then follow it ourselves.
    useEffect(
        () =>
            router.on('location', (event) => {
                event.preventDefault();
                setSignedIn(true);

                const url = event.detail.url.href;
                window.setTimeout(() => window.location.assign(url), SUCCESS_DELAY_MS);
            }),
        [],
    );

    const submit = (event: FormEvent) => {
        event.preventDefault();

        // Saved up front: a successful sign-in is a full page load to the
        // Livewire dashboard (Inertia::location), so onSuccess never runs.
        rememberEmail(form.data.email);

        form.submit(store(), {
            onFinish: () => form.reset('password'),
        });
    };

    const emailError = form.errors.email;
    const passwordError = form.errors.password;

    return (
        <AuthLayout>
            <Head title="Login" />

            {signedIn && (
                <div
                    role="status"
                    aria-live="polite"
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-emerald-950/90 px-6 text-center text-white backdrop-blur-md animate-in fade-in duration-300"
                >
                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <img src="/img/doh.png" alt="" className="size-14 drop-shadow-lg" />
                        <img src="/img/bagongpilipinas.png" alt="" className="size-14 scale-[1.2] drop-shadow-lg" />
                    </div>

                    <div className="relative flex size-20 items-center justify-center">
                        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30" />
                        <span className="relative flex size-20 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-950/50 animate-in zoom-in-50 duration-500">
                            <CircleCheck className="size-11" />
                        </span>
                    </div>

                    <div className="grid gap-1.5">
                        <p className="text-2xl font-semibold tracking-tight">Login successful</p>
                        <p className="flex items-center justify-center gap-2 text-sm text-emerald-100/90">
                            <Loader2 className="size-4 animate-spin" />
                            Loading your dashboard…
                        </p>
                    </div>

                    <div className="h-1 w-56 overflow-hidden rounded-full bg-white/15">
                        <div className="login-progress h-full rounded-full bg-emerald-400" />
                    </div>
                </div>
            )}

            <Card className="mx-auto w-full max-w-sm gap-0 overflow-hidden py-0 shadow-2xl ring-1 ring-black/5 lg:mr-0 lg:ml-auto">
                <div aria-hidden="true" className="h-1.5 bg-emerald-700" />

                <CardHeader className="gap-1.5 px-6 pt-7 pb-2 text-center">
                    <CardTitle className="text-xl font-bold">Login</CardTitle>
                    <CardDescription>Sign in with your HRIS account.</CardDescription>
                </CardHeader>

                <CardContent className="px-6 pt-4 pb-7">
                    {/* Messages redirected here from elsewhere, e.g. an expired
                        session or an account that is no longer active. */}
                    {flash.error && (
                        <Alert variant="destructive" className="mb-4">
                            <CircleAlert />
                            <AlertDescription>{flash.error}</AlertDescription>
                        </Alert>
                    )}

                    {flash.status && (
                        <Alert className="mb-4">
                            <Info />
                            <AlertDescription>{flash.status}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={submit} className="grid gap-5" noValidate>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>
                            <div className="relative">
                                <Mail
                                    aria-hidden="true"
                                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                                />
                                <Input
                                    id="email"
                                    type="email"
                                    inputMode="email"
                                    autoComplete="off"
                                    placeholder="Enter your email"
                                    autoFocus
                                    required
                                    className="h-10 pl-9"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    aria-invalid={!!emailError}
                                    aria-describedby={emailError ? 'email-error' : undefined}
                                />
                            </div>
                            {emailError && (
                                <p id="email-error" role="alert" className="text-xs text-destructive">
                                    {emailError}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <LockKeyhole
                                    aria-hidden="true"
                                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                                />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    required
                                    className="h-10 pr-10 pl-9"
                                    value={form.data.password}
                                    onChange={(e) => form.setData('password', e.target.value)}
                                    aria-invalid={!!passwordError}
                                    aria-describedby={passwordError ? 'password-error' : undefined}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((show) => !show)}
                                    className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-3 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    aria-pressed={showPassword}
                                >
                                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                            </div>
                            {passwordError && (
                                <p id="password-error" role="alert" className="text-xs text-destructive">
                                    {passwordError}
                                </p>
                            )}
                        </div>

                        <Button type="submit" size="lg" className="mt-1 h-10 w-full" disabled={form.processing || signedIn}>
                            {form.processing ? (
                                <>
                                    <Loader2 className="animate-spin" />
                                    Signing in…
                                </>
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight />
                                </>
                            )}
                        </Button>
                    </form>

                    <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                        <ShieldCheck className="size-3.5" />
                        For authorized DOH Western Visayas personnel only.
                    </p>
                </CardContent>
            </Card>
        </AuthLayout>
    );
}
