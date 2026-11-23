import type { RegistroUI } from "./lecturas";

export type Estadisticas = {
  totalVentas: number;
  importeTotal: number;
  clienteConMasCompras: { nombre: string; compras: number } | null;
  skuMasVendido: { sku: string; cantidad: number } | null;
};

export function calcularEstadisticas(registro: RegistroUI): Estadisticas {
  const todosLosSkus: { sku: string; descripcion: string; monto: number }[] = [];
  let totalVentas = 0;
  let importeTotal = 0;
  let clienteTop: { nombre: string; compras: number } | null = null;

  for (const cliente of registro.clientes) {
    if (!clienteTop || cliente.compras > clienteTop.compras) {
      clienteTop = { nombre: cliente.nombre, compras: cliente.compras };
    }
    for (const venta of cliente.ventas) {
      todosLosSkus.push({ sku: venta.sku, descripcion: venta.descripcion, monto: venta.monto });
      totalVentas++;
      importeTotal += venta.monto;
    }
  }

  const skuContador = new Map<string, { sku: string; cantidad: number }>();
  for (const venta of todosLosSkus) {
    const actual = skuContador.get(venta.sku) ?? { sku: venta.sku, cantidad: 0 };
    skuContador.set(venta.sku, { sku: venta.sku, cantidad: actual.cantidad + 1 });
  }

  let skuTop: { sku: string; cantidad: number } | null = null;
  for (const entrada of skuContador.values()) {
    if (!skuTop || entrada.cantidad > skuTop.cantidad) {
      skuTop = entrada;
    }
  }

  return { totalVentas, importeTotal, clienteConMasCompras: clienteTop, skuMasVendido: skuTop };
}

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
      const coincideNombre = !termino || cliente.nombre.toLowerCase().includes(termino);
      const ventasFiltradas = cliente.ventas.filter((venta) => {
        if (montoMin !== null && venta.monto < montoMin) return false;
        if (montoMax !== null && venta.monto > montoMax) return false;
        return true;
      });
      if (coincideNombre && (!tieneFiltroMonto || ventasFiltradas.length > 0)) {
        return { ...cliente, ventas: ventasFiltradas, compras: ventasFiltradas.length };
      }
      return null;
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  return {
    ...registro,
    clientes: clientesFiltrados,
  };
}
