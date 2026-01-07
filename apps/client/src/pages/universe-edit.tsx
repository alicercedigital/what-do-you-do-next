import { useParams } from "react-router-dom"
import { UniverseEditor } from "@/universe/components/universe-editor"

export default function EditUniversePage() {
  const { id } = useParams<{ id: string }>()

  if (!id) {
    return <div>Universe ID not found</div>
  }

  return <UniverseEditor universeId={id} />
}
