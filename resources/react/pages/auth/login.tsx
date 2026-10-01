import { Head, useForm, usePage } from '@inertiajs/react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { store } from '@/actions/App/Http/Controllers/Auth/LoginController';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

const LAST_EMAIL_KEY = 'lastLoginEmail';

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

    const submit = (event: FormEvent) => {
        event.preventDefault();

        // Saved up front: a successful sign-in is a full page load to the
        // Livewire dashboard (Inertia::location), so onSuccess never runs.
        rememberEmail(form.data.email);

        form.submit(store(), {
            onFinish: () => form.reset('password'),
        });
    };

    return (
        <AuthLayout>
            <Head title="Login" />

            <Card className="mx-auto mt-7 w-full gap-0 py-0 shadow-lg sm:w-[28rem]">
                <CardHeader className="px-4 pt-4 text-center sm:px-7 sm:pt-7">
                    <CardTitle className="text-2xl font-bold">Login Account</CardTitle>
                </CardHeader>

                <CardContent className="p-4 sm:p-7">
                    {/* Messages redirected here from elsewhere, e.g. an expired
                        session or an account that is no longer active. */}
                    {flash.error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{flash.error}</AlertDescription>
                        </Alert>
                    )}

                    {flash.status && (
                        <Alert className="mb-4">
                            <AlertDescription>{flash.status}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={submit} className="grid gap-y-4" noValidate>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                autoComplete="username"
                                autoFocus
                                required
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                                aria-invalid={!!form.errors.email}
                                aria-describedby={form.errors.email ? 'email-error' : undefined}
                            />
                            {form.errors.email && (
                                <p id="email-error" className="text-xs text-destructive">
                                    {form.errors.email}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    className="pr-10"
                                    value={form.data.password}
                                    onChange={(e) => form.setData('password', e.target.value)}
                                    aria-invalid={!!form.errors.password}
                                    aria-describedby={form.errors.password ? 'password-error' : undefined}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((show) => !show)}
                                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                </button>
                            </div>
                            {form.errors.password && (
                                <p id="password-error" className="text-xs text-destructive">
                                    {form.errors.password}
                                </p>
                            )}
                        </div>

                        <Button type="submit" size="lg" className="w-full" disabled={form.processing}>
                            {form.processing && <Loader2 className="animate-spin" />}
                            {form.processing ? 'Signing in…' : 'Sign in'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </AuthLayout>
    );
}
