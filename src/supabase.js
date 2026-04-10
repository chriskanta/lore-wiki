import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kjcytblbevypmooidfyt.supabase.co'
const supabaseKey = 'sb_publishable_rWeLGTzzFLa5TstjbUQfvg_zGCpHZIN'

export const supabase = createClient(supabaseUrl, supabaseKey)