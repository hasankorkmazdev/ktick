import { useState } from "react"
import { Check, Clock, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@radix-ui/react-label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface IntervalSelectorProps {
    intervalMs: number
    onChange: (ms: number) => void
}

export function IntervalSelector({ intervalMs, onChange }: IntervalSelectorProps) {
    const [minutes, setMinutes] = useState(Math.floor(intervalMs / 60000))
    const [seconds, setSeconds] = useState((intervalMs % 60000) / 1000)

    const handleSave = () => {
        const totalMs = (minutes * 60 * 1000) + (seconds * 1000)
        if (totalMs > 0) {
            onChange(totalMs)
        }
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-[130px] justify-between">
                    <span>
                        {minutes > 0 ? `${minutes} dk ` : ""}
                        {seconds} sn
                    </span>
                    <Clock className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-50">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Yenileme Sıklığı</h4>
                        <p className="text-sm text-muted-foreground">
                        Veri yenileme periyodunu belirleyin
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="minutes">Dakika</Label>
                            <Input
                                id="minutes"
                                type="number"
                                min="0"
                                className="col-span-2 h-8"
                                value={minutes}
                                onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="seconds">Saniye</Label>
                            <Input
                                id="seconds"
                                type="number"
                                min="0"
                                className="col-span-2 h-8"
                                value={seconds}
                                onChange={(e) => setSeconds(parseInt(e.target.value) || 0)}
                            />
                        </div>

                        {/* İkonlu butonlar */}
                        <div className="flex justify-end gap-2 mt-2">

                            <Button
                                size="sm"
                                onClick={() => console.log("İptal edildi")}
                                className="flex items-center gap-1"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSave}
                                className="flex items-center gap-1"
                            >
                                <Check className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                </div>
            </PopoverContent>
        </Popover>
    )
}
