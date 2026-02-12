<template>
  <v-app class="login-app">
    <v-main class="d-flex align-center justify-center" style="min-height: 100vh;">
      <v-card
        class="pa-8 glow-card"
        width="420"
        rounded="xl"
      >
        <div class="text-center mb-6">
          <img src="/logo.svg" alt="DealMind" height="56" class="mb-3" />
          <h1 class="text-h5 font-weight-bold gradient-text">DealMind</h1>
          <p class="text-body-2 text-grey mt-1">AI-Powered Deal Intelligence</p>
        </div>

        <v-tabs v-model="tab" grow color="primary" class="mb-6">
          <v-tab value="login">Sign In</v-tab>
          <v-tab value="register">Register</v-tab>
        </v-tabs>

        <v-alert
          v-if="auth.state.error"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-4"
          closable
          @click:close="auth.state.error = null"
        >
          {{ auth.state.error }}
        </v-alert>

        <v-window v-model="tab">
          <!-- Login -->
          <v-window-item value="login">
            <v-form @submit.prevent="handleLogin" ref="loginForm">
              <v-text-field
                v-model="loginEmail"
                label="Email"
                type="email"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-email-outline"
                class="mb-2"
                :rules="[v => !!v || 'Email is required']"
              />
              <v-text-field
                v-model="loginPassword"
                label="Password"
                :type="showPass ? 'text' : 'password'"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPass ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPass = !showPass"
                class="mb-4"
                :rules="[v => !!v || 'Password is required']"
              />
              <v-btn
                type="submit"
                block
                color="primary"
                size="large"
                :loading="auth.state.loading"
              >
                Sign In
              </v-btn>
            </v-form>
          </v-window-item>

          <!-- Register -->
          <v-window-item value="register">
            <v-form @submit.prevent="handleRegister" ref="registerForm">
              <v-text-field
                v-model="regName"
                label="Full Name"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-account-outline"
                class="mb-2"
                :rules="[v => !!v || 'Name is required']"
              />
              <v-text-field
                v-model="regEmail"
                label="Email"
                type="email"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-email-outline"
                class="mb-2"
                :rules="[v => !!v || 'Email is required']"
              />
              <v-text-field
                v-model="regPassword"
                label="Password"
                :type="showPass ? 'text' : 'password'"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPass ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPass = !showPass"
                class="mb-4"
                :rules="[v => !!v || 'Password is required', v => v.length >= 6 || 'Min 6 characters']"
              />
              <v-btn
                type="submit"
                block
                color="primary"
                size="large"
                :loading="auth.state.loading"
              >
                Create Account
              </v-btn>
            </v-form>
          </v-window-item>
        </v-window>

        <p class="text-center text-caption text-grey mt-6">
          Hallucination Squad -- Agentic AI Hackathon 2026
        </p>
      </v-card>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../stores/auth'

const router = useRouter()
const auth = useAuth()

const tab = ref('login')
const showPass = ref(false)

const loginEmail = ref('')
const loginPassword = ref('')
const regName = ref('')
const regEmail = ref('')
const regPassword = ref('')

async function handleLogin() {
  if (!loginEmail.value || !loginPassword.value) return
  try {
    await auth.login(loginEmail.value, loginPassword.value)
    router.push('/dashboard')
  } catch { /* error shown via auth.state.error */ }
}

async function handleRegister() {
  if (!regName.value || !regEmail.value || !regPassword.value) return
  try {
    await auth.register(regEmail.value, regPassword.value, regName.value)
    router.push('/dashboard')
  } catch { /* error shown via auth.state.error */ }
}
</script>

<style scoped>
.login-app {
  background: radial-gradient(ellipse at 50% 0%, rgba(139, 92, 246, 0.08) 0%, #0a0a14 60%) !important;
}
</style>
