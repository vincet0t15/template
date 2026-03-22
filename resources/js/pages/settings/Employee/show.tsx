import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog"
import type { Employee } from "@/types/employee"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from 'sonner';

interface EmployeeShowProps {
    isOpen: boolean
    onClose: () => void
    employee: Employee
}

export function EmployeeShow({ isOpen, onClose, employee }: EmployeeShowProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleManage = () => {
        onClose();
        router.get(route('employees.manage.show', employee.id));
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('employees.destroy', employee.id), {
            onSuccess: () => {
                toast.success('Employee deleted successfully');
                setShowDeleteDialog(false);
                onClose();
            },
            onError: () => {
                toast.error('Failed to delete employee');
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="w-[400px] p-0 bg-background border shadow-lg rounded-lg overflow-hidden">
                    {/* Header with Avatar */}
                    <div className="flex flex-col items-center gap-3 pt-8 pb-4 bg-muted/30">
                        <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg">
                            <AvatarImage
                                src={employee.image_path}
                                alt="Employee"
                            />
                            <AvatarFallback className="text-lg font-semibold">
                                {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="text-center space-y-1">
                            <h2 className="text-xl font-semibold tracking-tight text-foreground uppercase">
                                {employee.last_name}, {employee.first_name} {employee.middle_name?.charAt(0)}. {employee.suffix}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {employee.position}
                            </p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-4 space-y-4">
                        {/* Info Section */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm border-b py-2">
                                <span className="text-muted-foreground">Department</span>
                                <span className="font-medium text-right truncate uppercase">
                                    {employee.office?.code}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm border-b py-2">
                                <span className="text-muted-foreground">Status</span>
                                <span className="font-medium text-right truncate uppercase">
                                    {employee.employment_status?.name}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm border-b py-2">
                                <span className="text-muted-foreground">RATA Eligible</span>
                                <span className={`font-medium text-right ${employee.is_rata_eligible ? 'text-green-600' : 'text-gray-500'}`}>
                                    {employee.is_rata_eligible ? 'Yes' : 'No'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm py-2">
                                <span className="text-muted-foreground">Salary</span>
                                <span className="font-medium text-right">
                                    {employee.latest_salary
                                        ? `₱${new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2 }).format(Number(employee.latest_salary.amount))}`
                                        : 'Not set'
                                    }
                                </span>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-2 pt-2">
                            <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={() => setShowDeleteDialog(true)}
                            >
                                Delete
                            </Button>
                            <Button
                                variant="default"
                                className="flex-1"
                                onClick={handleManage}
                            >
                                Manage
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Employee</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{employee.first_name} {employee.last_name}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}