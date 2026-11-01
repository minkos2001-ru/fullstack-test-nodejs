import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DeleteBtnProps {
  selectedCount: number
  isDeleting: boolean
  onConfirm: () => Promise<void>
}

export default function DeleteBtn({
  selectedCount,
  isDeleting,
  onConfirm,
}: DeleteBtnProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleConfirm = async () => {
    await onConfirm()
    setDialogOpen(false)
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <Button
        size="lg"
        variant="destructive"
        onClick={() => setDialogOpen(true)}
        disabled={selectedCount === 0 || isDeleting}
      >
        <Trash2 data-icon="inline-start" />
        Удалить
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Удаление</DialogTitle>
          <DialogDescription>
            Вы действительно хотите удалить выбранные записи?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setDialogOpen(false)}
            disabled={isDeleting}
          >
            Отмена
          </Button>

          <Button
            variant="default"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            <Trash2 data-icon="inline-start" />
            Удалить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
