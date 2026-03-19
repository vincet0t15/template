import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import type { Employee } from "@/types/employee"
import { Description } from "@radix-ui/react-dialog"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface EmployeeShowProps {
    isOpen: boolean
    onClose: () => void
    employee: Employee
}

export function EmployeeShow({ isOpen, onClose, employee }: EmployeeShowProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[400px] p-1 bg-background border-none shadow-none rounded-md">
                <CardHeader className="flex flex-col items-center gap-3 pt-8">
                    <Avatar className="h-24 w-24 ring-4 ring-muted shadow-md">
                        <AvatarImage
                            src={employee.image_path}
                            alt="Employee"
                        />
                        <AvatarFallback>{employee.first_name}  {employee.last_name}</AvatarFallback>
                    </Avatar>

                    <div className="text-center space-y-1">
                        <h2 className="text-xl font-semibold tracking-tight text-foreground uppercase">
                            {employee.first_name} {employee.middle_name?.charAt(0)}. {employee.last_name} {employee.suffix}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {employee.position}
                        </p>
                    </div>
                </CardHeader>

                {/* Content */}
                <div className="px-6 pb-6 space-y-4">

                    {/* Info Section */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm border-b pb-2 last:border-none">
                            <span className="text-muted-foreground">
                                Department
                            </span>
                            <span className="font-medium text-right  truncate uppercase">
                                {employee.office?.code}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm border-b pb-2 last:border-none">
                            <span className="text-muted-foreground">
                                Status
                            </span>
                            <span className="font-medium text-right  truncate uppercase">
                                {employee.employment_status?.name}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm border-b pb-2 last:border-none">
                            <span className="text-muted-foreground">
                                Salary
                            </span>
                            <span className="font-medium text-right  truncate uppercase">
                                {/* {new Intl.NumberFormat('en-PH', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }).format(Number(employee.salary))} */}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm border-b pb-2 last:border-none">
                            <span className="text-muted-foreground">
                                PERA
                            </span>
                            <span className="font-medium text-right  truncate uppercase">
                                {/* {new Intl.NumberFormat('en-PH', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }).format(Number(employee.pera))} */}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm border-b pb-2 last:border-none">
                            <span className="text-muted-foreground">
                                RATA
                            </span>
                            <span className="font-medium text-right  truncate uppercase">
                                {/* {new Intl.NumberFormat('en-PH', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }).format(Number(employee.rata))} */}
                            </span>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className='flex gap-2'>
                        <Button className="w-full sm:flex-1">
                            Delete
                        </Button>
                        <Button variant="outline" className="w-full sm:flex-1">
                            Manage
                        </Button>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    )
}