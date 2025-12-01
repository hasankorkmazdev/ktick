"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

interface NumberInputProps {
    value?: number
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    min?: number
    max?: number
    step?: number
    decimalPlaces?: number
    onDecimalChange?: (v: number) => void
    disabled?: boolean
    className?: string
    placeholder?: string
}

export function NumberInput({
    value = 0,
    onChange,
    decimalPlaces = 0,
    onDecimalChange,
    min = 0,
    max = 9999999,
    step = 1,
    disabled = false,
    className,
    placeholder,
}: NumberInputProps) {
    const [precision, setPrecision] = useState(decimalPlaces)
    const [inputValue, setInputValue] = useState(String(value.toFixed(decimalPlaces)))

    // Sync internal state with external value prop
    useEffect(() => {
        setInputValue(String(value.toFixed(precision)))
    }, [value, precision])

    const format = (num: number) => Number(num.toFixed(precision))

    const emit = (val: number) => {
        const event = { target: { value: val } } as unknown as React.ChangeEvent<HTMLInputElement>
        onChange?.(event)
    }

    const handleDecrement = () => {
        const num = Number.parseFloat(inputValue) || 0
        const newVal = format(Math.max(num - step, min))
        setInputValue(newVal.toFixed(precision))
        emit(newVal)
    }

    const handleIncrement = () => {
        const num = Number.parseFloat(inputValue) || 0
        const newVal = format(Math.min(num + step, max))
        setInputValue(newVal.toFixed(precision))
        emit(newVal)
    }
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value
        setInputValue(raw) // sadece yazılanı sakla
    }
    const handleBlur = () => {
        const num = Number.parseFloat(inputValue) || 0
        const newVal = format(Math.min(Math.max(num, min), max))
        setInputValue(newVal.toFixed(precision))
        emit(newVal)
    }

    const handlePrecisionChange = (val: string) => {
        const p = Number(val)
        setPrecision(p)
        onDecimalChange?.(p)

        // mevcut input'u yeni precision'a göre formatla
        const num = Number.parseFloat(inputValue) || 0
        const formatted = Number(num.toFixed(p))
        setInputValue(formatted.toFixed(p))
        emit(formatted)
    }

    return (
        <div className={cn("flex items-center items-between",
            className
        )}>
            <div
                className="flex items-center rounded-lg border border-input bg-background  focus-within:ring-ring focus-within:ring-offset-2 flex-3">

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleDecrement}
                    disabled={disabled}
                    className="h-9 w-9 rounded-none border-r border-input hover:bg-muted"
                >
                    <Minus className="h-4 w-4" />
                </Button>

                <input
                    type="number"
                    value={inputValue}
                    onBlur={handleBlur}
                    onChange={handleInputChange}

                    disabled={disabled}
                    placeholder={placeholder}
                    min={min}
                    max={max}
                    step={step}
                    className={cn(
                        "h-9 flex-1 border-0 bg-transparent text-center text-sm",
                        "placeholder:text-muted-foreground",
                        "focus:outline-none",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                        "[&::-moz-appearance]:textfield"
                    )}
                />

                {/* INCREMENT */}
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleIncrement}
                    disabled={disabled}
                    className="h-9 w-9 rounded-none border-l border-input hover:bg-muted"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex-1 ms-1 ">
                <Select value={String(precision)} onValueChange={handlePrecisionChange} disabled={disabled}>
                    <SelectTrigger className=" !h-9 !bg-background">
                        <SelectValue placeholder="0" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="0">0</SelectItem>
                        <SelectItem value="1">0.0</SelectItem>
                        <SelectItem value="2">0.00</SelectItem>
                        <SelectItem value="3">0.000</SelectItem>
                        <SelectItem value="4">0.0000</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
