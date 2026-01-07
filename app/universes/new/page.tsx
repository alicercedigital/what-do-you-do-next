import { UniverseEditor } from "@/editor/universe-editor";

export default function NewUniversePage() {
  return <UniverseEditor universeId={crypto.randomUUID()} />;
}
