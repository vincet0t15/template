import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
export default function Overview() {
    return (
        <div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="shadow-sm border-slate-200/60">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12 Projects</div>
                        <p className="text-xs text-muted-foreground">+2 since last week</p>
                    </CardContent>
                </Card>

                <Card className="col-span-full lg:col-span-2 shadow-sm border-slate-200/60">
                    <CardHeader>
                        <CardTitle>Welcome back, Juan</CardTitle>
                        <CardDescription>
                            You have 3 pending tasks that require your attention today.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[200px] flex items-center justify-center border-t border-dashed mt-2">
                        <p className="text-slate-400 italic">Project Activity Feed Placeholder</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

