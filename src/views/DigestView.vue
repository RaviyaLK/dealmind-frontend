<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" style="display: flex; flex-direction: column; gap: 16px;">
      <v-skeleton-loader type="heading" width="300" />
      <v-skeleton-loader type="list-item" repeat="4" />
      <v-skeleton-loader type="table" />
    </div>

    <!-- Main Content -->
    <template v-else>
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px;">
      <div>
        <div style="font-size: 28px; font-weight: 700;">Morning Alignment</div>
        <div style="font-size: 14px; color: #9ca3af; margin-top: 4px;">Your daily deal intelligence digest</div>
      </div>
      <v-card class="glow-card" style="padding: 12px 20px;">
        <div style="font-size: 11px; color: #6b7280; font-weight: 500;">DAILY DIGEST</div>
        <div style="font-size: 16px; font-weight: 600; margin-top: 2px;">{{ todayDate }}</div>
      </v-card>
    </div>

    <!-- Stats Row -->
    <v-row class="mb-5">
      <v-col cols="3">
        <v-card class="glow-card" style="text-align: center; padding: 24px;">
          <div style="font-size: 11px; color: #6b7280; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">Active Deals</div>
          <div style="font-size: 48px; font-weight: 800; line-height: 1; color: #06b6d4;">{{ activeDeals }}</div>
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card class="glow-card" style="text-align: center; padding: 24px;">
          <div style="font-size: 11px; color: #6b7280; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">At Risk</div>
          <div style="font-size: 48px; font-weight: 800; line-height: 1; color: #ef4444;">{{ atRisk }}</div>
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card class="glow-card" style="text-align: center; padding: 24px;">
          <div style="font-size: 11px; color: #6b7280; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">Healthy</div>
          <div style="font-size: 48px; font-weight: 800; line-height: 1; color: #22c55e;">{{ healthy }}</div>
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card class="glow-card" style="text-align: center; padding: 24px;">
          <div style="font-size: 11px; color: #6b7280; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">Pipeline Value</div>
          <div class="gradient-text" style="font-size: 48px; font-weight: 800; line-height: 1;">{{ totalValue }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Critical Alert Banner -->
    <div v-if="criticalAlert" style="border-radius: 12px; padding: 20px; margin-bottom: 24px; display: flex; align-items: center; gap: 16px; background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.04)); border: 1px solid rgba(239, 68, 68, 0.3);">
      <v-icon color="error" size="24">mdi-bell-alert-outline</v-icon>
      <div style="flex: 1;">
        <div style="font-weight: 700; color: #ef4444; font-size: 14px;">ACTION REQUIRED</div>
        <div style="font-size: 14px; color: #fca5a5;"><strong>{{ criticalAlert.deal_name }}</strong> -- {{ criticalAlert.description }}</div>
      </div>
      <v-btn variant="flat" size="small" class="text-none" style="background: linear-gradient(135deg, #a855f7, #ec4899); color: white; font-weight: 600;" @click="router.push(`/alerts/${criticalAlert.deal_id}`)">View Alert</v-btn>
    </div>

    <!-- Deal Health Table -->
    <v-card class="glow-card mb-6">
      <div style="padding: 20px 24px; border-bottom: 1px solid rgba(139, 92, 246, 0.12);">
        <span style="font-size: 18px; font-weight: 600;">Deal Health Summary</span>
      </div>
      <v-table style="background: transparent;">
        <thead>
          <tr style="background: rgba(139, 92, 246, 0.04);">
            <th style="font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">Deal</th>
            <th style="font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">Stage</th>
            <th style="font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">Health</th>
            <th style="font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">Trend</th>
            <th style="font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="deal in deals" :key="deal.id" class="deal-row">
            <td style="padding: 14px 16px; font-weight: 600; font-size: 14px;">{{ deal.title }}</td>
            <td style="padding: 14px 16px; font-size: 14px; color: #d1d5db;">{{ deal.stage || 'Unknown' }}</td>
            <td style="padding: 14px 16px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span :style="{ fontSize: '14px', fontWeight: 600, color: getHealthColor(deal.health_score), fontVariantNumeric: 'tabular-nums' }">{{ deal.health_score }}%</span>
                <v-progress-linear :model-value="deal.health_score" :color="getHealthColor(deal.health_score)" bg-color="rgba(255,255,255,0.06)" rounded height="6" style="width: 80px;" />
              </div>
            </td>
            <td style="padding: 14px 16px;">
              <span :style="{ fontSize: '13px', fontWeight: 600, color: getTrendColor(calculateTrend(deal.health_score)) }">
                <v-icon size="16" :color="getTrendColor(calculateTrend(deal.health_score))" style="margin-right: 4px;">{{ getTrendIcon(calculateTrend(deal.health_score)) }}</v-icon>
                {{ calculateTrend(deal.health_score) === 'up' ? 'Up' : calculateTrend(deal.health_score) === 'down' ? 'Down' : 'Stable' }}
              </span>
            </td>
            <td style="padding: 14px 16px;">
              <div :style="{ width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: getStatusBg(calculateStatus(deal.health_score)), color: getStatusColor(calculateStatus(deal.health_score)) }">
                <v-icon size="14" :color="getStatusColor(calculateStatus(deal.health_score))">{{ getStatusIcon(calculateStatus(deal.health_score)) }}</v-icon>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Today's Priorities -->
    <v-card class="glow-card">
      <v-card-text style="padding: 24px;">
        <div style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">Today's Priorities</div>
        <v-row>
          <v-col cols="4">
            <div style="padding: 16px; border-radius: 12px; background: rgba(239, 68, 68, 0.06); border: 1px solid rgba(239, 68, 68, 0.15);">
              <div style="font-size: 11px; font-weight: 700; color: #ef4444; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Urgent</div>
              <div style="font-size: 13px; color: #d1d5db;">{{ urgentPriority || 'Handle critical alerts' }}</div>
            </div>
          </v-col>
          <v-col cols="4">
            <div style="padding: 16px; border-radius: 12px; background: rgba(245, 158, 11, 0.06); border: 1px solid rgba(245, 158, 11, 0.15);">
              <div style="font-size: 11px; font-weight: 700; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Follow Up</div>
              <div style="font-size: 13px; color: #d1d5db;">{{ followUpPriority || 'Follow up on pending deals' }}</div>
            </div>
          </v-col>
          <v-col cols="4">
            <div style="padding: 16px; border-radius: 12px; background: rgba(34, 197, 94, 0.06); border: 1px solid rgba(34, 197, 94, 0.15);">
              <div style="font-size: 11px; font-weight: 700; color: #22c55e; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Opportunity</div>
              <div style="font-size: 13px; color: #d1d5db;">{{ opportunityPriority || 'Advance strong deals to proposal' }}</div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { dealsAPI, alertsAPI } from '../api'

const router = useRouter()

const loading = ref(false)
const deals = ref([])
const alerts = ref([])

const todayDate = computed(() => {
  const today = new Date()
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return today.toLocaleDateString('en-US', options)
})

const activeDeals = computed(() => deals.value.length)

const atRisk = computed(() => {
  return deals.value.filter(d => d.health_score < 60).length
})

const healthy = computed(() => {
  return deals.value.filter(d => d.health_score >= 80).length
})

const totalValue = computed(() => {
  const total = deals.value.reduce((sum, d) => sum + (d.deal_value || 0), 0)
  if (total >= 1000000) return '$' + (total / 1000000).toFixed(1) + 'M'
  if (total >= 1000) return '$' + (total / 1000).toFixed(0) + 'K'
  return '$' + total.toFixed(0)
})

const criticalAlert = computed(() => {
  const critical = alerts.value.find(a => a.severity === 'critical' || a.severity === 'high')
  if (!critical) return null
  const deal = deals.value.find(d => d.id === critical.deal_id)
  return {
    ...critical,
    deal_name: deal?.title || 'Unknown Deal',
    description: critical.description || 'Risk detected',
  }
})

const urgentPriority = computed(() => {
  const critical = criticalAlert.value
  return critical ? `Review and respond to ${critical.deal_name}` : 'Handle critical alerts'
})

const followUpPriority = computed(() => {
  const atrisk = deals.value.filter(d => d.health_score < 60)
  return atrisk.length > 0 ? `Follow up on ${atrisk[0]?.name}` : 'Follow up on pending deals'
})

const opportunityPriority = computed(() => {
  const strong = deals.value.filter(d => d.health_score >= 80)
  return strong.length > 0 ? `Advance ${strong[0]?.name} to proposal` : 'Advance strong deals'
})

async function loadData() {
  loading.value = true
  try {
    const [dealsRes, alertsRes] = await Promise.all([
      dealsAPI.list(),
      alertsAPI.list(),
    ])
    deals.value = dealsRes.data?.deals || []
    alerts.value = alertsRes.data || []
  } catch (error) {
    console.error('Error loading digest data:', error)
  } finally {
    loading.value = false
  }
}

function calculateTrend(health) {
  if (health >= 80) return 'up'
  if (health < 60) return 'down'
  return 'stable'
}

function calculateStatus(health) {
  if (health < 60) return 'alert'
  if (health < 80) return 'warning'
  return 'ok'
}

function getHealthColor(h) {
  return h >= 80 ? '#22c55e' : h >= 60 ? '#f59e0b' : '#ef4444'
}

function getTrendColor(t) {
  return t === 'up' ? '#22c55e' : t === 'down' ? '#ef4444' : '#9ca3af'
}

function getTrendIcon(t) {
  return t === 'up' ? 'mdi-trending-up' : t === 'down' ? 'mdi-trending-down' : 'mdi-trending-neutral'
}

function getStatusBg(s) {
  return s === 'alert' ? 'rgba(239,68,68,0.2)' : s === 'warning' ? 'rgba(245,158,11,0.2)' : 'rgba(34,197,94,0.2)'
}

function getStatusColor(s) {
  return s === 'alert' ? '#ef4444' : s === 'warning' ? '#f59e0b' : '#22c55e'
}

function getStatusIcon(s) {
  return s === 'alert' ? 'mdi-bell-alert' : s === 'warning' ? 'mdi-alert' : 'mdi-check'
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.deal-row:hover { background: rgba(139, 92, 246, 0.04); }
</style>
