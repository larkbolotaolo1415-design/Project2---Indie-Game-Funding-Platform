import { Contract, TransactionBuilder, Account, BASE_FEE, rpc, nativeToScVal } from '@stellar/stellar-sdk';
const CONTRACT_ID = 'CCR5FQJA3IDXNDLZMZURWF3QYGKN3PDY3MM4SWB7AXNOW6DYMI3PAUER';
const source = new Account('GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5', '0');
const server = new rpc.Server('https://soroban-testnet.stellar.org');
const tx = new TransactionBuilder(source, { fee: BASE_FEE, networkPassphrase: 'Test SDF Network ; September 2015' })
  .addOperation(new Contract(CONTRACT_ID).call('get_info', nativeToScVal(null)))
  .setTimeout(30)
  .build();
const sim = await server.simulateTransaction(tx);
console.log('sim success', rpc.Api.isSimulationSuccess(sim));
console.log(JSON.stringify(sim, null, 2));
