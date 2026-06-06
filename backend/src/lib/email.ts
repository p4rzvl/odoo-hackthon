import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
let resend: Resend | null = null;
if (resendApiKey) {
  resend = new Resend(resendApiKey);
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'notifications@vendorbridge.erp';

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: EmailParams) {
  if (!resend) {
    console.warn('[Email] Resend not configured — skipping email to', to);
    return;
  }
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html
    });
  } catch (error) {
    console.error('[Email] Failed to send:', subject, error);
  }
}

export async function sendNewUserNotificationToAdmin(adminEmail: string, newUserEmail: string, newUserName: string, role: string) {
  return sendEmail({
    to: adminEmail,
    subject: `New User Registration: ${newUserEmail} (${role})`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto;">
        <div style="background: #714B67; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">VendorBridge ERP</h1>
        </div>
        <div style="border: 1px solid #e5e5e5; border-top: 0; padding: 32px; border-radius: 0 0 8px 8px;">
          <p style="color: #212529; font-size: 14px;">A new user has registered and is awaiting activation:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
            <tr><td style="padding: 6px 0; color: #6b7280;">Name</td><td style="padding: 6px 0; font-weight: 600; text-align: right;">${newUserName}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280; border-top: 1px solid #e5e5e5;">Email</td><td style="padding: 6px 0; font-weight: 600; text-align: right; border-top: 1px solid #e5e5e5;">${newUserEmail}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280; border-top: 1px solid #e5e5e5;">Role</td><td style="padding: 6px 0; font-weight: 600; text-align: right; border-top: 1px solid #e5e5e5;">${role}</td></tr>
          </table>
          <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">Please log in to the Admin panel to activate this account.</p>
          <p style="color: #6b7280; font-size: 12px;">This is an automated message from VendorBridge ERP.</p>
        </div>
      </div>
    `
  });
}

export async function sendAccountActivatedEmail(userEmail: string, userName: string, role: string) {
  return sendEmail({
    to: userEmail,
    subject: `Your VendorBridge Account Has Been Activated`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto;">
        <div style="background: #714B67; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">VendorBridge ERP</h1>
        </div>
        <div style="border: 1px solid #e5e5e5; border-top: 0; padding: 32px; border-radius: 0 0 8px 8px;">
          <p style="color: #212529; font-size: 14px;">Dear <strong>${userName}</strong>,</p>
          <p style="color: #212529; font-size: 14px;">Your VendorBridge account with role <strong>${role}</strong> has been activated by an Administrator.</p>
          <p style="color: #212529; font-size: 14px;">You can now log in and start using the system.</p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">This is an automated message from VendorBridge ERP.</p>
        </div>
      </div>
    `
  });
}

export async function sendInvoiceEmail(vendorEmail: string, vendorName: string, invoiceNumber: string, poNumber: string, grandTotal: number, gstNumber: string) {
  return sendEmail({
    to: vendorEmail,
    subject: `Invoice ${invoiceNumber} from VendorBridge`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto;">
        <div style="background: #714B67; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">VendorBridge ERP</h1>
        </div>
        <div style="border: 1px solid #e5e5e5; border-top: 0; padding: 32px; border-radius: 0 0 8px 8px;">
          <p style="color: #212529; font-size: 14px;">Dear <strong>${vendorName}</strong>,</p>
          <p style="color: #212529; font-size: 14px;">A new invoice has been generated against Purchase Order <strong>${poNumber}</strong>.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
            <tr><td style="padding: 8px 0; color: #6b7280;">Invoice</td><td style="padding: 8px 0; font-weight: 600; text-align: right;">${invoiceNumber}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280; border-top: 1px solid #e5e5e5;">PO Reference</td><td style="padding: 8px 0; font-weight: 600; text-align: right; border-top: 1px solid #e5e5e5;">${poNumber}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280; border-top: 1px solid #e5e5e5;">GST</td><td style="padding: 8px 0; font-weight: 600; text-align: right; border-top: 1px solid #e5e5e5;">${gstNumber}</td></tr>
            <tr><td style="padding: 12px 0 8px 0; color: #6b7280; border-top: 2px solid #212529; font-weight: 700;">Grand Total</td><td style="padding: 12px 0 8px 0; font-weight: 700; text-align: right; border-top: 2px solid #212529; font-size: 18px;">₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
          </table>
          <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">Please log in to your VendorBridge account to view and download the invoice PDF.</p>
          <p style="color: #6b7280; font-size: 12px;">This is an automated message from VendorBridge ERP. Please do not reply directly.</p>
        </div>
      </div>
    `
  });
}

export async function sendApprovalNotification(recipientEmail: string, recipientName: string, rfqTitle: string, level: number, status: 'assigned' | 'approved' | 'rejected') {
  const subject = status === 'assigned'
    ? `Approval Request: "${rfqTitle}" (L${level})`
    : `Approval ${status === 'approved' ? 'Approved' : 'Rejected'}: "${rfqTitle}" (L${level})`;

  const body = status === 'assigned'
    ? `A new quotation for <strong>"${rfqTitle}"</strong> requires your Level ${level} approval. Please log in to VendorBridge to review the quotation details and submit your decision.`
    : `The Level ${level} approval for <strong>"${rfqTitle}"</strong> has been ${status}.`;

  return sendEmail({
    to: recipientEmail,
    subject,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto;">
        <div style="background: #714B67; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">VendorBridge ERP</h1>
        </div>
        <div style="border: 1px solid #e5e5e5; border-top: 0; padding: 32px; border-radius: 0 0 8px 8px;">
          <p style="color: #212529; font-size: 14px;">Dear <strong>${recipientName}</strong>,</p>
          <p style="color: #212529; font-size: 14px;">${body}</p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">This is an automated message from VendorBridge ERP.</p>
        </div>
      </div>
    `
  });
}

export async function sendQuotationNotification(vendorEmail: string, vendorName: string, rfqTitle: string, status: 'invited' | 'selected' | 'rejected') {
  const subject = status === 'invited'
    ? `New RFQ Invitation: "${rfqTitle}"`
    : status === 'selected'
    ? `Quotation Selected: "${rfqTitle}"`
    : `Quotation Update: "${rfqTitle}"`;

  const body = status === 'invited'
    ? `You have been invited to submit a quotation for <strong>"${rfqTitle}"</strong>. Please log in to VendorBridge to view the RFQ details and submit your bid.`
    : status === 'selected'
    ? `Your quotation for <strong>"${rfqTitle}"</strong> has been selected and moved to the approval workflow.`
    : `Your quotation for <strong>"${rfqTitle}"</strong> was not selected. We thank you for your participation.`;

  return sendEmail({
    to: vendorEmail,
    subject,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto;">
        <div style="background: #714B67; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">VendorBridge ERP</h1>
        </div>
        <div style="border: 1px solid #e5e5e5; border-top: 0; padding: 32px; border-radius: 0 0 8px 8px;">
          <p style="color: #212529; font-size: 14px;">Dear <strong>${vendorName}</strong>,</p>
          <p style="color: #212529; font-size: 14px;">${body}</p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">This is an automated message from VendorBridge ERP.</p>
        </div>
      </div>
    `
  });
}

export async function sendPoNotification(vendorEmail: string, vendorName: string, poNumber: string, totalAmount: number) {
  return sendEmail({
    to: vendorEmail,
    subject: `Purchase Order ${poNumber} Generated`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto;">
        <div style="background: #714B67; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">VendorBridge ERP</h1>
        </div>
        <div style="border: 1px solid #e5e5e5; border-top: 0; padding: 32px; border-radius: 0 0 8px 8px;">
          <p style="color: #212529; font-size: 14px;">Dear <strong>${vendorName}</strong>,</p>
          <p style="color: #212529; font-size: 14px;">A Purchase Order <strong>${poNumber}</strong> has been generated with a total value of <strong>₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>.</p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">Please log in to your VendorBridge account to review the PO details.</p>
          <p style="color: #6b7280; font-size: 12px;">This is an automated message from VendorBridge ERP.</p>
        </div>
      </div>
    `
  });
}
