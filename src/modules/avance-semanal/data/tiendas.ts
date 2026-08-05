export interface Tienda {
  codigo: number
  nombre: string
  gerente: string
  regional: string
}

export interface Gerente {
  nombre: string
  regional: string
  tiendas: Tienda[]
}

export const TIENDAS: Tienda[] = [
  // === ALEJANDRO RAMOS ===
  { codigo: 302, nombre: '302 KFC Transistmica', gerente: 'ALEXIS MORALES', regional: 'ALEJANDRO RAMOS' },
  { codigo: 308, nombre: '308 KFC Dorado', gerente: 'ALEXIS MORALES', regional: 'ALEJANDRO RAMOS' },
  { codigo: 312, nombre: '312 KFC San Francisco', gerente: 'ALEXIS MORALES', regional: 'ALEJANDRO RAMOS' },
  { codigo: 316, nombre: '316 KFC Calle 50', gerente: 'ALEXIS MORALES', regional: 'ALEJANDRO RAMOS' },
  { codigo: 322, nombre: '322 KFC Milla 8', gerente: 'ALEXIS MORALES', regional: 'ALEJANDRO RAMOS' },
  
  { codigo: 323, nombre: '323 KFC Terminal', gerente: 'CHRISTIE MONTENEGRO', regional: 'ALEJANDRO RAMOS' },
  { codigo: 329, nombre: '329 KFC Albrook Magic Zone', gerente: 'CHRISTIE MONTENEGRO', regional: 'ALEJANDRO RAMOS' },
  { codigo: 330, nombre: '330 KFC Metromall', gerente: 'CHRISTIE MONTENEGRO', regional: 'ALEJANDRO RAMOS' },
  { codigo: 336, nombre: '336 KFC Megamall', gerente: 'CHRISTIE MONTENEGRO', regional: 'ALEJANDRO RAMOS' },
  { codigo: 340, nombre: '340 KFC Los Andes', gerente: 'CHRISTIE MONTENEGRO', regional: 'ALEJANDRO RAMOS' },
  { codigo: 349, nombre: '349 KFC Costa del Este Town Center', gerente: 'CHRISTIE MONTENEGRO', regional: 'ALEJANDRO RAMOS' },
  { codigo: 401, nombre: '401 KFC Albrook Carrousel', gerente: 'CHRISTIE MONTENEGRO', regional: 'ALEJANDRO RAMOS' },
  { codigo: 403, nombre: '403 KFC Multiplaza', gerente: 'CHRISTIE MONTENEGRO', regional: 'ALEJANDRO RAMOS' },
  
  { codigo: 310, nombre: '310 KFC Tocumen', gerente: 'YAJAIRA GONZALEZ', regional: 'ALEJANDRO RAMOS' },
  { codigo: 324, nombre: '324 KFC La Doña', gerente: 'YAJAIRA GONZALEZ', regional: 'ALEJANDRO RAMOS' },
  { codigo: 334, nombre: '334 KFC Las Americas 24/12', gerente: 'YAJAIRA GONZALEZ', regional: 'ALEJANDRO RAMOS' },
  { codigo: 341, nombre: '341 KFC Pedregal', gerente: 'YAJAIRA GONZALEZ', regional: 'ALEJANDRO RAMOS' },
  { codigo: 348, nombre: '348 KFC La Siesta', gerente: 'YAJAIRA GONZALEZ', regional: 'ALEJANDRO RAMOS' },
  { codigo: 350, nombre: '350 KFC Ven Versalles', gerente: 'YAJAIRA GONZALEZ', regional: 'ALEJANDRO RAMOS' },
  { codigo: 354, nombre: '354 KFC Nuevo Tocumen', gerente: 'YAJAIRA GONZALEZ', regional: 'ALEJANDRO RAMOS' },
  
  // === ANNJEANETTE ALOMAR ===
  { codigo: 315, nombre: '315 KFC David Interamericana', gerente: 'IDA APARICIO', regional: 'ANNJEANETTE ALOMAR' },
  { codigo: 339, nombre: '339 KFC San Mateo', gerente: 'IDA APARICIO', regional: 'ANNJEANETTE ALOMAR' },
  { codigo: 344, nombre: '344 KFC Frontera', gerente: 'IDA APARICIO', regional: 'ANNJEANETTE ALOMAR' },
  { codigo: 352, nombre: '352 KFC David Centro', gerente: 'IDA APARICIO', regional: 'ANNJEANETTE ALOMAR' },
  { codigo: 355, nombre: '355 KFC Algarrobos - Chiriquí', gerente: 'IDA APARICIO', regional: 'ANNJEANETTE ALOMAR' },
  
  { codigo: 321, nombre: '321 KFC Santiago', gerente: 'EDWIN MONJE', regional: 'ANNJEANETTE ALOMAR' },
  { codigo: 328, nombre: '328 KFC Chitre', gerente: 'EDWIN MONJE', regional: 'ANNJEANETTE ALOMAR' },
  { codigo: 335, nombre: '335 KFC Penonome', gerente: 'EDWIN MONJE', regional: 'ANNJEANETTE ALOMAR' },
  { codigo: 337, nombre: '337 KFC Santiago Mall', gerente: 'EDWIN MONJE', regional: 'ANNJEANETTE ALOMAR' },
  { codigo: 342, nombre: '342 KFC Aguadulce', gerente: 'EDWIN MONJE', regional: 'ANNJEANETTE ALOMAR' },
  
  // === GABRIEL NUÑEZ ===
  { codigo: 309, nombre: '309 KFC Cincuentenario', gerente: 'KEYDA ARAUZ', regional: 'GABRIEL NUÑEZ' },
  { codigo: 319, nombre: '319 KFC Los Pueblos', gerente: 'KEYDA ARAUZ', regional: 'GABRIEL NUÑEZ' },
  { codigo: 320, nombre: '320 KFC Conquistador', gerente: 'KEYDA ARAUZ', regional: 'GABRIEL NUÑEZ' },
  { codigo: 325, nombre: '325 KFC Usma', gerente: 'KEYDA ARAUZ', regional: 'GABRIEL NUÑEZ' },
  { codigo: 326, nombre: '326 KFC 12 de Octubre', gerente: 'KEYDA ARAUZ', regional: 'GABRIEL NUÑEZ' },
  { codigo: 338, nombre: '338 KFC Brisas del Golf', gerente: 'KEYDA ARAUZ', regional: 'GABRIEL NUÑEZ' },
  
  { codigo: 304, nombre: '304 KFC Colon', gerente: 'ROSA PEREZ', regional: 'GABRIEL NUÑEZ' },
  { codigo: 307, nombre: '307 KFC Central', gerente: 'ROSA PEREZ', regional: 'GABRIEL NUÑEZ' },
  { codigo: 318, nombre: '318 KFC Calidonia', gerente: 'ROSA PEREZ', regional: 'GABRIEL NUÑEZ' },
  { codigo: 333, nombre: '333 KFC Centenial', gerente: 'ROSA PEREZ', regional: 'GABRIEL NUÑEZ' },
  { codigo: 343, nombre: '343 KFC Alta Plaza', gerente: 'ROSA PEREZ', regional: 'GABRIEL NUÑEZ' },
  { codigo: 347, nombre: '347 KFC Sabanitas', gerente: 'ROSA PEREZ', regional: 'GABRIEL NUÑEZ' },
  { codigo: 353, nombre: '353 KFC Plaza Margarita', gerente: 'ROSA PEREZ', regional: 'GABRIEL NUÑEZ' },
  
  { codigo: 327, nombre: '327 KFC Chorrera', gerente: 'JOSE LUIS ABREGO', regional: 'GABRIEL NUÑEZ' },
  { codigo: 331, nombre: '331 KFC Coronado', gerente: 'JOSE LUIS ABREGO', regional: 'GABRIEL NUÑEZ' },
  { codigo: 332, nombre: '332 KFC Westland', gerente: 'JOSE LUIS ABREGO', regional: 'GABRIEL NUÑEZ' },
  { codigo: 345, nombre: '345 KFC Costa Verde Market', gerente: 'JOSE LUIS ABREGO', regional: 'GABRIEL NUÑEZ' },
  { codigo: 346, nombre: '346 KFC Arraijan Town Center', gerente: 'JOSE LUIS ABREGO', regional: 'GABRIEL NUÑEZ' },
  { codigo: 351, nombre: '351 KFC Avenida Libertadores-Chorrera', gerente: 'JOSE LUIS ABREGO', regional: 'GABRIEL NUÑEZ' },
]

export const GERENTES = Array.from(new Set(TIENDAS.map(t => t.gerente)))
export const REGIONALES = Array.from(new Set(TIENDAS.map(t => t.regional)))

export function getTiendasPorGerente(gerente: string): Tienda[] {
  return TIENDAS.filter(t => t.gerente === gerente)
}

export function getTiendasPorRegional(regional: string): Tienda[] {
  return TIENDAS.filter(t => t.regional === regional)
}

export function getGerentesPorRegional(regional: string): string[] {
  return Array.from(new Set(TIENDAS.filter(t => t.regional === regional).map(t => t.gerente)))
}
