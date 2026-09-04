// Edge Function: create-user
//
// Lets an admin create another account (admin or customer) without ever
// exposing the Supabase service_role key to the browser. The service role
// key only ever lives inside this function's Supabase-managed environment.
//
// Deploy with: supabase functions deploy create-user

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Missing authorization header' }, 401)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    // Client scoped to the caller's own JWT, used only to confirm who is calling.
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const {
      data: { user },
      error: userError,
    } = await callerClient.auth.getUser()
    if (userError || !user) return json({ error: 'Invalid session' }, 401)

    // Privileged client, only used server-side.
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    const { data: callerProfile, error: callerProfileError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (callerProfileError || callerProfile?.role !== 'admin') {
      return json({ error: 'Only admins can create accounts' }, 403)
    }

    const body = await req.json()
    const { email, password, fullName, role, companyId, newCompanyName } = body

    if (!email || !password || !fullName || !role) {
      return json({ error: 'email, password, fullName and role are required' }, 400)
    }
    if (!['admin', 'customer'].includes(role)) {
      return json({ error: 'role must be "admin" or "customer"' }, 400)
    }
    if (password.length < 8) {
      return json({ error: 'Password must be at least 8 characters' }, 400)
    }

    let finalCompanyId = companyId || null
    if (role === 'customer' && !finalCompanyId) {
      if (!newCompanyName) {
        return json({ error: 'A company is required for customer accounts' }, 400)
      }
      const { data: company, error: companyError } = await adminClient
        .from('companies')
        .insert({ name: newCompanyName })
        .select()
        .single()
      if (companyError) return json({ error: companyError.message }, 400)
      finalCompanyId = company.id
    }

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (createError) return json({ error: createError.message }, 400)

    const { error: insertError } = await adminClient.from('profiles').insert({
      id: created.user.id,
      full_name: fullName,
      email,
      role,
      company_id: role === 'admin' ? null : finalCompanyId,
    })

    if (insertError) {
      await adminClient.auth.admin.deleteUser(created.user.id)
      return json({ error: insertError.message }, 400)
    }

    return json({ success: true, userId: created.user.id })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Unexpected error' }, 500)
  }
})
