import { UniverseEditor } from "@/universe/universe-editor";

export default function NewUniversePage() {
  return <UniverseEditor universeId={crypto.randomUUID()} />;
}
