<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading && !monitoringRunning" style="display: flex; flex-direction: column; gap: 16px;">
      <v-skeleton-loader type="heading" width="400" />
      <v-skeleton-loader type="card" />
      <v-skeleton-loader type="list-item-three-line" />
    </div>

    <!-- Monitoring in progress -->
    <div v-else-if="monitoringRunning" style="text-align: center; padding: 60px 20px;">
      <v-progress-circular indeterminate color="primary" size="64" width="4" />
      <div style="font-size: 18px; font-weight: 600; margin-top: 20px;">{{ monitoringStatus }}</div>
      <div style="font-size: 14px; color: #9ca3af; margin-top: 8px;">Step {{ monitoringStep }} of 4</div>
      <div style="width: 300px; margin: 20px auto 0;">
        <v-progress-linear
          :model-value="(monitoringStep / 4) * 100"
          color="primary"
          height="6"
          rounded
        />
      </div>
    </div>

    <!-- Deal Switcher Bar (always visible when not loading/running) -->
    <div v-else>
    <v-card class="glow-card mb-6" v-if="deals.length > 0">
      <v-card-text style="padding: 16px 24px; display: flex; align-items: center; gap: 16px;">
        <v-icon color="cyan" size="20">mdi-radar</v-icon>
        <v-select
          v-model="selectedDealId"
          :items="deals"
          item-title="label"
          item-value="id"
          label="Select deal to monitor"
          variant="outlined"
          density="compact"
          hide-details
          style="max-width: 360px;"
          @update:modelValue="onDealSwitch"
        />
        <v-btn
          variant="flat"
          color="primary"
          size="small"
          class="text-none"
          :disabled="!effectiveDealId"
          :loading="monitoringRunning"
          @click="runMonitoring"
        >
          <v-icon start size="14">mdi-play</v-icon>
          Run Monitoring Agent
        </v-btn>
        <v-btn
          v-if="alerts.length > 0"
          variant="outlined"
          color="warning"
          size="small"
          class="text-none"
          :disabled="!effectiveDealId || clearingAlerts"
          :loading="clearingAlerts"
          @click="clearAlerts"
        >
          <v-icon start size="14">mdi-delete-sweep-outline</v-icon>
          Clear Previous Alerts
        </v-btn>
        <v-spacer />
        <div v-if="currentDeal" style="font-size: 12px; color: #9ca3af;">
          Viewing: <strong style="color: #c084fc;">{{ currentDeal.client_name }}</strong>
        </div>
      </v-card-text>
    </v-card>
    <div v-else-if="!loading" style="text-align: center; padding: 60px 20px;">
      <v-icon size="64" color="grey">mdi-briefcase-outline</v-icon>
      <div style="font-size: 18px; font-weight: 600; margin-top: 16px;">No deals found</div>
      <div style="font-size: 14px; color: #9ca3af; margin-top: 8px;">Create a deal first from the Dashboard</div>
    </div>

    <!-- No Alerts State -->
    <div v-if="deals.length > 0 && !currentAlert" style="text-align: center; padding: 60px 20px;">
      <v-icon size="64" color="grey">mdi-bell-outline</v-icon>
      <div style="font-size: 18px; font-weight: 600; margin-top: 16px;">No active alerts</div>
      <div style="font-size: 14px; color: #9ca3af; margin-top: 8px;">Select a deal above and run monitoring to detect risks</div>

      <!-- No-emails info banner -->
      <div v-if="noEmailsReason" style="max-width: 500px; margin: 20px auto 0; padding: 14px 20px; border-radius: 12px; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); text-align: left;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <v-icon color="warning" size="16">mdi-email-off-outline</v-icon>
          <span style="font-size: 13px; font-weight: 600; color: #fbbf24;">No relevant emails found</span>
        </div>
        <div style="font-size: 12px; color: #9ca3af; line-height: 1.6;">{{ noEmailsReason }}</div>
      </div>
    </div>

    <!-- Main Content (alerts found) -->
    <template v-if="currentAlert">
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px;">
      <div>
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 6px;">
          <v-chip variant="flat" size="small" :color="isPositiveAlert ? 'success' : 'error'" style="font-weight: 700; font-size: 12px;">{{ isPositiveAlert ? 'UPDATE' : 'ALERT' }}</v-chip>
          <span style="font-size: 28px; font-weight: 700;">{{ isPositiveAlert ? 'Positive Signal Detected' : 'Instant Risk Detection & Recovery' }}</span>
        </div>
        <div style="font-size: 14px; color: #9ca3af;">{{ isPositiveAlert ? 'DealMind detected a positive signal and drafted a follow-up response' : 'DealMind detected a potential deal risk and drafted a recovery response' }}</div>
      </div>
      <v-btn variant="outlined" color="primary" size="small" class="text-none" @click="runMonitoring" :loading="monitoringRunning">
        <v-icon start size="14">mdi-refresh</v-icon>
        Re-run Monitoring
      </v-btn>
    </div>

    <v-row>
      <!-- Left Column -->
      <v-col cols="5">
        <!-- Deal at Risk Card -->
        <v-card class="mb-5" :style="isPositiveAlert
          ? 'background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.04)) !important; border: 1px solid rgba(34, 197, 94, 0.3) !important; border-radius: 16px !important;'
          : 'background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.04)) !important; border: 1px solid rgba(239, 68, 68, 0.3) !important; border-radius: 16px !important;'">
          <div :style="isPositiveAlert
            ? 'padding: 16px 20px; display: flex; align-items: center; gap: 12px; background: rgba(34, 197, 94, 0.1); border-bottom: 1px solid rgba(34, 197, 94, 0.2);'
            : 'padding: 16px 20px; display: flex; align-items: center; gap: 12px; background: rgba(239, 68, 68, 0.1); border-bottom: 1px solid rgba(239, 68, 68, 0.2);'">
            <v-icon :color="isPositiveAlert ? 'success' : 'error'" size="22">{{ isPositiveAlert ? 'mdi-check-decagram' : 'mdi-bell-alert-outline' }}</v-icon>
            <span style="font-weight: 700; font-size: 18px;">{{ isPositiveAlert ? 'DEAL LOOKING GOOD' : 'DEAL AT RISK' }}</span>
          </div>
          <v-card-text style="padding: 24px;">
            <div style="font-size: 28px; font-weight: 800; margin-bottom: 4px;">{{ currentDeal?.name || currentDeal?.client_name || 'Unknown Deal' }}</div>
            <div style="font-size: 14px; color: #9ca3af; margin-bottom: 20px;">{{ currentDeal?.description || currentDeal?.title || 'Project' }}</div>

            <v-row class="mb-5">
              <v-col cols="6">
                <div style="padding: 16px; border-radius: 12px; background: rgba(0,0,0,0.25);">
                  <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">{{ isPositiveAlert ? 'Status' : 'Severity' }}</div>
                  <div v-if="isPositiveAlert" style="font-size: 18px; font-weight: 700; color: #4ade80; display: flex; align-items: center; gap: 8px;">
                    <v-icon color="success" size="18">mdi-check-circle</v-icon>
                    POSITIVE
                  </div>
                  <div v-else style="font-size: 18px; font-weight: 700; color: #ef4444; display: flex; align-items: center; gap: 8px;">
                    <v-icon color="error" size="18">mdi-alert</v-icon>
                    {{ currentAlert?.severity?.toUpperCase() || 'UNKNOWN' }}
                  </div>
                </div>
              </v-col>
              <v-col cols="6">
                <div style="padding: 16px; border-radius: 12px; background: rgba(0,0,0,0.25);">
                  <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Deal Value</div>
                  <div style="font-size: 18px; font-weight: 700;">{{ formatCost(currentDeal?.deal_value || currentDeal?.value) }}</div>
                </div>
              </v-col>
            </v-row>

            <!-- Red Flags or Positive Signals -->
            <div style="font-size: 13px; font-weight: 600; margin-bottom: 12px;">{{ isPositiveAlert ? 'Positive Signals' : 'Detected Red Flags' }}</div>
            <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;">
              <div v-for="(flag, idx) in redFlags" :key="idx" style="display: flex; align-items: flex-start; gap: 12px; padding: 14px; border-radius: 12px; background: rgba(0,0,0,0.2);">
                <v-icon :color="isPositiveAlert ? 'success' : 'error'" size="16" style="margin-top: 2px; flex-shrink: 0;">{{ isPositiveAlert ? 'mdi-check-circle' : 'mdi-flag' }}</v-icon>
                <div>
                  <div style="font-weight: 600; font-size: 13px;">{{ flag }}</div>
                  <div style="font-size: 12px; color: #9ca3af; font-style: italic; margin-top: 4px;">{{ isPositiveAlert ? 'Positive signal detected by Quinn' : 'Risk detected by Quinn' }}</div>
                </div>
              </div>
            </div>

            <!-- Sentiment Gauge -->
            <div style="padding: 20px; border-radius: 12px; background: rgba(0,0,0,0.25);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span style="font-size: 13px; font-weight: 600;">Sentiment Score</span>
                <span :style="{ fontSize: '24px', fontWeight: 800, color: isPositiveAlert ? '#4ade80' : '#ef4444' }">{{ (currentAlert?.sentiment_score || 0).toFixed(1) }}</span>
              </div>
              <div style="position: relative; height: 12px; border-radius: 6px; overflow: hidden; background: linear-gradient(90deg, #ef4444, #f59e0b, #22c55e);">
                <div :style="{ position: 'absolute', top: '50%', left: sentimentPosition + '%', transform: 'translate(-50%, -50%)', width: '16px', height: '16px', background: 'white', borderRadius: '50%', border: '3px solid #ef4444', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }"></div>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 10px; color: #6b7280; margin-top: 6px;">
                <span>Negative</span><span>Neutral</span><span>Positive</span>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Recommended Actions -->
        <v-card class="glow-card">
          <v-card-text style="padding: 20px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
              <v-icon color="primary" size="18">mdi-lightbulb-outline</v-icon>
              <span style="font-size: 16px; font-weight: 600;">Recommended Actions</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div v-for="action in (currentAlert?.recovery_actions || [])" :key="action.id" style="display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 12px; background: rgba(139, 92, 246, 0.06); cursor: pointer;" class="action-row" @click="toggleAction(action.id)">
                <v-icon :color="action.completed ? 'success' : 'grey'" size="18">{{ action.completed ? 'mdi-check-circle' : 'mdi-circle-outline' }}</v-icon>
                <span style="flex: 1; font-size: 13px;">{{ action.action_text || action.description }}</span>
                <v-chip size="x-small" :color="getPriorityColor(action.priority)" variant="tonal" style="font-size: 10px; font-weight: 700;">P{{ action.priority || 0 }}</v-chip>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Right Column: Source Emails + Draft Email -->
      <v-col cols="7">
        <!-- Source Emails Card (what triggered the risk) -->
        <v-card v-if="sourceEmails.length > 0" class="glow-card mb-5" style="border: 1px solid rgba(245, 158, 11, 0.25) !important;">
          <div style="padding: 16px 20px; display: flex; align-items: center; gap: 10px; background: rgba(245, 158, 11, 0.08); border-bottom: 1px solid rgba(245, 158, 11, 0.2);">
            <v-icon color="warning" size="20">mdi-email-search-outline</v-icon>
            <span style="font-weight: 700; font-size: 16px;">Source Emails (Triggered This Alert)</span>
            <v-chip size="x-small" variant="tonal" color="warning" style="font-weight: 700;">{{ sourceEmails.length }}</v-chip>
          </div>
          <v-card-text style="padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; max-height: 320px; overflow-y: auto;">
            <div v-for="(email, idx) in sourceEmails" :key="idx" style="padding: 14px 16px; border-radius: 12px; background: rgba(0,0,0,0.2); border-left: 3px solid rgba(245, 158, 11, 0.5);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 13px; font-weight: 600; color: #fbbf24;">{{ email.subject || '(No subject)' }}</span>
                <span style="font-size: 11px; color: #6b7280;">{{ email.date || '' }}</span>
              </div>
              <div style="font-size: 11px; color: #9ca3af; margin-bottom: 8px;">
                From: <span style="color: #d1d5db;">{{ email.from || 'Unknown' }}</span>
              </div>
              <div style="font-size: 12px; color: #d1d5db; line-height: 1.6; white-space: pre-line;">{{ email.content || email.preview || '' }}</div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Draft Recovery Email Card -->
        <v-card class="glow-card" style="display: flex; flex-direction: column;">
          <div style="padding: 20px 24px; border-bottom: 1px solid rgba(139, 92, 246, 0.12); background: rgba(0,0,0,0.15);">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
              <v-icon color="primary" size="22">mdi-email-outline</v-icon>
              <span style="font-weight: 700; font-size: 18px;">{{ isPositiveAlert ? 'Draft Follow-up Email' : 'Draft Recovery Email' }}</span>
              <v-chip size="x-small" variant="flat" style="background: linear-gradient(135deg, #a855f7, #ec4899); color: white; font-size: 10px; font-weight: 700;">AI GENERATED</v-chip>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="width: 56px; font-size: 12px; color: #6b7280;">To:</span>
                <span style="font-size: 13px;">{{ recoveryRecipient }}</span>
              </div>
              <div v-if="!editingEmail" style="display: flex; align-items: center; gap: 12px;">
                <span style="width: 56px; font-size: 12px; color: #6b7280;">Subject:</span>
                <span style="font-size: 13px;">{{ emailSubject || 'Response to Your Concerns' }}</span>
              </div>
              <div v-else style="display: flex; align-items: center; gap: 12px;">
                <span style="width: 56px; font-size: 12px; color: #6b7280;">Subject:</span>
                <v-text-field v-model="editSubject" variant="outlined" density="compact" hide-details style="font-size: 13px;" />
              </div>
            </div>
          </div>

          <!-- View mode: render as HTML if edited, otherwise plain text -->
          <div v-if="!editingEmail && isHtmlBody" style="flex: 1; padding: 24px; font-size: 13px; color: #d1d5db; line-height: 1.8; overflow-y: auto; min-height: 200px;" v-html="emailBody" />
          <div v-else-if="!editingEmail" style="flex: 1; padding: 24px; font-size: 13px; color: #d1d5db; line-height: 1.8; white-space: pre-line; overflow-y: auto; min-height: 200px;">{{ emailBody || 'Recovery email content will be generated by Quinn...' }}</div>

          <!-- Edit mode: Rich Text Editor -->
          <div v-else style="flex: 1; display: flex; flex-direction: column; border-top: 1px solid rgba(139, 92, 246, 0.12);">
            <!-- Toolbar -->
            <div style="display: flex; flex-wrap: wrap; gap: 2px; padding: 8px 16px; background: rgba(0,0,0,0.25); border-bottom: 1px solid rgba(139, 92, 246, 0.15);">
              <!-- Text style group -->
              <v-btn-group variant="outlined" density="compact" divided style="height: 32px;">
                <v-btn size="x-small" @click="execCmd('bold')" :color="isBold ? 'primary' : ''" title="Bold (Ctrl+B)">
                  <v-icon size="16">mdi-format-bold</v-icon>
                </v-btn>
                <v-btn size="x-small" @click="execCmd('italic')" :color="isItalic ? 'primary' : ''" title="Italic (Ctrl+I)">
                  <v-icon size="16">mdi-format-italic</v-icon>
                </v-btn>
                <v-btn size="x-small" @click="execCmd('underline')" :color="isUnderline ? 'primary' : ''" title="Underline (Ctrl+U)">
                  <v-icon size="16">mdi-format-underline</v-icon>
                </v-btn>
                <v-btn size="x-small" @click="execCmd('strikeThrough')" title="Strikethrough">
                  <v-icon size="16">mdi-format-strikethrough</v-icon>
                </v-btn>
              </v-btn-group>

              <div style="width: 1px; background: rgba(139,92,246,0.2); margin: 2px 6px;" />

              <!-- Font size -->
              <v-btn-group variant="outlined" density="compact" divided style="height: 32px;">
                <v-btn size="x-small" @click="execCmd('fontSize', '2')" title="Small text">
                  <span style="font-size: 10px; font-weight: 700;">A</span>
                </v-btn>
                <v-btn size="x-small" @click="execCmd('fontSize', '3')" title="Normal text">
                  <span style="font-size: 13px; font-weight: 700;">A</span>
                </v-btn>
                <v-btn size="x-small" @click="execCmd('fontSize', '5')" title="Large text">
                  <span style="font-size: 17px; font-weight: 700;">A</span>
                </v-btn>
              </v-btn-group>

              <div style="width: 1px; background: rgba(139,92,246,0.2); margin: 2px 6px;" />

              <!-- Text color -->
              <v-menu :close-on-content-click="false">
                <template #activator="{ props }">
                  <v-btn size="x-small" variant="outlined" v-bind="props" title="Text Color" style="height: 32px;">
                    <v-icon size="16">mdi-format-color-text</v-icon>
                    <div style="width: 14px; height: 3px; background: currentColor; margin-top: 1px;" />
                  </v-btn>
                </template>
                <div style="display: flex; gap: 4px; padding: 8px; background: #1e1e2e; border-radius: 8px;">
                  <div v-for="c in textColors" :key="c" @click="execCmd('foreColor', c)" style="width: 22px; height: 22px; border-radius: 4px; cursor: pointer; border: 1px solid rgba(255,255,255,0.1);" :style="{ background: c }" />
                </div>
              </v-menu>

              <!-- Highlight -->
              <v-menu :close-on-content-click="false">
                <template #activator="{ props }">
                  <v-btn size="x-small" variant="outlined" v-bind="props" title="Highlight" style="height: 32px;">
                    <v-icon size="16">mdi-format-color-highlight</v-icon>
                  </v-btn>
                </template>
                <div style="display: flex; gap: 4px; padding: 8px; background: #1e1e2e; border-radius: 8px;">
                  <div v-for="c in highlightColors" :key="c" @click="execCmd('hiliteColor', c)" style="width: 22px; height: 22px; border-radius: 4px; cursor: pointer; border: 1px solid rgba(255,255,255,0.1);" :style="{ background: c }" />
                  <div @click="execCmd('hiliteColor', 'transparent')" style="width: 22px; height: 22px; border-radius: 4px; cursor: pointer; border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center;">
                    <v-icon size="12" color="grey">mdi-close</v-icon>
                  </div>
                </div>
              </v-menu>

              <div style="width: 1px; background: rgba(139,92,246,0.2); margin: 2px 6px;" />

              <!-- Alignment -->
              <v-btn-group variant="outlined" density="compact" divided style="height: 32px;">
                <v-btn size="x-small" @click="execCmd('justifyLeft')" title="Align Left">
                  <v-icon size="16">mdi-format-align-left</v-icon>
                </v-btn>
                <v-btn size="x-small" @click="execCmd('justifyCenter')" title="Center">
                  <v-icon size="16">mdi-format-align-center</v-icon>
                </v-btn>
                <v-btn size="x-small" @click="execCmd('justifyRight')" title="Align Right">
                  <v-icon size="16">mdi-format-align-right</v-icon>
                </v-btn>
              </v-btn-group>

              <div style="width: 1px; background: rgba(139,92,246,0.2); margin: 2px 6px;" />

              <!-- Lists & indent -->
              <v-btn-group variant="outlined" density="compact" divided style="height: 32px;">
                <v-btn size="x-small" @click="execCmd('insertUnorderedList')" title="Bullet List">
                  <v-icon size="16">mdi-format-list-bulleted</v-icon>
                </v-btn>
                <v-btn size="x-small" @click="execCmd('insertOrderedList')" title="Numbered List">
                  <v-icon size="16">mdi-format-list-numbered</v-icon>
                </v-btn>
                <v-btn size="x-small" @click="execCmd('indent')" title="Indent">
                  <v-icon size="16">mdi-format-indent-increase</v-icon>
                </v-btn>
                <v-btn size="x-small" @click="execCmd('outdent')" title="Outdent">
                  <v-icon size="16">mdi-format-indent-decrease</v-icon>
                </v-btn>
              </v-btn-group>

              <div style="width: 1px; background: rgba(139,92,246,0.2); margin: 2px 6px;" />

              <!-- Extras -->
              <v-btn-group variant="outlined" density="compact" divided style="height: 32px;">
                <v-btn size="x-small" @click="insertLink" title="Insert Link">
                  <v-icon size="16">mdi-link-variant</v-icon>
                </v-btn>
                <v-btn size="x-small" @click="execCmd('insertHorizontalRule')" title="Horizontal Line">
                  <v-icon size="16">mdi-minus</v-icon>
                </v-btn>
                <v-btn size="x-small" @click="execCmd('removeFormat')" title="Clear Formatting">
                  <v-icon size="16">mdi-format-clear</v-icon>
                </v-btn>
                <v-btn size="x-small" @click="execCmd('undo')" title="Undo">
                  <v-icon size="16">mdi-undo</v-icon>
                </v-btn>
                <v-btn size="x-small" @click="execCmd('redo')" title="Redo">
                  <v-icon size="16">mdi-redo</v-icon>
                </v-btn>
              </v-btn-group>
            </div>

            <!-- Editable area -->
            <div
              ref="editorRef"
              contenteditable="true"
              @input="onEditorInput"
              @keyup="updateToolbarState"
              @mouseup="updateToolbarState"
              style="flex: 1; padding: 20px 24px; font-size: 14px; color: #e5e7eb; line-height: 1.7; min-height: 250px; max-height: 400px; overflow-y: auto; outline: none; font-family: 'Segoe UI', Arial, sans-serif;"
            />
          </div>

          <div style="padding: 16px 24px; background: rgba(168, 85, 247, 0.06); border-top: 1px solid rgba(139, 92, 246, 0.12);">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <v-icon color="primary" size="14">mdi-star-outline</v-icon>
              <span style="font-size: 12px; color: #c084fc; font-weight: 600;">Quinn's Insights</span>
            </div>
            <div style="font-size: 11px; color: #9ca3af;">Empathetic tone -- Avoided defensive language -- Offered concrete alternatives -- Clear call-to-action</div>
          </div>

          <div style="padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(139, 92, 246, 0.12);">
            <div style="display: flex; gap: 10px;">
              <v-btn v-if="!editingEmail" variant="outlined" color="primary" size="small" class="text-none" @click="runMonitoring">
                <v-icon start size="14">mdi-refresh</v-icon>Regenerate
              </v-btn>
              <v-btn v-if="!editingEmail" variant="outlined" color="primary" size="small" class="text-none" @click="startEditing">
                <v-icon start size="14">mdi-pencil-outline</v-icon>Edit
              </v-btn>
              <v-btn v-if="editingEmail" variant="outlined" color="success" size="small" class="text-none" @click="saveEdit">
                <v-icon start size="14">mdi-check</v-icon>Save
              </v-btn>
              <v-btn v-if="editingEmail" variant="outlined" color="grey" size="small" class="text-none" @click="cancelEdit">
                <v-icon start size="14">mdi-close</v-icon>Cancel
              </v-btn>
            </div>
            <v-btn
              variant="flat"
              size="default"
              class="text-none"
              style="background: linear-gradient(135deg, #EA4335, #FBBC04); color: white; font-weight: 700;"
              :loading="sendingEmail"
              :disabled="!emailBody || !emailSubject"
              @click="sendViaGmail"
            >
              <v-icon start size="16">mdi-send</v-icon>
              Send via Gmail
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
    </template>
    </div>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="4000" location="bottom right">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { alertsAPI, dealsAPI, integrationsAPI } from '../api'
import { useAgentTasks } from '../stores/agentTasks'

const route = useRoute()
const { startTask: storeStartTask, resumePolling, getTask, isRunning } = useAgentTasks()
const monitorTask = getTask('monitoring')

const dealId = ref(route.params.dealId || null)
const selectedDealId = ref(null)
const loading = ref(false)

// Computed properties bridging store state to template
const monitoringRunning = computed(() => monitorTask.status === 'running')
const monitoringStatus = computed(() => monitorTask.stepMessage || 'Starting monitoring agent...')
const monitoringStep = computed(() => monitorTask.stepNumber)

const currentAlert = ref(null)
const currentDeal = ref(null)
const emailBody = ref('')
const emailSubject = ref('')
const alerts = ref([])
const deals = ref([])
const noEmailsReason = ref(null)

// Edit mode state
const editingEmail = ref(false)
const editSubject = ref('')
const editBody = ref('')
const editorRef = ref(null)

// Rich text toolbar state
const isBold = ref(false)
const isItalic = ref(false)
const isUnderline = ref(false)

const isHtmlBody = computed(() => /<[a-z][\s\S]*>/i.test(emailBody.value || ''))
const isPositiveAlert = computed(() => currentAlert.value?.alert_type === 'positive_update')

const textColors = ['#ffffff', '#e5e7eb', '#f87171', '#fb923c', '#fbbf24', '#4ade80', '#60a5fa', '#a78bfa', '#f472b6']
const highlightColors = ['#fef08a', '#bbf7d0', '#bfdbfe', '#e9d5ff', '#fecdd3', '#fed7aa']

// Source emails parsed from alert.source_context
const sourceEmails = computed(() => {
  if (!currentAlert.value?.source_context) return []
  try {
    const parsed = JSON.parse(currentAlert.value.source_context)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
})

// Derive the recovery email recipient from the source email sender
const recoveryRecipient = computed(() => {
  if (sourceEmails.value.length > 0) {
    const firstFrom = sourceEmails.value[0]?.from || ''
    if (firstFrom) return firstFrom
  }
  return currentDeal.value?.contact_email || 'contact@client.com'
})

const snackbar = ref({ show: false, text: '', color: 'success' })
function showMsg(text, color = 'success') {
  snackbar.value = { show: true, text, color }
}

const sendingEmail = ref(false)
const clearingAlerts = ref(false)

const effectiveDealId = computed(() => dealId.value || selectedDealId.value)

async function onDealSwitch(newDealId) {
  if (!newDealId) return
  // Reset state for the new deal
  currentAlert.value = null
  currentDeal.value = null
  emailBody.value = ''
  emailSubject.value = ''
  noEmailsReason.value = null
  editingEmail.value = false
  editSubject.value = ''
  editBody.value = ''
  // Reload alerts for the selected deal
  await loadAlerts()
}

async function clearAlerts() {
  const dId = effectiveDealId.value
  if (!dId) return
  clearingAlerts.value = true
  try {
    const res = await alertsAPI.clearForDeal(dId)
    const count = res.data?.deleted || 0
    showMsg(`Cleared ${count} previous alert(s)`)
    // Reset all alert state
    alerts.value = []
    currentAlert.value = null
    emailBody.value = ''
    emailSubject.value = ''
    noEmailsReason.value = null
    editingEmail.value = false
  } catch (e) {
    showMsg('Failed to clear alerts', 'error')
  } finally {
    clearingAlerts.value = false
  }
}

const redFlags = computed(() => {
  if (!currentAlert.value) return []
  // Try risk_factors first, then build from description
  if (currentAlert.value.risk_factors?.length) return currentAlert.value.risk_factors
  if (currentAlert.value.description) return [currentAlert.value.description]
  return [currentAlert.value.title || 'Risk detected']
})

const sentimentPosition = computed(() => {
  if (!currentAlert.value?.sentiment_score) return 50
  const score = currentAlert.value.sentiment_score
  return Math.max(0, Math.min(100, ((score + 1) / 2) * 100))
})

async function loadDeals() {
  try {
    const res = await dealsAPI.list()
    const rawDeals = res.data?.deals || (Array.isArray(res.data) ? res.data : [])
    deals.value = rawDeals.map(d => ({
      ...d,
      label: `${d.client_name} — ${d.title}`,
    }))
  } catch (e) {
    console.warn('Failed to load deals:', e)
  }
}

async function loadAlerts() {
  loading.value = true
  try {
    let alertsList = []
    const dId = effectiveDealId.value
    if (dId) {
      const res = await alertsAPI.list({ deal_id: dId })
      alertsList = res.data
    } else {
      const res = await alertsAPI.list()
      alertsList = res.data
    }

    if (alertsList.length > 0) {
      const mostCritical = alertsList.sort((a, b) => {
        const severityOrder = { critical: 3, high: 2, medium: 1, low: 0 }
        return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0)
      })[0]

      await loadAlert(mostCritical.id)
    }

    alerts.value = alertsList
  } catch (error) {
    console.error('Error loading alerts:', error)
  } finally {
    loading.value = false
  }
}

async function loadAlert(alertId) {
  try {
    const alertRes = await alertsAPI.get(alertId)
    currentAlert.value = alertRes.data

    if (currentAlert.value.deal_id) {
      const dealRes = await dealsAPI.get(currentAlert.value.deal_id)
      currentDeal.value = dealRes.data
    }

    if (currentAlert.value.email_body) {
      emailBody.value = currentAlert.value.email_body
    }
    if (currentAlert.value.email_subject) {
      emailSubject.value = currentAlert.value.email_subject
    }
  } catch (error) {
    console.error('Error loading alert:', error)
  }
}

async function toggleAction(actionId) {
  try {
    await alertsAPI.toggleAction(currentAlert.value.id, actionId)
    await loadAlert(currentAlert.value.id)
  } catch (error) {
    console.error('Error toggling action:', error)
  }
}

// Completion handler for monitoring tasks (called by store)
async function onMonitoringComplete(task) {
  if (task.status === 'completed') {
    const resultData = task.result || {}
    // Handle result whether it's a string or object
    let parsedResult = resultData
    if (typeof resultData === 'string') {
      try { parsedResult = JSON.parse(resultData) } catch { parsedResult = {} }
    }
    if (parsedResult.no_emails_reason) {
      noEmailsReason.value = parsedResult.no_emails_reason
      showMsg('Monitoring complete — no relevant emails found', 'warning')
    } else {
      noEmailsReason.value = null
      showMsg('Monitoring complete — alerts generated!')
    }
    await loadAlerts()
  } else if (task.status === 'failed') {
    showMsg(task.error || 'Monitoring failed', 'error')
  }
}

async function runMonitoring() {
  const dId = effectiveDealId.value
  if (!dId) {
    showMsg('Please select a deal first', 'warning')
    return
  }

  noEmailsReason.value = null
  await storeStartTask(dId, 'monitoring', onMonitoringComplete)
}

// ── Rich text editor helpers ──
function execCmd(command, value = null) {
  document.execCommand(command, false, value)
  editorRef.value?.focus()
  updateToolbarState()
}

function updateToolbarState() {
  isBold.value = document.queryCommandState('bold')
  isItalic.value = document.queryCommandState('italic')
  isUnderline.value = document.queryCommandState('underline')
}

function insertLink() {
  const url = prompt('Enter URL:')
  if (url) execCmd('createLink', url)
}

function onEditorInput() {
  // Keep editBody in sync with contenteditable HTML
  if (editorRef.value) {
    editBody.value = editorRef.value.innerHTML
  }
}

function plainTextToHtml(text) {
  // Convert plain text to formatted HTML for the editor
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  const paragraphs = escaped.split(/\n\n+/).map(p => p.trim()).filter(Boolean)
  return paragraphs
    .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('')
}

function wrapHtmlForEmail(html) {
  // Wrap editor HTML in a styled container for Gmail sending
  return `<div style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1a1a1a; max-width: 640px;">${html}</div>`
}

async function startEditing() {
  editSubject.value = emailSubject.value
  // Convert plain text body to HTML paragraphs for the editor
  const body = emailBody.value || ''
  editBody.value = body.includes('<') ? body : plainTextToHtml(body)
  editingEmail.value = true
  await nextTick()
  if (editorRef.value) {
    editorRef.value.innerHTML = editBody.value
    editorRef.value.focus()
  }
}

function cancelEdit() {
  editingEmail.value = false
  editSubject.value = ''
  editBody.value = ''
}

async function saveEdit() {
  // Read final content from the contenteditable
  if (editorRef.value) {
    editBody.value = editorRef.value.innerHTML
  }
  const newSubject = editSubject.value
  const newBody = editBody.value

  emailSubject.value = newSubject
  emailBody.value = newBody
  editingEmail.value = false

  // Also update currentAlert so loadAlert() won't overwrite
  if (currentAlert.value) {
    currentAlert.value.email_subject = newSubject
    currentAlert.value.email_body = newBody
  }

  // Persist to backend
  if (currentAlert.value?.id) {
    try {
      await alertsAPI.update(currentAlert.value.id, {
        email_subject: newSubject,
        email_body: newBody,
      })
      showMsg('Recovery email updated')
    } catch (e) {
      console.warn('Could not save email edit to backend:', e)
      showMsg('Email updated locally (save to server failed)', 'warning')
    }
  }
}

async function sendViaGmail() {
  // If user is still in edit mode, auto-save their changes first
  if (editingEmail.value) {
    await saveEdit()
  }

  const recipient = recoveryRecipient.value
  if (!recipient || recipient === 'contact@client.com') {
    showMsg('No valid recipient email found', 'warning')
    return
  }
  const subject = emailSubject.value
  const body = emailBody.value
  if (!subject || !body) {
    showMsg('Cannot send — email subject or body is empty', 'warning')
    return
  }

  sendingEmail.value = true
  try {
    let toAddress = recipient
    const match = recipient.match(/<([^>]+)>/)
    if (match) toAddress = match[1]

    // If body already has HTML tags (from rich editor), wrap it; otherwise convert plain text
    const isHtml = /<[a-z][\s\S]*>/i.test(body)
    const htmlBody = isHtml ? wrapHtmlForEmail(body) : wrapHtmlForEmail(plainTextToHtml(body))

    await integrationsAPI.sendEmail({
      to: [toAddress],
      subject,
      body: htmlBody,
    })
    showMsg('Recovery email sent via Gmail!')
  } catch (e) {
    console.error('Failed to send email:', e)
    const detail = e.response?.data?.detail || 'Failed to send email'
    showMsg(detail, 'error')
  } finally {
    sendingEmail.value = false
  }
}

function getPriorityColor(priority) {
  if (typeof priority === 'number') {
    if (priority <= 1) return 'error'
    if (priority <= 2) return 'warning'
    return 'info'
  }
  switch (priority?.toLowerCase()) {
    case 'critical':
    case 'high':
      return 'error'
    case 'medium':
      return 'warning'
    default:
      return 'info'
  }
}

function formatCost(cost) {
  if (!cost) return '$0'
  if (cost >= 1000000) return '$' + (cost / 1000000).toFixed(1) + 'M'
  if (cost >= 1000) return '$' + (cost / 1000).toFixed(0) + 'K'
  return '$' + cost
}

onMounted(async () => {
  await loadDeals()
  // Pre-select deal from route params if present
  if (dealId.value) {
    selectedDealId.value = dealId.value
  }
  await loadAlerts()

  // Resume monitoring polling if task is still running (user navigated away and came back)
  if (isRunning('monitoring')) {
    resumePolling('monitoring', onMonitoringComplete)
  }
  // If task already completed while away, load results
  if (monitorTask.status === 'completed') {
    await loadAlerts()
  }
})

</script>

<style scoped>
.action-row:hover { background: rgba(139, 92, 246, 0.12) !important; }
</style>
