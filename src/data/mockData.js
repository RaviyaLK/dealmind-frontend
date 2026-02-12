export const deals = [
  {
    id: 1,
    name: 'Acme Corp',
    project: 'Data Platform',
    stage: 'Negotiate',
    health: 68,
    trend: 'down',
    value: 450000,
    risk: 'high',
    contact: 'Jennifer Chen',
    email: 'jennifer.chen@acmecorp.com',
    lastActivity: '10 min ago',
  },
  {
    id: 2,
    name: 'TechStart Inc',
    project: 'Cloud Migration',
    stage: 'Proposal',
    health: 72,
    trend: 'down',
    value: 280000,
    risk: 'medium',
    contact: 'Michael Torres',
    email: 'mtorres@techstart.io',
    lastActivity: '6 days ago',
  },
  {
    id: 3,
    name: 'HealthCo',
    project: 'Patient Portal',
    stage: 'Qualified',
    health: 85,
    trend: 'up',
    value: 620000,
    risk: 'low',
    contact: 'Sarah Kim',
    email: 'skim@healthco.com',
    lastActivity: '1 day ago',
  },
  {
    id: 4,
    name: 'GlobalFin',
    project: 'Trading Dashboard',
    stage: 'Proposal',
    health: 78,
    trend: 'stable',
    value: 340000,
    risk: 'medium',
    contact: 'David Liu',
    email: 'dliu@globalfin.com',
    lastActivity: '3 days ago',
  },
  {
    id: 5,
    name: 'EduTech Solutions',
    project: 'LMS Platform',
    stage: 'Qualified',
    health: 92,
    trend: 'up',
    value: 180000,
    risk: 'low',
    contact: 'Emma Davis',
    email: 'edavis@edutech.com',
    lastActivity: '2 hours ago',
  },
  {
    id: 6,
    name: 'RetailMax',
    project: 'Inventory System',
    stage: 'Discovery',
    health: 55,
    trend: 'down',
    value: 195000,
    risk: 'high',
    contact: 'James Wilson',
    email: 'jwilson@retailmax.com',
    lastActivity: '5 days ago',
  },
  {
    id: 7,
    name: 'CyberShield',
    project: 'Security Audit Tool',
    stage: 'Negotiate',
    health: 81,
    trend: 'up',
    value: 410000,
    risk: 'low',
    contact: 'Anna Petrova',
    email: 'apetrova@cybershield.io',
    lastActivity: '1 hour ago',
  },
  {
    id: 8,
    name: 'LogiFlow',
    project: 'Supply Chain AI',
    stage: 'Discovery',
    health: 63,
    trend: 'stable',
    value: 520000,
    risk: 'medium',
    contact: 'Robert Chang',
    email: 'rchang@logiflow.com',
    lastActivity: '4 days ago',
  }
]

export const alerts = [
  {
    id: 1,
    deal: 'Acme Corp',
    type: 'critical',
    message: 'Competitor mentioned in latest email thread',
    time: '10 min ago',
  },
  {
    id: 2,
    deal: 'TechStart Inc',
    type: 'warning',
    message: 'No client response in 6 days',
    time: '2 hours ago',
  },
  {
    id: 3,
    deal: 'HealthCo',
    type: 'success',
    message: 'Positive sentiment detected in call transcript',
    time: '4 hours ago',
  },
  {
    id: 4,
    deal: 'RetailMax',
    type: 'warning',
    message: 'Budget concerns raised by stakeholder',
    time: '1 day ago',
  },
]

export const reviewQueue = [
  {
    id: 1,
    title: 'Pricing Framework',
    deal: 'Acme Corp',
    priority: 'critical',
    confidence: 65,
    reason: 'Financial commitments require sign-off',
  },
  {
    id: 2,
    title: 'Technical Approach',
    deal: 'TechStart Inc',
    priority: 'high',
    confidence: 78,
    reason: 'Claims need verification',
  },
  {
    id: 3,
    title: 'Timeline Proposal',
    deal: 'GlobalFin',
    priority: 'medium',
    confidence: 82,
    reason: 'Delivery dates need confirmation',
  },
]

export const qualificationSteps = [
  { id: 1, label: 'INGEST', description: 'Parse PDF/DOCX', status: 'complete' },
  { id: 2, label: 'EXTRACT', description: 'AI Requirements Extraction', status: 'active' },
  { id: 3, label: 'ANALYZE', description: 'Gap Analysis', status: 'pending' },
  { id: 4, label: 'MATCH', description: 'Employee DB Cross-Ref', status: 'pending' },
  { id: 5, label: 'DECIDE', description: 'GO / NO-GO', status: 'pending' },
]

export const extractedRequirements = [
  { category: 'Technical', requirement: 'System must handle 10,000 concurrent users with sub-200ms response time', confidence: 95 },
  { category: 'Infrastructure', requirement: 'AWS cloud deployment with multi-region failover mandatory', confidence: 100 },
  { category: 'Functional', requirement: 'Real-time analytics dashboard with customizable widgets', confidence: 88 },
  { category: 'Integration', requirement: 'Bi-directional integration with Salesforce CRM and HubSpot', confidence: 75 },
  { category: 'Security', requirement: 'SOC 2 Type II compliance and end-to-end encryption', confidence: 92 },
  { category: 'Timeline', requirement: 'MVP delivery within 12 weeks of contract signing', confidence: 80 },
]

export const staffingProposal = [
  { role: 'Tech Lead', name: 'John Smith', allocation: '50%', cost: 45000, status: 'available' },
  { role: 'Backend Developer', name: 'Lisa Park', allocation: '100%', cost: 60000, status: 'available' },
  { role: 'Frontend Developer', name: null, allocation: '100%', cost: 50000, status: 'contract' },
  { role: 'QA Engineer', name: 'Mark Chen', allocation: '50%', cost: 30000, status: 'available' },
]

export const pipelineStats = {
  activeDeals: 8,
  atRisk: 2,
  pipelineValue: 2400000,
  avgHealth: 74,
  weeklyChange: {
    deals: +2,
    value: 340000,
    health: 3,
  }
}

export const recoveryEmail = {
  to: 'jennifer.chen@acmecorp.com',
  subject: 'Addressing Your Timeline Concerns',
  body: `Hi Jennifer,

Thank you for sharing your concerns -- I really appreciate your candor, and I want to make sure we address this properly.

I've been thinking about your situation, and I believe we can offer some flexibility. Here are a few options:

1. Phased Delivery -- Prioritize the core analytics module for an earlier go-live, with subsequent feature releases on a rolling basis.

2. Parallel Workstreams -- By running frontend and backend development concurrently with a dedicated team, we can compress the timeline by approximately 3 weeks.

Would you have 20 minutes this week to discuss which approach best fits your team's priorities?

Best regards,
Ravindu`,
  insights: ['Empathetic tone maintained', 'Avoided defensive language', 'Offered concrete alternatives', 'Clear call-to-action included']
}
