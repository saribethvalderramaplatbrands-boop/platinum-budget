export interface SemanaInfo {
  numero: number
  fechaInicio: Date
  fechaFin: Date
  label: string
  value: string
}

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
]

export function getSemanasMartesLunes(anio: number): SemanaInfo[] {
  const primerEnero = new Date(anio, 0, 1)
  let primerMartes = new Date(primerEnero)

  while (primerMartes.getDay() !== 2) {
    primerMartes.setDate(primerMartes.getDate() + 1)
  }

  const semanas: SemanaInfo[] = []

  for (let i = 0; i < 53; i++) {
    const inicio = new Date(primerMartes)
    inicio.setDate(primerMartes.getDate() + (i * 7))
    const fin = new Date(inicio)
    fin.setDate(inicio.getDate() + 6)

    if (inicio.getFullYear() > anio && i > 0) break

    const label = `Semana #${i + 1} del ${inicio.getDate()} de ${MESES[inicio.getMonth()]} al ${fin.getDate()} de ${MESES[fin.getMonth()]}`

    semanas.push({
      numero: i + 1,
      fechaInicio: inicio,
      fechaFin: fin,
      label,
      value: `${anio}-W${String(i + 1).padStart(2, '0')}`
    })
  }

  return semanas
}

export function getSemanaActualMartesLunes(): SemanaInfo | null {
  const hoy = new Date()
  const anio = hoy.getFullYear()
  const semanas = getSemanasMartesLunes(anio)
  const actual = semanas.find(s => {
    const h = new Date(hoy)
    h.setHours(0, 0, 0, 0)
    const i = new Date(s.fechaInicio)
    i.setHours(0, 0, 0, 0)
    const f = new Date(s.fechaFin)
    f.setHours(23, 59, 59, 999)
    return h >= i && h <= f
  })
  return actual || semanas[0] || null
}

export function getAnioSemana(value: string): { anio: number; semana: number } {
  const [anio, w] = value.split('-W')
  return { anio: parseInt(anio), semana: parseInt(w) }
}
