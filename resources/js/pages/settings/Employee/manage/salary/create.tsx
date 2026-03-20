import { DatePicker } from "@/components/custom-date-picker"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface CreateSalaryProps {
  open: boolean
  onClose: () => void
}

export function CreateSalary({ open, onClose }: CreateSalaryProps) {

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <form className="space-y-6">
        <DialogContent className="sm:max-w-md p-6">

          {/* HEADER */}
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-semibold">
              Set Salary
            </DialogTitle>
            <DialogDescription>
              Define employee salary details and effective period.
            </DialogDescription>
          </DialogHeader>

          {/* CURRENT INFO (OPTIONAL) */}
          <div className="bg-muted/50 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Salary</p>
              <p className="text-lg font-semibold">₱5,000</p>
            </div>
            <Badge variant="secondary">Active</Badge>
          </div>

          {/* FORM */}
          <FieldGroup className="space-y-5">

            {/* SALARY */}
            <Field className="space-y-2">
              <Label>Salary Amount</Label>
              <Input
                type="number"
                placeholder="Enter amount (e.g. 15000)"
              />
            </Field>

            {/* DATES */}
            <div className="grid grid-cols-2 gap-4">
              <Field className="space-y-2">
                <Label>Effective Date</Label>
                <DatePicker />
              </Field>

              <Field className="space-y-2">
                <Label>End Date</Label>
                <DatePicker />
              </Field>
            </div>

            {/* REMARKS */}
            <Field className="space-y-2">
              <Label>Remarks (Optional)</Label>
              <Textarea
                placeholder="Add notes about this salary change..."
                className="min-h-[80px]"
              />
            </Field>

          </FieldGroup>

          {/* FOOTER */}
          <DialogFooter className="gap-2 pt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="w-full sm:w-auto">
              Save Salary
            </Button>
          </DialogFooter>

        </DialogContent>
      </form>
    </Dialog>
  )
}
