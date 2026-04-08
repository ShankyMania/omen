export interface Vulnerability {
  vuln_id: number
  scan_id: number
  url: string
  param: string
  issue: string
  severity: number        // 0-10 CVSS
  cvss_score: number
  ai_fix?: string
  screenshot_url?: string
  cve_id?: string
  created_at: string
}

export interface ScanStatus {
  scan_id: number
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number        // 0-100
  message?: string
}

export interface Project {
  project_id: number
  name: string
  owner_id: number
}
