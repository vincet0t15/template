import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Banknote, Calendar, FileText, Info, Wallet } from 'lucide-react'
export default function Overview() {
    return (
        <div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Earnings this Year */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">YTD Gross Earnings</CardTitle>
                        <Banknote className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₱310,000.00</div>
                        <p className="text-xs text-muted-foreground">+5% from last year</p>
                    </CardContent>
                </Card>

                {/* Active Allowance Count */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Active Allowances</CardTitle>
                        <Wallet className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R.A.T.A | P.E.R.A</div>
                        <p className="text-xs text-muted-foreground">Updated as of Mar 2026</p>
                    </CardContent>
                </Card>

                {/* Document Status */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Filed Documents</CardTitle>
                        <FileText className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">48 Files</div>
                        <p className="text-xs text-muted-foreground">3 pending verification</p>
                    </CardContent>
                </Card>

                {/* Service Length */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Tenure</CardTitle>
                        <Calendar className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4y 2m 15d</div>
                        <p className="text-xs text-muted-foreground">Joined Jan 01, 2022</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-base">Income Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-medium">
                                <span>Take-home Pay (85%)</span>
                                <span>Deductions (15%)</span>
                            </div>
                            {/* Isang Progress bar na may dalawang kulay */}
                            <div className="h-3 w-full bg-rose-100 rounded-full overflow-hidden flex">
                                <div className="h-full bg-emerald-500" style={{ width: '85%' }} />
                            </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-lg flex items-center gap-3">
                            <Info className="h-4 w-4 text-blue-500" />
                            <p className="text-xs text-slate-600">
                                Your deductions increased by <strong>2%</strong> this month due to the new PhilHealth adjustment.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

