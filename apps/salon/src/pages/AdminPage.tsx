import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Users,
  Scissors,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { useAdminStore } from "@/store/admin-store";
import type { Service, Professional } from "@/types";

type Tab = "services" | "professionals";

const categoryOptions: { value: Service["category"]; label: string }[] = [
  { value: "corte", label: "Corte" },
  { value: "barba", label: "Barba" },
  { value: "combo", label: "Combo" },
  { value: "tratamento", label: "Tratamento" },
];

const iconOptions = [
  "✂️", "💈", "🧔", "🪒", "👑", "⭐", "✨", "💇", "👦", "🎯", "💧", "🎨",
];

const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function AdminPage() {
  const [tab, setTab] = useState<Tab>("services");
  const store = useAdminStore();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h2 className="font-display text-2xl font-bold">Painel Admin</h2>
      <p className="mt-1 text-sm text-white/50">
        Gerencie serviços e profissionais
      </p>

      {/* Tabs */}
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setTab("services")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
            tab === "services"
              ? "bg-salon-500 text-white"
              : "bg-white/5 text-white/50 hover:bg-white/10"
          }`}
        >
          <Scissors className="h-4 w-4" /> Serviços ({store.services.length})
        </button>
        <button
          onClick={() => setTab("professionals")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
            tab === "professionals"
              ? "bg-salon-500 text-white"
              : "bg-white/5 text-white/50 hover:bg-white/10"
          }`}
        >
          <Users className="h-4 w-4" /> Profissionais (
          {store.professionals.length})
        </button>
      </div>

      <div className="mt-6">
        {tab === "services" ? <ServicesPanel /> : <ProfessionalsPanel />}
      </div>
    </div>
  );
}

// ─── Services Panel ──────────────────────────────────────────────

function ServicesPanel() {
  const { services, addService, updateService, deleteService } =
    useAdminStore();
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const emptyService: Omit<Service, "id"> = {
    name: "",
    description: "",
    duration: 30,
    price: 0,
    category: "corte",
    icon: "✂️",
  };

  const [form, setForm] = useState(emptyService);

  const startEdit = (service: Service) => {
    setEditing(service.id);
    setForm({
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      category: service.category,
      icon: service.icon,
    });
    setAdding(false);
  };

  const startAdd = () => {
    setAdding(true);
    setEditing(null);
    setForm(emptyService);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("Nome do serviço é obrigatório");
      return;
    }
    if (editing) {
      updateService(editing, form);
      toast.success("Serviço atualizado");
    } else {
      addService(form);
      toast.success("Serviço adicionado");
    }
    setEditing(null);
    setAdding(false);
    setForm(emptyService);
  };

  const handleDelete = (id: string, name: string) => {
    deleteService(id);
    toast.success(`"${name}" removido`);
    if (editing === id) {
      setEditing(null);
      setForm(emptyService);
    }
  };

  return (
    <div>
      <button
        onClick={startAdd}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/10 py-3 text-sm font-medium text-white/50 transition-all hover:border-salon-500/50 hover:text-salon-400"
      >
        <Plus className="h-4 w-4" /> Adicionar Serviço
      </button>

      <AnimatePresence>
        {adding && (
          <ServiceForm
            form={form}
            setForm={setForm}
            onSave={handleSave}
            onCancel={() => {
              setAdding(false);
              setForm(emptyService);
            }}
            isNew
          />
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {services.map((service) => (
          <div key={service.id}>
            {editing === service.id ? (
              <ServiceForm
                form={form}
                setForm={setForm}
                onSave={handleSave}
                onCancel={() => {
                  setEditing(null);
                  setForm(emptyService);
                }}
                isNew={false}
              />
            ) : (
              <motion.div
                layout
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <span className="text-xl">{service.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{service.name}</p>
                  <p className="text-xs text-white/40">
                    {service.duration} min
                    {service.price > 0
                      ? ` · R$ ${service.price.toFixed(2)}`
                      : " · Consulte"}
                    {" · "}
                    {categoryOptions.find((c) => c.value === service.category)?.label}
                  </p>
                </div>
                <button
                  onClick={() => startEdit(service)}
                  className="rounded-lg p-2 text-white/30 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(service.id, service.name)}
                  className="rounded-lg p-2 text-white/30 transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ServiceForm({
  form,
  setForm,
  onSave,
  onCancel,
  isNew,
}: {
  form: Omit<Service, "id">;
  setForm: (f: Omit<Service, "id">) => void;
  onSave: () => void;
  onCancel: () => void;
  isNew: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-3 overflow-hidden rounded-xl border border-salon-500/30 bg-salon-500/5 p-4"
    >
      <h4 className="mb-3 text-sm font-semibold text-salon-400">
        {isNew ? "Novo Serviço" : "Editar Serviço"}
      </h4>
      <div className="space-y-3">
        <input
          placeholder="Nome do serviço"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-salon-500 focus:outline-none"
        />
        <input
          placeholder="Descrição"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-salon-500 focus:outline-none"
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[10px] uppercase text-white/30">
              Duração (min)
            </label>
            <input
              type="number"
              value={form.duration}
              onChange={(e) =>
                setForm({ ...form, duration: parseInt(e.target.value) || 0 })
              }
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-salon-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase text-white/30">
              Preço (R$) — 0 = Consulte
            </label>
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: parseFloat(e.target.value) || 0 })
              }
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-salon-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[10px] uppercase text-white/30">
              Categoria
            </label>
            <div className="relative">
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value as Service["category"],
                  })
                }
                className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-salon-500 focus:outline-none"
              >
                {categoryOptions.map((c) => (
                  <option key={c.value} value={c.value} className="bg-neutral-900">
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase text-white/30">
              Ícone
            </label>
            <div className="flex flex-wrap gap-1">
              {iconOptions.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setForm({ ...form, icon })}
                  className={`rounded-lg p-1.5 text-lg transition-all ${
                    form.icon === icon
                      ? "bg-salon-500/20 ring-1 ring-salon-500"
                      : "hover:bg-white/10"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={onSave}
            className="flex items-center gap-1 rounded-lg bg-salon-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-salon-600"
          >
            <Save className="h-3 w-3" /> Salvar
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-1 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-white/50 transition-colors hover:bg-white/10"
          >
            <X className="h-3 w-3" /> Cancelar
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Professionals Panel ─────────────────────────────────────────

function ProfessionalsPanel() {
  const { professionals, addProfessional, updateProfessional, deleteProfessional } =
    useAdminStore();
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  type ProForm = Omit<Professional, "id">;

  const emptyPro: ProForm = {
    name: "",
    avatar: "",
    role: "Barbeiro",
    rating: 5.0,
    reviewCount: 0,
    specialties: [],
    availableDays: [1, 2, 3, 4, 5, 6],
  };

  const [form, setForm] = useState<ProForm>(emptyPro);
  const [specialtyInput, setSpecialtyInput] = useState("");

  const startEdit = (pro: Professional) => {
    setEditing(pro.id);
    setForm({
      name: pro.name,
      avatar: pro.avatar,
      role: pro.role,
      rating: pro.rating,
      reviewCount: pro.reviewCount,
      specialties: [...pro.specialties],
      availableDays: [...pro.availableDays],
    });
    setAdding(false);
  };

  const startAdd = () => {
    setAdding(true);
    setEditing(null);
    setForm(emptyPro);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    const avatar =
      form.avatar ||
      form.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const data = { ...form, avatar };

    if (editing) {
      updateProfessional(editing, data);
      toast.success("Profissional atualizado");
    } else {
      addProfessional(data);
      toast.success("Profissional adicionado");
    }
    setEditing(null);
    setAdding(false);
    setForm(emptyPro);
  };

  const handleDelete = (id: string, name: string) => {
    deleteProfessional(id);
    toast.success(`"${name}" removido`);
    if (editing === id) {
      setEditing(null);
      setForm(emptyPro);
    }
  };

  const toggleDay = (day: number) => {
    setForm((f) => ({
      ...f,
      availableDays: f.availableDays.includes(day)
        ? f.availableDays.filter((d) => d !== day)
        : [...f.availableDays, day].sort(),
    }));
  };

  const addSpecialty = () => {
    if (specialtyInput.trim()) {
      setForm((f) => ({
        ...f,
        specialties: [...f.specialties, specialtyInput.trim()],
      }));
      setSpecialtyInput("");
    }
  };

  const removeSpecialty = (index: number) => {
    setForm((f) => ({
      ...f,
      specialties: f.specialties.filter((_, i) => i !== index),
    }));
  };

  const renderForm = (isNew: boolean) => (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-3 overflow-hidden rounded-xl border border-salon-500/30 bg-salon-500/5 p-4"
    >
      <h4 className="mb-3 text-sm font-semibold text-salon-400">
        {isNew ? "Novo Profissional" : "Editar Profissional"}
      </h4>
      <div className="space-y-3">
        <input
          placeholder="Nome completo"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-salon-500 focus:outline-none"
        />
        <input
          placeholder="Cargo (ex: Barbeiro, Barbeiro Master)"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-salon-500 focus:outline-none"
        />

        {/* Available days */}
        <div>
          <label className="mb-2 block text-[10px] uppercase text-white/30">
            Dias disponíveis
          </label>
          <div className="flex gap-1">
            {dayLabels.map((label, i) => (
              <button
                key={i}
                onClick={() => toggleDay(i)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                  form.availableDays.includes(i)
                    ? "bg-salon-500 text-white"
                    : "bg-white/5 text-white/30 hover:bg-white/10"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Specialties */}
        <div>
          <label className="mb-2 block text-[10px] uppercase text-white/30">
            Especialidades
          </label>
          <div className="flex gap-2">
            <input
              placeholder="Adicionar especialidade"
              value={specialtyInput}
              onChange={(e) => setSpecialtyInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSpecialty()}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-salon-500 focus:outline-none"
            />
            <button
              onClick={addSpecialty}
              className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white/50 hover:bg-white/20"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {form.specialties.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {form.specialties.map((s, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/60"
                >
                  {s}
                  <button
                    onClick={() => removeSpecialty(i)}
                    className="text-white/30 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={handleSave}
            className="flex items-center gap-1 rounded-lg bg-salon-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-salon-600"
          >
            <Save className="h-3 w-3" /> Salvar
          </button>
          <button
            onClick={() => {
              setEditing(null);
              setAdding(false);
              setForm(emptyPro);
            }}
            className="flex items-center gap-1 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-white/50 transition-colors hover:bg-white/10"
          >
            <X className="h-3 w-3" /> Cancelar
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div>
      <button
        onClick={startAdd}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/10 py-3 text-sm font-medium text-white/50 transition-all hover:border-salon-500/50 hover:text-salon-400"
      >
        <Plus className="h-4 w-4" /> Adicionar Profissional
      </button>

      <AnimatePresence>{adding && renderForm(true)}</AnimatePresence>

      <div className="space-y-2">
        {professionals.map((pro) => (
          <div key={pro.id}>
            {editing === pro.id ? (
              renderForm(false)
            ) : (
              <motion.div
                layout
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-bold">
                  {pro.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{pro.name}</p>
                  <p className="text-xs text-white/40">
                    {pro.role} ·{" "}
                    {pro.availableDays
                      .map((d: number) => dayLabels[d])
                      .join(", ")}
                  </p>
                </div>
                <button
                  onClick={() => startEdit(pro)}
                  className="rounded-lg p-2 text-white/30 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(pro.id, pro.name)}
                  className="rounded-lg p-2 text-white/30 transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
