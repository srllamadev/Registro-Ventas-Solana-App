import { createSignerFromKeyPair, generateKeyPairSigner, address, createSolanaRpc, transaction, setTransactionMessageFeePayerSigner, setTransactionMessageLifetimeUsingBlockhash, appendTransactionMessageInstruction } from '@solana/kit';
import { readFile } from 'node:fs/promises';
import { createNoopSigner } from '@solana/kit';
import { PublicKey, Keypair } from '@solana/web3.js';
import {
  getCrearRegistroInstruction,
  getCrearClienteInstruction,
  getRegistrarVentaInstruction,
  getCambiarMontoInstruction,
  getHacerDevolucionInstruction,
  REGISTRO_PROGRAM_ADDRESS,
  fetchMaybeRegistro,
  fetchAllCliente,
  fetchAllVenta,
} from '../clients/js/src/generated/index.js';

const ENDPOINT = 'https://api.devnet.solana.com';
const rpc = createSolanaRpc(ENDPOINT);

async function cargarWallet() {
  const keypairPath = process.env.HOME + '/.config/solana/id.json';
  const secretKey = JSON.parse(await readFile(keypairPath, 'utf-8'));
  const keypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));
  console.log('Wallet:', keypair.publicKey.toBase58());
  return keypair;
}

function pdaRegistro(nombreNegocio, owner) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('registro'), Buffer.from(nombreNegocio), owner.toBuffer()],
    new PublicKey(REGISTRO_PROGRAM_ADDRESS)
  );
  return address(pda.toBase58());
}

function pdaCliente(registro, idCliente) {
  const idBuffer = Buffer.alloc(2);
  idBuffer.writeUInt16LE(idCliente);
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('cliente'), new PublicKey(registro).toBuffer(), idBuffer],
    new PublicKey(REGISTRO_PROGRAM_ADDRESS)
  );
  return address(pda.toBase58());
}

function pdaVenta(cliente, sku) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('venta'), new PublicKey(cliente).toBuffer(), Buffer.from(sku)],
    new PublicKey(REGISTRO_PROGRAM_ADDRESS)
  );
  return address(pda.toBase58());
}

async function leerRegistro(nombreNegocio, owner) {
  const direccion = pdaRegistro(nombreNegocio, new PublicKey(owner));
  const cuenta = await fetchMaybeRegistro(rpc, direccion);
  if (!cuenta.exists) return null;
  
  const clientes = await fetchAllCliente(rpc, cuenta.data.clientes);
  const conVentas = await Promise.all(
    clientes.map(async (c) => {
      const ventas = await fetchAllVenta(rpc, c.data.historial);
      return {
        idCliente: c.data.idCliente,
        nombre: c.data.nombre,
        compras: c.data.compras,
        ventas: ventas.map((v) => ({
          sku: v.data.sku,
          descripcion: v.data.descripcion,
          monto: v.data.monto,
        })),
      };
    })
  );
  
  return {
    nombreNegocio: cuenta.data.nombreNegocio,
    idCounter: cuenta.data.idCounter,
    clientes: conVentas,
  };
}

async function main() {
  const keypair = await cargarWallet();
  const ownerAddress = address(keypair.publicKey.toBase58());
  const nombreNegocio = 'Cafe CLI Test';
  
  console.log('\n=== OPERACIÓN 1: Crear Registro ===');
  try {
    const registro = pdaRegistro(nombreNegocio, keypair.publicKey);
    console.log('Dirección del registro:', registro);
    console.log('✓ Registro preparado');
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  console.log('\n=== OPERACIÓN 2: Leer datos existentes ===');
  try {
    const datos = await leerRegistro(nombreNegocio, keypair.publicKey);
    if (datos) {
      console.log('Registro encontrado:', datos.nombreNegocio);
      console.log('Clientes:', datos.clientes.length);
      console.log('Último ID:', datos.idCounter);
    } else {
      console.log('No existe registro con ese nombre');
    }
  } catch (error) {
    console.error('Error leyendo registro:', error.message);
  }
  
  console.log('\n=== Verificación del Programa ===');
  try {
    const programInfo = await rpc.getAccountInfo(address(REGISTRO_PROGRAM_ADDRESS)).send();
    if (programInfo.value) {
      console.log('✓ Programa desplegado en Devnet');
      console.log('Program ID:', REGISTRO_PROGRAM_ADDRESS);
      console.log('Ejecutable:', programInfo.value.executable);
    }
  } catch (error) {
    console.error('Error verificando programa:', error.message);
  }
}

main().catch(console.error);
