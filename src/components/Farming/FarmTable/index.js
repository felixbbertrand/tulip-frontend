import React, { useState } from 'react'
import { DataView, textStyle, Button, GU, IconInfo } from '@1hive/1hive-ui'
import styled from 'styled-components'
import ReactTooltip from 'react-tooltip'
import PairName from '../PairName'
import RewardComponent from '../RewardComponent'
import Fuse from 'fuse.js'
import DepositModal from '../DepositModal'
import Loader from '../../Loader'
import Icon from '../../../assets/tulip/icon.svg'
import UT from '../../../assets/tulip/unknownToken.svg'
import { useWallet } from '../../../providers/Wallet'
import { getNetworkConfig } from '../../../networks'
import { buttonGrayCss, buttonGreenCss } from '../styles'
import { useFetchPoolInfo } from '../../../hooks/useFetchPoolInfo'

const FarmTable = props => {
  const {
    account,
    status,
    _web3ReactContext: { chainId },
  } = useWallet()

  let tokenImage = Icon
  let tokenName = 'xComb'
  const network = getNetworkConfig(chainId)

  if (network) {
    tokenImage = network.token.image
    tokenName = network.token.name
  }

  const [modalAction, setModalAction] = useState(false)
  const [modalData, setModalData] = useState({})
  const [imgObj2, setImgObj] = useState(null)
  const [rewardApy, setRewardApy] = useState(0)
  const { pairData, searchValue, balance } = props
  const poolInfo = useFetchPoolInfo()

  const pairs = pairData || []
  const fuse = new Fuse(pairs, {
    keys: [
      'pairInfo.token0.name',
      'pairInfo.token0.symbol',
      'pairInfo.token1.symbol',
      'pairInfo.token1.name',
    ],
  })

  const StyledTooltip = styled(ReactTooltip)`
    border-radius: 10px !important;
  `

  const isZeroBalance = pairAddress => {
    return (
      balance === null ||
      Number(balance[pairAddress]) === 0 ||
      balance.length === 0
    )
  }

  const buttonCss = pairAddress => {
    if (isZeroBalance(pairAddress)) {
      return buttonGrayCss
    }
    return buttonGreenCss
  }
  const results = fuse.search(searchValue)
  const handleModalActions = (e, img, rwdApy) => {
    const d = searchValue ? results : pairs
    const filtered = d.filter(data => {
      return data.pair === e.target.id
    })

    setImgObj(img)
    setRewardApy(rwdApy)
    // do nothing if balance is zero or data is not loaded
    if (filtered.length === 0 || isZeroBalance(e.target.id)) {
      return
    }

    setModalAction(true)
    setModalData({
      ...filtered[0],
      account,
      balance: balance[filtered[0].pair],
    })
  }

  const handleModalClose = () => {
    setModalAction(false)
  }

  if (pairs.length === 0 && status !== 'disconnected' && account) {
    return <Loader />
  }

  return (
    <div
      css={`
        ${textStyle('body2')};
        font-family: 'Overpass', sans-serif;
        font-weight: 300;
        font-size: 18px;
      `}
    >
      <DataView
        fields={[
          'Asset',
          'Rewards 24h',
          'Reward Yield 24h ',
          <span data-tip="Reward Yield 24h Annualized">
            <span>Reward Yield 1y </span>
            <IconInfo css="vertical-align: text-bottom" height="16px" />
            &nbsp;
          </span>,
          'Reward Asset',
          ' ',
        ]}
        css={`
          border-top: none;
          margin-bottom: 20px;
        `}
        emptyState={{
          default: {
            displayLoader: false,
            title: `${
              searchValue
                ? 'No results'
                : 'Connect your account to see the farms'
            }`,
            subtitle: null,
            illustration: (
              <img src={tokenImage} height={6 * GU} width={5.5 * GU} />
            ),
            clearLabel: null,
          },
          loading: {
            displayLoader: true,
            title: 'No data available.',
            subtitle: null,
            illustration: <Loader />,
            clearLabel: null,
          },
        }}
        entries={account ? (searchValue ? results : pairs) : []}
        header
        renderEntry={pool => {
          const customLabel = `${pool.pairInfo.token0.symbol} - ${pool.pairInfo.token1.symbol} LP`
          const token0Img = pool.pairInfo.token0.logoURI
            ? pool.pairInfo.token0.logoURI
            : UT
          const token1Img = pool.pairInfo.token1.logoURI
            ? pool.pairInfo.token1.logoURI
            : UT
          const imgObj = {
            pair1: token0Img,
            pair2: token1Img,
          }
          return [
            <PairName
              image={imgObj}
              name={customLabel}
              subheadline="Honeyswap"
            />,
            <p
              css={`
                padding-right: 15px;
              `}
            >
              {isFinite(pool.hsf24h) ? pool.hsf24h.toFixed(2) : 0}
            </p>,
            <p>
              {isFinite(pool.rewardApy24h) ? pool.rewardApy24h.toFixed(2) : 0}%
            </p>,
            <p>{isFinite(pool.rewardApy) ? pool.rewardApy.toFixed(2) : 0}%</p>,
            <RewardComponent image={tokenImage} name={tokenName} />,
            <React.Fragment>
              <StyledTooltip
                place="left"
                type="light"
                effect="solid"
                backgroundColor="#aaf5d4"
              />
              {isZeroBalance(pool.pair) ? (
                <div data-tip="In order to be able to Stake you need to be LP of this pair in Honeyswap">
                  <Button
                    disabled={isZeroBalance(pool.pair)}
                    css={buttonCss(pool.pair)}
                    id={pool.pair}
                    label="Stake"
                    onClick={e => {
                      handleModalActions(e, imgObj, pool.rewardApy, pool)
                    }}
                  />
                </div>
              ) : (
                <Button
                  disabled={isZeroBalance(pool.pair)}
                  css={buttonCss(pool.pair)}
                  id={pool.pair}
                  label="Stake"
                  onClick={e => {
                    handleModalActions(e, imgObj, pool.rewardApy, pool)
                  }}
                />
              )}
            </React.Fragment>,
          ]
        }}
      />
      <DepositModal
        modalAction={modalAction}
        handleModalClose={handleModalClose}
        tokenImg={imgObj2}
        data={modalData}
        poolInfo={poolInfo}
        rewardApy={rewardApy}
      />
    </div>
  )
}
export default FarmTable
