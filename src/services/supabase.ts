import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrtgkudjdhteszorfxik.supabase.co';           // 여기에 Project URL 붙여넣기
const SUPABASE_ANON_KEY = 'sb_publishable_BSnTVp8WmJBzDFYAH3-nZg_VUmmaRRI'; // 여기에 공개 가능한 API 키 붙여넣기

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
