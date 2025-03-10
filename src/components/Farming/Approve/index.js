import React, { useState, useRef } from 'react'
import { Button, TransactionProgress } from '@1hive/1hive-ui'
import { useApprove } from '../../../hooks/useApprove'
import { getNetworkConfig } from '../../../networks'
import { useWallet } from 'use-wallet'

const Approve = props => {
  const {
    _web3ReactContext: { chainId },
  } = useWallet()
  const [visible, setVisible] = useState(false)
  const [txHash, setTxHash] = useState('')
  const opener = useRef()
  const balanceToEth = props.amount.balance
  const approve = useApprove(props.token, balanceToEth, chainId)
  const network = getNetworkConfig(chainId)

  const transactionTime = new Date()
  transactionTime.setSeconds(transactionTime.getSeconds() + 8)

  const handleApprove = () => {
    approve()
      .then(x => {
        if (x) {
          setVisible(true)
          setTxHash(x.hash)
          x.wait()
            .then(() => {
              setVisible(false)
            })
            .catch(err => {
              props.onError(err)
            })
        }
      })
      .catch(err => {
        props.onError(err)
      })
  }

  return (
    <>
      <Button
        css={`
          background: linear-gradient(90deg, #aaf5d4, #7ce0d6);
        `}
        label="Approve"
        wide
        onClick={handleApprove}
        ref={opener}
      />
      <TransactionProgress
        transactionHashUrl={network.txUrl + txHash}
        progress={1}
        visible={visible}
        endTime={transactionTime}
        onClose={() => setVisible(false)}
        opener={opener}
        slow={false}
      />
    </>
  )
}

export default Approve
