"use client"

import { useState, useMemo } from "react"
import { CheckCircle, AlertCircle } from "lucide-react"
import { format, addMonths, subMonths, isBefore } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ExamTracker() {
  const [quarter, setQuarter] = useState<string>("")
  const [year, setYear] = useState<string>("")
  const [results, setResults] = useState<any>(null)
  const { setTheme } = useTheme()

  const currentDate = useMemo(() => new Date(), [])

  const availableYears = useMemo(() => {
    const maxExpirationMonths = 12
    const oldestValidDate = subMonths(currentDate, maxExpirationMonths)
    const oldestYear = oldestValidDate.getFullYear()
    const currentYear = currentDate.getFullYear()

    return Array.from({ length: currentYear - oldestYear + 1 }, (_, index) => {
      const year = currentYear - index
      const lastPeriodOfYear = new Date(year, 11, 31)
      return isBefore(lastPeriodOfYear, oldestValidDate) ? null : year.toString()
    }).filter(Boolean) as string[]
  }, [currentDate])

  const calculateExamDates = () => {
    if (!quarter || !year) return

    const yearNum = Number.parseInt(year)
    const baseDate = quarter === "1" ? new Date(yearNum, 6, 31) : new Date(yearNum, 11, 31)
    const expirationDate = addMonths(baseDate, 12)

    if (isBefore(expirationDate, currentDate)) {
      setResults({ isExpired: true })
      return
    }

    const tanda1Start = quarter === "1" ? new Date(yearNum, 6, 1) : new Date(yearNum, 11, 1)
    const tanda1End = quarter === "1" ? new Date(yearNum, 7, 31) : new Date(yearNum + 1, 1, 28)

    const tanda2Start = quarter === "1" ? new Date(yearNum, 11, 1) : new Date(yearNum + 1, 6, 1)
    const tanda2End = quarter === "1" ? new Date(yearNum + 1, 1, 28) : new Date(yearNum + 1, 7, 31)

    const tanda3Start = quarter === "1" ? new Date(yearNum + 1, 6, 1) : new Date(yearNum + 1, 11, 1)
    const tanda3End = quarter === "1" ? new Date(yearNum + 1, 7, 31) : new Date(yearNum + 2, 1, 28)

    const periods = [
      { name: "Tanda 1", startDate: tanda1Start, endDate: tanda1End },
      { name: "Tanda 2", startDate: tanda2Start, endDate: tanda2End },
      { name: "Tanda 3", startDate: tanda3Start, endDate: tanda3End },
    ].filter((period) => !isBefore(period.endDate, currentDate))

    setResults({ periods: periods.slice(0, 3), expirationDate, isExpired: false })
  }

  const ToggleDarkMode = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex justify-between items-center"> ¿Hasta cuándo puedo rendir un examen final? <ToggleDarkMode /></CardTitle>
        
          <CardDescription>
            Calcula hasta cuándo puedes rendir un examen final basado en la aprobación de tu cursada. Fecha actual: {" "}
            {format(currentDate, "MMMM yyyy", { locale: es })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Año de aprobación</Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un año" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Cuatrimestre de aprobación</Label>
            <Select value={quarter} onValueChange={setQuarter}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un cuatrimestre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Primer cuatrimestre (Marzo-Julio)</SelectItem>
                <SelectItem value="2">Segundo cuatrimestre (Agosto-Diciembre)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={calculateExamDates} disabled={!quarter || !year}>
            Calcular fechas de examen
          </Button>
        </CardFooter>

        {results && results.isExpired && (
          <CardContent className="pt-4 border-t">
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">Materia vencida</p>
                <p className="text-sm">La regularidad de esta materia ya ha vencido. Ya no es posible rendir el examen final.</p>
              </div>
            </div>
          </CardContent>
        )}

        {results && !results.isExpired && (
          <CardContent className="pt-4 border-t">
            <h3 className="font-semibold text-lg mb-3">Períodos disponibles para rendir:</h3>
            <div className="space-y-3">
              {results.periods.map((period: any, index: number) => (
                <div key={index} className="bg-muted p-3 rounded-md">
                  <div className="font-medium">{period.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(period.startDate, "MMMM yyyy", { locale: es })} - {" "}
                    {format(period.endDate, "MMMM yyyy", { locale: es })}
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-4 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>
                  Tu regularidad vence el {" "}
                  <span className="font-semibold">{format(results.expirationDate, "PPP", { locale: es })}</span>
                </span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
