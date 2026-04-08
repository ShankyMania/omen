import { GetServerSideProps } from 'next'
import axios from 'axios'
import VulnTable from '@/components/VulnTable'
import { Vulnerability } from '@/types'

interface Props {
  scanId: string
  vulns: Vulnerability[]
  error?: string
}

export default function ScanDetail({ scanId, vulns, error }: Props) {
  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6">
        <div className="card">
          <h2 className="text-lg font-bold text-white mb-1">Scan #{scanId}</h2>
          <p className="text-zinc-500 text-sm">{vulns.length} vulnerabilities found</p>
        </div>
        {error ? (
          <p className="text-red-400 text-sm">{error}</p>
        ) : (
          <div className="card">
            <VulnTable vulns={vulns} showFix />
          </div>
        )}
      </main>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const scanId  = params?.id as string
  const apiBase = process.env.API_URL ?? 'http://localhost:4000'
  try {
    const res = await axios.get(`${apiBase}/api/scan/${scanId}/results`)
    return { props: { scanId, vulns: res.data } }
  } catch {
    return { props: { scanId, vulns: [], error: 'Failed to load scan results.' } }
  }
}
