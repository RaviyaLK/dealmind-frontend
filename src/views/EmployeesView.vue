<template>
  <div>
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px;">
      <div>
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 6px;">
          <v-chip variant="flat" size="small" style="background: linear-gradient(135deg, #06b6d4, #3b82f6); color: white; font-weight: 700; font-size: 12px;">RESOURCES</v-chip>
          <span style="font-size: 28px; font-weight: 700;">Employee Management</span>
        </div>
        <div style="font-size: 14px; color: #9ca3af;">
          Manage your team for deal qualification and staffing proposals
        </div>
      </div>
      <div style="display: flex; gap: 8px;">
        <v-btn variant="outlined" color="primary" size="small" class="text-none" @click="showUploadDialog = true">
          <v-icon start size="16">mdi-file-excel</v-icon>
          Upload Excel
        </v-btn>
        <v-btn color="primary" size="small" class="text-none" @click="showAddDialog = true">
          <v-icon start size="16">mdi-plus</v-icon>
          Add Employee
        </v-btn>
      </div>
    </div>

    <!-- Stats Row -->
    <v-row class="mb-6">
      <v-col cols="3">
        <v-card class="glow-card">
          <v-card-text style="padding: 20px; display: flex; align-items: center; gap: 16px;">
            <div style="width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #a855f7, #ec4899);">
              <v-icon color="white" size="22">mdi-account-group</v-icon>
            </div>
            <div>
              <div style="font-size: 24px; font-weight: 800;">{{ employees.length }}</div>
              <div style="font-size: 12px; color: #6b7280;">Total Employees</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card class="glow-card">
          <v-card-text style="padding: 20px; display: flex; align-items: center; gap: 16px;">
            <div style="width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #22c55e, #16a34a);">
              <v-icon color="white" size="22">mdi-check-circle</v-icon>
            </div>
            <div>
              <div style="font-size: 24px; font-weight: 800;">{{ availableCount }}</div>
              <div style="font-size: 12px; color: #6b7280;">Available (>50%)</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card class="glow-card">
          <v-card-text style="padding: 20px; display: flex; align-items: center; gap: 16px;">
            <div style="width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #06b6d4, #0891b2);">
              <v-icon color="white" size="22">mdi-tag-multiple</v-icon>
            </div>
            <div>
              <div style="font-size: 24px; font-weight: 800;">{{ uniqueSkillCount }}</div>
              <div style="font-size: 12px; color: #6b7280;">Unique Skills</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card class="glow-card">
          <v-card-text style="padding: 20px; display: flex; align-items: center; gap: 16px;">
            <div style="width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f59e0b, #d97706);">
              <v-icon color="white" size="22">mdi-domain</v-icon>
            </div>
            <div>
              <div style="font-size: 24px; font-weight: 800;">{{ uniqueDepartments.length }}</div>
              <div style="font-size: 12px; color: #6b7280;">Departments</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Employee Table -->
    <v-card class="glow-card">
      <div style="padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(139, 92, 246, 0.12);">
        <div style="display: flex; align-items: center; gap: 10px;">
          <v-icon color="primary" size="18">mdi-account-multiple</v-icon>
          <span style="font-size: 16px; font-weight: 600;">Team Roster</span>
        </div>
        <v-text-field
          v-model="searchQuery"
          placeholder="Search by name, role, or skill..."
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-magnify"
          hide-details
          style="max-width: 300px;"
          clearable
        />
      </div>
      <v-card-text style="padding: 0;">
        <div v-if="loading" style="padding: 40px; text-align: center;">
          <v-progress-circular indeterminate color="primary" />
        </div>
        <div v-else-if="filteredEmployees.length === 0" style="padding: 60px 20px; text-align: center; color: #6b7280;">
          <v-icon size="48" color="grey" style="margin-bottom: 12px;">mdi-account-off</v-icon>
          <div style="font-size: 14px;">{{ employees.length === 0 ? 'No employees yet' : 'No matches found' }}</div>
          <div style="font-size: 12px; margin-top: 8px;">{{ employees.length === 0 ? 'Upload an Excel file or add employees manually' : 'Try a different search term' }}</div>
        </div>
        <v-table v-else density="comfortable" style="background: transparent;">
          <thead>
            <tr style="border-bottom: 1px solid rgba(139, 92, 246, 0.12);">
              <th style="color: #6b7280; font-size: 11px; font-weight: 700; letter-spacing: 1px;">NAME</th>
              <th style="color: #6b7280; font-size: 11px; font-weight: 700; letter-spacing: 1px;">ROLE</th>
              <th style="color: #6b7280; font-size: 11px; font-weight: 700; letter-spacing: 1px;">DEPARTMENT</th>
              <th style="color: #6b7280; font-size: 11px; font-weight: 700; letter-spacing: 1px;">SKILLS</th>
              <th style="color: #6b7280; font-size: 11px; font-weight: 700; letter-spacing: 1px;">AVAILABILITY</th>
              <th style="color: #6b7280; font-size: 11px; font-weight: 700; letter-spacing: 1px;">RATE</th>
              <th style="color: #6b7280; font-size: 11px; font-weight: 700; letter-spacing: 1px; width: 60px;"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="emp in filteredEmployees" :key="emp.id" style="border-bottom: 1px solid rgba(139, 92, 246, 0.06);">
              <td style="padding: 14px 16px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(6, 182, 212, 0.2)); font-size: 13px; font-weight: 700; color: #c084fc;">
                    {{ getInitials(emp.name) }}
                  </div>
                  <div>
                    <div style="font-weight: 600; font-size: 13px;">{{ emp.name }}</div>
                    <div style="font-size: 11px; color: #6b7280;">{{ emp.email }}</div>
                  </div>
                </div>
              </td>
              <td style="padding: 14px 16px; font-size: 13px;">{{ emp.role }}</td>
              <td style="padding: 14px 16px;">
                <v-chip size="x-small" variant="tonal" color="primary" style="font-size: 10px; font-weight: 600;">{{ emp.department }}</v-chip>
              </td>
              <td style="padding: 14px 16px;">
                <div style="display: flex; gap: 4px; flex-wrap: wrap; max-width: 250px;">
                  <v-chip v-for="skill in (emp.skills || []).slice(0, 4)" :key="skill" size="x-small" variant="outlined" color="cyan" style="font-size: 10px;">{{ skill }}</v-chip>
                  <v-chip v-if="(emp.skills || []).length > 4" size="x-small" variant="tonal" style="font-size: 10px;">+{{ emp.skills.length - 4 }}</v-chip>
                </div>
              </td>
              <td style="padding: 14px 16px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <v-progress-linear :model-value="emp.availability_percent" :color="emp.availability_percent > 50 ? '#22c55e' : emp.availability_percent > 20 ? '#f59e0b' : '#ef4444'" bg-color="rgba(255,255,255,0.06)" rounded height="6" style="width: 60px;" />
                  <span style="font-size: 12px; font-weight: 600;">{{ emp.availability_percent }}%</span>
                </div>
              </td>
              <td style="padding: 14px 16px; font-size: 13px; font-weight: 600; color: #22c55e;">${{ emp.hourly_rate }}/hr</td>
              <td style="padding: 14px 16px;">
                <v-btn icon variant="text" size="x-small" color="error" @click="deleteEmployee(emp.id)">
                  <v-icon size="16">mdi-delete-outline</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <!-- Upload Excel Dialog -->
    <v-dialog v-model="showUploadDialog" max-width="480">
      <v-card class="glow-card pa-6">
        <v-card-title class="text-h6 font-weight-bold px-0">Upload Employee Excel</v-card-title>
        <div style="font-size: 13px; color: #9ca3af; margin-bottom: 16px;">
          Upload an .xlsx file with columns: Name, Email, Role, Department, Skills, Availability (%), Hourly Rate
        </div>
        <div style="padding: 24px; border-radius: 12px; background: rgba(0,0,0,0.2); border: 2px dashed rgba(139, 92, 246, 0.3); text-align: center; margin-bottom: 16px;">
          <input ref="excelInput" type="file" accept=".xlsx,.xls" style="display: none;" @change="onExcelSelected" />
          <v-icon color="primary" size="36" style="margin-bottom: 12px;">mdi-file-excel</v-icon>
          <div v-if="!excelFile" style="font-size: 13px; margin-bottom: 12px;">Choose an Excel file</div>
          <div v-else style="font-size: 13px; color: #22c55e; margin-bottom: 12px;">{{ excelFile.name }}</div>
          <v-btn variant="outlined" color="primary" size="small" @click="excelInput?.click()">{{ excelFile ? 'Change File' : 'Select File' }}</v-btn>
        </div>
        <div v-if="uploadResult" style="padding: 12px; border-radius: 8px; margin-bottom: 12px;" :style="{ background: uploadResult.errors?.length ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', border: uploadResult.errors?.length ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(34,197,94,0.3)' }">
          <div style="font-size: 13px; font-weight: 600;">Imported: {{ uploadResult.total_imported }} | Skipped: {{ uploadResult.total_skipped }}</div>
          <div v-if="uploadResult.errors?.length" style="font-size: 12px; color: #ef4444; margin-top: 6px;">
            <div v-for="err in uploadResult.errors.slice(0, 3)" :key="err">{{ err }}</div>
          </div>
        </div>
        <v-card-actions class="px-0">
          <v-spacer />
          <v-btn variant="text" @click="showUploadDialog = false; excelFile = null; uploadResult = null;">Cancel</v-btn>
          <v-btn color="primary" variant="flat" @click="uploadExcel" :loading="uploading" :disabled="!excelFile">Upload</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Employee Dialog -->
    <v-dialog v-model="showAddDialog" max-width="520">
      <v-card class="glow-card pa-6">
        <v-card-title class="text-h6 font-weight-bold px-0">Add Employee</v-card-title>
        <v-text-field v-model="newEmployee.name" label="Full Name" variant="outlined" density="comfortable" class="mt-4" />
        <v-text-field v-model="newEmployee.email" label="Email" variant="outlined" density="comfortable" />
        <v-row>
          <v-col cols="6">
            <v-text-field v-model="newEmployee.role" label="Role / Title" variant="outlined" density="comfortable" />
          </v-col>
          <v-col cols="6">
            <v-text-field v-model="newEmployee.department" label="Department" variant="outlined" density="comfortable" />
          </v-col>
        </v-row>
        <v-text-field v-model="newEmployee.skillsText" label="Skills (comma-separated)" variant="outlined" density="comfortable" placeholder="Python, React, AWS, Machine Learning" />
        <v-row>
          <v-col cols="6">
            <v-text-field v-model.number="newEmployee.availability_percent" label="Availability (%)" type="number" variant="outlined" density="comfortable" />
          </v-col>
          <v-col cols="6">
            <v-text-field v-model.number="newEmployee.hourly_rate" label="Hourly Rate ($)" type="number" variant="outlined" density="comfortable" />
          </v-col>
        </v-row>
        <v-card-actions class="px-0">
          <v-spacer />
          <v-btn variant="text" @click="showAddDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" @click="addEmployee" :loading="adding">Add Employee</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { employeesAPI } from '../api'

const employees = ref([])
const loading = ref(false)
const searchQuery = ref('')

// Upload dialog
const showUploadDialog = ref(false)
const excelInput = ref(null)
const excelFile = ref(null)
const uploading = ref(false)
const uploadResult = ref(null)

// Add dialog
const showAddDialog = ref(false)
const adding = ref(false)
const newEmployee = ref({
  name: '', email: '', role: '', department: '',
  skillsText: '', availability_percent: 80, hourly_rate: 75,
})

// Computed
const filteredEmployees = computed(() => {
  if (!searchQuery.value) return employees.value
  const q = searchQuery.value.toLowerCase()
  return employees.value.filter(e =>
    e.name?.toLowerCase().includes(q) ||
    e.role?.toLowerCase().includes(q) ||
    e.department?.toLowerCase().includes(q) ||
    (e.skills || []).some(s => s.toLowerCase().includes(q))
  )
})

const availableCount = computed(() =>
  employees.value.filter(e => e.availability_percent > 50).length
)

const uniqueSkillCount = computed(() => {
  const skills = new Set()
  employees.value.forEach(e => (e.skills || []).forEach(s => skills.add(s.toLowerCase())))
  return skills.size
})

const uniqueDepartments = computed(() => {
  const depts = new Set(employees.value.map(e => e.department).filter(Boolean))
  return [...depts]
})

// Methods
async function loadEmployees() {
  loading.value = true
  try {
    const response = await employeesAPI.list()
    employees.value = response.data || []
  } catch (error) {
    console.error('Failed to load employees:', error)
  } finally {
    loading.value = false
  }
}

function getInitials(name) {
  return (name || '??').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function onExcelSelected(event) {
  excelFile.value = event.target.files?.[0] || null
  uploadResult.value = null
}

async function uploadExcel() {
  if (!excelFile.value) return
  uploading.value = true
  uploadResult.value = null
  try {
    const response = await employeesAPI.upload(excelFile.value)
    uploadResult.value = response.data
    await loadEmployees()
    if (!response.data.errors?.length) {
      setTimeout(() => { showUploadDialog.value = false; excelFile.value = null; uploadResult.value = null }, 1500)
    }
  } catch (error) {
    console.error('Failed to upload:', error)
    uploadResult.value = { total_imported: 0, total_skipped: 0, errors: [error.response?.data?.detail || 'Upload failed'] }
  } finally {
    uploading.value = false
  }
}

async function addEmployee() {
  if (!newEmployee.value.name || !newEmployee.value.email) return
  adding.value = true
  try {
    await employeesAPI.create({
      name: newEmployee.value.name,
      email: newEmployee.value.email,
      role: newEmployee.value.role,
      department: newEmployee.value.department,
      skills: newEmployee.value.skillsText.split(',').map(s => s.trim()).filter(Boolean),
      availability_percent: newEmployee.value.availability_percent,
      hourly_rate: newEmployee.value.hourly_rate,
    })
    showAddDialog.value = false
    newEmployee.value = { name: '', email: '', role: '', department: '', skillsText: '', availability_percent: 80, hourly_rate: 75 }
    await loadEmployees()
  } catch (error) {
    console.error('Failed to add employee:', error)
  } finally {
    adding.value = false
  }
}

async function deleteEmployee(id) {
  try {
    await employeesAPI.delete(id)
    employees.value = employees.value.filter(e => e.id !== id)
  } catch (error) {
    console.error('Failed to delete employee:', error)
  }
}

onMounted(() => {
  loadEmployees()
})
</script>
