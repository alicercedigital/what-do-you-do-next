import { UniverseEditor } from "@/components/universe/universe-editor"

export default async function EditUniversePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <UniverseEditor universeId={id} />
}
