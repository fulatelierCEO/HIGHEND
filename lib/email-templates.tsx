interface PurchaseEmailProps {
  customerName: string;
  productName: string;
  productType: 'template' | 'saas';
  amount: number;
  purchaseDate: string;
}

export function PurchaseThankYouEmail({
  customerName,
  productName,
  productType,
  amount,
  purchaseDate,
}: PurchaseEmailProps) {
  const buttonUrl = productType === 'template'
    ? 'https://fulatelier.com/library'
    : 'https://fulatelier.com/dashboard';

  const buttonText = productType === 'template'
    ? 'Access Your Download'
    : 'Get Started';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Your Purchase</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
    <tr>
      <td align="center" style="padding: 60px 20px 20px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom: 60px; text-align: center;">
              <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 14px; font-weight: 400; letter-spacing: 4px; text-transform: uppercase; color: #1a1a1a;">
                ATELIER
              </h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding-bottom: 40px;">
              <h2 style="margin: 0 0 24px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 42px; font-weight: 400; line-height: 1.2; color: #1a1a1a;">
                Thank You
              </h2>
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #666666; font-weight: 300;">
                Dear ${customerName},
              </p>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #666666; font-weight: 300;">
                Your purchase of <strong style="color: #1a1a1a; font-weight: 400;">${productName}</strong> has been confirmed. We're excited to have you join us.
              </p>
            </td>
          </tr>

          <!-- Purchase Details -->
          <tr>
            <td style="padding: 32px; background-color: #fafafa; border: 1px solid #e5e5e5; margin-bottom: 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom: 16px;">
                    <p style="margin: 0; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #999999;">
                      ORDER DETAILS
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size: 15px; color: #1a1a1a; font-weight: 300;">
                          ${productName}
                        </td>
                        <td align="right" style="font-size: 15px; color: #1a1a1a; font-weight: 400;">
                          $${amount.toFixed(2)}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 12px; border-top: 1px solid #e5e5e5;">
                    <p style="margin: 0; font-size: 13px; color: #999999; font-weight: 300;">
                      Purchase Date: ${purchaseDate}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 40px 0; text-align: center;">
              <a href="${buttonUrl}" style="display: inline-block; padding: 16px 48px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; font-weight: 400;">
                ${buttonText}
              </a>
            </td>
          </tr>

          <!-- Additional Info -->
          ${productType === 'template' ? `
          <tr>
            <td style="padding: 32px; background-color: #fafafa; border: 1px solid #e5e5e5; margin-bottom: 40px;">
              <p style="margin: 0 0 12px 0; font-size: 14px; color: #1a1a1a; font-weight: 400;">
                Your download is ready
              </p>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666; font-weight: 300;">
                Visit your library to access your template files and documentation. All future updates will be available there as well.
              </p>
            </td>
          </tr>
          ` : `
          <tr>
            <td style="padding: 32px; background-color: #fafafa; border: 1px solid #e5e5e5; margin-bottom: 40px;">
              <p style="margin: 0 0 12px 0; font-size: 14px; color: #1a1a1a; font-weight: 400;">
                Welcome to your dashboard
              </p>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666; font-weight: 300;">
                Your account is now active. Click the button above to access your dashboard and get started.
              </p>
            </td>
          </tr>
          `}

          <!-- Footer -->
          <tr>
            <td style="padding-top: 60px; padding-bottom: 40px; text-align: center; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #999999; font-weight: 300;">
                Questions? Contact us at support@fulatelier.com
              </p>
              <p style="margin: 0; font-size: 13px; color: #999999; font-weight: 300;">
                © ${new Date().getFullYear()} Atelier. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
