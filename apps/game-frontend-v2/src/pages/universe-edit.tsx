import { UniverseEditor } from "@/universe/universe-editor";
import { useParams } from "react-router-dom";

export default function EditUniversePage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div>Universe ID not found</div>;
  }

  return <UniverseEditor universeId={id} />;
}
