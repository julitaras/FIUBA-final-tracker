"use client"

import { useState, useMemo, useCallback } from "react"
import { CheckCircle, AlertCircle, Github, ExternalLink } from "lucide-react"
import { format, addMonths, subMonths, isBefore } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

function ToggleDarkMode() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function ExamTracker() {
  const [quarter, setQuarter] = useState<string>("")
  const [year, setYear] = useState<string>("")
  const [results, setResults] = useState<any>(null)

  const currentDate = useMemo(() => new Date(), [])

  const calculateExamDates = useCallback(() => {
    if (!quarter || !year) return

    const startMonth = (Number.parseInt(quarter) - 1) * 3
    const startDate = new Date(Number.parseInt(year), startMonth, 1)
    const endDate = addMonths(startDate, 6)
    const finalExamDate = subMonths(endDate, 1)

    setResults({
      courseApproval: format(endDate, "MMMM yyyy", { locale: es }),
      finalExam: format(finalExamDate, "MMMM yyyy", { locale: es }),
      isExpired: isBefore(finalExamDate, currentDate),
    })
  }, [quarter, year, currentDate])

  return (
    <div className="flex flex-col justify-between min-h-screen">
      <div className="flex justify-center items-center flex-grow p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              {" "}
              ¿Hasta cuándo puedo rendir un examen final? <ToggleDarkMode />
            </CardTitle>

            <CardDescription>
              Calcula hasta cuándo puedes rendir un examen final basado en la aprobación de tu cursada. Fecha actual:{" "}
              {format(currentDate, "MMMM yyyy", { locale: es })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full gap-2">
              <Label htmlFor="quarter">Cuatrimestre</Label>
              <Select onValueChange={setQuarter}>
                <SelectTrigger id="quarter">
                  <SelectValue placeholder="Selecciona un cuatrimestre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Primer Cuatrimestre</SelectItem>
                  <SelectItem value="2">Segundo Cuatrimestre</SelectItem>
                  <SelectItem value="3">Tercer Cuatrimestre</SelectItem>
                  <SelectItem value="4">Cuarto Cuatrimestre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid w-full gap-2">
              <Label htmlFor="year">Año</Label>
              <Select onValueChange={setYear}>
                <SelectTrigger id="year">
                  <SelectValue placeholder="Selecciona un año" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => {
                    const currentYear = new Date().getFullYear() - i
                    return (
                      <SelectItem key={currentYear} value={currentYear.toString()}>
                        {currentYear}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full" onClick={calculateExamDates} disabled={!quarter || !year}>
              Calcular fechas de examen
            </Button>
          </CardFooter>

          {results && (
            <CardFooter className="flex flex-col space-y-2">
              {results.isExpired ? (
                <div className="flex items-center text-sm text-red-500">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <p>¡Atención! El período para rendir el examen final ha expirado en {results.finalExam}.</p>
                </div>
              ) : (
                <div className="flex items-center text-sm text-green-500">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <p>Puedes rendir el examen final hasta {results.finalExam}.</p>
                </div>
              )}
            </CardFooter>
          )}
        </Card>
      </div>
      <footer className="w-full py-4 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <a
            href="https://github.com/julitaras/FIUBA-final-tracker/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <Github className="h-4 w-4 mr-2" />
            Reportar un problema
          </a>
          <a
            href="https://fiubaverse.wordpress.com/dudas-sobre-finales-integradores/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Más info sobre exámenes finales
          </a>
        </div>
      </footer>
    </div>
  )
}

