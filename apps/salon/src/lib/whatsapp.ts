import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Service, Professional } from "@/types";

const SALON_PHONE = "5500000000000"; // Admin configures this

export function getSalonPhone(): string {
  return localStorage.getItem("salon-whatsapp-phone") || SALON_PHONE;
}

export function setSalonPhone(phone: string): void {
  localStorage.setItem("salon-whatsapp-phone", phone);
}

export function buildWhatsAppUrl(
  service: Service,
  professional: Professional,
  date: string,
  time: string,
  customerName: string,
  customerPhone: string,
): string {
  const formattedDate = format(parseISO(date), "dd 'de' MMMM (EEEE)", {
    locale: ptBR,
  });

  const priceText =
    service.price > 0 ? `R$ ${service.price.toFixed(2)}` : "A consultar";

  const message = [
    `Olá! Gostaria de agendar um horário:`,
    ``,
    `*Serviço:* ${service.name}`,
    `*Profissional:* ${professional.name}`,
    `*Data:* ${formattedDate}`,
    `*Horário:* ${time}`,
    `*Valor:* ${priceText}`,
    ``,
    `*Nome:* ${customerName}`,
    `*Telefone:* ${customerPhone}`,
    ``,
    `Aguardo confirmação. Obrigado!`,
  ].join("\n");

  const phone = getSalonPhone().replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
