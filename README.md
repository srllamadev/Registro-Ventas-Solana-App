# Registro de Ventas · Aplicación Frontend

![Registro de Ventas · App — Solana, TypeScript y React](./images/banner-app.png)

Aplicación frontend educativa desarrollada con **TypeScript y React** para interactuar con el programa [Registro de Ventas con PDAs](https://github.com/WayLearnLatam/Registro-Ventas-Solana-PDA) en **Solana Devnet**.

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

Este proyecto incluye dos mejoras funcionales sobre la versión base:

#### 1. Panel de Estadísticas del Registro

Calcula y muestra en tiempo real métricas útiles sobre el negocio:

| Métrica | Descripción |
|---------|-------------|
| **Total de ventas** | Número acumulado de ventas activas en el registro |
| **Importe total** | Suma de todos los montos registrados |
| **Cliente con más compras** | Identifica al cliente que más ventas tiene |
| **SKU más vendido** | El producto con más registros en el historial |

**Implementación técnica**:
- Función `calcularEstadisticas()` en `src/solana/estadisticas.ts:1-43`
- Los cálculos se ejecutan en el frontend sobre los datos leídos del programa
- No modifica la cadena, solo procesa datos ya cargados

#### 2. Búsqueda y Filtros de Clientes

Permite localizar clientes y ventas específicas mediante múltiples criterios:

| Filtro | Descripción |
|--------|-------------|
| **Búsqueda por nombre** | Filtra clientes cuyo nombre contenga el término (case-insensitive) |
| **Monto mínimo** | Muestra solo ventas con importe igual o superior al valor indicado |
| **Monto máximo** | Muestra solo ventas con importe igual o inferior al valor indicado |
| **Combinación** | Los tres criterios pueden usarse simultáneamente |

**Implementación técnica**:
- Función `filtrarClientes()` en `src/solana/estadisticas.ts:45-70`
- El filtrado se aplica en el frontend sobre los datos ya cargados
- No realiza lecturas adicionales al RPC
- Botón "Limpiar filtros" para restaurar la vista completa

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

**Desarrollado por**: [Tu Nombre]  
**Fecha**: Noviembre 2026  
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
