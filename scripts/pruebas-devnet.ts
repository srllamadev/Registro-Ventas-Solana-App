import '../src/polyfills';
import { readFileSync, writeFileSync } from 'node:fs';
import { PublicKey, Connection, Keypair } from '@solana/web3.js';
import { address, createNoopSigner } from '@solana/kit';
import {
  getCrearRegistroInstruction,
  getCrearClienteInstruction,
  getRegistrarVentaInstruction,
  getCambiarMontoInstruction,
  getHacerDevolucionInstruction,
  REGISTRO_PROGRAM_ADDRESS,
} from '../clients/js/src/generated';
import { pdaRegistro, pdaCliente, pdaVenta } from '../src/solana/pdas';
import { AccountRole } from '@solana/kit';
import { Transaction, TransactionInstruction } from '@solana/web3.js';

function aWeb3(ix: any): TransactionInstruction {
  const keys = (ix.accounts ?? []).map((cuenta: any) => ({
    pubkey: new PublicKey(cuenta.address),
    isSigner: cuenta.role === AccountRole.READONLY_SIGNER || cuenta.role === AccountRole.WRITABLE_SIGNER,
    isWritable: cuenta.role === AccountRole.WRITABLE || cuenta.role === AccountRole.WRITABLE_SIGNER,
  }));
  return new TransactionInstruction({
    programId: new PublicKey(ix.programAddress),
    keys,
    data: Buffer.from(new Uint8Array(ix.data ?? [])),
  });
}

const ENDPOINT = 'https://api.devnet.solana.com';
const connection = new Connection(ENDPOINT, 'confirmed');

async function cargarWallet(): Promise<Keypair> {
  const keypairPath = process.env.HOME + '/.config/solana/id.json';
  const secretKey = JSON.parse(readFileSync(keypairPath, 'utf-8'));
  const keypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));
  return keypair;
}

async function enviarInstruccion(ix: any, keypair: Keypair): Promise<string> {
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
  const tx = new Transaction({ feePayer: keypair.publicKey, blockhash, lastValidBlockHeight });
  tx.add(aWeb3(ix));
  const firma = await connection.sendTransaction(tx, [keypair], { preflightCommitment: 'confirmed' });
  await connection.confirmTransaction({ signature: firma, blockhash, lastValidBlockHeight }, 'confirmed');
  return firma;
}

async function main() {
  const keypair = await cargarWallet();
  console.log('\n========================================');
  console.log('INTERACCIÓN CON EL CONTRATO EN DEVNET');
  console.log('========================================');
  console.log('Wallet:', keypair.publicKey.toBase58());
  console.log('Program ID:', REGISTRO_PROGRAM_ADDRESS);
  
  const balance = await connection.getBalance(keypair.publicKey);
  console.log('Balance:', balance / 1e9, 'SOL');
  
  console.log('\n=== VERIFICACIÓN: Programa desplegado ===');
  const programInfo = await connection.getAccountInfo(new PublicKey(REGISTRO_PROGRAM_ADDRESS));
  if (programInfo?.executable) {
    console.log('✓ Programa ejecutable en Devnet');
    console.log('  Balance del programa:', programInfo.lamports / 1e9, 'SOL');
  } else {
    console.log('✗ Programa no encontrado');
    return;
  }
  
  const nombreNegocio = 'Cafe CLI Test ' + Date.now().toString().slice(-6);
  const ownerAddress = address(keypair.publicKey.toBase58());
  const registroPda = pdaRegistro(nombreNegocio, ownerAddress);
  
  console.log('\n=== OPERACIÓN 1: Crear Registro ===');
  console.log('Nombre del negocio:', nombreNegocio);
  console.log('Dirección PDA:', registroPda);
  
  const ownerSigner = createNoopSigner(ownerAddress);
  
  const ix1 = getCrearRegistroInstruction({
    owner: ownerSigner,
    registro: registroPda,
    nombreNegocio,
  });
  
  try {
    const firma1 = await enviarInstruccion(ix1, keypair);
    console.log('✓ Registro creado');
    console.log('  Transacción:', firma1);
    console.log('  Explorer: https://explorer.solana.com/tx/' + firma1 + '?cluster=devnet');
  } catch (error: any) {
    console.error('Error creando registro:', error.message);
    return;
  }
  
  console.log('\n=== OPERACIÓN 2: Crear Cliente ===');
  const idCliente = 1;
  const clientePda = pdaCliente(registroPda, idCliente);
  console.log('ID Cliente:', idCliente);
  console.log('Dirección PDA:', clientePda);
  
  const ix2 = getCrearClienteInstruction({
    owner: ownerSigner,
    registro: registroPda,
    cliente: clientePda,
    nombre: 'Ana García',
  });
  
  try {
    const firma2 = await enviarInstruccion(ix2, keypair);
    console.log('✓ Cliente creado: Ana García');
    console.log('  Transacción:', firma2);
  } catch (error: any) {
    console.error('Error creando cliente:', error.message);
    return;
  }
  
  console.log('\n=== OPERACIÓN 3: Registrar Venta ===');
  const sku = 'CAF01';
  const ventaPda = pdaVenta(clientePda, sku);
  console.log('SKU:', sku);
  console.log('Dirección PDA:', ventaPda);
  
  const ix3 = getRegistrarVentaInstruction({
    owner: ownerSigner,
    registro: registroPda,
    cliente: clientePda,
    venta: ventaPda,
    idCliente,
    sku,
    descripcion: 'Café Americano Grande',
    monto: 75,
  });
  
  try {
    const firma3 = await enviarInstruccion(ix3, keypair);
    console.log('✓ Venta registrada');
    console.log('  SKU:', sku, '| Monto:', 75, 'unidades');
    console.log('  Transacción:', firma3);
  } catch (error: any) {
    console.error('Error registrando venta:', error.message);
    return;
  }
  
  console.log('\n=== OPERACIÓN 4: Cambiar Monto ===');
  const nuevoMonto = 85;
  console.log('SKU:', sku, '| Nuevo monto:', nuevoMonto);
  
  const ix4 = getCambiarMontoInstruction({
    owner: ownerSigner,
    registro: registroPda,
    cliente: clientePda,
    venta: ventaPda,
    idCliente,
    sku,
    nuevoMonto,
  });
  
  try {
    const firma4 = await enviarInstruccion(ix4, keypair);
    console.log('✓ Monto actualizado:', nuevoMonto, 'unidades');
    console.log('  Transacción:', firma4);
  } catch (error: any) {
    console.error('Error cambiando monto:', error.message);
    return;
  }
  
  console.log('\n=== OPERACIÓN 5: Hacer Devolución ===');
  console.log('SKU:', sku);
  
  const ix5 = getHacerDevolucionInstruction({
    owner: ownerSigner,
    registro: registroPda,
    cliente: clientePda,
    venta: ventaPda,
    idCliente,
    sku,
  });
  
  try {
    const firma5 = await enviarInstruccion(ix5, keypair);
    console.log('✓ Devolución procesada');
    console.log('  La cuenta de venta ha sido cerrada');
    console.log('  Transacción:', firma5);
  } catch (error: any) {
    console.error('Error haciendo devolución:', error.message);
    return;
  }
  
  console.log('\n========================================');
  console.log('RESUMEN DE OPERACIONES');
  console.log('========================================');
  console.log('1. ✓ Registro creado:', nombreNegocio);
  console.log('2. ✓ Cliente creado: Ana García (ID 1)');
  console.log('3. ✓ Venta registrada: CAF01 (75 unidades)');
  console.log('4. ✓ Monto actualizado: 85 unidades');
  console.log('5. ✓ Devolución procesada');
  console.log('\nTodas las transacciones están verificables en Solana Explorer.');
  console.log('========================================\n');
}

main().catch((error) => {
  console.error('Error fatal:', error);
  process.exit(1);
});
