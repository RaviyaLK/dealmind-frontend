<template>
  <div>
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px;">
      <div>
        <span style="font-size: 28px; font-weight: 700;">Proposals</span>
        <div style="font-size: 14px; color: #9ca3af; margin-top: 4px;">AI-generated proposals with supporting documents</div>
      </div>
    </div>

    <!-- Deal Selector -->
    <v-card class="glow-card mb-6" style="max-width: 500px;" v-if="!selectedDealId">
      <v-card-text style="padding: 24px;">
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 12px;">Select a Deal</div>
        <v-select
          v-model="selectedDealId"
          :items="deals"
          item-title="label"
          item-value="id"
          label="Choose a deal"
          outlined
          dense
          :loading="loadingDeals"
          @update:modelValue="onDealSelected"
        />
      </v-card-text>
    </v-card>

    <!-- Loading -->
    <div v-if="loading" style="display: flex; flex-direction: column; gap: 16px;">
      <v-skeleton-loader type="card" />
      <v-skeleton-loader type="article" />
    </div>

    <!-- No proposals yet -->
    <div v-else-if="selectedDealId && proposals.length === 0 && !loading" style="text-align: center; padding: 60px 20px;">
      <v-icon size="64" color="grey" style="margin-bottom: 16px;">mdi-file-document-outline</v-icon>
      <div style="font-size: 18px; font-weight: 600; margin-top: 8px;">No proposals yet</div>
      <div style="font-size: 14px; color: #9ca3af; margin-top: 8px;">Go to the Decision screen and click "Proceed to Proposal" to generate one</div>
    </div>

    <!-- Proposal Content -->
    <template v-if="selectedDealId && currentProposal">
      <!-- Deal chip + proposal selector -->
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
        <v-chip variant="flat" color="purple" size="small" closable @click:close="resetDeal">
          {{ currentDealLabel }}
        </v-chip>
        <v-select
          v-if="proposals.length > 1"
          v-model="selectedProposalId"
          :items="proposals"
          item-title="title"
          item-value="id"
          label="Version"
          outlined
          dense
          hide-details
          style="max-width: 280px;"
          @update:modelValue="selectProposal"
        />
        <v-spacer />
        <v-btn
          :variant="showChat ? 'flat' : 'outlined'"
          :color="showChat ? 'cyan' : 'purple'"
          size="small"
          class="text-none mr-2"
          @click="showChat = !showChat"
        >
          <v-icon start size="16">mdi-chat-outline</v-icon>
          {{ showChat ? 'Close Chat' : 'Chat with Quinn' }}
        </v-btn>
        <v-btn
          variant="flat"
          color="purple"
          size="small"
          class="text-none mr-2"
          @click="showTemplateSelector = true"
        >
          <v-icon start size="16">mdi-file-word-box</v-icon>
          Download DOCX
        </v-btn>
        <v-chip
          variant="flat"
          size="small"
          :color="statusColor(currentProposal.status)"
          style="font-weight: 700; text-transform: uppercase; font-size: 11px;"
        >{{ currentProposal.status }}</v-chip>
      </div>

      <v-row>
        <!-- Left Column: Proposal content -->
        <v-col :cols="showChat ? 7 : 8">
          <v-card class="glow-card mb-4">
            <v-card-text style="padding: 32px;">
              <!-- Compliance score bar -->
              <div v-if="currentProposal.compliance_score != null" style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding: 16px; border-radius: 12px; background: rgba(6, 182, 212, 0.06); border: 1px solid rgba(6, 182, 212, 0.15);">
                <v-icon color="cyan" size="20">mdi-shield-check</v-icon>
                <div style="flex: 1;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span style="font-size: 12px; font-weight: 600; color: #06b6d4;">Compliance Score</span>
                    <span style="font-size: 14px; font-weight: 700; color: #06b6d4;">{{ Math.round(currentProposal.compliance_score * 100) }}%</span>
                  </div>
                  <v-progress-linear
                    :model-value="currentProposal.compliance_score * 100"
                    color="cyan"
                    height="6"
                    rounded
                    style="border-radius: 3px;"
                  />
                </div>
              </div>

              <!-- Compliance issues -->
              <div v-if="complianceIssues.length > 0" style="margin-bottom: 24px;">
                <div style="font-size: 13px; font-weight: 600; color: #f59e0b; margin-bottom: 8px;">
                  <v-icon size="14" color="warning" style="margin-right: 4px;">mdi-alert</v-icon>
                  Compliance Issues ({{ complianceIssues.filter(i => i.status !== 'addressed').length }})
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  <div
                    v-for="(issue, idx) in complianceIssues"
                    :key="idx"
                    :style="{
                      padding: '8px 12px', borderRadius: '8px', fontSize: '12px',
                      background: issue.status === 'addressed' ? 'rgba(34,197,94,0.06)' : issue.status === 'partially_addressed' ? 'rgba(245,158,11,0.06)' : 'rgba(239,68,68,0.06)',
                      border: `1px solid ${issue.status === 'addressed' ? 'rgba(34,197,94,0.2)' : issue.status === 'partially_addressed' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    }"
                  >
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <v-icon :color="issue.status === 'addressed' ? 'success' : issue.status === 'partially_addressed' ? 'warning' : 'error'" size="14">
                        {{ issue.status === 'addressed' ? 'mdi-check-circle' : issue.status === 'partially_addressed' ? 'mdi-minus-circle' : 'mdi-close-circle' }}
                      </v-icon>
                      <span style="font-weight: 500;">{{ issue.requirement_text || `Requirement ${issue.requirement_index}` }}</span>
                    </div>
                    <div v-if="issue.notes" style="color: #9ca3af; margin-top: 4px; padding-left: 20px;">{{ issue.notes }}</div>
                  </div>
                </div>
              </div>

              <!-- Proposal markdown content -->
              <div class="proposal-content" v-html="renderedContent" />
            </v-card-text>
          </v-card>

          <!-- Review Section -->
          <v-card class="glow-card" v-if="currentProposal.status === 'draft'">
            <v-card-text style="padding: 24px;">
              <div style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">Review & Approve</div>
              <v-textarea
                v-model="reviewNotes"
                label="Review Notes (optional)"
                outlined
                dense
                rows="3"
                placeholder="Add any review comments, change requests, or approval notes..."
              />
              <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px;">
                <v-btn variant="outlined" color="error" class="text-none" :loading="reviewing" @click="reviewProposal('rejected')">
                  <v-icon start size="14">mdi-close</v-icon>
                  Reject
                </v-btn>
                <v-btn variant="flat" color="success" class="text-none" :loading="reviewing" @click="reviewProposal('approved')">
                  <v-icon start size="14">mdi-check</v-icon>
                  Approve
                </v-btn>
              </div>
            </v-card-text>
          </v-card>

          <!-- Already reviewed -->
          <v-card class="glow-card" v-else-if="currentProposal.review_notes" style="margin-top: 16px;">
            <v-card-text style="padding: 20px 24px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <v-icon :color="currentProposal.status === 'approved' ? 'success' : 'error'" size="16">
                  {{ currentProposal.status === 'approved' ? 'mdi-check-decagram' : 'mdi-close-circle' }}
                </v-icon>
                <span style="font-size: 13px; font-weight: 600; text-transform: uppercase;">{{ currentProposal.status }}</span>
              </div>
              <div style="font-size: 13px; color: #d1d5db;">{{ currentProposal.review_notes }}</div>
            </v-card-text>
          </v-card>

          <!-- Deal Outcome Actions (after proposal is approved) -->
          <v-card v-if="currentProposal.status === 'approved' && dealStatus !== 'won'" class="mb-4" style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(6, 182, 212, 0.04)) !important; border: 1px solid rgba(34, 197, 94, 0.25) !important; border-radius: 16px !important; margin-top: 16px;">
            <v-card-text style="padding: 24px;">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                <v-icon color="success" size="20">mdi-trophy-outline</v-icon>
                <span style="font-size: 16px; font-weight: 700;">Close This Deal</span>
              </div>
              <div style="font-size: 12px; color: #9ca3af; margin-bottom: 16px;">
                Proposal approved! Mark the final deal outcome to update your pipeline and win rate.
              </div>
              <div style="display: flex; gap: 10px;">
                <v-btn variant="flat" color="success" class="text-none" style="font-weight: 700; flex: 1;" :loading="closingDeal" @click="closeDealAs('won')">
                  <v-icon start size="16">mdi-trophy</v-icon>
                  Mark as Won
                </v-btn>
                <v-btn variant="outlined" color="error" class="text-none" style="flex: 1;" :loading="closingDeal" @click="closeDealAs('declined')">
                  <v-icon start size="14">mdi-close</v-icon>
                  Mark as Lost
                </v-btn>
              </div>
            </v-card-text>
          </v-card>

          <!-- Deal already closed -->
          <v-card v-if="dealStatus === 'won'" style="background: rgba(34, 197, 94, 0.08) !important; border: 1px solid rgba(34, 197, 94, 0.3) !important; border-radius: 16px !important; margin-top: 16px;">
            <v-card-text style="padding: 20px 24px; text-align: center;">
              <v-icon color="success" size="36" style="margin-bottom: 8px;">mdi-trophy</v-icon>
              <div style="font-size: 18px; font-weight: 700; color: #4ade80;">Deal Won!</div>
              <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">This deal has been closed as won</div>
            </v-card-text>
          </v-card>
          <v-card v-else-if="dealStatus === 'declined'" style="background: rgba(239, 68, 68, 0.08) !important; border: 1px solid rgba(239, 68, 68, 0.3) !important; border-radius: 16px !important; margin-top: 16px;">
            <v-card-text style="padding: 20px 24px; text-align: center;">
              <v-icon color="error" size="36" style="margin-bottom: 8px;">mdi-close-circle</v-icon>
              <div style="font-size: 18px; font-weight: 700; color: #f87171;">Deal Lost</div>
              <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">This deal has been marked as lost</div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Right Column: Chat Panel OR Attachments -->
        <v-col :cols="showChat ? 5 : 4">
          <!-- ═══ CHAT PANEL ═══ -->
          <v-card v-if="showChat" class="glow-card" style="display: flex; flex-direction: column; height: calc(100vh - 200px); overflow: hidden;">
            <!-- Chat Header -->
            <div style="padding: 16px 20px; border-bottom: 1px solid rgba(139, 92, 246, 0.12); display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #06b6d4); display: flex; align-items: center; justify-content: center;">
                <v-icon size="18" color="white">mdi-robot-happy-outline</v-icon>
              </div>
              <div style="flex: 1;">
                <div style="font-size: 14px; font-weight: 700;">Quinn</div>
                <div v-if="chatLoading" style="font-size: 11px; color: #06b6d4;">Editing proposal...</div>
                <div v-else style="font-size: 11px; color: #6b7280;">Proposal editor</div>
              </div>
              <v-btn icon size="x-small" variant="text" @click="showChat = false">
                <v-icon size="16">mdi-close</v-icon>
              </v-btn>
            </div>

            <!-- Chat Messages -->
            <div ref="chatContainer" style="flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px;">
              <!-- Welcome message -->
              <div v-if="chatMessages.length === 0" style="text-align: center; padding: 40px 20px;">
                <div style="width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(6, 182, 212, 0.1)); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                  <v-icon size="28" color="purple">mdi-chat-processing-outline</v-icon>
                </div>
                <div style="font-size: 15px; font-weight: 600; margin-bottom: 8px;">Chat with Quinn</div>
                <div style="font-size: 12px; color: #9ca3af; line-height: 1.6;">
                  I can edit sections, add content, and even email proposals for you. Try:<br/>
                  <span style="color: #c084fc;">"Make the executive summary shorter"</span><br/>
                  <span style="color: #c084fc;">"Add a section about cloud infrastructure"</span><br/>
                  <span style="color: #c084fc;"></span>
                </div>
              </div>

              <!-- Message bubbles -->
              <div
                v-for="(msg, idx) in chatMessages"
                :key="idx"
                :style="{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }"
              >
                <!-- Quinn avatar (assistant only) -->
                <div v-if="msg.role === 'assistant'" style="width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #06b6d4); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-right: 8px; margin-top: 2px;">
                  <v-icon size="14" color="white">mdi-robot-happy-outline</v-icon>
                </div>
                <div style="max-width: 85%;">
                  <div
                    :style="{
                      padding: '10px 14px',
                      borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      fontSize: '13px',
                      lineHeight: '1.5',
                      background: msg.role === 'user' ? 'rgba(124, 58, 237, 0.15)' : '#1a1a2e',
                      border: msg.role === 'user' ? '1px solid rgba(124, 58, 237, 0.3)' : '1px solid rgba(139, 92, 246, 0.12)',
                      color: msg.role === 'user' ? '#e9d5ff' : '#d1d5db',
                    }"
                  >
                    {{ msg.content }}
                  </div>
                  <!-- MCP Tools Used chips -->
                  <div v-if="msg.tools_used && msg.tools_used.length > 0" style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;">
                    <span
                      v-for="tool in msg.tools_used"
                      :key="tool"
                      style="font-size: 10px; padding: 2px 8px; border-radius: 10px; background: rgba(6, 182, 212, 0.12); color: #06b6d4; border: 1px solid rgba(6, 182, 212, 0.25); font-weight: 500;"
                    >
                      <v-icon size="10" style="margin-right: 2px;">mdi-tools</v-icon>
                      {{ tool }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Loading indicator -->
              <div v-if="chatLoading" style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #06b6d4); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <v-icon size="14" color="white">mdi-robot-happy-outline</v-icon>
                </div>
                <div style="padding: 10px 14px; border-radius: 14px 14px 14px 4px; background: #1a1a2e; border: 1px solid rgba(139, 92, 246, 0.12);">
                  <div style="display: flex; gap: 4px; align-items: center;">
                    <span class="chat-dot" style="width: 6px; height: 6px; border-radius: 50%; background: #06b6d4; animation: chatPulse 1.4s ease-in-out infinite;"></span>
                    <span class="chat-dot" style="width: 6px; height: 6px; border-radius: 50%; background: #06b6d4; animation: chatPulse 1.4s ease-in-out 0.2s infinite;"></span>
                    <span class="chat-dot" style="width: 6px; height: 6px; border-radius: 50%; background: #06b6d4; animation: chatPulse 1.4s ease-in-out 0.4s infinite;"></span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Chat Input -->
            <div style="padding: 12px 16px; border-top: 1px solid rgba(139, 92, 246, 0.12); flex-shrink: 0;">
              <div style="display: flex; gap: 8px; align-items: flex-end;">
                <v-textarea
                  v-model="chatInput"
                  placeholder="Tell Quinn how to change the proposal..."
                  rows="1"
                  max-rows="3"
                  auto-grow
                  hide-details
                  density="compact"
                  variant="outlined"
                  :disabled="chatLoading"
                  @keydown.enter.exact.prevent="sendChatMessage"
                  style="font-size: 13px;"
                />
                <v-btn
                  icon
                  size="small"
                  color="purple"
                  variant="flat"
                  :disabled="!chatInput.trim() || chatLoading"
                  :loading="chatLoading"
                  @click="sendChatMessage"
                  style="flex-shrink: 0;"
                >
                  <v-icon size="18">mdi-send</v-icon>
                </v-btn>
              </div>
            </div>
          </v-card>

          <!-- ═══ ATTACHMENTS SIDEBAR (when chat is closed) ═══ -->
          <template v-else>
            <!-- Upload Supporting Files -->
            <v-card class="glow-card mb-4">
              <v-card-text style="padding: 24px;">
                <div style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">Supporting Files</div>
                <div style="font-size: 12px; color: #9ca3af; margin-bottom: 16px;">
                  Upload SOWs, pricing sheets, case studies, or any supporting docs. Text files are auto-indexed into the knowledge base for future proposals.
                </div>

                <!-- Upload area -->
                <div
                  style="border: 2px dashed rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: border-color 0.2s;"
                  @dragover.prevent
                  @drop.prevent="handleDrop"
                  @click="$refs.fileInput.click()"
                >
                  <v-icon size="32" color="purple" style="margin-bottom: 8px;">mdi-cloud-upload-outline</v-icon>
                  <div style="font-size: 13px; font-weight: 500;">Drop files here or click to browse</div>
                  <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">PDF, DOCX, XLSX, PPTX, TXT, CSV</div>
                  <input
                    ref="fileInput"
                    type="file"
                    multiple
                    accept=".pdf,.docx,.xlsx,.pptx,.txt,.csv,.png,.jpg,.jpeg"
                    style="display: none;"
                    @change="handleFileSelect"
                  />
                </div>

                <!-- Upload progress -->
                <div v-if="uploading" style="margin-top: 12px; text-align: center;">
                  <v-progress-circular indeterminate color="purple" size="24" width="2" />
                  <span style="font-size: 12px; color: #9ca3af; margin-left: 8px;">Uploading...</span>
                </div>

                <!-- Attachment list -->
                <div v-if="attachments.length > 0" style="margin-top: 16px; display: flex; flex-direction: column; gap: 8px;">
                  <div
                    v-for="att in attachments"
                    :key="att.id"
                    style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; background: rgba(139, 92, 246, 0.06); border: 1px solid rgba(139, 92, 246, 0.12);"
                  >
                    <v-icon :color="fileIconColor(att.file_type)" size="20">{{ fileIcon(att.file_type) }}</v-icon>
                    <div style="flex: 1; min-width: 0;">
                      <div style="font-size: 12px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ att.filename }}</div>
                      <div style="font-size: 10px; color: #6b7280;">{{ formatBytes(att.file_size) }} &bull; {{ att.is_processed ? 'Indexed' : 'Processing...' }}</div>
                    </div>
                    <v-btn icon size="x-small" variant="text" color="error" @click="deleteAttachment(att)">
                      <v-icon size="14">mdi-close</v-icon>
                    </v-btn>
                  </div>
                </div>

                <div v-else-if="!uploading" style="text-align: center; padding: 12px; color: #4b5563; font-size: 12px;">
                  No files uploaded yet
                </div>
              </v-card-text>
            </v-card>

            <!-- Proposal Info Card -->
            <v-card class="glow-card">
              <v-card-text style="padding: 24px;">
                <div style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">Info</div>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                  <div style="display: flex; justify-content: space-between; font-size: 12px;">
                    <span style="color: #6b7280;">Generated by</span>
                    <span style="color: #c084fc; font-weight: 600;">Quinn</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 12px;">
                    <span style="color: #6b7280;">Version</span>
                    <span>v{{ currentProposal.version }}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 12px;">
                    <span style="color: #6b7280;">Created</span>
                    <span>{{ formatDate(currentProposal.created_at) }}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 12px;">
                    <span style="color: #6b7280;">Attachments</span>
                    <span>{{ attachments.length }} files</span>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </template>
        </v-col>
      </v-row>
    </template>

    <!-- Template Selector Dialog -->
    <v-dialog v-model="showTemplateSelector" max-width="780" persistent>
      <v-card rounded="xl" style="overflow: hidden;">
        <div style="background: linear-gradient(135deg, #6B21A8 0%, #1E3A5F 100%); padding: 24px 28px;">
          <div style="color: white; font-size: 20px; font-weight: 700;">Select Proposal Template</div>
          <div style="color: rgba(255,255,255,0.7); font-size: 13px; margin-top: 4px;">Choose a style for your DOCX export</div>
        </div>

        <v-card-text style="padding: 28px;">
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
            <div
              v-for="tmpl in templateOptions"
              :key="tmpl.id"
              @click="selectedTemplate = tmpl.id"
              style="cursor: pointer; border-radius: 14px; padding: 20px; border: 2.5px solid; transition: all 0.2s ease; position: relative;"
              :style="{
                borderColor: selectedTemplate === tmpl.id ? '#' + tmpl.primary_hex : '#e5e7eb',
                background: selectedTemplate === tmpl.id ? 'rgba(' + hexToRgb(tmpl.primary_hex) + ', 0.04)' : '#fff',
                boxShadow: selectedTemplate === tmpl.id ? '0 4px 20px rgba(' + hexToRgb(tmpl.primary_hex) + ', 0.15)' : 'none',
              }"
            >
              <!-- Selected indicator -->
              <div
                v-if="selectedTemplate === tmpl.id"
                style="position: absolute; top: 10px; right: 10px; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center;"
                :style="{ background: '#' + tmpl.primary_hex }"
              >
                <v-icon size="14" color="white">mdi-check</v-icon>
              </div>

              <!-- Mini document preview -->
              <div style="background: #f9fafb; border-radius: 8px; padding: 12px; margin-bottom: 14px; border: 1px solid #e5e7eb;">
                <div style="height: 4px; border-radius: 2px; width: 100%; margin-bottom: 10px;" :style="{ background: '#' + tmpl.primary_hex }"></div>
                <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.5px; margin-bottom: 6px;" :style="{ color: '#' + tmpl.primary_hex, fontFamily: tmpl.heading_font }">ESSHVA</div>
                <div style="height: 3px; background: #e5e7eb; border-radius: 1px; width: 80%; margin-bottom: 4px;"></div>
                <div style="height: 3px; background: #e5e7eb; border-radius: 1px; width: 60%; margin-bottom: 8px;"></div>
                <div style="display: flex; gap: 4px;">
                  <div style="height: 14px; flex: 1; border-radius: 2px;" :style="{ background: '#' + tmpl.primary_hex, opacity: 0.8 }"></div>
                  <div style="height: 14px; flex: 1; border-radius: 2px;" :style="{ background: '#' + tmpl.primary_hex, opacity: 0.3 }"></div>
                  <div style="height: 14px; flex: 1; border-radius: 2px;" :style="{ background: '#' + tmpl.primary_hex, opacity: 0.15 }"></div>
                </div>
              </div>

              <!-- Template name & description -->
              <div style="font-size: 15px; font-weight: 700; margin-bottom: 4px;" :style="{ color: '#' + tmpl.primary_hex }">{{ tmpl.name }}</div>
              <div style="font-size: 12px; color: #6b7280; line-height: 1.4;">{{ tmpl.description }}</div>

              <!-- Color + font info -->
              <div style="display: flex; align-items: center; gap: 8px; margin-top: 12px;">
                <div style="display: flex; gap: 4px;">
                  <div style="width: 16px; height: 16px; border-radius: 50%;" :style="{ background: '#' + tmpl.primary_hex }" />
                  <div style="width: 16px; height: 16px; border-radius: 50%;" :style="{ background: '#' + tmpl.accent_hex }" />
                </div>
                <div style="font-size: 10px; color: #9ca3af;">{{ tmpl.heading_font }}</div>
              </div>
            </div>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions style="padding: 16px 24px;">
          <v-spacer />
          <v-btn variant="text" class="text-none" @click="showTemplateSelector = false">Cancel</v-btn>
          <v-btn
            variant="flat"
            color="purple"
            class="text-none"
            :loading="exporting"
            @click="downloadWithTemplate"
          >
            <v-icon start size="16">mdi-download</v-icon>
            Download {{ templateOptions.find(t => t.id === selectedTemplate)?.name || 'Modern' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000" location="bottom right">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { dealsAPI, proposalsAPI } from '../api'
import api from '../api/client'

const route = useRoute()

const loading = ref(false)
const loadingDeals = ref(false)
const uploading = ref(false)
const reviewing = ref(false)
const exporting = ref(false)
const chatLoading = ref(false)

const deals = ref([])
const proposals = ref([])
const attachments = ref([])

const selectedDealId = ref(null)
const selectedProposalId = ref(null)
const currentProposal = ref(null)
const reviewNotes = ref('')

// ── Chat with Quinn ──
const showChat = ref(false)
const chatMessages = ref([])
const chatInput = ref('')
const chatContainer = ref(null)

async function sendChatMessage() {
  const msg = chatInput.value.trim()
  if (!msg || chatLoading.value || !currentProposal.value) return

  // Add user message
  chatMessages.value.push({ role: 'user', content: msg })
  chatInput.value = ''
  chatLoading.value = true
  await scrollChatToBottom()

  try {
    // Build history (exclude the message we just pushed — it goes as `message`)
    const history = chatMessages.value.slice(0, -1)
    const res = await proposalsAPI.chat(currentProposal.value.id, msg, history)

    // Add Quinn's reply (with tools_used metadata)
    chatMessages.value.push({
      role: 'assistant',
      content: res.data.reply,
      tools_used: res.data.tools_used || [],
    })

    // Update the proposal content — the renderedContent computed will auto-refresh
    if (res.data.updated_content) {
      currentProposal.value.content = res.data.updated_content
    }
  } catch (e) {
    const errMsg = e.response?.data?.detail || 'Something went wrong. Please try again.'
    chatMessages.value.push({ role: 'assistant', content: `Sorry, ${errMsg}` })
  } finally {
    chatLoading.value = false
    await scrollChatToBottom()
  }
}

async function scrollChatToBottom() {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const snackbar = ref({ show: false, text: '', color: 'success' })
function showMsg(text, color = 'success') {
  snackbar.value = { show: true, text, color }
}

const currentDealLabel = computed(() => {
  const d = deals.value.find(d => d.id === selectedDealId.value)
  return d?.label || 'Unknown Deal'
})

const complianceIssues = computed(() => {
  return currentProposal.value?.compliance_notes || []
})

// Simple markdown-to-HTML renderer
const renderedContent = computed(() => {
  if (!currentProposal.value?.content) return '<p style="color: #6b7280;">No content generated yet.</p>'
  let md = currentProposal.value.content
  // Headers
  md = md.replace(/^### (.+)$/gm, '<h3 style="font-size: 16px; font-weight: 700; color: #e5e7eb; margin: 24px 0 8px;">$1</h3>')
  md = md.replace(/^## (.+)$/gm, '<h2 style="font-size: 20px; font-weight: 700; color: #c084fc; margin: 28px 0 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(139,92,246,0.15);">$1</h2>')
  md = md.replace(/^# (.+)$/gm, '<h1 style="font-size: 24px; font-weight: 800; margin: 0 0 16px;">$1</h1>')
  // Bold & italic
  md = md.replace(/\*\*(.+?)\*\*/g, '<strong style="color: #e5e7eb;">$1</strong>')
  md = md.replace(/\*(.+?)\*/g, '<em>$1</em>')
  // Bullet lists
  md = md.replace(/^- (.+)$/gm, '<li style="margin: 4px 0; font-size: 13px;">$1</li>')
  md = md.replace(/(<li.*?<\/li>\n?)+/g, '<ul style="padding-left: 20px; margin: 8px 0;">$&</ul>')
  // Numbered lists
  md = md.replace(/^\d+\. (.+)$/gm, '<li style="margin: 4px 0; font-size: 13px;">$1</li>')
  // Paragraphs
  md = md.replace(/\n\n/g, '</p><p style="font-size: 13px; line-height: 1.8; color: #d1d5db; margin: 8px 0;">')
  md = '<p style="font-size: 13px; line-height: 1.8; color: #d1d5db; margin: 8px 0;">' + md + '</p>'
  // Horizontal rules
  md = md.replace(/^---$/gm, '<hr style="border: none; border-top: 1px solid rgba(139,92,246,0.15); margin: 24px 0;" />')
  return md
})

// ── Load Data ──

async function loadDeals() {
  loadingDeals.value = true
  try {
    const res = await dealsAPI.list()
    const allDeals = res.data?.deals || []
    deals.value = allDeals.map(d => ({ ...d, label: `${d.title} - ${d.client_name}` }))
  } catch { deals.value = [] }
  finally { loadingDeals.value = false }
}

async function loadProposals(dealId) {
  loading.value = true
  try {
    const res = await proposalsAPI.list({ deal_id: dealId })
    proposals.value = Array.isArray(res.data) ? res.data : []
    if (proposals.value.length > 0) {
      selectedProposalId.value = proposals.value[0].id
      currentProposal.value = proposals.value[0]
      await loadAttachments()
    } else {
      currentProposal.value = null
    }
  } catch { proposals.value = [] }
  finally { loading.value = false }
}

async function loadAttachments() {
  if (!currentProposal.value) return
  try {
    const res = await api.get(`/api/proposals/${currentProposal.value.id}/attachments`)
    attachments.value = res.data || []
  } catch { attachments.value = [] }
}

function onDealSelected(dealId) {
  if (dealId) {
    loadProposals(dealId)
    loadDealStatus()
  }
}

function selectProposal(proposalId) {
  const p = proposals.value.find(p => p.id === proposalId)
  if (p) {
    currentProposal.value = p
    loadAttachments()
  }
}

function resetDeal() {
  selectedDealId.value = null
  currentProposal.value = null
  proposals.value = []
  attachments.value = []
}

// ── File Upload ──

async function uploadFile(file) {
  if (!currentProposal.value) return
  uploading.value = true
  try {
    const form = new FormData()
    form.append('file', file)
    await api.post(`/api/proposals/${currentProposal.value.id}/attachments`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    showMsg(`${file.name} uploaded successfully`)
    await loadAttachments()
  } catch (e) {
    const msg = e.response?.data?.detail || 'Upload failed'
    showMsg(msg, 'error')
  } finally {
    uploading.value = false
  }
}

function handleFileSelect(event) {
  const files = event.target.files
  for (const file of files) uploadFile(file)
  event.target.value = ''
}

function handleDrop(event) {
  const files = event.dataTransfer.files
  for (const file of files) uploadFile(file)
}

async function deleteAttachment(att) {
  if (!currentProposal.value) return
  try {
    await api.delete(`/api/proposals/${currentProposal.value.id}/attachments/${att.id}`)
    showMsg('Attachment deleted')
    await loadAttachments()
  } catch {
    showMsg('Failed to delete', 'error')
  }
}

// ── Review ──

async function reviewProposal(status) {
  if (!currentProposal.value) return
  reviewing.value = true
  try {
    const res = await proposalsAPI.review(currentProposal.value.id, {
      status,
      review_notes: reviewNotes.value || null,
    })
    currentProposal.value = res.data
    showMsg(`Proposal ${status}`)
  } catch (e) {
    showMsg('Review failed', 'error')
  } finally {
    reviewing.value = false
  }
}

// ── Template Selector & DOCX Export ──

const showTemplateSelector = ref(false)
const selectedTemplate = ref('modern')
const templateOptions = ref([
  { id: 'modern', name: 'Modern', description: 'Bold & contemporary with vibrant purple accents', primary_hex: '6B21A8', accent_hex: '06B6D4', heading_font: 'Calibri', body_font: 'Calibri' },
  { id: 'classic', name: 'Classic', description: 'Traditional & formal with navy blue and gold accents', primary_hex: '1E3A5F', accent_hex: 'D4A574', heading_font: 'Times New Roman', body_font: 'Calibri' },
  { id: 'minimal', name: 'Minimal', description: 'Ultra-clean monochrome design with a single accent color', primary_hex: '18181B', accent_hex: '0891B2', heading_font: 'Calibri', body_font: 'Calibri' },
])

function hexToRgb(hex) {
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  return `${r}, ${g}, ${b}`
}

async function downloadWithTemplate() {
  if (!currentProposal.value) return
  exporting.value = true
  try {
    const res = await proposalsAPI.exportDocx(currentProposal.value.id, selectedTemplate.value)
    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const disposition = res.headers['content-disposition']
    let filename = 'ESSHVA_Proposal.docx'
    if (disposition) {
      const match = disposition.match(/filename="?([^";\n]+)"?/)
      if (match) filename = match[1]
    }
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    showTemplateSelector.value = false
    showMsg('Proposal downloaded as DOCX')
  } catch (e) {
    console.error('Export error:', e)
    showMsg('Failed to export DOCX', 'error')
  } finally {
    exporting.value = false
  }
}

// ── Deal Outcome ──

const closingDeal = ref(false)
const dealStatus = ref(null)

async function loadDealStatus() {
  if (!selectedDealId.value) return
  try {
    const res = await dealsAPI.get(selectedDealId.value)
    dealStatus.value = res.data?.status || null
  } catch { /* ignore */ }
}

async function closeDealAs(status) {
  if (!selectedDealId.value) return
  closingDeal.value = true
  try {
    await dealsAPI.update(selectedDealId.value, { status })
    dealStatus.value = status
    showMsg(status === 'won' ? 'Deal marked as Won!' : 'Deal marked as Lost')
  } catch (e) {
    showMsg(e.response?.data?.detail || 'Failed to update deal', 'error')
  } finally {
    closingDeal.value = false
  }
}

// ── Helpers ──

function statusColor(status) {
  const map = { draft: 'warning', approved: 'success', rejected: 'error', sent: 'info' }
  return map[status] || 'grey'
}

function fileIcon(ext) {
  const map = { pdf: 'mdi-file-pdf-box', docx: 'mdi-file-word-box', xlsx: 'mdi-file-excel-box', pptx: 'mdi-file-powerpoint-box', txt: 'mdi-file-document', csv: 'mdi-file-delimited' }
  return map[ext] || 'mdi-file-outline'
}

function fileIconColor(ext) {
  const map = { pdf: '#ef4444', docx: '#3b82f6', xlsx: '#22c55e', pptx: '#f59e0b', txt: '#9ca3af' }
  return map[ext] || '#9ca3af'
}

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function formatDate(dt) {
  if (!dt) return ''
  return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  await loadDeals()
  const dealId = route.params.dealId
  if (dealId) {
    selectedDealId.value = dealId
    await loadProposals(dealId)
    await loadDealStatus()
  }
})
</script>

<style scoped>
@keyframes chatPulse {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}
</style>
