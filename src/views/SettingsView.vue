<template>
  <div>
    <!-- Header -->
    <div style="margin-bottom: 28px;">
      <span style="font-size: 28px; font-weight: 700;">Settings</span>
      <div style="font-size: 14px; color: #9ca3af; margin-top: 4px;">Manage integrations and platform configuration</div>
    </div>

    <v-row>
      <!-- Integrations -->
      <v-col cols="8">
        <v-card class="glow-card mb-4">
          <v-card-text style="padding: 28px;">
            <div style="font-size: 18px; font-weight: 700; margin-bottom: 20px;">Integrations</div>

            <!-- Google Gmail -->
            <div style="display: flex; align-items: center; gap: 16px; padding: 20px; border-radius: 14px; background: rgba(234, 67, 53, 0.06); border: 1px solid rgba(234, 67, 53, 0.15);">
              <!-- Gmail icon -->
              <div style="width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #EA4335, #FBBC04); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <v-icon color="white" size="24">mdi-gmail</v-icon>
              </div>

              <div style="flex: 1;">
                <div style="font-size: 16px; font-weight: 600;">Google Gmail & Calendar</div>
                <div style="font-size: 12px; color: #9ca3af; margin-top: 2px;">
                  <template v-if="google.connected">
                    Connected as <span style="color: #06b6d4; font-weight: 500;">{{ google.account_email }}</span>
                    <span v-if="google.account_name"> ({{ google.account_name }})</span>
                  </template>
                  <template v-else>
                    Connect your Gmail to monitor deal communications, analyze sentiment, and send recovery emails
                  </template>
                </div>
                <div v-if="google.connected && google.is_expired" style="font-size: 11px; color: #f59e0b; margin-top: 4px;">
                  <v-icon size="12" color="warning">mdi-alert</v-icon>
                  Token expired — reconnect to refresh
                </div>
              </div>

              <div style="display: flex; gap: 8px; flex-shrink: 0;">
                <template v-if="google.connected">
                  <v-btn
                    variant="outlined"
                    color="error"
                    size="small"
                    class="text-none"
                    :loading="disconnecting"
                    @click="disconnectGoogle"
                  >
                    <v-icon start size="14">mdi-link-off</v-icon>
                    Disconnect
                  </v-btn>
                  <v-btn
                    variant="outlined"
                    color="info"
                    size="small"
                    class="text-none"
                    @click="connectGoogle"
                  >
                    <v-icon start size="14">mdi-refresh</v-icon>
                    Reconnect
                  </v-btn>
                </template>
                <v-btn
                  v-else
                  variant="flat"
                  size="small"
                  class="text-none"
                  style="background: linear-gradient(135deg, #EA4335, #FBBC04); color: white;"
                  :loading="connecting"
                  @click="connectGoogle"
                >
                  <v-icon start size="16">mdi-google</v-icon>
                  Connect Gmail
                </v-btn>
              </div>
            </div>

            <!-- Permissions info -->
            <div v-if="!google.connected" style="margin-top: 16px; padding: 14px 16px; border-radius: 10px; background: rgba(139, 92, 246, 0.04); border: 1px solid rgba(139, 92, 246, 0.1);">
              <div style="font-size: 12px; font-weight: 600; color: #a78bfa; margin-bottom: 6px;">What permissions are requested?</div>
              <div style="font-size: 12px; color: #9ca3af; line-height: 1.6;">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                  <v-icon size="12" color="success">mdi-check-circle</v-icon>
                  <span><strong>gmail.readonly</strong> — Read your emails to analyze deal communications</span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                  <v-icon size="12" color="success">mdi-check-circle</v-icon>
                  <span><strong>gmail.send</strong> — Send recovery emails on your behalf</span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                  <v-icon size="12" color="success">mdi-check-circle</v-icon>
                  <span><strong>calendar.readonly</strong> — Read meeting schedules for deal context</span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <v-icon size="12" color="success">mdi-check-circle</v-icon>
                  <span><strong>userinfo.profile</strong> — Read your profile info</span>
                </div>
              </div>
            </div>

            <!-- Connected: show recent emails preview -->
            <div v-if="google.connected" style="margin-top: 20px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                <span style="font-size: 14px; font-weight: 600;">Recent Emails</span>
                <v-btn variant="text" size="x-small" class="text-none" color="primary" :loading="loadingEmails" @click="fetchEmails">
                  <v-icon start size="14">mdi-refresh</v-icon> Refresh
                </v-btn>
              </div>

              <div v-if="loadingEmails" style="text-align: center; padding: 20px;">
                <v-progress-circular indeterminate color="primary" size="28" width="2" />
              </div>

              <div v-else-if="emails.length === 0" style="text-align: center; padding: 20px; color: #6b7280; font-size: 13px;">
                No recent emails found
              </div>

              <div v-else style="display: flex; flex-direction: column; gap: 6px; max-height: 300px; overflow-y: auto;">
                <div
                  v-for="email in emails"
                  :key="email.id"
                  style="padding: 10px 14px; border-radius: 10px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);"
                >
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                    <v-icon :color="email.is_read ? 'grey' : 'info'" size="14">{{ email.is_read ? 'mdi-email-open-outline' : 'mdi-email' }}</v-icon>
                    <span style="font-size: 12px; font-weight: 600; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ email.subject }}</span>
                    <span style="font-size: 10px; color: #6b7280; flex-shrink: 0;">{{ formatEmailDate(email.received) }}</span>
                  </div>
                  <div style="font-size: 11px; color: #9ca3af; padding-left: 22px;">
                    From: {{ email.from_name || email.from }}
                  </div>
                  <div style="font-size: 11px; color: #6b7280; padding-left: 22px; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    {{ email.preview }}
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>

      </v-col>

      <!-- Right Column: Status -->
      <v-col cols="4">
        <v-card class="glow-card mb-4">
          <v-card-text style="padding: 24px;">
            <div style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">Integration Status</div>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div :style="{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: google.connected ? '#22c55e' : '#6b7280',
                }" />
                <span style="font-size: 13px;">Google Gmail</span>
                <v-spacer />
                <v-chip
                  size="x-small"
                  :color="google.connected ? 'success' : 'default'"
                  variant="flat"
                  style="font-size: 10px; font-weight: 600;"
                >{{ google.connected ? 'Connected' : 'Not connected' }}</v-chip>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 8px; height: 8px; border-radius: 50%; background: #22c55e;" />
                <span style="font-size: 13px;">DeepSeek V3 (OpenRouter)</span>
                <v-spacer />
                <v-chip size="x-small" color="success" variant="flat" style="font-size: 10px; font-weight: 600;">Active</v-chip>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 8px; height: 8px; border-radius: 50%; background: #22c55e;" />
                <span style="font-size: 13px;">RAG / ChromaDB</span>
                <v-spacer />
                <v-chip size="x-small" color="success" variant="flat" style="font-size: 10px; font-weight: 600;">Active</v-chip>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <v-card class="glow-card">
          <v-card-text style="padding: 24px;">
            <div style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">About</div>
            <div style="display: flex; flex-direction: column; gap: 8px; font-size: 12px;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280;">Platform</span>
                <span style="font-weight: 600;">DealMind v1.0</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280;">Company</span>
                <span style="color: #c084fc; font-weight: 600;">ESSHVA</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280;">AI Engine</span>
                <span>DeepSeek V3 (OpenRouter)</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280;">Team</span>
                <span>Hallucination Squad</span>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000" location="bottom right">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { integrationsAPI } from '../api'

const route = useRoute()

const connecting = ref(false)
const disconnecting = ref(false)
const loadingEmails = ref(false)

const google = ref({ connected: false, account_email: '', account_name: '', is_expired: false })
const emails = ref([])

const snackbar = ref({ show: false, text: '', color: 'success' })
function showMsg(text, color = 'success') {
  snackbar.value = { show: true, text, color }
}

async function checkGoogleStatus() {
  try {
    const res = await integrationsAPI.googleStatus()
    google.value = res.data
    if (google.value.connected) {
      await fetchEmails()
    }
  } catch {
    google.value = { connected: false }
  }
}

async function connectGoogle() {
  connecting.value = true
  try {
    const res = await integrationsAPI.googleAuthUrl()
    const authUrl = res.data?.auth_url
    if (authUrl) {
      // Open Google login in the same window (it'll redirect back)
      window.location.href = authUrl
    } else {
      showMsg('Could not get auth URL. Check GOOGLE_CLIENT_ID in .env', 'error')
    }
  } catch (e) {
    const msg = e.response?.data?.detail || 'Failed to start OAuth flow'
    showMsg(msg, 'error')
  } finally {
    connecting.value = false
  }
}

async function disconnectGoogle() {
  disconnecting.value = true
  try {
    await integrationsAPI.googleDisconnect()
    google.value = { connected: false }
    emails.value = []
    showMsg('Gmail disconnected')
  } catch {
    showMsg('Failed to disconnect', 'error')
  } finally {
    disconnecting.value = false
  }
}

async function fetchEmails() {
  loadingEmails.value = true
  try {
    const res = await integrationsAPI.getEmails({ days: 7, top: 10 })
    emails.value = res.data || []
  } catch (e) {
    const msg = e.response?.data?.detail || 'Failed to fetch emails'
    if (msg.includes('not connected')) {
      google.value.connected = false
    }
    console.warn('Email fetch error:', msg)
    emails.value = []
  } finally {
    loadingEmails.value = false
  }
}

function formatEmailDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now - d
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffHrs < 1) return 'Just now'
  if (diffHrs < 24) return `${diffHrs}h ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

onMounted(async () => {
  // Check for OAuth callback params
  const params = new URLSearchParams(window.location.search)
  if (params.get('gmail') === 'connected') {
    showMsg('Gmail connected successfully!')
    // Clean up URL
    window.history.replaceState({}, '', '/settings')
  } else if (params.get('error')) {
    showMsg(`OAuth error: ${params.get('error_description') || params.get('error')}`, 'error')
    window.history.replaceState({}, '', '/settings')
  }

  await checkGoogleStatus()
})
</script>
