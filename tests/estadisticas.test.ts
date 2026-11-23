import '../src/polyfills';
import test from 'node:test';
import assert from 'node:assert/strict';
import { PublicKey } from '@solana/web3.js';
import { address } from '@solana/kit';
import { calcularEstadisticas, filtrarClientes } from '../src/solana/estadisticas';
import type { RegistroUI } from '../src/solana/lecturas';

const addr = (seed: number) => address(new PublicKey(new Uint8Array(32).fill(seed)).toBase58());

const fixture: RegistroUI = {
  direccion: addr(1),
  nombreNegocio: 'Cafe Test',
  idCounter: 2,
  clientes: [
    {
      direccion: addr(2),
      idCliente: 1,
      nombre: 'Ana',
      compras: 3,
      ventas: [
        { direccion: addr(3), sku: 'CAF01', descripcion: 'Cafe americano', monto: 50 },
        { direccion: addr(4), sku: 'CAF02', descripcion: 'Cafe latte', monto: 75 },
        { direccion: addr(5), sku: 'CAF01', descripcion: 'Cafe americano', monto: 60 },
      ],
    },
    {
      direccion: addr(6),
      idCliente: 2,
      nombre: 'Carlos',
      compras: 1,
      ventas: [
        { direccion: addr(7), sku: 'TEE01', descripcion: 'Te verde', monto: 40 },
      ],
    },
  ],
};

test('calcularEstadisticas cuenta el total de ventas y el importe acumulado', () => {
  const stats = calcularEstadisticas(fixture);
  assert.equal(stats.totalVentas, 4);
  assert.equal(stats.importeTotal, 225);
});

test('calcularEstadisticas identifica el cliente con mas compras', () => {
  const stats = calcularEstadisticas(fixture);
  assert.notEqual(stats.clienteConMasCompras, null);
  assert.equal(stats.clienteConMasCompras!.nombre, 'Ana');
  assert.equal(stats.clienteConMasCompras!.compras, 3);
});

test('calcularEstadisticas identifica el SKU mas vendido', () => {
  const stats = calcularEstadisticas(fixture);
  assert.notEqual(stats.skuMasVendido, null);
  assert.equal(stats.skuMasVendido!.sku, 'CAF01');
  assert.equal(stats.skuMasVendido!.cantidad, 2);
});

test('calcularEstadisticas devuelve null para registro vacio', () => {
  const vacio: RegistroUI = { ...fixture, clientes: [] };
  const stats = calcularEstadisticas(vacio);
  assert.equal(stats.totalVentas, 0);
  assert.equal(stats.importeTotal, 0);
  assert.equal(stats.clienteConMasCompras, null);
  assert.equal(stats.skuMasVendido, null);
});

test('filtrarClientes busca por nombre de cliente', () => {
  const filtrado = filtrarClientes(fixture, 'ana', null, null);
  assert.equal(filtrado.clientes.length, 1);
  assert.equal(filtrado.clientes[0].nombre, 'Ana');
});

test('filtrarClientes filtra por monto minimo', () => {
  const filtrado = filtrarClientes(fixture, '', 50, null);
  assert.equal(filtrado.clientes.length, 1);
  assert.equal(filtrado.clientes[0].nombre, 'Ana');
  assert.equal(filtrado.clientes[0].ventas.length, 3);
});

test('filtrarClientes filtra por rango de monto', () => {
  const filtrado = filtrarClientes(fixture, '', 45, 65);
  assert.equal(filtrado.clientes.length, 1);
  assert.equal(filtrado.clientes[0].nombre, 'Ana');
  assert.equal(filtrado.clientes[0].ventas.length, 2);
});

test('filtrarClientes combina busqueda y filtros de monto', () => {
  const filtrado = filtrarClientes(fixture, 'Ana', 50, 70);
  assert.equal(filtrado.clientes.length, 1);
  assert.equal(filtrado.clientes[0].nombre, 'Ana');
  assert.equal(filtrado.clientes[0].ventas.length, 2);
});

test('filtrarClientes devuelve vacio cuando no hay coincidencias', () => {
  const filtrado = filtrarClientes(fixture, 'NoExiste', null, null);
  assert.equal(filtrado.clientes.length, 0);
});
