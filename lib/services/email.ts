import * as SibApiV3Sdk from '@getbrevo/brevo';

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

apiInstance.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY!
);

const from = {
    email: process.env.BREVO_FROM_EMAIL!,
    name: 'MarketplaceTS',
};

export async function sendVerificationEmail(email: string, token: string, name: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
  
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.to = [{ email, name }];
  sendSmtpEmail.sender = from;
  sendSmtpEmail.subject = 'Verifikasi Email MarketplaceTS';
  sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verifikasi Email</title>
        <style>
          body { font-family: 'Poppins', Arial, sans-serif; margin: 0; padding: 20px; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: 700; color: #059669; margin-bottom: 10px; }
          .title { font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 20px; }
          .content { color: #4b5563; line-height: 1.6; margin-bottom: 30px; }
          .button { display: inline-block; background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">MarketplaceTS</div>
          </div>
          <h1 class="title">Selamat Datang, ${name}!</h1>
          <div class="content">
            <p>Terima kasih telah mendaftar di MarketplaceTS. Untuk melengkapi proses registrasi, silakan verifikasi email Anda dengan mengklik tombol di bawah ini:</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" class="button">Verifikasi Email</a>
          </div>
          <div class="content">
            <p>Jika Anda tidak dapat mengklik tombol di atas, salin dan tempel URL berikut ke browser Anda:</p>
            <p style="word-break: break-all; color: #059669;">${verificationUrl}</p>
            <p>Link ini akan kedaluwarsa dalam 24 jam.</p>
          </div>
          <div class="footer">
            <p>Email ini dikirim secara otomatis. Jika Anda tidak mendaftar di MarketplaceTS, abaikan email ini.</p>
            <p>&copy; 2025 MarketplaceTS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('API called successfully. Returned data: ', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail(email: string, token: string, name: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
  
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.to = [{ email, name }];
  sendSmtpEmail.sender = from;
  sendSmtpEmail.subject = 'Reset Password MarketplaceTS';
  sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Password</title>
        <style>
          body { font-family: 'Poppins', Arial, sans-serif; margin: 0; padding: 20px; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: 700; color: #059669; margin-bottom: 10px; }
          .title { font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 20px; }
          .content { color: #4b5563; line-height: 1.6; margin-bottom: 30px; }
          .button { display: inline-block; background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">MarketplaceTS</div>
          </div>
          <h1 class="title">Reset Password</h1>
          <div class="content">
            <p>Halo ${name},</p>
            <p>Kami menerima permintaan untuk mereset password akun MarketplaceTS Anda. Klik tombol di bawah ini untuk membuat password baru:</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          <div class="content">
            <p>Jika Anda tidak dapat mengklik tombol di atas, salin dan tempel URL berikut ke browser Anda:</p>
            <p style="word-break: break-all; color: #059669;">${resetUrl}</p>
            <p>Link ini akan kedaluwarsa dalam 1 jam. Jika Anda tidak meminta reset password, abaikan email ini.</p>
          </div>
          <div class="footer">
            <p>Email ini dikirim secara otomatis dari sistem MarketplaceTS.</p>
            <p>&copy; 2025 MarketplaceTS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('API called successfully. Returned data: ', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

export async function sendOTPEmail(email: string, otp: string, name: string) {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.to = [{ email, name }];
  sendSmtpEmail.sender = from;
  sendSmtpEmail.subject = 'Kode OTP MarketplaceTS';
  sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Kode OTP</title>
        <style>
          body { font-family: 'Poppins', Arial, sans-serif; margin: 0; padding: 20px; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: 700; color: #059669; margin-bottom: 10px; }
          .title { font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 20px; }
          .content { color: #4b5563; line-height: 1.6; margin-bottom: 30px; }
          .otp-code { background: #f3f4f6; border: 2px dashed #059669; border-radius: 8px; padding: 20px; text-align: center; font-size: 32px; font-weight: 700; color: #059669; letter-spacing: 4px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">MarketplaceTS</div>
          </div>
          <h1 class="title">Kode Verifikasi OTP</h1>
          <div class="content">
            <p>Halo ${name},</p>
            <p>Berikut adalah kode OTP untuk verifikasi akun Anda:</p>
          </div>
          <div class="otp-code">${otp}</div>
          <div class="content">
            <p>Masukkan kode ini pada halaman verifikasi untuk melanjutkan proses.</p>
            <p><strong>Kode ini berlaku selama 10 menit.</strong></p>
            <p>Jika Anda tidak meminta kode ini, abaikan email ini.</p>
          </div>
          <div class="footer">
            <p>Email ini dikirim secara otomatis dari sistem MarketplaceTS.</p>
            <p>&copy; 2025 MarketplaceTS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('API called successfully. Returned data: ', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
}
