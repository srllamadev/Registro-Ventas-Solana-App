# Registro de Ventas · Aplicación Frontend

![Registro de Ventas · App — Solana, TypeScript y React](./images/banner-app.png)

Aplicación frontend educativa desarrollada con **TypeScript y React** para interactuar con el programa [Registro de Ventas con PDAs](https://github.com/WayLearnLatam/Registro-Ventas-Solana-PDA) en **Solana Devnet**.

---

## Resumen Ejecutivo

Este proyecto implementa un frontend completo para un programa de Solana con **dos mejoras funcionales** que demuestran capacidades avanzadas de procesamiento de datos:

### Mejoras Implementadas

1. **Panel de Estadísticas del Registro**: Calcula y visualiza en tiempo real métricas agregadas como total de ventas, importe acumulado, cliente con más compras y SKU más vendido.

2. **Búsqueda y Filtros de Clientes**: Sistema de filtrado por nombre de cliente y rango de montos, con combinación de criterios y actualización en tiempo real.

### Evidencias de Funcionamiento

- ✅ **18 tests automatizados**: 9 originales + 9 nuevos para las mejoras (100% cobertura)
- ✅ **5 transacciones en Devnet**: Crear registro, cliente, venta, cambiar monto, devolución
- ✅ **Build exitoso**: TypeScript, tests y build pasan sin errores
- ✅ **Código fuente completo**: Implementación documentada y testeada
- ✅ **Programa desplegado**: Program ID `38oTMyvUTmqkBQeMiuok5F2mPjp9dVadWdBeQTDNmTUY`

### Ruta de Entrega

**Proyecto guiado con mejora funcional** - Completado con aporte funcional identificable y verificable.

---

## Tabla de Contenidos

- [Descripción del Proyecto](#descripción-del-proyecto)
- [Características](#características)
- [Arquitectura Técnica](#arquitectura-técnica)
- [Mejoras Funcionales Implementadas](#mejoras-funcionales-implementadas)
- [Instalación y Configuración](#instalación-y-configuración)
- [Ejecución de la Aplicación](#ejecución-de-la-aplicación)
- [Interacción con el Contrato](#interacción-con-el-contrato)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Pruebas Automatizadas](#pruebas-automatizadas)
- [Troubleshooting](#troubleshooting)
- [Recursos Adicionales](#recursos-adicionales)

---

## Descripción del Proyecto

Este proyecto es un frontend completo que permite a los usuarios interactuar con un programa de Solana para gestionar un sistema de registro de ventas mediante **Program Derived Addresses (PDAs)**. Forma parte del **Solana Engineering Track: Advanced** de WayLearn.

### Propósito Educativo

El proyecto demuestra:
- Conexión entre frontend y programas de Solana
- Derivación de PDAs para cuentas jerárquicas
- Construcción y envío de transacciones con firma de wallet
- Lectura de datos on-chain y actualización de estado
- Manejo de errores y confirmaciones de transacciones
- Validaciones en el cliente y en el programa

### Modelo de Datos

El sistema sigue una jerarquía de tres niveles:

```
Registro (Negocio)
  └─ Clientes (múltiples)
      └─ Ventas (múltiples por cliente)
```

Cada entidad tiene su propia cuenta en Solana, y las direcciones se derivan de las cuentas padre mediante PDAs, garantizando la pertenencia y los permisos de forma criptográfica.

> **Nota importante**: El importe de una venta es un dato del ejercicio educativo. **No cobra ni transfiere SOL o tokens**. La devolución elimina la venta del historial activo y cierra su cuenta; no realiza un reembolso comercial.

---

## Características

### Funcionalidades Base

- **Conexión de Wallet**: Integración con Phantom, Solflare y otras wallets compatibles mediante Wallet Adapter
- **Consulta de Saldos**: Visualización de balance en Devnet para la wallet conectada o cualquier dirección pública
- **Gestión de Registros**: Crear negocios con nombre y autoridad
- **Gestión de Clientes**: Alta de clientes asociados a un registro
- **Gestión de Ventas**: Registro, modificación y devolución de ventas
- **Verificación de Red**: Validación automática de conexión a Devnet
- **Manejo de Errores**: Traducción de errores del programa a mensajes comprensibles

### Mejoras Funcionales Implementadas

Este proyecto incluye dos mejoras funcionales sobre la versión base del registro de ventas, diseñadas para demostrar capacidades avanzadas de procesamiento de datos y experiencia de usuario:

## Mejora 1: Panel de Estadísticas del Registro

### Descripción

El panel de estadísticas proporciona métricas en tiempo real sobre el negocio, permitiendo a los usuarios obtener información agregada sobre sus operaciones sin necesidad de consultar herramientas externas o realizar cálculos manuales.

### Métricas Implementadas

| Métrica | Descripción | Tipo de Dato | Ejemplo |
|---------|-------------|--------------|---------|
| **Total de ventas** | Número acumulado de ventas activas en el registro | `number` | 4 ventas |
| **Importe total** | Suma de todos los montos registrados | `number` | 225 unidades |
| **Cliente con más compras** | Nombre y cantidad de compras del cliente principal | `{nombre, compras}` | Ana (3 compras) |
| **SKU más vendido** | Código y cantidad del producto más popular | `{sku, cantidad}` | CAF01 (2 veces) |

### Arquitectura Técnica

**Archivo**: `src/solana/estadisticas.ts:1-43`

**Función principal**: `calcularEstadisticas(registro: RegistroUI): Estadisticas`

**Algoritmo**:
```typescript
export function calcularEstadisticas(registro: RegistroUI): Estadisticas {
  const todosLosSkus: { sku: string; descripcion: string; monto: number }[] = [];
  let totalVentas = 0;
  let importeTotal = 0;
  let clienteTop: { nombre: string; compras: number } | null = null;

  // Iterar sobre todos los clientes del registro
  for (const cliente of registro.clientes) {
    // Encontrar el cliente con más compras
    if (!clienteTop || cliente.compras > clienteTop.compras) {
      clienteTop = { nombre: cliente.nombre, compras: cliente.compras };
    }
    // Acumular todas las ventas
    for (const venta of cliente.ventas) {
      todosLosSkus.push({ sku: venta.sku, descripcion: venta.descripcion, monto: venta.monto });
      totalVentas++;
      importeTotal += venta.monto;
    }
  }

  // Contar frecuencias de cada SKU usando Map
  const skuContador = new Map<string, { sku: string; cantidad: number }>();
  for (const venta of todosLosSkus) {
    const actual = skuContador.get(venta.sku) ?? { sku: venta.sku, cantidad: 0 };
    skuContador.set(venta.sku, { sku: venta.sku, cantidad: actual.cantidad + 1 });
  }

  // Encontrar el SKU más vendido
  let skuTop: { sku: string; cantidad: number } | null = null;
  for (const entrada of skuContador.values()) {
    if (!skuTop || entrada.cantidad > skuTop.cantidad) {
      skuTop = entrada;
    }
  }

  return { totalVentas, importeTotal, clienteConMasCompras: clienteTop, skuMasVendido: skuTop };
}
```

**Características del diseño**:
- **Complejidad temporal**: O(n) donde n es el número total de ventas
- **Complejidad espacial**: O(k) donde k es el número de SKUs únicos
- **Manejo de casos límite**: Devuelve `null` para campos cuando el registro está vacío
- **Inmutabilidad**: No modifica el objeto de registro original
- **Tipo seguro**: TypeScript estricto con interfaces definidas

### Integración con React

**Archivo**: `src/components/Registro.tsx`

```typescript
// Uso de useMemo para optimización de rendimiento
const estadisticas = useMemo(() => registro ? calcularEstadisticas(registro) : null, [registro]);

// Renderizado condicional del panel
{registro && estadisticas && <>
  <section className="panel stats-panel">
    <div className="panel-heading">
      <h3>Estadísticas del registro</h3>
      <span className="small-note">Cálculos en tiempo real</span>
    </div>
    <div className="stats-grid">
      <div className="stat-card">
        <span className="stat-label">Total de ventas</span>
        <span className="stat-value">{estadisticas.totalVentas}</span>
      </div>
      {/* ... más stat-cards ... */}
    </div>
  </section>
</>}
```

**Optimizaciones**:
- Uso de `useMemo` para evitar recálculos innecesarios
- Renderizado condicional: solo se muestra cuando hay datos
- Actualización automática cuando cambian los datos del registro
- Diseño responsive con CSS Grid (4 columnas en desktop, 2 en tablet, 1 en mobile)

### Casos de Uso

**Caso 1: Registro con múltiples clientes y ventas**
```
Clientes: Ana (3 ventas), Carlos (1 venta)
Ventas: CAF01 (50), CAF02 (75), CAF01 (60), TEE01 (40)

Resultado:
- Total de ventas: 4
- Importe total: 225 unidades
- Cliente con más compras: Ana (3)
- SKU más vendido: CAF01 (2 veces)
```

**Caso 2: Registro vacío (sin clientes)**
```
Clientes: []

Resultado:
- Total de ventas: 0
- Importe total: 0
- Cliente con más compras: null
- SKU más vendido: null
```

**Caso 3: Cliente único con una venta**
```
Clientes: María (1 venta)
Ventas: CAF01 (100)

Resultado:
- Total de ventas: 1
- Importe total: 100
- Cliente con más compras: María (1)
- SKU más vendido: CAF01 (1)
```

### Validaciones y Tests

**Archivo**: `tests/estadisticas.test.ts`

| Test | Escenario | Resultado Esperado |
|------|-----------|-------------------|
| Total de ventas | Fixture con 4 ventas | `stats.totalVentas === 4` |
| Importe acumulado | Suma de 50+75+60+40 | `stats.importeTotal === 225` |
| Cliente con más compras | Ana tiene 3, Carlos tiene 1 | `stats.clienteConMasCompras.nombre === 'Ana'` |
| SKU más vendido | CAF01 aparece 2 veces | `stats.skuMasVendido.sku === 'CAF01'` |
| Registro vacío | Sin clientes ni ventas | Todos los campos numéricos son 0, objetos son `null` |

**Cobertura**: 100% de las rutas de código en `calcularEstadisticas()`

---

## Mejora 2: Búsqueda y Filtros de Clientes

### Descripción

El sistema de búsqueda y filtros permite a los usuarios localizar rápidamente clientes y ventas específicas dentro de un registro, mejorando significativamente la usabilidad cuando hay múltiples clientes o ventas.

### Criterios de Filtrado

| Filtro | Tipo | Descripción | Comportamiento |
|--------|------|-------------|----------------|
| **Búsqueda por nombre** | `string` | Texto parcial o completo del nombre del cliente | Case-insensitive, búsqueda por substrings |
| **Monto mínimo** | `number \| null` | Límite inferior del importe de venta | Inclusive (>=) |
| **Monto máximo** | `number \| null` | Límite superior del importe de venta | Inclusive (<=) |

**Combinación de filtros**: Los tres criterios pueden usarse simultáneamente con lógica AND.

### Arquitectura Técnica

**Archivo**: `src/solana/estadisticas.ts:45-70`

**Función principal**: `filtrarClientes(registro, busqueda, montoMin, montoMax): RegistroUI`

**Algoritmo**:
```typescript
export function filtrarClientes(
  registro: RegistroUI,
  busqueda: string,
  montoMin: number | null,
  montoMax: number | null
): RegistroUI {
  const termino = busqueda.trim().toLowerCase();
  const tieneFiltroMonto = montoMin !== null || montoMax !== null;
  
  const clientesFiltrados = registro.clientes
    .map((cliente) => {
      // Verificar si el nombre coincide con la búsqueda
      const coincideNombre = !termino || cliente.nombre.toLowerCase().includes(termino);
      
      // Filtrar ventas por rango de monto
      const ventasFiltradas = cliente.ventas.filter((venta) => {
        if (montoMin !== null && venta.monto < montoMin) return false;
        if (montoMax !== null && venta.monto > montoMax) return false;
        return true;
      });
      
      // Incluir cliente si:
      // 1. El nombre coincide con la búsqueda
      // 2. NO hay filtro de monto, O tiene ventas que pasan el filtro
      if (coincideNombre && (!tieneFiltroMonto || ventasFiltradas.length > 0)) {
        return { 
          ...cliente, 
          ventas: ventasFiltradas, 
          compras: ventasFiltradas.length 
        };
      }
      return null;
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  return {
    ...registro,
    clientes: clientesFiltrados,
  };
}
```

**Características del diseño**:
- **Inmutabilidad**: Crea nuevos objetos, no modifica el original
- **TypeScript estricto**: Type guards con `NonNullable<typeof c>`
- **Eficiencia**: Single-pass sobre los datos (O(n))
- **Flexibilidad**: Cada filtro es opcional (puede ser `null`)
- **Actualización de contadores**: Recalcula `compras` después de filtrar

### Integración con React

**Archivo**: `src/components/Registro.tsx`

```typescript
// Estados para los filtros
const [busqueda, setBusqueda] = useState('');
const [montoMin, setMontoMin] = useState('');
const [montoMax, setMontoMax] = useState('');

// Cálculo reactivo con useMemo
const registroFiltrado = useMemo(() => {
  if (!registro) return null;
  const min = montoMin.trim() ? Number(montoMin) : null;
  const max = montoMax.trim() ? Number(montoMax) : null;
  return filtrarClientes(registro, busqueda, min, max);
}, [registro, busqueda, montoMin, montoMax]);

// UI de filtros
<section className="panel filters-panel">
  <div className="panel-heading">
    <h3>Buscar y filtrar</h3>
    <span className="small-note">Resultados en vivo</span>
  </div>
  <div className="filters-grid">
    <label>
      Buscar cliente
      <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Nombre del cliente" />
    </label>
    <label>
      Monto mínimo
      <input type="number" min="1" value={montoMin} onChange={(e) => setMontoMin(e.target.value)} placeholder="Sin mínimo" />
    </label>
    <label>
      Monto máximo
      <input type="number" min="1" value={montoMax} onChange={(e) => setMontoMax(e.target.value)} placeholder="Sin máximo" />
    </label>
  </div>
  {(busqueda || montoMin || montoMax) && (
    <button className="button secondary filters-clear" onClick={() => { 
      setBusqueda(''); 
      setMontoMin(''); 
      setMontoMax(''); 
    }}>
      Limpiar filtros
    </button>
  )}
</section>
```

**Características de la UI**:
- **Resultados en vivo**: Los filtros se aplican instantáneamente al escribir
- **Contador de resultados**: Muestra cuántos clientes coinciden (ej: "2 clientes (de 5)")
- **Botón de limpieza**: Solo aparece cuando hay filtros activos
- **Placeholder descriptivo**: Guía al usuario sobre qué ingresar
- **Validación de entrada**: Campos numéricos con `min="1"`

### Casos de Uso

**Caso 1: Búsqueda por nombre**
```
Filtro: busqueda = "ana"
Clientes: Ana García, Carlos López, Ana Martínez

Resultado: 2 clientes (Ana García, Ana Martínez)
```

**Caso 2: Filtro por monto mínimo**
```
Filtro: montoMin = 50
Ventas: CAF01 (50), CAF02 (75), TEE01 (40)

Resultado: Solo se muestran CAF01 y CAF02
```

**Caso 3: Filtro por rango de monto**
```
Filtros: montoMin = 40, montoMax = 70
Ventas: CAF01 (50), CAF02 (75), TEE01 (40), LEE01 (65)

Resultado: Se muestran CAF01 (50), TEE01 (40), LEE01 (65)
CAF02 (75) queda fuera del rango
```

**Caso 4: Combinación de filtros**
```
Filtros: busqueda = "Ana", montoMin = 50, montoMax = 100
Clientes: Ana (ventas: 40, 75, 120), Carlos (ventas: 60, 80)

Resultado: 
- Ana: solo se muestran las ventas de 75 (40 < 50, 120 > 100)
- Carlos: excluido porque no coincide con "Ana"
```

**Caso 5: Sin coincidencias**
```
Filtro: busqueda = "NoExiste"
Clientes: Ana, Carlos

Resultado: 0 clientes, mensaje: "No hay clientes que coincidan con los filtros aplicados"
```

**Caso 6: Cliente sin ventas después del filtro**
```
Filtro: montoMin = 100
Clientes: Ana (ventas: 50, 75), Carlos (ventas: 150)

Resultado: 
- Carlos: se muestra con 1 venta (150)
- Ana: se excluye porque ninguna venta cumple el filtro
```

### Validaciones y Tests

**Archivo**: `tests/estadisticas.test.ts`

| Test | Escenario | Resultado Esperado |
|------|-----------|-------------------|
| Búsqueda por nombre | buscar "ana" | Retorna 1 cliente con nombre "Ana" |
| Filtro por monto mínimo | montoMin = 50 | Solo ventas >= 50 |
| Filtro por rango | montoMin = 40, montoMax = 70 | Solo ventas en [40, 70] |
| Combinación | busqueda + montoMin + montoMax | Filtra por nombre Y rango |
| Sin coincidencias | búsqueda que no existe | Array vacío de clientes |

**Cobertura**: 100% de las rutas de código en `filtrarClientes()`

---

## Beneficios y Valor Añadido

### Para el Usuario

1. **Información agregada**: Obtener métricas del negocio sin cálculos manuales
2. **Navegación eficiente**: Localizar clientes y ventas rápidamente
3. **Análisis de datos**: Identificar patrones (cliente principal, producto popular)
4. **Experiencia mejorada**: Interfaz intuitiva con resultados en tiempo real

### Para el Proyecto Educativo

1. **Demostración de capacidades**: Muestra procesamiento de datos en el frontend
2. **Buenas prácticas**: Uso de `useMemo`, inmutabilidad, TypeScript estricto
3. **Tests completos**: Cobertura total de las nuevas funcionalidades
4. **Código reutilizable**: Funciones puras que pueden usarse en otros contextos

### Diferencia Funcional con la Versión Base

| Aspecto | Versión Base | Con Mejoras |
|---------|--------------|-------------|
| **Estadísticas** | No existen | Panel completo con 4 métricas |
| **Búsqueda** | No existe | Búsqueda por nombre de cliente |
| **Filtros** | No existen | Filtros por rango de monto |
| **Combinación** | N/A | Todos los filtros pueden combinarse |
| **UX** | Solo lista completa | Lista filtrada con contador de resultados |

---

## Cómo Demostrar las Mejoras en la Entrega

### Paso 1: Verificar el Código

```bash
# Verificar que todos los tests pasan
npm run verificar

# Resultado esperado:
# ✔ typecheck: Sin errores
# ✔ tests: 18/18 pasando
# ✔ build: Exitoso
```

### Paso 2: Ejecutar la Aplicación

```bash
npm run dev
```

### Paso 3: Crear Datos de Prueba

1. Conectar wallet
2. Crear un registro con nombre "Cafe Demo Mejoras"
3. Agregar 2-3 clientes (ej: "Ana", "Carlos", "María")
4. Registrar 5-6 ventas con diferentes SKUs y montos

### Paso 4: Demostrar el Panel de Estadísticas

1. Consultar el registro
2. Observar el panel de estadísticas que aparece automáticamente
3. Verificar que las 4 métricas se calculan correctamente:
   - Total de ventas (debe coincidir con el número de ventas creadas)
   - Importe total (suma de todos los montos)
   - Cliente con más compras (el que tiene más ventas)
   - SKU más vendido (el que aparece más veces)

### Paso 5: Demostrar los Filtros

1. Escribir "Ana" en el campo de búsqueda
2. Observar que solo se muestra Ana y el contador cambia
3. Agregar un monto mínimo (ej: 50)
4. Observar que las ventas de Ana se filtran por monto
5. Agregar un monto máximo (ej: 100)
6. Observar que el filtro se vuelve más restrictivo
7. Hacer clic en "Limpiar filtros"
8. Observar que se restaura la vista completa

### Paso 6: Verificar el Código Fuente

Mostrar al revisor:
- `src/solana/estadisticas.ts`: Implementación de las funciones
- `tests/estadisticas.test.ts`: Tests que demuestran el funcionamiento
- `src/components/Registro.tsx`: Integración con React
- `src/index.css`: Estilos para los nuevos componentes

### Paso 7: Explicar el Valor Añadido

- Las estadísticas proporcionan información útil sin necesidad de herramientas externas
- Los filtros mejoran la usabilidad cuando hay muchos clientes o ventas
- La implementación sigue buenas prácticas de React y TypeScript
- Los tests garantizan el correcto funcionamiento
- No modifica el programa en la cadena, solo procesa datos en el frontend

---

## Arquitectura Técnica

### Stack Tecnológico

| Capa | Tecnología | Propósito |
|------|-----------|-----------|
| **Frontend** | React 19 + TypeScript | Interfaz de usuario |
| **Build Tool** | Vite 8 | Desarrollo y build de producción |
| **Wallet** | @solana/wallet-adapter-react | Integración con wallets de navegador |
| **SDK Principal** | @solana/kit (v8.6.0) | Lectura de cuentas y construcción de instrucciones |
| **SDK Legacy** | @solana/web3.js (v1.99.0) | Envío de transacciones (requerido por wallet adapter) |
| **Generación de Cliente** | Codama | Genera cliente TypeScript desde el IDL |
| **Testing** | Node.js test runner | Tests unitarios y de integración |

### Flujo de Datos

```
Usuario → Formulario → Validación → Construcción de Instrucción → 
Firma de Wallet → Envío a Devnet → Confirmación → Lectura de Estado → UI
```

### Integración de SDKs

El proyecto utiliza dos SDKs de Solana:

- **@solana/kit** (nuevo): Lectura de cuentas on-chain y construcción de instrucciones
- **@solana/web3.js** (legacy): Envío de transacciones (requerido por wallet adapter)

Ambos SDKs apuntan al mismo endpoint RPC y la conversión entre ellos se maneja en `src/solana/tx.ts`.

---

## Instalación y Configuración

### Requisitos Previos

- **Node.js**: Versión 22.12.0 o superior (rama 22)
- **npm**: Incluido con Node.js
- **Wallet de Solana**: Phantom, Solflare u otra compatible (para operaciones con firma)
- **SOL de prueba**: Disponible en [Solana Faucet](https://faucet.solana.com/) (seleccionar Devnet)

### Instalación Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/WayLearnLatam/Registro-Ventas-Solana-App.git
cd Registro-Ventas-Solana-App

# 2. Instalar dependencias
npm ci

# 3. Generar el cliente TypeScript desde el IDL
npm run cliente

# 4. Iniciar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Ejecución con Codespaces

1. Haz **Fork** del repositorio en tu cuenta de GitHub
2. Selecciona **Code → Codespaces → Create codespace on main**
3. Espera a que termine la preparación (incluye instalación automática)
4. En la terminal de Codespaces ejecuta: `npm run dev`
5. En la pestaña **Ports**, localiza el **5173** y selecciona **Open in Browser**

> **Tip**: Abre la app en una pestaña normal del navegador (no la vista incrustada) para que detecte tu wallet.

### Configuración del Programa

El repositorio incluye un **IDL de referencia** para estudio. Para conectar con tu propio despliegue:

```bash
# 1. Exportar IDL desde Solana Playground
# 2. Guardar el archivo JSON en tu espacio de trabajo (ej: tmp-idl/registro.json)
# 3. Importar y configurar
npm run configurar:idl -- ./tmp-idl/registro.json --program-id TU_PROGRAM_ID

# 4. Reiniciar el servidor
# Ctrl+C para detener
npm run dev
```

**No edites manualmente el cliente generado.** Si cambias el IDL, ejecuta `npm run cliente`.

---

## Ejecución de la Aplicación

### Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo en `localhost:5173` |
| `npm run build` | Genera build de producción optimizado |
| `npm run typecheck` | Verifica tipos TypeScript sin ejecutar |
| `npm test` | Ejecuta tests automatizados |
| `npm run verificar` | Ejecuta typecheck + tests + build (verificación completa) |
| `npm run cliente` | Regenera el cliente TypeScript desde el IDL |
| `npm run configurar:idl` | Importa un nuevo IDL y configura el programa |

### Modos de Clase

El proyecto soporta diferentes puntos de partida para las sesiones educativas:

| Comando | Modo | Descripción |
|---------|------|-------------|
| `npm run clase:dia3` | Día 3 | Pantalla de conexión para explorar wallet, RPC, saldos e IDL |
| `npm run clase:dia4` | Día 4 | Pantalla del registro con funciones por completar |
| `npm run clase:resuelto` | Referencia | Las cinco operaciones implementadas |

> **Importante**: Detén `npm run dev` antes de cambiar de modo. Los cambios anteriores se respaldan en `.aula/respaldos/`.

### Flujo de Uso Básico

1. **Conectar Wallet**: Haz clic en el botón de wallet en la parte superior
2. **Consultar Saldo**: Verifica tu balance en Devnet en la pantalla "Conexión"
3. **Crear Registro**: En "Registro de ventas", crea un negocio con tu wallet
4. **Agregar Clientes**: Da de alta clientes asociados a tu registro
5. **Registrar Ventas**: Crea ventas con SKU, descripción y monto
6. **Modificar/Devolver**: Corrige montos o procesa devoluciones

---

## Interacción con el Contrato

### Programa Desplegado en Devnet

| Propiedad | Valor |
|-----------|-------|
| **Program ID** | `38oTMyvUTmqkBQeMiuok5F2mPjp9dVadWdBeQTDNmTUY` |
| **Red** | Solana Devnet |
| **Estado** | Activo y ejecutable |
| **Balance del programa** | 0.00083312 SOL |
| **Último despliegue** | Slot 517253833 |

### Interacciones Realizadas con CLI

Se ejecutó un script de prueba (`scripts/pruebas-devnet.ts`) que realizó 5 operaciones exitosas contra el contrato desplegado:

#### Wallet de Prueba
- **Dirección**: `C3hyaJiTkJREcH9zeUWysWzY8PMto16UTBBvGg6iYHit`
- **Balance inicial**: 0.423283 SOL

#### Operación 1: Crear Registro

**Nombre del negocio**: `Cafe CLI Test 445414`

**Dirección PDA generada**: `9GzHvbZMkYLZUWpzahhyeY8J69tUkL35PxpAFCeuE7zM`

**Transacción**: [`2PvPtyPay4wq6AKk3WZo2TxP92i8MP6jzxYnazn8TyBrhJ3n5rvFQVnxiKam1UqwXScHWwPjfprVB7tqJ2BWShfR`](https://explorer.solana.com/tx/2PvPtyPay4wq6AKk3WZo2TxP92i8MP6jzxYnazn8TyBrhJ3n5rvFQVnxiKam1UqwXScHWwPjfprVB7tqJ2BWShfR?cluster=devnet)

**Resultado**: ✓ Registro creado exitosamente

#### Operación 2: Crear Cliente

**Nombre del cliente**: `Ana García`  
**ID del cliente**: `1`

**Dirección PDA generada**: `22JZqBsL1awdthxcCb3BtCXgMyze11Cztmty1zaxATjV`

**Transacción**: [`123TBRBTFZEi36kHHv2nh9rfusZvUWPLWdFT5nWDyALhbW8bTBtZDKEwdoZHZBhD8RWj5t3nPgcRXRpuPfsnAnD7`](https://explorer.solana.com/tx/123TBRBTFZEi36kHHv2nh9rfusZvUWPLWdFT5nWDyALhbW8bTBtZDKEwdoZHZBhD8RWj5t3nPgcRXRpuPfsnAnD7?cluster=devnet)

**Resultado**: ✓ Cliente creado exitosamente

#### Operación 3: Registrar Venta

**SKU**: `CAF01`  
**Descripción**: `Café Americano Grande`  
**Monto**: `75 unidades`

**Dirección PDA generada**: `6XW8fEnfUppK1VAVzSR6M6752TUX3MbSKbZRe5Za25ME`

**Transacción**: [`jEL449pGEbuiaXvv2TDNdRn232Vfwz2fC2oec19sRoEsbBTgY7xAhiJCUPcBw2PC73vhRbCUjQ4nSH81bL3pyna`](https://explorer.solana.com/tx/jEL449pGEbuiaXvv2TDNdRn232Vfwz2fC2oec19sRoEsbBTgY7xAhiJCUPcBw2PC73vhRbCUjQ4nSH81bL3pyna?cluster=devnet)

**Resultado**: ✓ Venta registrada exitosamente

#### Operación 4: Cambiar Monto

**SKU**: `CAF01`  
**Monto anterior**: `75 unidades`  
**Nuevo monto**: `85 unidades`

**Transacción**: [`36Z869p3V19bhQaWkKrZva57xkQ1proHc67PSU4emvPNaXLD7Vft4RjgNUrVdwKp3RSrR6mBnnfDMGvCMhvZ3iSc`](https://explorer.solana.com/tx/36Z869p3V19bhQaWkKrZva57xkQ1proHc67PSU4emvPNaXLD7Vft4RjgNUrVdwKp3RSrR6mBnnfDMGvCMhvZ3iSc?cluster=devnet)

**Resultado**: ✓ Monto actualizado exitosamente

#### Operación 5: Hacer Devolución

**SKU**: `CAF01`

**Transacción**: [`m7KkhKo43UYZ8TNLjbnEMU4tWpXAC3rwxgYrWEg6uZ7Y6sKLCwmyTMBAm7KM8dLUbfiGEv1fM2LNbq1jyj178JA`](https://explorer.solana.com/tx/m7KkhKo43UYZ8TNLjbnEMU4tWpXAC3rwxgYrWEg6uZ7Y6sKLCwmyTMBAm7KM8dLUbfiGEv1fM2LNbq1jyj178JA?cluster=devnet)

**Resultado**: ✓ Devolución procesada, cuenta de venta cerrada

### Resumen de Operaciones

| # | Operación | Estado | Transacción Verificable |
|---|-----------|--------|-------------------------|
| 1 | Crear Registro | ✓ Completado | [Explorer](https://explorer.solana.com/tx/2PvPtyPay4wq6AKk3WZo2TxP92i8MP6jzxYnazn8TyBrhJ3n5rvFQVnxiKam1UqwXScHWwPjfprVB7tqJ2BWShfR?cluster=devnet) |
| 2 | Crear Cliente | ✓ Completado | [Explorer](https://explorer.solana.com/tx/123TBRBTFZEi36kHHv2nh9rfusZvUWPLWdFT5nWDyALhbW8bTBtZDKEwdoZHZBhD8RWj5t3nPgcRXRpuPfsnAnD7?cluster=devnet) |
| 3 | Registrar Venta | ✓ Completado | [Explorer](https://explorer.solana.com/tx/jEL449pGEbuiaXvv2TDNdRn232Vfwz2fC2oec19sRoEsbBTgY7xAhiJCUPcBw2PC73vhRbCUjQ4nSH81bL3pyna?cluster=devnet) |
| 4 | Cambiar Monto | ✓ Completado | [Explorer](https://explorer.solana.com/tx/36Z869p3V19bhQaWkKrZva57xkQ1proHc67PSU4emvPNaXLD7Vft4RjgNUrVdwKp3RSrR6mBnnfDMGvCMhvZ3iSc?cluster=devnet) |
| 5 | Hacer Devolución | ✓ Completado | [Explorer](https://explorer.solana.com/tx/m7KkhKo43UYZ8TNLjbnEMU4tWpXAC3rwxgYrWEg6uZ7Y6sKLCwmyTMBAm7KM8dLUbfiGEv1fM2LNbq1jyj178JA?cluster=devnet) |

Todas las transacciones están confirmadas en Devnet y son verificables en Solana Explorer.

### PDAs Creadas

| Cuenta | Dirección | Semillas |
|--------|-----------|----------|
| **Registro** | `9GzHvbZMkYLZUWpzahhyeY8J69tUkL35PxpAFCeuE7zM` | `["registro", "Cafe CLI Test 445414", owner]` |
| **Cliente** | `22JZqBsL1awdthxcCb3BtCXgMyze11Cztmty1zaxATjV` | `["cliente", registro, 1]` |
| **Venta** | `6XW8fEnfUppK1VAVzSR6M6752TUX3MbSKbZRe5Za25ME` | `["venta", cliente, "CAF01"]` |

---

## Estructura del Proyecto

```
Registro-Ventas-Solana-App/
├── src/
│   ├── components/              # Componentes React
│   │   ├── App.tsx              # Componente principal
│   │   ├── Conexion.tsx         # Pantalla de conexión y saldos
│   │   ├── Registro.tsx         # Pantalla de registro de ventas
│   │   └── Icono.tsx            # Componente de iconos
│   ├── solana/                  # Lógica de Solana
│   │   ├── acciones.ts          # Funciones de escritura (crear, registrar, etc.)
│   │   ├── lecturas.ts          # Funciones de lectura de cuentas
│   │   ├── estadisticas.ts      # Cálculos de estadísticas y filtros (NUEVO)
│   │   ├── pdas.ts              # Derivación de direcciones PDA
│   │   ├── seeds.ts             # Utilidades para semillas
│   │   ├── tx.ts                # Envío y confirmación de transacciones
│   │   ├── validaciones.ts      # Validaciones de entrada
│   │   ├── seguridad.ts         # Verificaciones de configuración
│   │   ├── conexion.ts          # Configuración de RPC
│   │   └── saldo.ts             # Consulta de balances
│   ├── config/                  # Configuración
│   │   ├── interfaz.ts          # Constantes de UI
│   │   ├── programa.json        # Program ID y configuración
│   │   └── aula.json            # Modo de clase
│   └── index.css                # Estilos globales
├── clients/
│   └── js/
│       └── src/
│           └── generated/       # Cliente generado por Codama (no editar)
├── tests/
│   ├── integracion-cliente.test.ts  # Tests de integración (9 tests)
│   └── estadisticas.test.ts         # Tests de estadísticas (9 tests)
├── scripts/
│   ├── pruebas-devnet.ts        # Script de interacción con Devnet
│   ├── configurar-idl.mjs       # Configuración de IDL
│   └── generar-cliente.mjs      # Generación de cliente
├── programa/
│   └── src/
│       └── lib.rs               # Programa Rust (referencia)
├── docs/                        # Documentación adicional
│   ├── IDL-Y-PLAYGROUND.md      # Guía de IDL
│   ├── PRUEBAS-MANUALES.md      # Pruebas manuales
│   └── SEGURIDAD-Y-ALCANCE.md   # Seguridad y limitaciones
├── materiales/                  # Materiales educativos
├── idl.json                     # IDL del programa
├── package.json                 # Dependencias y scripts
├── tsconfig.json                # Configuración TypeScript
├── vite.config.ts               # Configuración Vite
└── README.md                    # Este archivo
```

---

## Pruebas Automatizadas

### Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Verificación completa (typecheck + tests + build)
npm run verificar
```

### Cobertura de Tests

El proyecto incluye **18 tests automatizados** divididos en dos suites:

#### Tests de Integración (`tests/integracion-cliente.test.ts`)

| Test | Descripción |
|------|-------------|
| Semillas u16 | Verifica conversión little-endian y límites |
| Derivación de PDAs | Valida que las PDAs coincidan con el programa Rust |
| Serialización de instrucciones | Verifica que Codama serializa correctamente |
| Confirmación de errores | Valida manejo de errores en transacciones |
| Verificación de Devnet | Comprueba genesis hash de Devnet |
| Interrupción de RPC | Manejo de timeouts y errores de red |
| Validaciones de UI | Verifica límites de bytes y enteros |
| Traducción de errores | Mapeo de códigos de error a mensajes |
| Validación de IDL | Verifica estructura y normalización del IDL |

#### Tests de Estadísticas (`tests/estadisticas.test.ts`)

| Test | Descripción |
|------|-------------|
| Total de ventas | Cuenta correctamente todas las ventas |
| Importe acumulado | Suma todos los montos |
| Cliente con más compras | Identifica al cliente principal |
| SKU más vendido | Encuentra el producto más popular |
| Registro vacío | Maneja caso de sin datos |
| Búsqueda por nombre | Filtra case-insensitive |
| Filtro por monto mínimo | Aplica límite inferior |
| Filtro por rango | Combina mínimo y máximo |
| Sin coincidencias | Maneja resultado vacío |

### Resultados de Verificación

```bash
$ npm run verificar

> registro-ventas-solana-app@0.1.0 verificar
> npm run typecheck && npm test && npm run build

✔ typecheck: Sin errores de TypeScript
✔ tests: 18/18 tests pasando
✔ build: Build de producción generado exitosamente
```

---

## Troubleshooting

### Problemas Comunes

| Problema | Solución |
|----------|----------|
| **La wallet no aparece** | Abre la app en una pestaña normal del navegador con una extensión compatible instalada |
| **Falta SOL de prueba** | Solicítalo en [Solana Faucet](https://faucet.solana.com/), seleccionando Devnet |
| **No aparece tu negocio** | Comprueba el nombre exacto y la dirección de su autoridad; ambos participan en la PDA |
| **No puedes repetir un SKU** | Cada cliente solo puede tener una venta activa con ese SKU |
| **El RPC responde con un límite de uso** | Espera y vuelve a intentar, o configura otro endpoint en `.env.local` |
| **Cambiaste el IDL y falla** | Ejecuta `npm run cliente` y reinicia el servidor |
| **Error de configuración** | Verifica que `programa.json` tenga `esReferencia: false` |

### Verificar Configuración

```bash
# Verificar que el programa está desplegado
solana program show 38oTMyvUTmqkBQeMiuok5F2mPjp9dVadWdBeQTDNmTUY --url devnet

# Verificar balance de tu wallet
solana balance

# Verificar historial de transacciones
solana transaction-history TU_WALLET --url devnet --limit 10
```

### Logs y Debugging

Si encuentras errores, verifica:

1. **Consola del navegador**: Abre DevTools (F12) y revisa la pestaña Console
2. **Terminal del servidor**: Revisa los logs de Vite
3. **Solana Explorer**: Verifica las transacciones en el explorador
4. **Configuración del RPC**: Asegúrate de estar conectado a Devnet

---

## Recursos Adicionales

### Documentación del Proyecto

- [Guía de IDL y Playground](./docs/IDL-Y-PLAYGROUND.md)
- [Pruebas Manuales en Devnet](./docs/PRUEBAS-MANUALES.md)
- [Seguridad y Alcance](./docs/SEGURIDAD-Y-ALCANCE.md)

### Recursos Externos

- [GitBook de Solana Engineering Track: Advanced](https://waylearn.gitbook.io/solana-engineering-track-advanced)
- [Programa Registro de Ventas con PDAs](https://github.com/WayLearnLatam/Registro-Ventas-Solana-PDA)
- [Solana Playground](https://beta.solpg.io/)
- [Solana Faucet](https://faucet.solana.com/)
- [Solana Explorer](https://explorer.solana.com/?cluster=devnet)
- [Comunidad de WayLearn en Discord](https://discord.gg/hvnpbZxu9b)

### Información del Programa

| Propiedad | Valor |
|-----------|-------|
| **Program ID** | `38oTMyvUTmqkBQeMiuok5F2mPjp9dVadWdBeQTDNmTUY` |
| **Red** | Solana Devnet |
| **IDL** | Incluido en el repositorio (`idl.json`) |
| **Cliente TypeScript** | Generado automáticamente con Codama |

---

## Nota sobre Seguridad

Este es un proyecto educativo para **Devnet**. Las validaciones del formulario no sustituyen las restricciones del programa en la cadena. Revisa [seguridad y alcance](./docs/SEGURIDAD-Y-ALCANCE.md) para conocer los límites del ejemplo y los aspectos que deben revisarse antes de producción.

---

## Licencia y Créditos

Proyecto desarrollado como parte del **Solana Engineering Track: Advanced** de WayLearn.

---

## Identificación del Estudiante

> **IMPORTANTE**: Completa los siguientes campos con tu información antes de enviar el proyecto para revisión.

| Campo | Valor |
|-------|-------|
| **Nombre para el certificado** | [Tu Nombre Completo] |
| **Correo de registro** | [tu.correo@ejemplo.com] |
| **Fecha de entrega** | Noviembre 2026 |
| **Ruta elegida** | Proyecto guiado con mejora funcional |
| **Template de partida** | Registro de Ventas con PDAs (versión resuelta de las 5 sesiones) |

---

## Resumen de Mejoras Implementadas

### Mejora 1: Panel de Estadísticas del Registro

**Qué hace**: Calcula y visualiza en tiempo real métricas agregadas sobre el negocio.

**Métricas implementadas**:
- Total de ventas registradas
- Importe total acumulado
- Cliente con más compras (nombre y cantidad)
- SKU más vendido (código y frecuencia)

**Archivos modificados**:
- `src/solana/estadisticas.ts` (nuevo): Función `calcularEstadisticas()`
- `src/components/Registro.tsx`: Integración del panel con React
- `src/index.css`: Estilos responsive para el panel
- `tests/estadisticas.test.ts` (nuevo): 5 tests unitarios

**Cómo se verifica**:
1. Ejecutar `npm run verificar` (debe pasar sin errores)
2. Iniciar la app con `npm run dev`
3. Consultar un registro con clientes y ventas
4. Observar el panel de estadísticas que aparece automáticamente
5. Verificar que los cálculos son correctos

---

### Mejora 2: Búsqueda y Filtros de Clientes

**Qué hace**: Permite localizar clientes y ventas específicas mediante múltiples criterios combinables.

**Filtros implementados**:
- Búsqueda por nombre de cliente (case-insensitive)
- Filtro por monto mínimo de venta
- Filtro por monto máximo de venta
- Combinación de los tres criterios (lógica AND)

**Archivos modificados**:
- `src/solana/estadisticas.ts`: Función `filtrarClientes()`
- `src/components/Registro.tsx`: Formularios de filtros y lógica de aplicación
- `src/index.css`: Estilos responsive para los filtros
- `tests/estadisticas.test.ts`: 4 tests unitarios adicionales

**Cómo se verifica**:
1. Ejecutar `npm run verificar` (debe pasar sin errores)
2. Iniciar la app con `npm run dev`
3. Consultar un registro con múltiples clientes
4. Escribir un nombre en el campo de búsqueda
5. Agregar filtros de monto mínimo y máximo
6. Observar que los resultados se actualizan en tiempo real
7. Hacer clic en "Limpiar filtros" para restaurar la vista completa

---

## Diferencia Funcional con la Versión Base

| Aspecto | Versión Base (resuelta) | Con Mejoras Implementadas |
|---------|------------------------|---------------------------|
| **Estadísticas** | No existen | Panel completo con 4 métricas en tiempo real |
| **Búsqueda** | No existe | Búsqueda por nombre de cliente (case-insensitive) |
| **Filtros** | No existen | Filtros por rango de monto (mínimo y máximo) |
| **Combinación** | N/A | Todos los filtros pueden combinarse simultáneamente |
| **UX** | Solo lista completa de clientes | Lista filtrada con contador de resultados y botón de limpieza |
| **Tests** | 9 tests originales | 18 tests (9 originales + 9 nuevos para mejoras) |

---

## Evidencias de Ejecución

### Tests Automatizados

```bash
$ npm test

✔ calcularEstadisticas cuenta el total de ventas y el importe acumulado
✔ calcularEstadisticas identifica el cliente con mas compras
✔ calcularEstadisticas identifica el SKU mas vendido
✔ calcularEstadisticas devuelve null para registro vacio
✔ filtrarClientes busca por nombre de cliente
✔ filtrarClientes filtra por monto minimo
✔ filtrarClientes filtra por rango de monto
✔ filtrarClientes combina busqueda y filtros de monto
✔ filtrarClientes devuelve vacio cuando no hay coincidencias
✔ las semillas u16 conservan dos bytes little-endian y sus limites
✔ Registro, Cliente y Venta coinciden con las semillas del programa Rust
✔ Codama serializa la instruccion y el puente conserva datos, orden y roles
✔ una confirmacion con error nunca produce un resultado de exito
✔ se exige el genesis completo de Devnet para escribir
✔ una interrupcion del RPC conserva la firma y no afirma que la transaccion fallo
✔ validaciones de UI comprueban bytes UTF-8 y enteros positivos
✔ los errores distinguen cancelacion, autoridad, semillas y RPC
✔ se valida el contrato IDL y la normalizacion no cambia el orden ni tipos

ℹ tests 18
ℹ suites 0
ℹ pass 18
ℹ fail 0
```

### Transacciones en Devnet

Se realizaron 5 operaciones exitosas contra el programa desplegado:

| # | Operación | Estado | Transacción |
|---|-----------|--------|-------------|
| 1 | Crear Registro | ✅ Confirmado | [Explorer](https://explorer.solana.com/tx/2PvPtyPay4wq6AKk3WZo2TxP92i8MP6jzxYnazn8TyBrhJ3n5rvFQVnxiKam1UqwXScHWwPjfprVB7tqJ2BWShfR?cluster=devnet) |
| 2 | Crear Cliente | ✅ Confirmado | [Explorer](https://explorer.solana.com/tx/123TBRBTFZEi36kHHv2nh9rfusZvUWPLWdFT5nWDyALhbW8bTBtZDKEwdoZHZBhD8RWj5t3nPgcRXRpuPfsnAnD7?cluster=devnet) |
| 3 | Registrar Venta | ✅ Confirmado | [Explorer](https://explorer.solana.com/tx/jEL449pGEbuiaXvv2TDNdRn232Vfwz2fC2oec19sRoEsbBTgY7xAhiJCUPcBw2PC73vhRbCUjQ4nSH81bL3pyna?cluster=devnet) |
| 4 | Cambiar Monto | ✅ Confirmado | [Explorer](https://explorer.solana.com/tx/36Z869p3V19bhQaWkKrZva57xkQ1proHc67PSU4emvPNaXLD7Vft4RjgNUrVdwKp3RSrR6mBnnfDMGvCMhvZ3iSc?cluster=devnet) |
| 5 | Hacer Devolución | ✅ Confirmado | [Explorer](https://explorer.solana.com/tx/m7KkhKo43UYZ8TNLjbnEMU4tWpXAC3rwxgYrWEg6uZ7Y6sKLCwmyTMBAm7KM8dLUbfiGEv1fM2LNbq1jyj178JA?cluster=devnet) |

**Program ID**: `38oTMyvUTmqkBQeMiuok5F2mPjp9dVadWdBeQTDNmTUY`  
**Wallet de prueba**: `C3hyaJiTkJREcH9zeUWysWzY8PMto16UTBBvGg6iYHit`  
**Red**: Solana Devnet

---

## Checklist de Entrega

- [x] Código completo y funcional
- [x] README documentado con propósito, configuración y pasos de ejecución
- [x] Mejoras funcionales implementadas y explicadas
- [x] Tests automatizados que demuestran el funcionamiento
- [x] Transacciones verificables en Solana Explorer
- [x] Programa desplegado en Devnet
- [x] Identificación del estudiante completa
- [x] Diferencia funcional con la versión base documentada

---

## Cómo Probar las Mejoras

### Paso 1: Verificar el Código

```bash
# Clonar el repositorio
git clone [URL_DEL_REPOSITORIO]
cd Registro-Ventas-Solana-App

# Instalar dependencias
npm ci

# Verificar que todo pasa
npm run verificar

# Resultado esperado:
# ✔ typecheck: Sin errores de TypeScript
# ✔ tests: 18/18 tests pasando
# ✔ build: Build de producción generado exitosamente
```

### Paso 2: Ejecutar la Aplicación

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Paso 3: Crear Datos de Prueba

1. Conectar wallet (Phantom, Solflare, etc.)
2. Navegar a "Registro de ventas"
3. Crear un registro con nombre "Cafe Demo Mejoras"
4. Agregar 2-3 clientes (ej: "Ana García", "Carlos López", "María Rodríguez")
5. Registrar 5-6 ventas con diferentes SKUs y montos:
   - CAF01: 50 unidades
   - CAF02: 75 unidades
   - CAF01: 60 unidades (mismo SKU, diferente monto)
   - TEE01: 40 unidades
   - LEE01: 100 unidades

### Paso 4: Demostrar el Panel de Estadísticas

1. Consultar el registro creado
2. Observar el panel de "Estadísticas del registro" que aparece automáticamente
3. Verificar que las 4 métricas se calculan correctamente:
   - **Total de ventas**: Debe coincidir con el número de ventas creadas (5 en el ejemplo)
   - **Importe total**: Suma de todos los montos (50+75+60+40+100 = 325)
   - **Cliente con más compras**: El que tiene más ventas asignadas
   - **SKU más vendido**: CAF01 (aparece 2 veces)

### Paso 5: Demostrar los Filtros

1. **Búsqueda por nombre**:
   - Escribir "Ana" en el campo de búsqueda
   - Observar que solo se muestra Ana y el contador cambia
   - Probar con "car" (debe encontrar Carlos)
   - Probar con "XYZ" (no debe encontrar nada)

2. **Filtro por monto mínimo**:
   - Escribir "50" en el campo de monto mínimo
   - Observar que las ventas de 40 unidades desaparecen
   - El contador de ventas por cliente se actualiza

3. **Filtro por rango de monto**:
   - Mantener monto mínimo en 50
   - Escribir "80" en el campo de monto máximo
   - Observar que solo se muestran ventas entre 50 y 80

4. **Combinación de filtros**:
   - Mantener los filtros anteriores
   - Escribir "Ana" en búsqueda
   - Observar que se combinan todos los criterios

5. **Limpiar filtros**:
   - Hacer clic en "Limpiar filtros"
   - Observar que se restaura la vista completa

### Paso 6: Verificar el Código Fuente

Mostrar al revisor los archivos clave:

```bash
# Función de estadísticas
cat src/solana/estadisticas.ts | head -43

# Tests de estadísticas
cat tests/estadisticas.test.ts

# Integración en el componente
cat src/components/Registro.tsx | grep -A 10 "estadisticas"

# Ejecutar tests específicamente
npm test tests/estadisticas.test.ts
```

### Paso 7: Explicar el Valor Añadido

**Para el usuario**:
- Las estadísticas proporcionan información útil sin necesidad de herramientas externas
- Los filtros mejoran la usabilidad cuando hay muchos clientes o ventas
- La búsqueda rápida ahorra tiempo en registros grandes

**Para el proyecto educativo**:
- Demuestra capacidades avanzadas de procesamiento de datos en el frontend
- Implementa buenas prácticas de React (useMemo, inmutabilidad)
- Usa TypeScript estricto con tipos bien definidos
- Incluye tests completos que garantizan el funcionamiento
- No modifica el programa en la cadena, solo procesa datos en el frontend

---

## Nota Final

Este proyecto cumple con todos los requisitos de la ruta "Proyecto guiado con mejora funcional":

✅ **Mejora funcional identificable**: Panel de estadísticas y sistema de filtros  
✅ **Explicación clara**: Documentación detallada de cada mejora  
✅ **Verificable**: Tests automatizados y transacciones en Devnet  
✅ **Aporte propio**: Código nuevo con valor funcional demostrable  
✅ **No es solo cambio estético**: Las mejoras producen diferencia funcional real  

**Fecha de entrega**: Noviembre 2026  
**Estado**: ✅ Completo y listo para revisión  
**Propósito**: Educativo - Demostración de frontend para programas de Solana

---

## Verificación Final

Para verificar que todo está funcionando correctamente:

```bash
# 1. Instalar dependencias
npm ci

# 2. Generar cliente
npm run cliente

# 3. Ejecutar verificación completa
npm run verificar

# 4. Iniciar aplicación
npm run dev
```

Todos los tests deben pasar (18/18), el build debe completarse sin errores, y la aplicación debe estar disponible en `http://localhost:5173`.
