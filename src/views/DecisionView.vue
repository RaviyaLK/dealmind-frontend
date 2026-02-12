<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" style="display: flex; flex-direction: column; gap: 16px;">
      <v-skeleton-loader type="heading" width="300" />
      <v-skeleton-loader type="card" />
      <v-skeleton-loader type="table" />
    </div>

    <!-- Deal Switcher Bar (always visible) -->
    <div v-else>
    <v-card class="glow-card mb-6" v-if="deals.length > 0">
      <v-card-text style="padding: 16px 24px; display: flex; align-items: center; gap: 16px;">
        <v-icon color="purple" size="20">mdi-scale-balance</v-icon>
        <v-select
          v-model="selectedDealId"
          :items="deals"
          item-title="label"
          item-value="id"
          label="Select a qualified deal"
          variant="outlined"
          density="compact"
          hide-details
          style="max-width: 360px;"
          @update:modelValue="onDealSelected"
        />
        <v-spacer />
        <div v-if="currentDeal" style="font-size: 12px; color: #9ca3af;">
          Viewing: <strong style="color: #c084fc;">{{ currentDeal.title }}</strong> — {{ currentDeal.client_name }}
        </div>
      </v-card-text>
    </v-card>
    <div v-else-if="!loading" style="text-align: center; padding: 60px 20px;">
      <v-icon size="64" color="grey">mdi-inbox-outline</v-icon>
      <div style="font-size: 18px; font-weight: 600; margin-top: 16px;">No deals with analysis available</div>
      <div style="font-size: 14px; color: #9ca3af; margin-top: 8px;">Run qualification on a deal first</div>
    </div>

    <!-- No deal selected yet -->
    <div v-if="deals.length > 0 && !currentDeal && !loading" style="text-align: center; padding: 60px 20px;">
      <v-icon size="64" color="grey">mdi-scale-balance</v-icon>
      <div style="font-size: 18px; font-weight: 600; margin-top: 16px;">Decisions with Reasoning</div>
      <div style="font-size: 14px; color: #9ca3af; margin-top: 8px;">Select a deal above to view its qualification decision</div>
    </div>

    <!-- No Analysis for selected deal -->
    <div v-if="currentDeal && !analysis && !loading" style="text-align: center; padding: 60px 20px;">
      <v-icon size="64" color="warning">mdi-alert-outline</v-icon>
      <div style="font-size: 18px; font-weight: 600; margin-top: 16px;">Run qualification first</div>
      <div style="font-size: 14px; color: #9ca3af; margin-top: 8px;">Analysis will appear here once qualification is complete</div>
    </div>

    <!-- Main Content -->
    <template v-if="currentDeal && analysis">
    <!-- Header -->
    <div style="margin-bottom: 28px;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 6px;">
        <v-chip variant="flat" size="small" color="success" style="font-weight: 700; font-size: 12px;">COMPLETE</v-chip>
        <span style="font-size: 28px; font-weight: 700;">Decisions with Reasoning</span>
      </div>
      <div style="font-size: 14px; color: #9ca3af;">Deal: <strong style="color: #c084fc;">{{ currentDeal?.title || currentDeal?.name || 'Loading...' }}</strong> -- {{ currentDeal?.client_name || '' }}</div>
    </div>

    <!-- Main Decision Card -->
    <v-card class="glow-card mb-6" style="border: 1.5px solid transparent; background-image: linear-gradient(#12121f, #12121f), linear-gradient(135deg, #a855f7, #ec4899, #06b6d4); background-origin: border-box; background-clip: padding-box, border-box;">
      <v-card-text style="padding: 32px;">
        <!-- Decision Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div :style="{ width: '52px', height: '52px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: recommendationStyle.gradient }">
              <v-icon color="white" size="28">{{ recommendationStyle.icon }}</v-icon>
            </div>
            <div>
              <div :style="{ fontSize: '13px', color: recommendationStyle.color, fontWeight: 600, marginBottom: '4px' }">RECOMMENDATION</div>
              <div style="font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">{{ recommendationLabel }}</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div class="gradient-text-cyan" style="font-size: 48px; font-weight: 800; line-height: 1;">{{ confidencePercent }}%</div>
            <div style="font-size: 13px; color: #9ca3af; margin-top: 4px;">Confidence Score</div>
          </div>
        </div>

        <!-- Content Grid -->
        <v-row>
          <!-- Analysis -->
          <v-col cols="6">
            <div style="border-radius: 16px; padding: 24px; background: rgba(0, 0, 0, 0.25);">
              <div style="font-size: 18px; font-weight: 600; margin-bottom: 20px;">Analysis</div>

              <!-- Positive Factors -->
              <div style="margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                  <div style="width: 8px; height: 8px; border-radius: 50%; background: #22c55e;"></div>
                  <span style="font-weight: 600; color: #4ade80; font-size: 14px;">Positive Factors</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px; padding-left: 16px;">
                  <div v-for="factor in (analysis?.positive_factors || [])" :key="factor" style="display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: #d1d5db;">
                    <v-icon color="success" size="14" style="margin-top: 3px; flex-shrink: 0;">mdi-check</v-icon>
                    {{ factor }}
                  </div>
                </div>
              </div>

              <!-- Risk Factors -->
              <div v-if="analysis?.risk_factors?.length" style="margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                  <div style="width: 8px; height: 8px; border-radius: 50%; background: #ef4444;"></div>
                  <span style="font-weight: 600; color: #f87171; font-size: 14px;">Risk Factors</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px; padding-left: 16px;">
                  <div v-for="risk in analysis.risk_factors" :key="risk" style="display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: #d1d5db;">
                    <v-icon color="error" size="14" style="margin-top: 3px; flex-shrink: 0;">mdi-alert-circle</v-icon>
                    {{ risk }}
                  </div>
                </div>
              </div>

              <!-- Conditions -->
              <div v-if="analysis?.conditions?.length">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                  <div style="width: 8px; height: 8px; border-radius: 50%; background: #f59e0b;"></div>
                  <span style="font-weight: 600; color: #f59e0b; font-size: 14px;">Conditions for GO</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <div v-for="cond in analysis.conditions" :key="cond" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 10px; background: rgba(245, 158, 11, 0.06); border: 1px solid rgba(245, 158, 11, 0.2);">
                    <v-icon color="warning" size="16">mdi-alert</v-icon>
                    <span style="font-size: 13px; color: #fcd34d;">{{ cond }}</span>
                  </div>
                </div>
              </div>

              <!-- Reasoning -->
              <div v-if="analysis?.reasoning" style="margin-top: 20px; padding: 16px; border-radius: 12px; background: rgba(139, 92, 246, 0.06); border: 1px solid rgba(139, 92, 246, 0.15);">
                <div style="font-size: 12px; font-weight: 600; color: #c084fc; margin-bottom: 8px;">Quinn's Reasoning</div>
                <div style="font-size: 13px; color: #d1d5db; line-height: 1.7;">{{ analysis.reasoning }}</div>
              </div>
            </div>
          </v-col>

          <!-- Staffing / Assignments -->
          <v-col cols="6">
            <div style="border-radius: 16px; padding: 24px; background: rgba(0, 0, 0, 0.25);">
              <!-- Header with action buttons -->
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div style="font-size: 18px; font-weight: 600;">Team Assignments</div>
                <div style="display: flex; gap: 8px;">
                  <v-btn
                    size="x-small"
                    variant="outlined"
                    color="cyan"
                    class="text-none"
                    :loading="autoAssigning"
                    @click="handleAutoAssign"
                  >
                    <v-icon start size="14">mdi-auto-fix</v-icon>
                    Auto-Assign
                  </v-btn>
                  <v-btn
                    size="x-small"
                    variant="flat"
                    color="purple"
                    class="text-none"
                    @click="showAssignDialog = true"
                  >
                    <v-icon start size="14">mdi-account-plus</v-icon>
                    Assign
                  </v-btn>
                </div>
              </div>

              <!-- Empty State -->
              <div v-if="!assignments || assignments.length === 0" style="text-align: center; padding: 24px; color: #6b7280;">
                <v-icon size="40" color="grey" style="margin-bottom: 10px;">mdi-account-group-outline</v-icon>
                <div style="font-size: 13px; font-weight: 500;">No team members assigned yet</div>
                <div style="font-size: 11px; margin-top: 6px; color: #4b5563;">Click "Auto-Assign" to let Quinn pick the best matches, or "Assign" to choose manually</div>
              </div>

              <!-- Assignment List -->
              <div v-else style="display: flex; flex-direction: column; gap: 8px;">
                <div
                  v-for="a in assignments"
                  :key="a.id"
                  :style="getAssignStyle(a.assigned_by)"
                  style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-radius: 12px;"
                >
                  <div style="flex: 1; min-width: 0;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="font-weight: 600; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ a.employee_name }}</div>
                      <v-chip
                        v-if="a.assigned_by === 'auto'"
                        size="x-small"
                        variant="flat"
                        color="cyan"
                        style="font-size: 9px; height: 16px;"
                      >AI</v-chip>
                      <v-chip
                        v-else
                        size="x-small"
                        variant="flat"
                        color="purple"
                        style="font-size: 9px; height: 16px;"
                      >MANUAL</v-chip>
                    </div>
                    <div style="font-size: 11px; color: #9ca3af; margin-top: 2px;">{{ a.role_on_deal || a.employee_role }}</div>
                    <div v-if="a.employee_skills && a.employee_skills.length" style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;">
                      <span
                        v-for="skill in a.employee_skills.slice(0, 3)"
                        :key="skill"
                        style="font-size: 9px; padding: 1px 6px; border-radius: 4px; background: rgba(139, 92, 246, 0.15); color: #c084fc;"
                      >{{ skill }}</span>
                      <span v-if="a.employee_skills.length > 3" style="font-size: 9px; color: #6b7280;">+{{ a.employee_skills.length - 3 }}</span>
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 12px; margin-left: 12px; flex-shrink: 0;">
                    <div style="text-align: right;">
                      <div style="font-size: 12px; color: #9ca3af;">{{ a.allocation_percent }}% alloc</div>
                      <div style="font-weight: 600; font-size: 13px;">{{ formatCost(getMonthlyCost(a)) }}/mo</div>
                    </div>
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      color="error"
                      @click="handleUnassign(a)"
                    >
                      <v-icon size="16">mdi-close</v-icon>
                    </v-btn>
                  </div>
                </div>
              </div>

              <!-- Total -->
              <div v-if="assignments && assignments.length > 0" style="margin-top: 20px; padding: 20px; border-radius: 14px; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.08));">
                <div>
                  <span style="font-weight: 600; font-size: 15px;">Total Estimated Cost</span>
                  <div style="font-size: 11px; color: #9ca3af; margin-top: 2px;">{{ assignments.length }} team member{{ assignments.length !== 1 ? 's' : '' }} assigned</div>
                </div>
                <span class="gradient-text" style="font-size: 28px; font-weight: 800;">{{ formatCost(totalStaffingCost) }}</span>
              </div>

              <!-- Margin -->
              <div v-if="assignments && assignments.length > 0" style="margin-top: 16px; padding: 16px; border-radius: 12px; background: rgba(34, 197, 94, 0.06); border: 1px solid rgba(34, 197, 94, 0.15);">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <v-icon color="success" size="14">mdi-chart-bar</v-icon>
                  <span style="font-size: 12px; font-weight: 600; color: #4ade80;">Margin Analysis</span>
                </div>
                <div style="font-size: 12px; color: #9ca3af;">Projected margin: <span :style="{ color: calculateMargin >= 30 ? '#4ade80' : calculateMargin >= 10 ? '#fbbf24' : '#f87171', fontWeight: 700 }">{{ calculateMargin }}%</span> at {{ formatCost(currentDeal?.deal_value) }} deal value</div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Supporting Documents (upload BEFORE generating proposal) -->
    <v-card class="glow-card mb-6">
      <v-card-text style="padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <div style="font-size: 18px; font-weight: 600;">Supporting Documents</div>
            <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">Upload SOWs, case studies, pricing sheets, or reference docs. These will be indexed and used by the AI when generating the proposal.</div>
          </div>
          <v-chip variant="flat" size="x-small" color="cyan" v-if="dealDocuments.length > 0">
            {{ dealDocuments.length }} file{{ dealDocuments.length !== 1 ? 's' : '' }}
          </v-chip>
        </div>

        <!-- Upload area -->
        <div
          style="border: 2px dashed rgba(6, 182, 212, 0.3); border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: border-color 0.2s; margin-bottom: 16px;"
          @dragover.prevent
          @drop.prevent="handleDocDrop"
          @click="$refs.docFileInput.click()"
        >
          <v-icon size="28" color="cyan" style="margin-bottom: 6px;">mdi-cloud-upload-outline</v-icon>
          <div style="font-size: 13px; font-weight: 500;">Drop files here or click to browse</div>
          <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">PDF, DOCX, XLSX, TXT</div>
          <input
            ref="docFileInput"
            type="file"
            multiple
            accept=".pdf,.docx,.xlsx,.txt"
            style="display: none;"
            @change="handleDocFileSelect"
          />
        </div>

        <!-- Category selector for uploads -->
        <v-select
          v-model="docUploadCategory"
          :items="docCategories"
          item-title="label"
          item-value="value"
          label="Document Category"
          outlined
          dense
          hide-details
          style="max-width: 260px; margin-bottom: 16px;"
        />

        <!-- Upload progress -->
        <div v-if="docUploading" style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <v-progress-circular indeterminate color="cyan" size="20" width="2" />
          <span style="font-size: 12px; color: #9ca3af;">Uploading & processing...</span>
        </div>

        <!-- Document list -->
        <div v-if="dealDocuments.length > 0" style="display: flex; flex-direction: column; gap: 8px;">
          <div
            v-for="doc in dealDocuments"
            :key="doc.id"
            style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; background: rgba(6, 182, 212, 0.06); border: 1px solid rgba(6, 182, 212, 0.12);"
          >
            <v-icon :color="docFileIconColor(doc.file_type)" size="20">{{ docFileIcon(doc.file_type) }}</v-icon>
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 12px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ doc.original_filename || doc.filename }}</div>
              <div style="font-size: 10px; color: #6b7280;">
                {{ docFormatBytes(doc.file_size) }} &bull;
                <span :style="{ color: doc.is_processed ? '#22c55e' : '#f59e0b' }">{{ doc.is_processed ? 'Indexed' : 'Processing...' }}</span>
                &bull; {{ (doc.doc_category || 'general').toUpperCase() }}
              </div>
            </div>
            <v-btn icon size="x-small" variant="text" color="error" @click="deleteDoc(doc)">
              <v-icon size="14">mdi-close</v-icon>
            </v-btn>
          </div>
        </div>
        <div v-else-if="!docUploading" style="text-align: center; padding: 8px; color: #4b5563; font-size: 12px;">
          No supporting documents uploaded yet
        </div>
      </v-card-text>
    </v-card>

    <!-- Action Bar -->
    <v-card class="glow-card">
      <v-card-text style="padding: 20px 24px; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; gap: 12px;">
          <v-btn variant="outlined" color="error" size="small" class="text-none" :loading="declining" @click="showDeclineConfirm = true">
            <v-icon start size="14">mdi-close</v-icon>
            Decline Deal
          </v-btn>
          <v-btn variant="outlined" color="primary" size="small" class="text-none" :loading="exporting" @click="exportReport">
            <v-icon start size="14">mdi-file-export-outline</v-icon>
            Export Report
          </v-btn>
        </div>
        <div style="display: flex; gap: 12px;">
          <v-btn variant="outlined" color="primary" size="small" class="text-none" @click="reevaluate">Re-evaluate</v-btn>
          <v-btn variant="flat" color="success" size="default" class="text-none" style="font-weight: 700;" :loading="proceedLoading" @click="proceedToProposal">
            <v-icon start size="16">mdi-check</v-icon>
            Proceed to Proposal
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
    </template>
    </div>

    <!-- ═══════════ Assign Employee Dialog ═══════════ -->
    <v-dialog v-model="showAssignDialog" max-width="600" persistent>
      <v-card style="background: #12121f; border: 1px solid rgba(139, 92, 246, 0.3);">
        <v-card-title style="padding: 20px 24px; display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 18px; font-weight: 700;">Assign Team Member</span>
          <v-btn icon size="small" variant="text" @click="showAssignDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider />
        <v-card-text style="padding: 24px;">
          <!-- Loading available employees -->
          <div v-if="loadingAvailable" style="text-align: center; padding: 20px;">
            <v-progress-circular indeterminate color="purple" />
            <div style="font-size: 13px; color: #9ca3af; margin-top: 8px;">Loading available employees...</div>
          </div>

          <!-- No employees available -->
          <div v-else-if="availableEmployees.length === 0" style="text-align: center; padding: 20px; color: #6b7280;">
            <v-icon size="36" color="grey">mdi-account-off</v-icon>
            <div style="font-size: 13px; margin-top: 8px;">All employees are already assigned to this deal</div>
          </div>

          <!-- Employee picker -->
          <div v-else>
            <v-autocomplete
              v-model="assignForm.employee_id"
              :items="availableEmployees"
              item-title="label"
              item-value="id"
              label="Select Employee"
              outlined
              dense
              style="margin-bottom: 16px;"
            >
              <template v-slot:item="{ props: itemProps, item }">
                <v-list-item v-bind="itemProps">
                  <template v-slot:subtitle>
                    <span style="font-size: 11px; color: #9ca3af;">{{ item.raw.role }} &bull; {{ item.raw.department }} &bull; {{ item.raw.availability_percent }}% avail &bull; {{ formatCost(item.raw.hourly_rate) }}/hr</span>
                  </template>
                </v-list-item>
              </template>
            </v-autocomplete>

            <v-row dense>
              <v-col cols="6">
                <v-text-field
                  v-model="assignForm.role_on_deal"
                  label="Role on Deal (optional)"
                  outlined
                  dense
                  placeholder="e.g. Lead Developer"
                />
              </v-col>
              <v-col cols="3">
                <v-text-field
                  v-model.number="assignForm.allocation_percent"
                  label="Allocation %"
                  outlined
                  dense
                  type="number"
                  min="10"
                  max="100"
                />
              </v-col>
              <v-col cols="3">
                <v-text-field
                  v-model.number="assignForm.hourly_rate_override"
                  label="Rate $/hr"
                  outlined
                  dense
                  type="number"
                  placeholder="Default"
                />
              </v-col>
            </v-row>

            <v-textarea
              v-model="assignForm.notes"
              label="Notes (optional)"
              outlined
              dense
              rows="2"
              placeholder="Why this person is a good fit..."
            />
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions style="padding: 16px 24px; justify-content: flex-end;">
          <v-btn variant="text" color="grey" class="text-none" @click="showAssignDialog = false">Cancel</v-btn>
          <v-btn
            variant="flat"
            color="purple"
            class="text-none"
            :disabled="!assignForm.employee_id"
            :loading="assigning"
            @click="handleManualAssign"
          >
            <v-icon start size="14">mdi-account-plus</v-icon>
            Assign
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ═══════════ Proposal Progress Dialog ═══════════ -->
    <v-dialog v-model="showProposalProgress" max-width="520" persistent>
      <v-card style="background: #12121f; border: 1px solid rgba(6, 182, 212, 0.3);">
        <v-card-text style="padding: 32px; text-align: center;">
          <div v-if="proposalStatus === 'running'">
            <v-progress-circular indeterminate color="cyan" size="56" width="4" style="margin-bottom: 16px;" />
            <div style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Quinn is generating your proposal</div>
            <div style="font-size: 13px; color: #9ca3af; margin-bottom: 24px;">{{ proposalStepMessage }}</div>
            <!-- Step indicators -->
            <div style="display: flex; justify-content: center; gap: 12px;">
              <div v-for="(step, i) in proposalSteps" :key="step.key" style="display: flex; align-items: center; gap: 6px;">
                <div :style="{
                  width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700,
                  background: proposalStepNum > i ? 'linear-gradient(135deg, #22c55e, #16a34a)' : proposalStepNum === i ? 'linear-gradient(135deg, #06b6d4, #0891b2)' : 'rgba(255,255,255,0.08)',
                  color: proposalStepNum >= i ? '#fff' : '#6b7280',
                }">
                  <v-icon v-if="proposalStepNum > i" size="14" color="white">mdi-check</v-icon>
                  <span v-else>{{ i + 1 }}</span>
                </div>
                <span :style="{ fontSize: '11px', color: proposalStepNum >= i ? '#d1d5db' : '#6b7280' }">{{ step.label }}</span>
              </div>
            </div>
            <!-- Cancel button while running -->
            <v-btn variant="text" color="grey" class="text-none mt-6" size="small" @click="cancelProposal">
              <v-icon start size="14">mdi-close</v-icon>
              Cancel
            </v-btn>
          </div>

          <div v-else-if="proposalStatus === 'completed'">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #22c55e, #16a34a); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
              <v-icon color="white" size="28">mdi-check</v-icon>
            </div>
            <div style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Proposal Generated!</div>
            <div style="font-size: 13px; color: #9ca3af; margin-bottom: 8px;">Quinn has created a draft proposal for {{ currentDeal?.client_name }}</div>
            <div v-if="proposalComplianceScore != null" style="font-size: 13px; color: #06b6d4; font-weight: 600;">
              Compliance Score: {{ Math.round(proposalComplianceScore * 100) }}%
            </div>
          </div>

          <div v-else-if="proposalStatus === 'failed'">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #ef4444, #dc2626); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
              <v-icon color="white" size="28">mdi-alert</v-icon>
            </div>
            <div style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Proposal Generation Failed</div>
            <div style="font-size: 13px; color: #f87171;">{{ proposalError }}</div>
          </div>
        </v-card-text>
        <v-card-actions v-if="proposalStatus !== 'running'" style="padding: 0 32px 24px; justify-content: center;">
          <v-btn variant="flat" color="cyan" class="text-none" @click="showProposalProgress = false">
            {{ proposalStatus === 'completed' ? 'Done' : 'Close' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Decline Confirmation Dialog -->
    <v-dialog v-model="showDeclineConfirm" max-width="440">
      <v-card style="background: #12121f; border: 1px solid rgba(239, 68, 68, 0.3);">
        <v-card-text style="padding: 28px; text-align: center;">
          <div style="width: 52px; height: 52px; border-radius: 50%; background: rgba(239, 68, 68, 0.15); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
            <v-icon color="error" size="28">mdi-close-circle-outline</v-icon>
          </div>
          <div style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Decline This Deal?</div>
          <div style="font-size: 13px; color: #9ca3af;">This will mark <strong style="color: #f87171;">{{ currentDeal?.title }}</strong> as declined. You can re-open it later if needed.</div>
        </v-card-text>
        <v-card-actions style="padding: 0 28px 24px; justify-content: center; gap: 12px;">
          <v-btn variant="text" color="grey" class="text-none" @click="showDeclineConfirm = false">Cancel</v-btn>
          <v-btn variant="flat" color="error" class="text-none" :loading="declining" @click="declineDeal">
            <v-icon start size="14">mdi-close</v-icon>
            Decline Deal
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for feedback -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000" location="bottom right">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { dealsAPI, employeesAPI, assignmentsAPI, documentsAPI, proposalsAPI } from '../api'
import { useAgentTasks } from '../stores/agentTasks'

const props = defineProps({
  dealId: {
    type: String,
    default: null,
  },
})

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const proceedLoading = ref(false)
const autoAssigning = ref(false)
const assigning = ref(false)
const loadingAvailable = ref(false)
const selectedDealId = ref(null)

const currentDeal = ref(null)
const analysis = ref(null)
const assignments = ref([])
const deals = ref([])
const riskFactors = ref([])

// Assign dialog
const showAssignDialog = ref(false)
const availableEmployees = ref([])
const assignForm = ref({
  employee_id: null,
  role_on_deal: '',
  allocation_percent: 100,
  hourly_rate_override: null,
  notes: '',
})

// Snackbar
const snackbar = ref({ show: false, text: '', color: 'success' })
function showMsg(text, color = 'success') {
  snackbar.value = { show: true, text, color }
}

// ── Supporting Documents ──
const dealDocuments = ref([])
const docUploading = ref(false)
const docUploadCategory = ref('proposal')
const docCategories = [
  { label: 'Proposal / SOW', value: 'proposal' },
  { label: 'RFP / Requirements', value: 'rfp' },
  { label: 'Case Study', value: 'general' },
  { label: 'Pricing Sheet', value: 'general' },
  { label: 'Other', value: 'general' },
]

async function loadDealDocuments(dealId) {
  try {
    const res = await documentsAPI.list({ deal_id: dealId })
    dealDocuments.value = Array.isArray(res.data) ? res.data : []
  } catch {
    dealDocuments.value = []
  }
}

async function uploadDoc(file) {
  if (!currentDeal.value) return
  docUploading.value = true
  try {
    await documentsAPI.upload(file, currentDeal.value.id, docUploadCategory.value)
    showMsg(`${file.name} uploaded & queued for indexing`)
    // Reload after a short delay to let background processing start
    setTimeout(() => loadDealDocuments(currentDeal.value.id), 1500)
  } catch (e) {
    const msg = e.response?.data?.detail || 'Upload failed'
    showMsg(msg, 'error')
  } finally {
    docUploading.value = false
  }
}

function handleDocFileSelect(event) {
  const files = event.target.files
  for (const file of files) uploadDoc(file)
  event.target.value = ''
}

function handleDocDrop(event) {
  const files = event.dataTransfer.files
  for (const file of files) uploadDoc(file)
}

async function deleteDoc(doc) {
  try {
    await documentsAPI.delete(doc.id)
    showMsg('Document removed')
    await loadDealDocuments(currentDeal.value.id)
  } catch {
    showMsg('Failed to delete document', 'error')
  }
}

function docFileIcon(ext) {
  const map = { pdf: 'mdi-file-pdf-box', docx: 'mdi-file-word-box', xlsx: 'mdi-file-excel-box', txt: 'mdi-file-document' }
  return map[ext] || 'mdi-file-outline'
}

function docFileIconColor(ext) {
  const map = { pdf: '#ef4444', docx: '#3b82f6', xlsx: '#22c55e', txt: '#9ca3af' }
  return map[ext] || '#9ca3af'
}

function docFormatBytes(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// Format recommendation for display
const recommendationLabel = computed(() => {
  const rec = analysis.value?.recommendation || ''
  const map = { 'go': 'GO', 'no_go': 'NO GO', 'conditional_go': 'CONDITIONAL GO' }
  return map[rec] || rec.toUpperCase().replace(/_/g, ' ')
})

const recommendationStyle = computed(() => {
  const rec = analysis.value?.recommendation || ''
  if (rec === 'go') return { gradient: 'linear-gradient(135deg, #22c55e, #16a34a)', icon: 'mdi-check-circle', color: '#22c55e' }
  if (rec === 'no_go') return { gradient: 'linear-gradient(135deg, #ef4444, #dc2626)', icon: 'mdi-close-circle', color: '#ef4444' }
  return { gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', icon: 'mdi-alert-circle', color: '#f59e0b' }
})

const confidencePercent = computed(() => {
  const score = analysis.value?.confidence_score || 0
  return score > 1 ? Math.round(score) : Math.round(score * 100)
})

function getMonthlyCost(a) {
  const rate = a.hourly_rate_override != null ? a.hourly_rate_override : (a.employee_hourly_rate || 0)
  return rate * 160 * ((a.allocation_percent || 100) / 100)
}

const totalStaffingCost = computed(() => {
  if (!assignments.value || !Array.isArray(assignments.value)) return 0
  return assignments.value.reduce((sum, a) => sum + getMonthlyCost(a), 0)
})

const calculateMargin = computed(() => {
  const dealValue = currentDeal.value?.deal_value
  if (!dealValue || !assignments.value?.length) return 0
  const margin = ((dealValue - totalStaffingCost.value) / dealValue) * 100
  return Math.round(margin)
})

// ── Data Loading ──

async function loadAssignments(dealId) {
  try {
    const res = await assignmentsAPI.list(dealId)
    assignments.value = res.data?.assignments || []
  } catch (e) {
    console.warn('No assignments:', e.response?.status)
    assignments.value = []
  }
}

async function loadDealById(id) {
  if (!id) return
  loading.value = true
  try {
    const dealRes = await dealsAPI.get(id)
    currentDeal.value = dealRes.data

    // Load analysis (may 404)
    try {
      const analysisRes = await dealsAPI.getAnalysis(id)
      analysis.value = analysisRes.data
      riskFactors.value = analysis.value?.risk_factors || []
    } catch (e) {
      console.warn('No analysis found:', e.response?.status)
      analysis.value = null
    }

    // Load persistent assignments + supporting documents
    await loadAssignments(id)
    await loadDealDocuments(id)
  } catch (error) {
    console.error('Error loading deal:', error)
  } finally {
    loading.value = false
  }
}

async function loadAllDeals() {
  loading.value = true
  try {
    const dealsRes = await dealsAPI.list()
    const allDeals = dealsRes.data?.deals || []
    deals.value = allDeals
      .filter(deal => deal.requirement_count > 0)
      .map(d => ({ ...d, label: `${d.title} - ${d.client_name}` }))

    if (deals.value.length === 1) {
      selectedDealId.value = deals.value[0].id
      await loadDealById(deals.value[0].id)
    }
  } catch (error) {
    console.error('Error loading deals:', error)
  } finally {
    loading.value = false
  }
}

function onDealSelected(id) {
  if (!id) return
  // Reset state for the new deal
  currentDeal.value = null
  analysis.value = null
  assignments.value = []
  dealDocuments.value = []
  riskFactors.value = []
  loadDealById(id)
}

// ── Assignment Actions ──

async function handleAutoAssign() {
  if (!currentDeal.value) return
  autoAssigning.value = true
  try {
    const res = await assignmentsAPI.autoAssign(currentDeal.value.id, 5)
    const newCount = Array.isArray(res.data) ? res.data.length : 0
    await loadAssignments(currentDeal.value.id)
    showMsg(`Auto-assigned ${newCount} team member${newCount !== 1 ? 's' : ''}`)
  } catch (e) {
    const msg = e.response?.data?.detail || 'Auto-assign failed'
    showMsg(msg, 'error')
  } finally {
    autoAssigning.value = false
  }
}

async function handleManualAssign() {
  if (!currentDeal.value || !assignForm.value.employee_id) return
  assigning.value = true
  try {
    const payload = {
      employee_id: assignForm.value.employee_id,
      allocation_percent: assignForm.value.allocation_percent || 100,
    }
    if (assignForm.value.role_on_deal) payload.role_on_deal = assignForm.value.role_on_deal
    if (assignForm.value.hourly_rate_override) payload.hourly_rate_override = assignForm.value.hourly_rate_override
    if (assignForm.value.notes) payload.notes = assignForm.value.notes

    await assignmentsAPI.assign(currentDeal.value.id, payload)
    await loadAssignments(currentDeal.value.id)
    showAssignDialog.value = false
    resetAssignForm()
    showMsg('Team member assigned successfully')
  } catch (e) {
    const msg = e.response?.data?.detail || 'Failed to assign employee'
    showMsg(msg, 'error')
  } finally {
    assigning.value = false
  }
}

async function handleUnassign(assignment) {
  if (!currentDeal.value) return
  try {
    await assignmentsAPI.remove(currentDeal.value.id, assignment.id)
    await loadAssignments(currentDeal.value.id)
    showMsg(`${assignment.employee_name} unassigned`)
  } catch (e) {
    showMsg('Failed to unassign', 'error')
  }
}

async function loadAvailableEmployees() {
  if (!currentDeal.value) return
  loadingAvailable.value = true
  try {
    const res = await assignmentsAPI.availableEmployees(currentDeal.value.id)
    availableEmployees.value = (res.data || []).map(emp => ({
      ...emp,
      label: `${emp.name} — ${emp.role} (${emp.department})`,
    }))
  } catch (e) {
    availableEmployees.value = []
  } finally {
    loadingAvailable.value = false
  }
}

function resetAssignForm() {
  assignForm.value = {
    employee_id: null,
    role_on_deal: '',
    allocation_percent: 100,
    hourly_rate_override: null,
    notes: '',
  }
}

// Load available employees when dialog opens
watch(showAssignDialog, (open) => {
  if (open) {
    resetAssignForm()
    loadAvailableEmployees()
  }
})

// ── Proposal Progress (using shared store) ──

const { startTask: storeStartTask, resumePolling, getTask, isRunning, clearTask } = useAgentTasks()
const proposalTask = getTask('proposal')

const showProposalProgress = ref(false)
const proposalComplianceScore = ref(null)

// Computed properties bridging store state to template
const proposalStatus = computed(() => {
  // Map store states to what the template expects: 'running' | 'completed' | 'failed'
  if (proposalTask.status === 'running') return 'running'
  if (proposalTask.status === 'completed') return 'completed'
  if (proposalTask.status === 'failed') return 'failed'
  return 'running' // default for dialog display (dialog is only shown when active)
})
const proposalStepMessage = computed(() => proposalTask.stepMessage || 'Starting proposal generation...')
const proposalStepNum = computed(() => proposalTask.stepNumber)
const proposalError = computed(() => proposalTask.error || '')

const proposalSteps = [
  { key: 'retrieve', label: 'Retrieve' },
  { key: 'generate', label: 'Generate' },
  { key: 'comply', label: 'Compliance' },
]

// Completion handler for proposal tasks
async function onProposalComplete(task) {
  proceedLoading.value = false
  if (task.status === 'completed' && task.result) {
    try {
      const r = typeof task.result === 'string' ? JSON.parse(task.result) : task.result
      proposalComplianceScore.value = r?.compliance_score ?? null
    } catch { /* ignore */ }
  }
}

async function proceedToProposal() {
  if (!currentDeal.value) return
  proceedLoading.value = true
  proposalComplianceScore.value = null
  showProposalProgress.value = true

  await storeStartTask(currentDeal.value.id, 'proposal', onProposalComplete)
  // If startTask set status to 'failed' immediately, update loading
  if (proposalTask.status === 'failed') {
    proceedLoading.value = false
  }
}

function cancelProposal() {
  clearTask('proposal')
  proceedLoading.value = false
  showProposalProgress.value = false
}

// ── Other Actions ──

const declining = ref(false)
const exporting = ref(false)
const showDeclineConfirm = ref(false)

async function declineDeal() {
  if (!currentDeal.value) return
  declining.value = true
  try {
    await dealsAPI.update(currentDeal.value.id, { status: 'declined' })
    showDeclineConfirm.value = false
    showMsg('Deal has been declined')
    // Navigate back to dashboard after a short delay
    setTimeout(() => router.push('/'), 1000)
  } catch (e) {
    const msg = e.response?.data?.detail || 'Failed to decline deal'
    showMsg(msg, 'error')
  } finally {
    declining.value = false
  }
}

async function exportReport() {
  if (!currentDeal.value || !analysis.value) return
  exporting.value = true
  try {
    // First check if there's a proposal we can export as DOCX
    const proposalsRes = await proposalsAPI.list({ deal_id: currentDeal.value.id })
    const proposals = proposalsRes.data?.proposals || proposalsRes.data || []

    if (proposals.length > 0) {
      // Export the latest proposal as DOCX
      const latestProposal = proposals[proposals.length - 1]
      const res = await proposalsAPI.exportDocx(latestProposal.id)
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${currentDeal.value.title || 'Deal'}_Report.docx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showMsg('Proposal report downloaded!')
    } else {
      // No proposal yet — export qualification analysis as JSON
      const report = {
        deal: {
          title: currentDeal.value.title,
          client: currentDeal.value.client_name,
          value: currentDeal.value.deal_value,
          status: currentDeal.value.status,
        },
        analysis: {
          recommendation: analysis.value.recommendation,
          confidence_score: analysis.value.confidence_score,
          positive_factors: analysis.value.positive_factors,
          risk_factors: analysis.value.risk_factors,
          conditions: analysis.value.conditions,
          reasoning: analysis.value.reasoning,
        },
        team: assignments.value.map(a => ({
          name: a.employee_name,
          role: a.role_on_deal || a.employee_role,
          allocation: a.allocation_percent + '%',
        })),
        exported_at: new Date().toISOString(),
      }
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${currentDeal.value.title || 'Deal'}_Analysis.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showMsg('Analysis report downloaded!')
    }
  } catch (e) {
    console.error('Export error:', e)
    showMsg('Failed to export report', 'error')
  } finally {
    exporting.value = false
  }
}

function reevaluate() {
  if (currentDeal.value?.id) loadDealById(currentDeal.value.id)
}

function getAssignStyle(assignedBy) {
  return assignedBy === 'auto'
    ? { background: 'rgba(6, 182, 212, 0.06)', border: '1px solid rgba(6, 182, 212, 0.2)' }
    : { background: 'rgba(139, 92, 246, 0.06)', border: '1px solid rgba(139, 92, 246, 0.15)' }
}

function formatCost(cost) {
  if (!cost && cost !== 0) return '$0'
  if (cost >= 1000000) return '$' + (cost / 1000000).toFixed(1) + 'M'
  if (cost >= 1000) return '$' + (cost / 1000).toFixed(0) + 'K'
  return '$' + Math.round(cost)
}

onMounted(async () => {
  const id = props.dealId || route.params.dealId
  if (id) {
    await loadDealById(id)
  } else {
    await loadAllDeals()
  }

  // Resume proposal polling if task is still running (user navigated away and came back)
  if (isRunning('proposal')) {
    showProposalProgress.value = true
    proceedLoading.value = true
    resumePolling('proposal', onProposalComplete)
  }
  // If task already completed while away, show completion
  if (proposalTask.status === 'completed') {
    showProposalProgress.value = true
    if (proposalTask.result) {
      try {
        const r = typeof proposalTask.result === 'string' ? JSON.parse(proposalTask.result) : proposalTask.result
        proposalComplianceScore.value = r?.compliance_score ?? null
      } catch { /* ignore */ }
    }
  }
})

</script>
