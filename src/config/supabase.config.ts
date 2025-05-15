import { createClient } from '@supabase/supabase-js'
import envConfig from '@/config/config'
// Create a single supabase client for interacting with your database
const supabase = createClient(`${envConfig.SUPABASE_URL}`, `${envConfig.SUPABASE_SERVICE_KEYS}`)

export default supabase