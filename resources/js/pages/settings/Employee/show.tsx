import { CardDescription, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import type { Employee } from "@/types/employee"

interface EmployeeShowProps {
    isOpen: boolean
    onClose: () => void
    employee: Employee
}

export function EmployeeShow({ isOpen, onClose, employee }: EmployeeShowProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[400px] p-2 bg-background border-none shadow-none">
                <div className="flex items-center justify-center">
                    {employee.image_path ? (
                        <img
                            src={employee.image_path}
                            alt={`${employee.first_name} ${employee.last_name}`}
                            className="max-h-[60vh] w-auto rounded-lg object-contain"
                        />
                    ) : (
                        <div className="flex h-60 w-full items-center justify-center rounded-lg bg-muted">
                            <span className="text-sm text-muted-foreground">
                                No image available
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex flex-col items-center text-center gap-1">
                    <span className="text-sm font-semibold">
                        {employee.first_name} {employee.last_name}
                    </span>

                    <span className="text-xs text-muted-foreground">
                        {employee.office?.name}
                    </span>

                    <span className="text-xs text-muted-foreground">
                        {employee.employment_status?.name}
                    </span>

                    <span className="text-xs text-muted-foreground">
                        {employee.position}
                    </span>
                    <div className="flex">
                        <span className="text-xs text-muted-foreground flex items-center">
                            <Label className="text-xs">Salary</Label>
                            <span className="ml-1">
                                {new Intl.NumberFormat('en-PH', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }).format(Number(employee.salary))}
                            </span>
                        </span>
                        |
                        <span className="text-xs text-muted-foreground flex items-center">
                            <Label className="text-xs">RATA</Label>
                            <span className="ml-1">
                                {new Intl.NumberFormat('en-PH', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }).format(Number(employee.rata))}
                            </span>
                        </span>
                        |
                        <span className="text-xs text-muted-foreground flex items-center">
                            <Label className="text-xs">PERA</Label>
                            <span className="ml-1">
                                {new Intl.NumberFormat('en-PH', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }).format(Number(employee.pera))}
                            </span>
                        </span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}