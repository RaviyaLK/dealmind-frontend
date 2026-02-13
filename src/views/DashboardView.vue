<template>
  <div>
    <v-skeleton-loader v-if="loading" type="heading, article, article, article, article" class="mb-6" />

    <div style="margin-bottom: 28px;" v-if="!loading">
      <div style="font-size: 28px; font-weight: 700; color: #ffffff;">{{ greeting }}, {{ userName }}</div>
      <div style="font-size: 14px; color: #9ca3af; margin-top: 4px;">Here's your deal intelligence for today</div>
    </div>

    <v-row class="mb-6" v-if="!loading">
      <v-col cols="3">
        <v-card class="glow-card" style="position: relative; overflow: hidden;">
          <div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #06b6d4, transparent);"></div>
          <v-card-text style="padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <div style="font-size: 13px; color: #9ca3af; margin-bottom: 8px;">Active Deals</div>
                <div style="font-size: 32px; font-weight: 700; line-height: 1; color: #ffffff;">{{ activeDeals }}</div>
                <div style="font-size: 12px; margin-top: 8px; font-weight: 500; color: #06b6d4;">{{ activeDealsChange }}</div>
              </div>
              <div style="width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: rgba(6, 182, 212, 0.09);">
                <v-icon color="#06b6d4" size="22">mdi-briefcase-outline</v-icon>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card class="glow-card" style="position: relative; overflow: hidden;">
          <div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #ef4444, transparent);"></div>
          <v-card-text style="padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <div style="font-size: 13px; color: #9ca3af; margin-bottom: 8px;">At Risk</div>
                <div style="font-size: 32px; font-weight: 700; line-height: 1; color: #ffffff;">{{ atRisk }}</div>
                <div style="font-size: 12px; margin-top: 8px; font-weight: 500; color: #ef4444;">Needs attention</div>
              </div>
              <div style="width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: rgba(239, 68, 68, 0.09);">
                <v-icon color="#ef4444" size="22">mdi-alert-outline</v-icon>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card class="glow-card" style="position: relative; overflow: hidden;">
          <div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #a855f7, transparent);"></div>
          <v-card-text style="padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <div style="font-size: 13px; color: #9ca3af; margin-bottom: 8px;">Pipeline Value</div>
                <div style="font-size: 32px; font-weight: 700; line-height: 1; color: #ffffff;">{{ formattedTotalValue }}</div>
                <div style="font-size: 12px; margin-top: 8px; font-weight: 500; color: #a855f7;">Total value</div>
              </div>
              <div style="width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: rgba(168, 85, 247, 0.09);">
                <v-icon color="#a855f7" size="22">mdi-currency-usd</v-icon>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card class="glow-card" style="position: relative; overflow: hidden;">
          <div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #22c55e, transparent);"></div>
          <v-card-text style="padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <div style="font-size: 13px; color: #9ca3af; margin-bottom: 8px;">Win Rate</div>
                <div style="font-size: 32px; font-weight: 700; line-height: 1; color: #ffffff;">{{ Math.round(winRate) }}%</div>
                <div style="font-size: 12px; margin-top: 8px; font-weight: 500; color: #22c55e;">Success rate</div>
              </div>
              <div style="width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: rgba(34, 197, 94, 0.09);">
                <v-icon color="#22c55e" size="22">mdi-heart-pulse</v-icon>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="!loading">
      <v-col cols="8">
        <v-card class="glow-card">
          <div style="padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(139, 92, 246, 0.12);">
            <span style="font-size: 18px; font-weight: 600;">Deal Pipeline</span>
            <v-text-field
              v-model="searchQuery"
              density="compact"
              variant="outlined"
              placeholder="Search deals..."
              prepend-inner-icon="mdi-magnify"
              hide-details
              style="max-width: 220px;"
              bg-color="rgba(139, 92, 246, 0.06)"
            />
          </div>

          <div v-if="filteredDeals.length === 0" style="padding: 60px 20px; text-align: center;">
            <v-icon size="64" color="#6b7280" style="margin-bottom: 16px;">mdi-briefcase-outline</v-icon>
            <div style="font-size: 18px; font-weight: 600; color: #ffffff; margin-bottom: 8px;">No deals yet</div>
            <div style="font-size: 14px; color: #9ca3af; margin-bottom: 20px;">Start by creating your first deal to see it here</div>
            <v-btn variant="flat" color="primary" @click="createNewDeal">Create Deal</v-btn>
          </div>

          <v-table v-else style="background: transparent;">
            <thead>
              <tr style="background: rgba(139, 92, 246, 0.04);">
                <th style="font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">Deal</th>
                <th style="font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">Stage</th>
                <th style="font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">Health</th>
                <th style="font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">Status</th>
                <th style="font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="deal in filteredDeals" :key="deal.id" style="cursor: pointer;" class="deal-row" @click="navigateToDeal(deal.id)">
                <td style="padding: 16px;">
                  <div style="font-weight: 600; font-size: 14px;">{{ deal.title }}</div>
                  <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">{{ deal.client_name }}</div>
                </td>
                <td>
                  <v-chip size="small" variant="tonal" :color="getStageColor(deal.stage)" style="font-size: 11px; font-weight: 600;">{{ deal.stage }}</v-chip>
                </td>
                <td>
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <v-progress-linear
                      :model-value="deal.health_score"
                      :color="getHealthColor(deal.health_score)"
                      bg-color="rgba(255,255,255,0.06)"
                      rounded
                      height="6"
                      style="width: 60px;"
                    />
                    <span :style="{ fontSize: '13px', fontWeight: 600, color: getHealthColor(deal.health_score), fontVariantNumeric: 'tabular-nums' }">{{ deal.health_score }}%</span>
                  </div>
                </td>
                <td>
                  <v-chip size="x-small" variant="tonal" :color="getStatusColor(deal.status)" style="font-size: 10px; font-weight: 700; text-transform: uppercase;">{{ deal.status }}</v-chip>
                </td>
                <td style="font-weight: 600; font-size: 14px;">{{ formatCurrency(deal.deal_value) }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>

      <v-col cols="4">
        <v-card class="glow-card mb-5">
          <v-card-text style="padding: 20px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
              <v-icon color="error" size="18">mdi-alert-outline</v-icon>
              <span style="font-size: 16px; font-weight: 600;">Active Alerts</span>
            </div>
            <div v-if="activeAlerts.length === 0" style="font-size: 13px; color: #9ca3af; padding: 20px; text-align: center;">
              No active alerts
            </div>
            <div v-else style="display: flex; flex-direction: column; gap: 10px;">
              <div
                v-for="alert in activeAlerts"
                :key="alert.id"
                :style="{ padding: '14px', borderRadius: '12px', background: getAlertBg(alert.type), borderLeft: '3px solid ' + getAlertColor(alert.type) }"
              >
                <div style="font-weight: 600; font-size: 13px;">{{ alert.title }}</div>
                <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">{{ alert.description }}</div>
                <div style="font-size: 11px; color: #6b7280; margin-top: 6px;">{{ formatTime(alert.created_at) }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, inject, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../stores/auth'
import { dealsAPI, alertsAPI } from '../api'

const router = useRouter()
const auth = useAuth()

const deals = ref([])
const alerts = ref([])
const loading = ref(true)
const searchQuery = ref('')

// Computed Greeting based on time
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
})

const userName = computed(() => auth.state.user?.full_name || 'User')

const filteredDeals = computed(() => {
  if (!searchQuery.value) return deals.value
  const q = searchQuery.value.toLowerCase()
  return deals.value.filter(d =>
    d.title.toLowerCase().includes(q) ||
    d.client_name.toLowerCase().includes(q)
  )
})

const activeDeals = computed(() => deals.value.filter(d => d.status === 'active').length)
const atRisk = computed(() => deals.value.filter(d => d.status === 'at_risk').length)
const totalValue = computed(() => deals.value.reduce((sum, d) => sum + (d.deal_value || 0), 0))
const winRate = computed(() => {
  const wonStatuses = ['closed', 'won']
  const lostStatuses = ['declined', 'lost', 'no_go']
  const wonDeals = deals.value.filter(d => wonStatuses.includes(d.status) || wonStatuses.includes(d.stage)).length
  const lostDeals = deals.value.filter(d => lostStatuses.includes(d.status) || lostStatuses.includes(d.stage)).length
  const totalDecided = wonDeals + lostDeals
  if (totalDecided === 0) return 0
  return (wonDeals / totalDecided) * 100
})

const activeDealsChange = computed(() => {
  return '+' + Math.floor(activeDeals.value * 0.25) + ' potential'
})

const formattedTotalValue = computed(() => {
  if (totalValue.value >= 1000000) {
    return '$' + (totalValue.value / 1000000).toFixed(1) + 'M'
  }
  return '$' + (totalValue.value / 1000).toFixed(0) + 'K'
})

const activeAlerts = computed(() => {
  return alerts.value.filter(a => !a.is_resolved)
})

async function loadDashboard() {
  try {
    loading.value = true
    const [dealsData, alertsData] = await Promise.all([
      dealsAPI.list(),
      alertsAPI.list({ is_resolved: false })
    ])
    deals.value = dealsData.data?.deals || []
    alerts.value = alertsData.data || []
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  } finally {
    loading.value = false
  }
}

const dealCreatedSignal = inject('dealCreatedSignal', ref(0))
watch(dealCreatedSignal, () => {
  loadDashboard()
})

onMounted(() => loadDashboard())

function getHealthColor(h) {
  return h >= 80 ? '#22c55e' : h >= 60 ? '#f59e0b' : '#ef4444'
}

function getStageColor(stage) {
  const stageColorMap = {
    'discovery': 'info',
    'qualification': 'primary',
    'proposal': 'warning',
    'negotiate': 'secondary',
    'closed': 'success'
  }
  return stageColorMap[stage] || 'primary'
}

function getStatusColor(status) {
  const statusColorMap = {
    'active': 'success',
    'at_risk': 'error',
    'closed': 'primary',
    'lost': 'secondary'
  }
  return statusColorMap[status] || 'secondary'
}

function formatCurrency(value) {
  if (!value) return '$0'
  if (value >= 1000000) {
    return '$' + (value / 1000000).toFixed(1) + 'M'
  }
  if (value >= 1000) {
    return '$' + (value / 1000).toFixed(0) + 'K'
  }
  return '$' + value
}

function getAlertBg(t) {
  return t === 'critical' ? 'rgba(239,68,68,0.08)' : t === 'warning' ? 'rgba(245,158,11,0.08)' : 'rgba(34,197,94,0.08)'
}

function getAlertColor(t) {
  return t === 'critical' ? '#ef4444' : t === 'warning' ? '#f59e0b' : '#22c55e'
}

function formatTime(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return diffMins + ' min ago'
  if (diffHours < 24) return diffHours + ' hour' + (diffHours > 1 ? 's' : '') + ' ago'
  if (diffDays < 7) return diffDays + ' day' + (diffDays > 1 ? 's' : '') + ' ago'
  return date.toLocaleDateString()
}

function navigateToDeal(dealId) {
  router.push(`/qualification/${dealId}`)
}

const openNewDealDialog = inject('openNewDealDialog', () => {})

function createNewDeal() {
  openNewDealDialog()
}
</script>

<style scoped>
.deal-row:hover {
  background: rgba(139, 92, 246, 0.04);
}
</style>