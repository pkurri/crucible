import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://zwwlcqttdmbmyfvdogwr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3d2xjcXR0ZG1ibXlmdmRvZ3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MTgyMDgsImV4cCI6MjA4Nzk5NDIwOH0.mGqGUhZ38Vz2DpfF22KjA2nsIGkD_VCKmz4xHZYjcLc'
)

async function testEmail() {
  const testEmailAddress = `test-smtp-${Date.now()}@example.com`;
  console.log(`Testing SMTP by attempting to sign up: ${testEmailAddress}...`)
  
  const { data, error } = await supabase.auth.signUp({
    email: testEmailAddress,
    password: 'testpassword123',
  })
  
  if (error) {
    if (error.message.includes('rate limit')) {
       console.error('\n❌ Rate Limit Hit: SMTP settings might not be fully applied or correct.')
    }
    console.error('\n❌ Error details:')
    console.error(error.message)
  } else {
    console.log('\n✅ Success! Supabase accepted the request.')
    console.log('Now check your SMTP provider dashboard or your email for the verification link.')
  }
}

testEmail()
