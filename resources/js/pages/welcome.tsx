import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Building2, CoinsIcon, FileText, Receipt, Settings, Shield, TrendingDown, Users } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Employee Compensation Management System" />
            <div className="min-h-screen">
                {/* Nav */}
                <nav className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-900/80">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 dark:bg-white">
                                <Building2 className="h-5 w-5 text-white dark:text-slate-900" />
                            </div>
                            <div>
                                <p className="text-sm leading-none font-bold text-slate-900 dark:text-white">ECMS</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Employee Compensation Management</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('login')}
                                        className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Hero */}
                <section className="mx-auto max-w-6xl px-6 py-20 text-center">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        <Shield className="h-3.5 w-3.5 text-emerald-500" />
                        Local Government Unit — Employee Compensation Management System
                    </div>
                    <h1 className="mb-6 text-5xl font-bold tracking-tight text-slate-900 lg:text-6xl dark:text-white">
                        Manage your workforce
                        <br />
                        <span className="text-slate-400 dark:text-slate-500">with confidence</span>
                    </h1>
                    <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-500 dark:text-slate-400">
                        A centralized platform for tracking employee compensation, deductions, and claims — built for LGU payroll accuracy and
                        transparency.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link
                            href={auth.user ? route('dashboard') : route('login')}
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                        >
                            {auth.user ? 'Go to Dashboard' : 'Sign In to Continue'}
                        </Link>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="mx-auto max-w-6xl px-6 pb-20">
                    <div className="mb-10 text-center">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Everything you need</h2>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            All modules in one place for complete employee lifecycle management
                        </p>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                icon: <Users className="h-5 w-5" />,
                                title: 'Employee Directory',
                                desc: 'Manage employee profiles, positions, offices, and employment statuses with ease.',
                                color: 'text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400',
                            },
                            {
                                icon: <CoinsIcon className="h-5 w-5" />,
                                title: 'Compensation',
                                desc: 'Track salary history, PERA, and RATA allowances per employee with full audit trail.',
                                color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400',
                            },
                            {
                                icon: <TrendingDown className="h-5 w-5" />,
                                title: 'Deductions',
                                desc: 'Record monthly deductions by pay period with type classification and amount tracking.',
                                color: 'text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400',
                            },
                            {
                                icon: <Receipt className="h-5 w-5" />,
                                title: 'Claims & Reimbursements',
                                desc: 'Log employee claims with purpose, date, type, and amount in a structured format.',
                                color: 'text-violet-600 bg-violet-50 dark:bg-violet-950 dark:text-violet-400',
                            },
                            {
                                icon: <FileText className="h-5 w-5" />,
                                title: 'Reports',
                                desc: 'View per-employee financial summaries, deduction history, and claims by period.',
                                color: 'text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400',
                            },
                            {
                                icon: <Settings className="h-5 w-5" />,
                                title: 'System Settings',
                                desc: 'Configure offices, deduction types, claim types, and employment statuses.',
                                color: 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400',
                            },
                        ].map((feature) => (
                            <div
                                key={feature.title}
                                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-700/50 dark:bg-slate-800/50"
                            >
                                <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${feature.color}`}>
                                    {feature.icon}
                                </div>
                                <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
                                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Banner */}
                <section className="mx-auto max-w-6xl px-6 pb-20">
                    <div className="rounded-2xl bg-slate-900 px-10 py-12 text-center dark:bg-slate-800">
                        <h2 className="mb-3 text-2xl font-bold text-white">Ready to get started?</h2>
                        <p className="mb-7 text-sm text-slate-400">Sign in with your account to access the employee management portal.</p>
                        <Link
                            href={auth.user ? route('dashboard') : route('login')}
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow transition hover:bg-slate-100"
                        >
                            {auth.user ? 'Open Dashboard' : 'Sign In Now'}
                        </Link>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-slate-200/80 dark:border-slate-700/50">
                    <div className="mx-auto max-w-6xl px-6 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                        © {new Date().getFullYear()} Employee Compensation Management System. All rights reserved.
                    </div>
                </footer>
            </div>
        </>
    );
}
