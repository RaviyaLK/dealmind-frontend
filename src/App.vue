<template>
  <v-app>
    <!-- Login page renders without chrome -->
    <template v-if="$route.path === '/login'">
      <router-view />
    </template>

    <!-- Authenticated layout -->
    <template v-else>
      <!-- Top App Bar -->
      <v-app-bar
        flat
        height="64"
        style="background: rgba(10, 10, 20, 0.95) !important; backdrop-filter: blur(12px);"
      >
        <router-link to="/dashboard" style="text-decoration: none; display: flex; align-items: center; gap: 12px; padding-right: 24px; margin-left: 16px; border-right: 1px solid rgba(139, 92, 246, 0.2);">
          <img src="/logo.svg" alt="DealMind" style="width: 36px; height: 36px; border-radius: 12px;" />
          <span class="gradient-text" style="font-size: 18px; font-weight: 700;">DealMind</span>
        </router-link>

        <div style="display: flex; align-items: center; gap: 4px; margin-left: 16px;">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            style="text-decoration: none;"
          >
            <v-btn
              variant="flat"
              size="small"
              :color="$route.path === item.path ? 'primary' : 'transparent'"
              :style="$route.path !== item.path ? 'color: #9ca3af;' : ''"
              class="text-none"
            >
              <v-icon size="16" start>{{ item.icon }}</v-icon>
              {{ item.label }}
            </v-btn>
          </router-link>
        </div>

        <v-spacer />

        <v-btn
          variant="flat"
          size="small"
          class="text-none mr-2"
          style="background: linear-gradient(135deg, #a855f7, #ec4899); color: white;"
          @click="showNewDealDialog = true"
        >
          <v-icon size="16" start>mdi-plus</v-icon>
          New Deal
        </v-btn>

        <v-menu v-model="showNotifPanel" :close-on-content-click="false" location="bottom end" max-width="400" min-width="360">
          <template #activator="{ props }">
            <v-btn icon variant="text" size="small" class="mr-2" v-bind="props" @click="loadRecentAlerts">
              <v-badge color="error" :content="alertCount" floating :model-value="alertCount > 0">
                <v-icon color="grey">mdi-bell-outline</v-icon>
              </v-badge>
            </v-btn>
          </template>
          <v-card style="background: #12122a; border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 16px; overflow: hidden;">
            <div style="padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(139, 92, 246, 0.12); background: rgba(0,0,0,0.2);">
              <div style="display: flex; align-items: center; gap: 8px;">
                <v-icon color="primary" size="18">mdi-bell-outline</v-icon>
                <span style="font-weight: 700; font-size: 15px;">Notifications</span>
              </div>
              <v-chip size="x-small" :color="alertCount > 0 ? 'error' : 'success'" variant="flat" style="font-weight: 700;">
                {{ alertCount > 0 ? `${alertCount} active` : 'All clear' }}
              </v-chip>
            </div>
            <div v-if="loadingNotifs" style="padding: 32px; text-align: center;">
              <v-progress-circular indeterminate color="primary" size="28" width="2" />
            </div>
            <div v-else-if="recentAlerts.length === 0" style="padding: 32px; text-align: center;">
              <v-icon size="40" color="grey" style="opacity: 0.4;">mdi-bell-check-outline</v-icon>
              <div style="font-size: 13px; color: #6b7280; margin-top: 8px;">No active alerts</div>
            </div>
            <div v-else style="max-height: 360px; overflow-y: auto;">
              <div
                v-for="alert in recentAlerts"
                :key="alert.id"
                style="padding: 14px 20px; border-bottom: 1px solid rgba(139, 92, 246, 0.08); cursor: pointer; transition: background 0.15s;"
                @mouseenter="$event.target.style.background = 'rgba(139,92,246,0.06)'"
                @mouseleave="$event.target.style.background = 'transparent'"
                @click="goToAlert(alert)"
              >
                <div style="display: flex; align-items: flex-start; gap: 10px;">
                  <v-icon
                    :color="alert.alert_type === 'positive_update' ? 'success' : (alert.severity === 'critical' ? 'error' : alert.severity === 'high' ? 'warning' : 'info')"
                    size="18"
                    style="margin-top: 2px; flex-shrink: 0;"
                  >
                    {{ alert.alert_type === 'positive_update' ? 'mdi-check-circle' : 'mdi-alert-circle' }}
                  </v-icon>
                  <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ alert.title }}</div>
                    <div style="font-size: 11px; color: #9ca3af; margin-top: 2px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">{{ alert.description }}</div>
                    <div style="font-size: 10px; color: #6b7280; margin-top: 4px;">{{ formatAlertTime(alert.created_at) }}</div>
                  </div>
                  <v-chip
                    size="x-small"
                    :color="alert.alert_type === 'positive_update' ? 'success' : (alert.severity === 'critical' ? 'error' : alert.severity === 'high' ? 'warning' : 'grey')"
                    variant="tonal"
                    style="font-size: 9px; font-weight: 700; flex-shrink: 0;"
                  >
                    {{ alert.alert_type === 'positive_update' ? 'POSITIVE' : alert.severity?.toUpperCase() }}
                  </v-chip>
                </div>
              </div>
            </div>
            <div style="padding: 12px 20px; border-top: 1px solid rgba(139, 92, 246, 0.12); text-align: center;">
              <v-btn variant="text" color="primary" size="small" class="text-none" @click="showNotifPanel = false; router.push('/alerts')">
                View All Alerts
              </v-btn>
            </div>
          </v-card>
        </v-menu>

        <v-menu>
          <template #activator="{ props }">
            <v-btn icon variant="text" size="small" v-bind="props">
              <v-icon color="grey">mdi-account-circle</v-icon>
            </v-btn>
          </template>
          <v-list density="compact" style="background: #1a1a2e;">
            <v-list-item v-if="user">
              <v-list-item-title class="font-weight-bold">{{ user.full_name }}</v-list-item-title>
              <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
            </v-list-item>
            <v-divider class="my-1" />
            <v-list-item @click="handleLogout" prepend-icon="mdi-logout" title="Sign Out" />
          </v-list>
        </v-menu>
      </v-app-bar>

      <!-- Sidebar -->
      <v-navigation-drawer
        permanent
        width="260"
        style="background: #0b0b1a !important;"
      >
        <div style="padding: 20px 24px 12px;">
          <span style="font-size: 11px; font-weight: 600; letter-spacing: 2px; color: #6b7280; text-transform: uppercase;">Main Menu</span>
        </div>

        <v-list density="compact" nav style="padding: 0 8px;">
          <v-list-item
            v-for="item in sidebarItems"
            :key="item.label"
            :to="item.path"
            :active="$route.path === item.path"
            active-color="primary"
            rounded="lg"
            style="margin-bottom: 2px; min-height: 44px;"
          >
            <template #prepend>
              <v-icon size="18" style="margin-right: 12px;">{{ item.icon }}</v-icon>
            </template>
            <v-list-item-title style="font-size: 14px;">{{ item.label }}</v-list-item-title>
            <template #append v-if="item.badge">
              <v-chip size="x-small" :color="item.badgeColor" variant="flat" style="height: 20px; font-size: 10px; font-weight: 700;">{{ item.badge }}</v-chip>
            </template>
          </v-list-item>
        </v-list>

        <template #append>
          <div style="padding: 16px; margin: 8px; border-radius: 12px; background: linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(6, 182, 212, 0.08)); border: 1px solid rgba(139, 92, 246, 0.2);">
            <div style="font-size: 11px; color: #6b7280; margin-bottom: 8px;">Agent Status</div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <div class="animate-pulse-glow" style="width: 8px; height: 8px; border-radius: 50%; background: #22c55e; color: #22c55e;"></div>
              <span style="font-size: 13px; font-weight: 500; color: #e5e7eb;">Quinn is Active</span>
            </div>
          </div>
        </template>
      </v-navigation-drawer>

      <!-- Main Content -->
      <v-main>
        <v-container fluid style="padding: 32px;">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </v-container>
      </v-main>

      <!-- New Deal Dialog -->
      <v-dialog v-model="showNewDealDialog" max-width="520">
        <v-card class="glow-card pa-6">
          <v-card-title class="text-h6 font-weight-bold px-0">Create New Deal</v-card-title>
          <v-text-field v-model="newDeal.title" label="Deal Title" variant="outlined" density="comfortable" class="mt-4" />
          <v-text-field v-model="newDeal.client_name" label="Client Name" variant="outlined" density="comfortable" />
          <v-text-field v-model.number="newDeal.deal_value" label="Deal Value ($)" type="number" variant="outlined" density="comfortable" />
          <v-textarea v-model="newDeal.description" label="Description" variant="outlined" density="comfortable" rows="3" />
          <v-card-actions class="px-0">
            <v-spacer />
            <v-btn variant="text" @click="showNewDealDialog = false">Cancel</v-btn>
            <v-btn color="primary" variant="flat" @click="createDeal" :loading="creatingDeal">Create Deal</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, provide } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from './stores/auth'
import { dealsAPI, alertsAPI } from './api'

const router = useRouter()
const auth = useAuth()

const user = computed(() => auth.state.user)
const alertCount = ref(0)

const showNotifPanel = ref(false)
const recentAlerts = ref([])
const loadingNotifs = ref(false)

const showNewDealDialog = ref(false)
const dealCreatedSignal = ref(0)
provide('openNewDealDialog', () => { showNewDealDialog.value = true })
provide('dealCreatedSignal', dealCreatedSignal)
const creatingDeal = ref(false)
const newDeal = ref({ title: '', client_name: '', deal_value: 0, description: '' })
const dealCount = ref(0)

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'mdi-view-dashboard-outline' },
  { path: '/qualification', label: 'Qualification', icon: 'mdi-magnify' },
  { path: '/decision', label: 'Decision', icon: 'mdi-check-decagram-outline' },
  { path: '/proposals', label: 'Proposals', icon: 'mdi-file-document-edit-outline' },
  { path: '/alerts', label: 'Alert & Recovery', icon: 'mdi-alert-outline' },
  { path: '/digest', label: 'Daily Digest', icon: 'mdi-file-document-outline' },
]

const sidebarItems = computed(() => [
  { path: '/dashboard', label: 'Dashboard', icon: 'mdi-view-dashboard-outline' },
  { path: '/dashboard', label: 'Deals', icon: 'mdi-briefcase-outline', badge: String(dealCount.value || 0), badgeColor: 'primary' },
  { path: '/employees', label: 'Employees', icon: 'mdi-account-group-outline' },
  { path: '/qualification', label: 'Qualification', icon: 'mdi-magnify' },
  { path: '/decision', label: 'Decision', icon: 'mdi-check-decagram-outline' },
  { path: '/proposals', label: 'Proposals', icon: 'mdi-file-document-edit-outline' },
  { path: '/alerts', label: 'Monitoring', icon: 'mdi-radar' },
  { path: '/alerts', label: 'Review Queue', icon: 'mdi-bell-alert-outline', badge: String(alertCount.value || 0), badgeColor: 'error' },
  { path: '/digest', label: 'Analytics', icon: 'mdi-chart-bar' },
  { path: '/settings', label: 'Settings', icon: 'mdi-cog-outline' },
])

function handleLogout() {
  auth.logout()
}

async function loadRecentAlerts() {
  loadingNotifs.value = true
  try {
    const res = await alertsAPI.list({ limit: 10 })
    const data = res.data
    recentAlerts.value = Array.isArray(data) ? data : (data?.alerts || data?.items || [])
  } catch {
    recentAlerts.value = []
  } finally {
    loadingNotifs.value = false
  }
}

function goToAlert(alert) {
  showNotifPanel.value = false
  router.push(`/alerts/${alert.deal_id}`)
}

function formatAlertTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHrs = Math.floor(diffMins / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`
  const diffDays = Math.floor(diffHrs / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString()
}

async function createDeal() {
  if (!newDeal.value.title || !newDeal.value.client_name) return
  creatingDeal.value = true
  try {
    await dealsAPI.create(newDeal.value)
    showNewDealDialog.value = false
    newDeal.value = { title: '', client_name: '', deal_value: 0, description: '' }
    loadCounts()
    dealCreatedSignal.value++
    router.push('/dashboard')
  } catch (err) {
    console.error('Failed to create deal:', err)
  } finally {
    creatingDeal.value = false
  }
}

async function loadCounts() {
  try {
    const [dealsRes, alertsRes] = await Promise.all([
      dealsAPI.list(),
      alertsAPI.summary(),
    ])
    dealCount.value = dealsRes.data.total || 0
    alertCount.value = alertsRes.data?.total_unresolved || 0
  } catch { /* not critical */ }
}

onMounted(() => {
  if (auth.isAuthenticated()) {
    loadCounts()
  }
})
</script>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
