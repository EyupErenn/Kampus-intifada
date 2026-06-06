import { createServerClient } from '@/lib/supabase'
import type { ResourceType } from '@/types/database'

interface ResourceBody {
  tent_id?: string
  title?: string
  url?: string
  type?: string
  submitted_by?: string
}

const ALLOWED_TYPES: ResourceType[] = ['video', 'makale', 'kitap', 'infografik']

export async function POST(req: Request) {
  let body: ResourceBody
  try {
    body = (await req.json()) as ResourceBody
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 })
  }

  const tentId = body.tent_id
  const title = body.title?.trim()

  if (!tentId || !title) {
    return Response.json({ error: 'tent_id_and_title_required' }, { status: 400 })
  }

  const type: ResourceType = ALLOWED_TYPES.includes(body.type as ResourceType)
    ? (body.type as ResourceType)
    : 'makale'

  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('resources')
      .insert({
        tent_id: tentId,
        title,
        url: body.url?.trim() || null,
        type,
        submitted_by: body.submitted_by?.trim() || null,
        is_approved: false, // her zaman onaysız başlar
      })
      .select()
      .single()

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }
    return Response.json({ resource: data })
  } catch {
    return Response.json({ error: 'server_error' }, { status: 500 })
  }
}
