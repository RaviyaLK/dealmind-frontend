import { reactive } from 'vue'
import { agentsAPI } from '../api'

// Step mappings per flow type
const STEP_CONFIG = {
  qualification: {
    steps: { ingest: 1, extract: 2, analyze: 3, match: 4, decide: 5, complete: 5 },
    messages: {
      ingest: 'Loading documents...',
      extract: 'Parsing content...',
      analyze: 'Analyzing requirements...',
      match: 'Matching patterns...',
      decide: 'Making final decision...',
    },
    totalSteps: 5,
  },
  proposal: {
    steps: { retrieve: 1, generate: 2, comply: 3, complete: 3 },
    messages: {
      retrieve: 'Searching knowledge base for relevant sections...',
      generate: 'Writing proposal with Quinn...',
      comply: 'Checking compliance against requirements...',
    },
    totalSteps: 3,
  },
  monitoring: {
    steps: { sentiment: 1, health: 2, alert: 3, recovery: 4, complete: 4 },
    messages: {
      sentiment: 'Analyzing communication sentiment...',
      health: 'Calculating deal health score...',
      alert: 'Detecting potential risks...',
      recovery: 'Generating recovery strategy...',
    },
    totalSteps: 4,
  },
}

const POLL_INTERVAL_MS = 2000
const SAFETY_TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes

function createEmptyTask() {
  return {
    taskId: null,
    dealId: null,
    status: 'idle', // idle | running | completed | failed
    step: '',
    stepNumber: 0,
    stepMessage: '',
    error: null,
    result: null,
    _pollInterval: null,
    _safetyTimeout: null,
    _onComplete: null,
  }
}

// Singleton reactive state — persists across route changes
const state = reactive({
  tasks: {
    qualification: createEmptyTask(),
    proposal: createEmptyTask(),
    monitoring: createEmptyTask(),
  },
})

function stopPolling(flowType) {
  const task = state.tasks[flowType]
  if (!task) return
  if (task._pollInterval) {
    clearInterval(task._pollInterval)
    task._pollInterval = null
  }
  if (task._safetyTimeout) {
    clearTimeout(task._safetyTimeout)
    task._safetyTimeout = null
  }
}

function pollTask(flowType) {
  const task = state.tasks[flowType]
  const config = STEP_CONFIG[flowType]
  if (!task || !config) return

  task._pollInterval = setInterval(async () => {
    if (!task.taskId || task.status !== 'running') {
      stopPolling(flowType)
      return
    }
    try {
      const res = await agentsAPI.status(task.taskId)
      const data = res.data

      // Update step info
      if (data.step) {
        const stepLower = data.step.toLowerCase()
        task.step = stepLower
        if (config.steps[stepLower] !== undefined) {
          task.stepNumber = config.steps[stepLower]
        }
        if (config.messages[stepLower]) {
          task.stepMessage = config.messages[stepLower]
        }
      }
      if (data.step_number && data.step_number > task.stepNumber) {
        task.stepNumber = data.step_number
      }
      if (data.message && !config.messages[task.step]) {
        task.stepMessage = data.message
      }

      // Check completion
      if (data.status === 'completed' || data.status === 'complete') {
        stopPolling(flowType)
        task.status = 'completed'
        task.stepNumber = config.totalSteps
        task.result = data.result || data.data || null
        if (task._onComplete) {
          try { await task._onComplete(task) } catch (e) { console.warn(`onComplete error for ${flowType}:`, e) }
        }
      } else if (data.status === 'failed') {
        stopPolling(flowType)
        task.status = 'failed'
        task.error = data.error || data.message || 'Agent task failed'
        if (task._onComplete) {
          try { await task._onComplete(task) } catch (e) { console.warn(`onComplete error for ${flowType}:`, e) }
        }
      }
    } catch (e) {
      console.warn(`Polling error for ${flowType}:`, e)
    }
  }, POLL_INTERVAL_MS)

  // Safety timeout
  task._safetyTimeout = setTimeout(() => {
    if (task.status === 'running') {
      stopPolling(flowType)
      task.status = 'failed'
      task.error = 'Task timed out after 5 minutes'
    }
  }, SAFETY_TIMEOUT_MS)
}

export function useAgentTasks() {
  /**
   * Start a new agent task
   * @param {string} dealId
   * @param {string} flowType - 'qualification' | 'proposal' | 'monitoring'
   * @param {Function} onComplete - callback(task) called when task completes or fails
   * @returns {Promise<string|null>} taskId or null on error
   */
  async function startTask(dealId, flowType, onComplete = null) {
    const task = state.tasks[flowType]
    if (!task) return null

    // Stop any existing polling for this flow
    stopPolling(flowType)

    // Reset task state
    Object.assign(task, createEmptyTask())
    task.dealId = dealId
    task.status = 'running'
    task.stepNumber = 0
    task.stepMessage = 'Starting...'
    task._onComplete = onComplete

    try {
      const res = await agentsAPI.run(dealId, flowType)
      const taskId = res.data?.task_id
      if (taskId) {
        task.taskId = taskId
        pollTask(flowType)
        return taskId
      } else {
        task.status = 'failed'
        task.error = 'No task ID returned from server'
        return null
      }
    } catch (e) {
      task.status = 'failed'
      task.error = e.response?.data?.detail || e.message || 'Failed to start agent'
      return null
    }
  }

  /**
   * Resume polling if task is still running (for when component re-mounts)
   * @param {string} flowType
   * @param {Function} onComplete - new callback for this mount cycle
   */
  function resumePolling(flowType, onComplete = null) {
    const task = state.tasks[flowType]
    if (!task) return
    if (onComplete) task._onComplete = onComplete
    if (task.status === 'running' && task.taskId && !task._pollInterval) {
      pollTask(flowType)
    }
  }

  /**
   * Get the reactive task object for a flow type
   */
  function getTask(flowType) {
    return state.tasks[flowType]
  }

  /**
   * Clear/reset a task to idle state
   */
  function clearTask(flowType) {
    stopPolling(flowType)
    const task = state.tasks[flowType]
    if (task) Object.assign(task, createEmptyTask())
  }

  /**
   * Check if a specific flow type has a running task
   */
  function isRunning(flowType) {
    return state.tasks[flowType]?.status === 'running'
  }

  return {
    state,
    startTask,
    resumePolling,
    stopPolling,
    getTask,
    clearTask,
    isRunning,
  }
}
