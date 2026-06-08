import {
  Contract,
  TransactionBuilder,
  BASE_FEE,
  Account,
  rpc,
  nativeToScVal,
  scValToNative,
} from '@stellar/stellar-sdk';
import { server, NETWORK_PASSPHRASE, CONTRACT_ID } from './stellar';

// A real, funded testnet account used ONLY as the source for read-only simulations.
const READ_SOURCE = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';

export interface LaroFundInfo {
  totalRevenuePerShare: number;
  userBalance: number;
  claimable: number;
}

export function contractConfigured(): boolean {
  return Boolean(CONTRACT_ID);
}

/** Read get_info() via simulation — no wallet or signature required. */
export async function readLaroFundInfo(user?: string): Promise<LaroFundInfo> {
  const contract = new Contract(CONTRACT_ID);
  const source = new Account(READ_SOURCE, '0');

  const userScVal = user 
    ? nativeToScVal(user, { type: 'address' }) 
    : nativeToScVal(null);

  const tx = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call('get_info', userScVal))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (!rpc.Api.isSimulationSuccess(sim) || !sim.result) {
    throw new Error('Could not read contract state. Is it deployed and initialised?');
  }

  // Returns [i128, i128, i128]
  const info = scValToNative(sim.result.retval) as [bigint, bigint, bigint];
  return { 
    totalRevenuePerShare: Number(info[0]), 
    userBalance: Number(info[1]), 
    claimable: Number(info[2]) 
  };
}

/**
 * Build `distribute(amount)` invocation.
 */
export async function buildDistributeXDR(
  sender: string,
  amount: number,
): Promise<string> {
  const contract = new Contract(CONTRACT_ID);
  const account = await server.getAccount(sender);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        'distribute',
        nativeToScVal(BigInt(Math.trunc(amount)), { type: 'i128' }),
      ),
    )
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (!rpc.Api.isSimulationSuccess(sim)) {
    throw new Error('Simulation failed — distribute call failed.');
  }

  return rpc.assembleTransaction(tx, sim).build().toXDR();
}

/**
 * Build `claim(user)` invocation.
 */
export async function buildClaimXDR(
  user: string,
): Promise<string> {
  const contract = new Contract(CONTRACT_ID);
  const account = await server.getAccount(user);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        'claim',
        nativeToScVal(user, { type: 'address' }),
      ),
    )
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (!rpc.Api.isSimulationSuccess(sim)) {
    throw new Error('Simulation failed — claim call failed.');
  }

  return rpc.assembleTransaction(tx, sim).build().toXDR();
}
