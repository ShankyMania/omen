import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Sidebar from '@/components/Sidebar'
import '../styles/globals.css'

const NO_SIDEBAR = ['/login']

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const showSidebar = !NO_SIDEBAR.includes(router.pathname)

  return (
    <>
      <Head>
        <title>OMEN — Web Vulnerability Scanner</title>
        <meta name="description" content="Intelligent web vulnerability scanner with AI remediation" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {showSidebar ? (
        <div className="min-h-screen" style={{ backgroundColor: '#111113' }}>
          <Sidebar />
          {/*
            Desktop: ml-64 to clear the fixed sidebar
            Mobile:  ml-0 + pt-14 to clear the fixed top bar
          */}
          <div className="lg:ml-64 pt-14 lg:pt-0 min-h-screen overflow-x-hidden">
            <Component {...pageProps} />
          </div>
        </div>
      ) : (
        <Component {...pageProps} />
      )}
    </>
  )
}
