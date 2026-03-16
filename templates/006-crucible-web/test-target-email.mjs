import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://zwwlcqttdmbmyfvdogwr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3d2xjcXR0ZG1ibXlmdmRvZ3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MTgyMDgsImV4cCI6MjA4Nzk5NDIwOH0.mGqGUhZ38Vz2DpfF22KjA2nsIGkD_VCKmz4xHZYjcLc'
)

async function testTargetEmail() {
  const targetEmail = 'prasadkurri.ai@gmail.com';
  console.log(`Testing SMTP for targeted address: ${targetEmail}...`)
  
  // Attempting a password reset or signup to trigger email
  const { data, error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
    redirectTo: 'http://localhost:3000/auth/callback',
  })
  
  if (error) {
    console.error('\n❌ Error triggering email:')
    console.error(error.message)
    console.error(`Code: ${error.status}`)
  } else {
    console.log('\n✅ Success! Supabase accepted the reset request for ' + targetEmail)
    console.log('Check your inbox or SMTP provider dashboard.')
  }
}

testTargetEmail()
