import { useContract } from '../web3-contracts'
import honeyFarm from '../abi/honeyfarm.json'
import multiWithdrawer from '../abi/multiwithdrawer.json'
import { getNetworkConfig } from '../networks'
import { serializeError } from 'eth-rpc-errors'
import { useWallet } from '../providers/Wallet'

export function useHarvestAll(ids, chainId) {
  const network = getNetworkConfig(chainId)
  const { account } = useWallet()
  const contract = useContract(network.honeyfarm, honeyFarm)
  const multiWithdrawerContract = useContract(
    network.multiWithdrawer,
    multiWithdrawer
  )
  return async () => {
    try {
      const approved = await contract.isApprovedForAll(
        account,
        network.multiWithdrawer
      )
      if (!approved) {
        await contract.setApprovalForAll(network.multiWithdrawer, true)
      }
      const res = await multiWithdrawerContract.withdrawRewardsFrom(ids)

      return res
    } catch (err) {
      serializeError(err)
    }
  }
}
