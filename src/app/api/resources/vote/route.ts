import { createServerClient } from '@/lib/supabase'

interface VoteBody {
  id?: string
}

export async function POST(req: Request) {
  let body: VoteBody
  try {
    body = (await req.json()) as VoteBody
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 })
  }

  const id = body.id
  if (!id || typeof id !== 'string') {
    return Response.json({ error: 'id_required' }, { status: 400 })
  }

  try {
    const supabase = createServerClient()
    const { error } = await supabase.rpc('increment_votes', { row_id: id })
    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }
    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'server_error' }, { status: 500 })
  }
}
