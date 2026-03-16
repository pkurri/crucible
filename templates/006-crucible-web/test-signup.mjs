import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://zwwlcqttdmbmyfvdogwr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3d2xjcXR0ZG1ibXlmdmRvZ3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MTgyMDgsImV4cCI6MjA4Nzk5NDIwOH0.mGqGUhZ38Vz2DpfF22KjA2nsIGkD_VCKmz4xHZYjcLc'
)

async function testSignup() {
  const targetEmail = 'prasadkurri.ai@gmail.com';
  console.log(`Attempting Signup for: ${targetEmail}...`)
  
  const { data, error } = await supabase.auth.signUp({
    email: targetEmail,
    password: 'Password123!',
  })
  
  if (error) {
    console.error('\n❌ Signup failed:')
    console.error(error.message)
    console.error(`Status: ${error.status}`)
  } else if (data.user && data.user.identities && data.user.identities.length === 0) {
    console.log('\n⚠️ User already registered, but not confirmed or has no identities.')
  } else {
    console.log('\n✅ Signup successful or already exists!')
    console.log('User ID: ' + data.user?.id)
    console.log('Check ' + targetEmail + ' for the confirmation email.')
  }
}

testSignup()
