import React, {useEffect, useState, useCallback} from 'react'
import NoSSR from 'react-no-ssr'
import axios from 'axios'

import classes from './App.css'

// Note: when working in dev mode, set "bypass network" in chrome

type BitcoinInfoData = {
  bpi: {
    EUR: {
      rate: number,
    },
  },
  time: {
    updated: number,
  }
}

type State = {
  loading: boolean,
  error: any,
  data: BitcoinInfoData | null,
}

const getInitialState = (): State => ({
  loading: false,
  error: null,
  data: null,
})

const useLoadBitcoinInfo = () => {
  const [state, setState] = useState(getInitialState())

  const fetchData = useCallback(() => {
    setState((state) => ({...state, loading: true}))
    axios
      .get('https://api.coindesk.com/v1/bpi/currentprice.json')
      .then((response) => {
        setState({loading: false, data: response.data, error: null})
      })
      .catch((error) => {
        setState({loading: false, data: null, error})
      })
  }, [setState])

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => {
      fetchData()
    }, 10000)

    return () => {
      clearInterval(interval)
    }
  }, [fetchData])

  return state
}

const DEFAULT_LOCALE = 'en-US'

const language = process.browser
  ? window.navigator.language || DEFAULT_LOCALE
  : DEFAULT_LOCALE

const BitcoinInfo = () => {
  const {error, data} = useLoadBitcoinInfo()

  if (error) {
    return <div>Could not load bitcoin price ... </div>
  } else if (data !== null) {
    return (
      <div className={classes.bitcoinWrapper}>
        <div className={classes.bitcoinPrice}>{data.bpi.EUR.rate}&nbsp;EUR</div>
        <div className={classes.bitcoinDate}>
          {new Date(data.time.updated).toLocaleString(language)}
        </div>
      </div>
    )
  }
  return <div>Loading ...</div>
}

const useIsOffline = () => {
  const [offline, setIsOffline] = useState(!navigator.onLine)

  const onOffline = useCallback(() => setIsOffline(true), [setIsOffline])
  const onOnline = useCallback(() => setIsOffline(false), [setIsOffline])

  useEffect(() => {
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.addEventListener('offline', onOffline)
    }
  }, [onOffline, onOnline])

  return offline
}

const OfflineBar = () => {
  const offline = useIsOffline()
  return offline ? <p>You are offline ...</p> : null
}

const App = () => (
  <div className={classes.wrapper}>
    <BitcoinInfo />
    <NoSSR>
      <OfflineBar />
    </NoSSR>
    <div className={classes.bitcoinImgWrapper}>
      <img src="/bitcoin-logo.png" alt="bitcoin logo" />
    </div>
  </div>
)

export default App
