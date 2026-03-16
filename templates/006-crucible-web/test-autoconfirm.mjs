import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://zwwlcqttdmbmyfvdogwr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3d2xjcXR0ZG1ibXlmdmRvZ3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MTgyMDgsImV4cCI6MjA4Nzk5NDIwOH0.mGqGUhZ38Vz2DpfF22KjA2nsIGkD_VCKmz4xHZYjcLc'
)

async function testAutoConfirm() {
  const freshEmail = `test-autoconfirm-${Date.now()}@example.com`;
  console.log(`Testing Auto-confirm for: ${freshEmail}...`)
  
  const { data, error } = await supabase.auth.signUp({
    email: freshEmail,
    password: 'Password123!',
  })
  
  if (error) {
    console.error('\n❌ Signup failed:')
    console.error(error.message)
  } else {
    console.log('\n✅ Signup request success.')
    console.log('User ID: ' + data.user?.id)
    console.log('Confirmed at: ' + data.user?.confirmed_at)
    if (data.user?.confirmed_at) {
      console.log('\n⚠️ AUTO-CONFIRM IS ENABLED. No confirmation email was sent.');
    } else {
      console.log('\n📬 Confirmation email SHOULD have been sent.');
    }
  }
}

testAutoConfirm()
