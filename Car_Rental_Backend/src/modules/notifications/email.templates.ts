import { env } from '../../config/env';

function layout(content: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:480px;padding:24px;
                border:1px solid #e5e7eb;border-radius:8px">
      <h2 style="margin:0 0 12px;color:#111827">${env.companyName}</h2>
      ${content}
      <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb"/>
      <p style="font-size:12px;color:#9ca3af;margin:0">
        ${env.companyName}<br/>
        <a href="mailto:${env.companyEmail}"
           style="color:#9ca3af">${env.companyEmail}</a>
      </p>
    </div>
  `;
}

export interface BookingEmailData {
  bookingId:    string;
  carLabel:     string;
  startDate:    string;
  endDate:      string;
  numberOfDays: number;
  totalPrice:   number;
  currency:     string;
}

function bookingTable(data: BookingEmailData): string {
  return `
    <div style="margin:20px 0;padding:16px;background:#f3f4f6;border-radius:6px">
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#374151">
        <tr>
          <td style="padding:6px 0;color:#6b7280">Référence</td>
          <td style="padding:6px 0;font-weight:600">${data.bookingId}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#6b7280">Véhicule</td>
          <td style="padding:6px 0">${data.carLabel}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#6b7280">Début</td>
          <td style="padding:6px 0">${data.startDate}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#6b7280">Fin</td>
          <td style="padding:6px 0">${data.endDate}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#6b7280">Durée</td>
          <td style="padding:6px 0">${data.numberOfDays} jour(s)</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#6b7280">Total</td>
          <td style="padding:6px 0;font-weight:700;color:#111827">
            ${data.totalPrice.toFixed(2)} ${data.currency}
          </td>
        </tr>
      </table>
    </div>
  `;
}

export function bookingConfirmedEmail(
  data: BookingEmailData,
): { subject: string; html: string } {
  return {
    subject: `Réservation confirmée — ${env.companyName}`,
    html: layout(`
      <p style="color:#374151">
        Votre paiement a été reçu et votre réservation est confirmée.
      </p>
      ${bookingTable(data)}
      <p style="color:#374151;font-size:14px">
        Pensez à apporter votre permis de conduire et une pièce d'identité
        le jour de la prise en charge.
      </p>
      <p style="font-size:12px;color:#9ca3af">
        Pour toute question, contactez-nous à
        <a href="mailto:${env.companyEmail}"
           style="color:#6b7280">${env.companyEmail}</a>.
      </p>
    `),
  };
}

export function bookingCancelledEmail(
  data: BookingEmailData,
): { subject: string; html: string } {
  return {
    subject: `Réservation annulée — ${env.companyName}`,
    html: layout(`
      <p style="color:#374151">
        Votre réservation a été annulée.
      </p>
      ${bookingTable(data)}
      <p style="color:#374151;font-size:14px">
        Si vous avez effectué un paiement, le remboursement sera traité
        sous 5 à 10 jours ouvrés.
      </p>
      <p style="font-size:12px;color:#9ca3af">
        Pour toute question, contactez-nous à
        <a href="mailto:${env.companyEmail}"
           style="color:#6b7280">${env.companyEmail}</a>.
      </p>
    `),
  };
}

export function bookingRejectedEmail(
  data: BookingEmailData,
): { subject: string; html: string } {
  return {
    subject: `Réservation refusée — ${env.companyName}`,
    html: layout(`
      <p style="color:#374151">
        Nous sommes dans l'impossibilité d'honorer votre réservation.
        Elle a été refusée.
      </p>
      ${bookingTable(data)}
      <p style="color:#374151;font-size:14px">
        Si vous avez effectué un paiement, vous serez intégralement remboursé
        sous 5 à 10 jours ouvrés.
      </p>
      <p style="font-size:12px;color:#9ca3af">
        <a href="mailto:${env.companyEmail}"
           style="color:#6b7280">${env.companyEmail}</a>
      </p>
    `),
  };
}