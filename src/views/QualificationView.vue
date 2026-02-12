<template>
  <div>
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px;">
      <div>
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 6px;">
          <v-chip variant="flat" size="small" style="background: linear-gradient(135deg, #a855f7, #ec4899); color: white; font-weight: 700; font-size: 12px;">FLOW 1</v-chip>
          <span style="font-size: 28px; font-weight: 700;">Intelligent Deal Qualification</span>
        </div>
        <div style="font-size: 14px; color: #9ca3af;">
          <span v-if="selectedDeal">Analyzing: <strong style="color: #c084fc;">{{ selectedDeal.name }}</strong></span>
          <span v-else>Select a deal to begin qualification</span>
        </div>
      </div>
      <div v-if="agentRunning" style="display: flex; align-items: center; gap: 10px; padding: 10px 20px; border-radius: 12px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3);">
        <div class="animate-pulse-glow" style="width: 10px; height: 10px; border-radius: 50%; background: #22c55e;"></div>
        <span style="font-size: 14px; color: #e5e7eb;">Quinn is {{ agentStep }}...</span>
      </div>
    </div>

    <!-- Progress Stepper -->
    <v-card class="glow-card mb-6">
      <v-card-text style="padding: 28px;">
        <div style="display: flex; align-items: center; justify-content: space-between; position: relative;">
          <div style="position: absolute; top: 24px; left: 60px; right: 60px; height: 3px; border-radius: 2px; background: rgba(139, 92, 246, 0.12);">
            <div :style="{ height: '100%', width: progressWidth, borderRadius: '2px', background: 'linear-gradient(90deg, #a855f7, #ec4899, #06b6d4)', transition: 'width 0.5s' }"></div>
          </div>
          <div v-for="step in qualificationSteps" :key="step.id" style="display: flex; flex-direction: column; align-items: center; z-index: 1; position: relative;">
            <div :style="{
              width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: step.id < agentStepNumber ? 'linear-gradient(135deg, #22c55e, #16a34a)' : step.id === agentStepNumber ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'rgba(139, 92, 246, 0.12)',
              boxShadow: step.id === agentStepNumber ? '0 0 24px rgba(168, 85, 247, 0.4)' : 'none',
            }">
              <v-icon v-if="step.id < agentStepNumber" color="white" size="22">mdi-check</v-icon>
              <v-icon v-else-if="step.id === agentStepNumber" color="white" size="20">mdi-cog</v-icon>
              <div v-else style="width: 8px; height: 8px; border-radius: 50%; background: #6b7280;"></div>
            </div>
            <div :style="{ marginTop: '10px', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', color: step.id <= agentStepNumber ? '#ffffff' : '#6b7280' }">{{ step.label }}</div>
            <div style="font-size: 10px; color: #4b5563; margin-top: 2px;">{{ step.description }}</div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Content Grid -->
    <v-row>
      <!-- Left Column -->
      <v-col cols="6">
        <!-- Deal Selector -->
        <v-card v-if="!dealId" class="glow-card mb-6">
          <v-card-text style="padding: 24px;">
            <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">Select a Deal</div>
            <v-select v-model="selectedDeal" :items="deals" item-title="name" item-value="id" label="Choose a deal to qualify" return-object outlined dense />
          </v-card-text>
        </v-card>

        <!-- Deal Info Card -->
        <v-card v-if="selectedDeal" class="glow-card mb-6">
          <v-card-text style="padding: 24px;">
            <div style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">{{ selectedDeal.name }}</div>
            <v-row>
              <v-col cols="6">
                <div style="padding: 12px; border-radius: 8px; background: rgba(139, 92, 246, 0.08);">
                  <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Client</div>
                  <div style="font-size: 14px; font-weight: 600;">{{ selectedDeal.client || 'N/A' }}</div>
                </div>
              </v-col>
              <v-col cols="6">
                <div style="padding: 12px; border-radius: 8px; background: rgba(139, 92, 246, 0.08);">
                  <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Status</div>
                  <div style="font-size: 14px; font-weight: 600;">{{ selectedDeal.status || 'Active' }}</div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Document Upload Section -->
        <v-card v-if="selectedDeal" class="glow-card">
          <div style="padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(139, 92, 246, 0.12);">
            <div style="display: flex; align-items: center; gap: 10px;">
              <v-icon color="primary" size="18">mdi-file-document-multiple-outline</v-icon>
              <span style="font-size: 16px; font-weight: 600;">Documents & Context</span>
            </div>
            <v-chip v-if="documents.length > 0" size="small" variant="tonal" color="primary" style="font-size: 11px; font-weight: 600;">
              {{ documents.length }} doc{{ documents.length > 1 ? 's' : '' }}
            </v-chip>
          </div>
          <v-card-text style="padding: 24px;">

            <!-- Uploaded Documents List -->
            <div v-if="documents.length > 0" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
              <div v-for="doc in documents" :key="doc.id" style="display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 10px; background: rgba(0,0,0,0.15); border: 1px solid rgba(139, 92, 246, 0.08);">
                <v-icon :color="getDocIcon(doc).color" size="20">{{ getDocIcon(doc).icon }}</v-icon>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ doc.original_filename || doc.filename }}</div>
                  <div style="font-size: 11px; color: #6b7280;">
                    <v-chip size="x-small" variant="tonal" :color="getCategoryColor(doc.doc_category)" style="font-size: 9px; font-weight: 700; margin-right: 4px;">{{ doc.doc_category }}</v-chip>
                    {{ formatFileSize(doc.file_size) }}
                  </div>
                </div>
                <v-icon v-if="doc.is_processed" size="16" color="success">mdi-check-circle</v-icon>
                <v-progress-circular v-else indeterminate size="16" width="2" color="primary" />
                <v-btn icon variant="text" size="x-small" @click="removeDocument(doc.id)" :disabled="agentRunning">
                  <v-icon size="14" color="grey">mdi-close</v-icon>
                </v-btn>
              </div>
            </div>

            <!-- Upload Area -->
            <div style="padding: 24px; border-radius: 14px; background: rgba(0, 0, 0, 0.2); border: 2px dashed rgba(139, 92, 246, 0.3); text-align: center; margin-bottom: 16px;">
              <input ref="fileInput" type="file" accept=".pdf,.docx,.txt,.xlsx" multiple style="display: none;" @change="onFilesSelected" />
              <v-icon color="primary" size="36" style="margin-bottom: 8px;">mdi-cloud-upload-outline</v-icon>
              <div style="font-size: 13px; font-weight: 600; margin-bottom: 4px;">Upload documents</div>
              <div style="font-size: 11px; color: #6b7280; margin-bottom: 12px;">PDF, DOCX, TXT, XLSX — select multiple files at once</div>
              <div style="display: flex; justify-content: center; gap: 8px;">
                <v-btn size="small" color="primary" variant="flat" @click="fileInput?.click()" :disabled="agentRunning || uploading">
                  <v-icon start size="14">mdi-file-plus</v-icon>
                  Choose Files
                </v-btn>
                <v-menu>
                  <template v-slot:activator="{ props: menuProps }">
                    <v-btn size="small" variant="outlined" color="primary" v-bind="menuProps" :disabled="agentRunning">
                      <v-icon start size="14">mdi-tag</v-icon>
                      {{ uploadCategory }}
                    </v-btn>
                  </template>
                  <v-list density="compact" style="background: #1a1a2e;">
                    <v-list-item v-for="cat in docCategories" :key="cat.value" @click="uploadCategory = cat.value" :active="uploadCategory === cat.value">
                      <template v-slot:prepend><v-icon size="16">{{ cat.icon }}</v-icon></template>
                      <v-list-item-title style="font-size: 12px;">{{ cat.label }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </div>

            <!-- Add Text Input -->
            <v-expansion-panels variant="accordion" style="margin-bottom: 16px;">
              <v-expansion-panel style="background: rgba(0,0,0,0.15); border: 1px solid rgba(139, 92, 246, 0.1);">
                <v-expansion-panel-title style="font-size: 13px; font-weight: 600; min-height: 44px; padding: 0 16px;">
                  <v-icon size="16" color="primary" style="margin-right: 8px;">mdi-text-box-plus-outline</v-icon>
                  Paste Text (Emails, Meeting Notes, Transcripts)
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-text-field v-model="textTitle" label="Title" variant="outlined" density="compact" placeholder="e.g. Client Call Notes - Feb 10" style="margin-bottom: 8px;" />
                  <v-select v-model="textCategory" :items="docCategories" item-title="label" item-value="value" label="Category" variant="outlined" density="compact" style="margin-bottom: 8px;" />
                  <v-textarea v-model="textContent" label="Paste your text here" variant="outlined" rows="5" placeholder="Paste meeting transcript, email thread, client notes, etc." />
                  <v-btn size="small" color="primary" variant="flat" :loading="savingText" :disabled="!textContent.trim() || agentRunning" @click="saveTextDocument">
                    <v-icon start size="14">mdi-content-save</v-icon>
                    Add as Document
                  </v-btn>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>

            <!-- Upload progress -->
            <v-progress-linear v-if="uploading" indeterminate color="primary" height="3" rounded style="margin-bottom: 12px;" />

            <!-- Error feedback -->
            <div v-if="agentError" style="padding: 10px 14px; border-radius: 8px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <v-icon size="16" color="error">mdi-alert-circle</v-icon>
                <span style="font-size: 13px; color: #ef4444;">{{ agentError }}</span>
              </div>
            </div>

            <!-- Run Qualification Button -->
            <v-btn
              color="success"
              size="large"
              block
              @click="runQualification"
              :disabled="documents.length === 0 || !allDocsProcessed || agentRunning"
              :loading="agentRunning"
            >
              <v-icon start>mdi-play</v-icon>
              Run Qualification ({{ documents.length }} doc{{ documents.length > 1 ? 's' : '' }})
            </v-btn>
            <div v-if="documents.length > 0 && !allDocsProcessed" style="text-align: center; margin-top: 6px; font-size: 11px; color: #f59e0b;">
              Waiting for documents to finish processing...
            </div>
            <div v-if="documents.length === 0" style="text-align: center; margin-top: 6px; font-size: 11px; color: #6b7280;">
              Upload at least one document to run qualification
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Right Column: Requirements -->
      <v-col cols="6">
        <v-card class="glow-card" style="height: 100%;">
          <div style="padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(139, 92, 246, 0.12);">
            <div style="display: flex; align-items: center; gap: 10px;">
              <v-icon color="primary" size="18">mdi-brain</v-icon>
              <span style="font-size: 16px; font-weight: 600;">Extracted Requirements</span>
            </div>
            <div v-if="agentRunning" style="display: flex; align-items: center; gap: 8px;">
              <v-progress-circular indeterminate size="14" width="2" color="primary" />
              <span style="font-size: 12px; color: #6b7280;">Analyzing...</span>
            </div>
          </div>
          <v-card-text style="padding: 20px; max-height: 520px; overflow-y: auto;">
            <div v-if="requirements.length === 0" style="text-align: center; padding: 40px 20px; color: #6b7280;">
              <div style="font-size: 14px;">No requirements extracted yet</div>
              <div style="font-size: 12px; margin-top: 8px;">Upload documents and run qualification to begin</div>
            </div>
            <div v-else style="display: flex; flex-direction: column; gap: 12px;">
              <div v-for="(req, i) in requirements" :key="i" style="padding: 16px; border-radius: 12px; background: rgba(0,0,0,0.15); border: 1px solid rgba(139, 92, 246, 0.08);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <v-chip size="x-small" variant="tonal" color="primary" style="font-size: 10px; font-weight: 700;">{{ req.category }}</v-chip>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <v-progress-linear :model-value="req.confidence" :color="getConfColor(req.confidence)" bg-color="rgba(255,255,255,0.06)" rounded height="5" style="width: 40px;" />
                    <span :style="{ fontSize: '11px', fontWeight: 700, color: getConfColor(req.confidence) }">{{ req.confidence }}%</span>
                  </div>
                </div>
                <div style="font-size: 13px; color: #d1d5db; line-height: 1.6;">{{ req.requirement }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { dealsAPI, documentsAPI } from '../api'
import { useAgentTasks } from '../stores/agentTasks'

const props = defineProps({ dealId: { type: String, default: null } })

const route = useRoute()
const { startTask, resumePolling, getTask, isRunning } = useAgentTasks()
const qualTask = getTask('qualification')

const selectedDeal = ref(null)
const deals = ref([])
const documents = ref([])
const uploading = ref(false)
const savingText = ref(false)
const requirements = ref([])
const fileInput = ref(null)
const uploadCategory = ref('rfp')

// Computed properties bridging store state to template
const agentRunning = computed(() => qualTask.status === 'running')
const agentStep = computed(() => qualTask.step || qualTask.stepMessage || '')
const agentStepNumber = computed(() => qualTask.stepNumber)
const agentError = computed(() => qualTask.error)

// Text input state
const textTitle = ref('')
const textCategory = ref('transcript')
const textContent = ref('')

const docCategories = [
  { label: 'RFP / RFI', value: 'rfp', icon: 'mdi-file-document' },
  { label: 'Email Thread', value: 'email', icon: 'mdi-email' },
  { label: 'Meeting Transcript', value: 'transcript', icon: 'mdi-microphone' },
  { label: 'Proposal', value: 'proposal', icon: 'mdi-file-edit' },
  { label: 'General', value: 'general', icon: 'mdi-file' },
]

const qualificationSteps = [
  { id: 1, label: 'INGEST', description: 'Loading documents' },
  { id: 2, label: 'EXTRACT', description: 'Parsing content' },
  { id: 3, label: 'ANALYZE', description: 'Analyzing requirements' },
  { id: 4, label: 'MATCH', description: 'Matching patterns' },
  { id: 5, label: 'DECIDE', description: 'Final decision' },
]

const progressWidth = computed(() => `${(agentStepNumber.value / 5) * 100}%`)
const allDocsProcessed = computed(() => documents.value.length > 0 && documents.value.every(d => d.is_processed))

// Load deals
onMounted(async () => {
  try {
    const response = await dealsAPI.list()
    const allDeals = response.data?.deals || []
    deals.value = allDeals.map(d => ({ ...d, name: d.title, client: d.client_name }))
    if (props.dealId) {
      const deal = deals.value.find(d => d.id === props.dealId)
      if (deal) selectedDeal.value = deal
    }
  } catch (error) {
    console.error('Failed to load deals:', error)
  }

  // Resume polling if qualification task is still running (user navigated away and came back)
  if (isRunning('qualification')) {
    resumePolling('qualification', onQualificationComplete)
  }
  // If task already completed, load results
  if (qualTask.status === 'completed' && selectedDeal.value) {
    await loadDealRequirements(selectedDeal.value.id)
  }
})

// Watch deal selection
watch(selectedDeal, async (newDeal) => {
  if (newDeal && newDeal.id) {
    await loadDealDocuments(newDeal.id)
    await loadDealRequirements(newDeal.id)
  }
}, { deep: true })

async function loadDealDocuments(dealId) {
  try {
    const res = await documentsAPI.list({ deal_id: dealId })
    documents.value = res.data || []
  } catch (e) {
    console.warn('Failed to load documents:', e)
    documents.value = []
  }
}

async function loadDealRequirements(dealId) {
  try {
    const reqResponse = await dealsAPI.getRequirements(dealId)
    const existingReqs = reqResponse.data || []
    if (existingReqs.length > 0) {
      requirements.value = existingReqs.map(r => ({
        ...r,
        requirement: r.requirement_text || r.requirement,
        confidence: Math.round((r.confidence || 0) * 100),
      }))
      // Mark the stepper as fully complete when requirements exist
      qualTask.stepNumber = 6
      qualTask.status = 'completed'
    } else {
      requirements.value = []
      if (qualTask.status !== 'running') {
        qualTask.stepNumber = 0
      }
    }
  } catch (e) {
    console.error('Failed to load requirements:', e)
  }
}

// Multi-file upload
async function onFilesSelected(event) {
  const files = Array.from(event.target.files || [])
  if (!files.length || !selectedDeal.value) return

  uploading.value = true
  qualTask.error = null

  for (const file of files) {
    try {
      const res = await documentsAPI.upload(file, selectedDeal.value.id, uploadCategory.value)
      const docId = res.data?.document_id
      if (docId) {
        await documentsAPI.process(docId)
      }
    } catch (e) {
      console.error(`Failed to upload ${file.name}:`, e)
      qualTask.error = `Failed to upload ${file.name}: ${e.response?.data?.detail || e.message}`
    }
  }

  await loadDealDocuments(selectedDeal.value.id)
  uploading.value = false
  if (fileInput.value) fileInput.value.value = ''
  pollDocProcessing()
}

// Save pasted text as document
async function saveTextDocument() {
  if (!textContent.value.trim() || !selectedDeal.value) return

  savingText.value = true
  qualTask.error = null

  try {
    await documentsAPI.createFromText(
      selectedDeal.value.id,
      textCategory.value,
      textTitle.value || 'Pasted Text',
      textContent.value,
    )
    textTitle.value = ''
    textContent.value = ''
    await loadDealDocuments(selectedDeal.value.id)
  } catch (e) {
    qualTask.error = e.response?.data?.detail || 'Failed to save text'
  } finally {
    savingText.value = false
  }
}

// Poll for document processing completion
function pollDocProcessing() {
  const interval = setInterval(async () => {
    if (!selectedDeal.value) { clearInterval(interval); return }
    await loadDealDocuments(selectedDeal.value.id)
    if (allDocsProcessed.value) clearInterval(interval)
  }, 2000)
  setTimeout(() => clearInterval(interval), 60000)
}

async function removeDocument(docId) {
  try {
    await documentsAPI.delete(docId)
    documents.value = documents.value.filter(d => d.id !== docId)
  } catch (e) {
    console.error('Failed to delete document:', e)
  }
}

// Completion handler for qualification tasks (called by store)
async function onQualificationComplete(task) {
  if (task.status === 'completed' && selectedDeal.value) {
    await loadDealRequirements(selectedDeal.value.id)
  }
}

// Run qualification — delegates to shared store
async function runQualification() {
  if (!selectedDeal.value || documents.value.length === 0) return
  await startTask(selectedDeal.value.id, 'qualification', onQualificationComplete)
}

// Helpers
function getDocIcon(doc) {
  const map = {
    pdf: { icon: 'mdi-file-pdf-box', color: '#ef4444' },
    docx: { icon: 'mdi-file-word-box', color: '#2563eb' },
    xlsx: { icon: 'mdi-file-excel-box', color: '#22c55e' },
    txt: { icon: 'mdi-file-document-outline', color: '#9ca3af' },
  }
  return map[doc.file_type] || { icon: 'mdi-file', color: '#6b7280' }
}

function getCategoryColor(cat) {
  const map = { rfp: 'error', email: 'info', transcript: 'warning', proposal: 'primary', general: 'default' }
  return map[cat] || 'default'
}

function getConfColor(c) {
  return c >= 85 ? '#22c55e' : c >= 70 ? '#f59e0b' : '#ef4444'
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

</script>
