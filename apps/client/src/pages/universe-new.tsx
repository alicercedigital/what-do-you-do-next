import { UniverseEditor } from "@/universe/components/universe-editor"

export default function NewUniversePage() {
  return <UniverseEditor universeId={crypto.randomUUID()} />;
}
