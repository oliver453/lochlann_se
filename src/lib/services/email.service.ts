// src/lib/services/email.service.ts
import { Resend } from 'resend';
import { config } from '@/lib/config';
import { formatDateForDisplay } from '@/lib/utils/date';

const resend = new Resend(config.resendApiKey);

export class EmailService {
  async sendBookingConfirmation(booking: {
    customer_name: string;
    customer_email: string;
    booking_date: string;
    booking_time: string;
    party_size: number;
    id: string;
  }) {
    const { data, error } = await resend.emails.send({
      from: 'Lochlan\'s Steakhouse <bookings@lochlannsteakhouse.com>',
      to: booking.customer_email,
      subject: 'Bokningsbekräftelse - Lochlan\'s Steakhouse',
      html: this.getConfirmationTemplate(booking),
    });

    if (error) {
      throw error;
    }

    return data;
  }

  private getConfirmationTemplate(booking: {
    customer_name: string;
    booking_date: string;
    booking_time: string;
    party_size: number;
    id: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: #fff; padding: 30px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; }
            .details { background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: 600; color: #666; }
            .detail-value { color: #000; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Lochlan's Steakhouse</h1>
            </div>
            <div class="content">
              <h2>Bokningsbekräftelse</h2>
              <p>Hej ${booking.customer_name},</p>
              <p>Tack för din bokning hos Lochlan's Steakhouse! Vi ser fram emot att välkomna er.</p>
              
              <div class="details">
                <div class="detail-row">
                  <span class="detail-label">Datum</span>
                  <span class="detail-value">${formatDateForDisplay(booking.booking_date)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Tid</span>
                  <span class="detail-value">${booking.booking_time.slice(0, 5)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Antal personer</span>
                  <span class="detail-value">${booking.party_size}</span>
                </div>
                <div class="detail-row" style="border: none;">
                  <span class="detail-label">Bokningsnummer</span>
                  <span class="detail-value">${booking.id.slice(0, 8).toUpperCase()}</span>
                </div>
              </div>

              <p>Vid frågor eller ändringar, kontakta oss på <a href="mailto:info@lochlannsteakhouse.com">info@lochlannsteakhouse.com</a> eller ring 08-123 456 78.</p>
            </div>
            <div class="footer">
              <p>Lochlan's Steakhouse<br>
              Storgatan 1, Stockholm<br>
              info@lochlannsteakhouse.com</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}