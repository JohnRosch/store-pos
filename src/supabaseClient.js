import { createClient } from '@supabase/supabase-js';

// DOUBLE CHECK THIS LINK: Ensure there is NO extra slash "/" at the very end of .co
const supabaseUrl = 'https://scvkhwaycmgwoomsebpy.supabase.co';
const supabaseAnonKey = 'sb_publishable_bSJqBBQOpQpe4a2CKrPzDA_ICOYmtYQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
