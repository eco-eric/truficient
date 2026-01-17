import { AccumulatedScan } from '@/pages/scanner/types';

interface CustomerInfo {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const generateEquipmentReportPDF = (
  scans: AccumulatedScan[],
  customerInfo: CustomerInfo
) => {
  const companyInfo = {
    name: 'Truficient Energy Solutions',
    address: 'Dallas-Fort Worth Metroplex',
    phone: '(469) 506-0053',
    email: 'service@truficient.com',
    website: 'www.truficient.com',
  };

  const currentYear = new Date().getFullYear();

  // Generate equipment rows
  const generateEquipmentRow = (scan: AccumulatedScan, index: number): string => {
    const { specs } = scan;
    const age = specs.manufactured_year 
      ? currentYear - specs.manufactured_year 
      : null;

    return `
      <div class="equipment-card">
        <div class="equipment-header">
          <div class="equipment-number">#${index + 1}</div>
          <div class="equipment-brand">
            <h3>${specs.brand || 'Unknown Brand'}</h3>
            <span class="equipment-type">${specs.equipment_type || 'HVAC Equipment'}</span>
          </div>
        </div>
        
        <div class="specs-grid">
          <div class="spec-row">
            <span class="spec-label">Model Number</span>
            <span class="spec-value mono">${specs.model_number}</span>
          </div>
          ${specs.serial_number ? `
          <div class="spec-row">
            <span class="spec-label">Serial Number</span>
            <span class="spec-value mono">${specs.serial_number}</span>
          </div>
          ` : ''}
          ${specs.manufactured_year ? `
          <div class="spec-row">
            <span class="spec-label">Manufactured</span>
            <span class="spec-value">${specs.manufactured_year} <span class="age-badge">${age} years old</span></span>
          </div>
          ` : ''}
          ${specs.tonnage ? `
          <div class="spec-row">
            <span class="spec-label">Tonnage</span>
            <span class="spec-value">${specs.tonnage}</span>
          </div>
          ` : ''}
          ${specs.seer_rating ? `
          <div class="spec-row">
            <span class="spec-label">SEER Rating</span>
            <span class="spec-value">${specs.seer_rating}</span>
          </div>
          ` : ''}
          ${specs.refrigerant ? `
          <div class="spec-row">
            <span class="spec-label">Refrigerant</span>
            <span class="spec-value">${specs.refrigerant}</span>
          </div>
          ` : ''}
          ${specs.breaker_size ? `
          <div class="spec-row">
            <span class="spec-label">Breaker Size</span>
            <span class="spec-value">${specs.breaker_size} Amp</span>
          </div>
          ` : ''}
          ${specs.voltage_info ? `
          <div class="spec-row">
            <span class="spec-label">Voltage/Phase</span>
            <span class="spec-value">${specs.voltage_info}</span>
          </div>
          ` : ''}
          ${specs.factory_charge ? `
          <div class="spec-row">
            <span class="spec-label">Factory Charge</span>
            <span class="spec-value">${specs.factory_charge}</span>
          </div>
          ` : ''}
          ${specs.fan_motor_info ? `
          <div class="spec-row">
            <span class="spec-label">Fan Motor</span>
            <span class="spec-value">${specs.fan_motor_info}</span>
          </div>
          ` : ''}
          ${specs.compressor_info ? `
          <div class="spec-row">
            <span class="spec-label">Compressor</span>
            <span class="spec-value">${specs.compressor_info}</span>
          </div>
          ` : ''}
        </div>
      </div>
    `;
  };

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Equipment Report - ${customerInfo.name || 'Your Home'}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 12px;
      line-height: 1.5;
      color: #1e3a5f;
      background: white;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #d4a84b;
    }
    .company-info h1 {
      font-size: 24px;
      color: #1e3a5f;
      margin-bottom: 5px;
    }
    .company-info p {
      color: #666;
      font-size: 11px;
    }
    .report-title {
      text-align: right;
    }
    .report-title h2 {
      font-size: 20px;
      color: #d4a84b;
      margin-bottom: 5px;
    }
    .report-date {
      font-size: 12px;
      color: #666;
    }
    .customer-section {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .customer-section h3 {
      font-size: 14px;
      color: #1e3a5f;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .customer-info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .customer-info-grid p {
      margin: 0;
    }
    .customer-info-grid strong {
      color: #1e3a5f;
    }
    .equipment-section h2 {
      font-size: 16px;
      color: #1e3a5f;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #eee;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .equipment-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      margin-bottom: 20px;
      overflow: hidden;
    }
    .equipment-header {
      background: #1e3a5f;
      color: white;
      padding: 15px;
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .equipment-number {
      background: #d4a84b;
      color: #1e3a5f;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
    }
    .equipment-brand h3 {
      font-size: 16px;
      margin-bottom: 2px;
    }
    .equipment-type {
      font-size: 12px;
      opacity: 0.8;
    }
    .specs-grid {
      padding: 15px;
    }
    .spec-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    .spec-row:last-child {
      border-bottom: none;
    }
    .spec-label {
      color: #666;
      font-weight: 500;
    }
    .spec-value {
      color: #1e3a5f;
      font-weight: 600;
      text-align: right;
    }
    .spec-value.mono {
      font-family: 'Courier New', monospace;
      font-size: 11px;
    }
    .age-badge {
      background: #fff3cd;
      color: #856404;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 10px;
      margin-left: 8px;
    }
    .cta-section {
      background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%);
      color: white;
      padding: 25px;
      border-radius: 8px;
      margin-top: 30px;
      text-align: center;
    }
    .cta-section h3 {
      font-size: 18px;
      margin-bottom: 10px;
    }
    .cta-section p {
      opacity: 0.9;
      margin-bottom: 15px;
    }
    .cta-phone {
      font-size: 24px;
      font-weight: bold;
      color: #d4a84b;
    }
    .disclaimer {
      margin-top: 30px;
      padding: 15px;
      background: #f0f0f0;
      border-radius: 8px;
      font-size: 10px;
      color: #666;
    }
    .disclaimer strong {
      color: #1e3a5f;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      color: #666;
      font-size: 11px;
    }
    .footer strong {
      color: #1e3a5f;
    }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .container { padding: 20px; }
      .equipment-card { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="company-info">
        <h1>${companyInfo.name}</h1>
        <p>${companyInfo.address}</p>
        <p>Phone: ${companyInfo.phone}</p>
        <p>Email: ${companyInfo.email}</p>
        <p>Web: ${companyInfo.website}</p>
      </div>
      <div class="report-title">
        <h2>EQUIPMENT REPORT</h2>
        <p class="report-date">Generated: ${formatDate(new Date())}</p>
      </div>
    </div>

    ${(customerInfo.name || customerInfo.address || customerInfo.phone || customerInfo.email) ? `
    <div class="customer-section">
      <h3>Property Information</h3>
      <div class="customer-info-grid">
        ${customerInfo.name ? `<p><strong>Owner:</strong> ${customerInfo.name}</p>` : ''}
        ${customerInfo.email ? `<p><strong>Email:</strong> ${customerInfo.email}</p>` : ''}
        ${customerInfo.phone ? `<p><strong>Phone:</strong> ${customerInfo.phone}</p>` : ''}
        ${customerInfo.address ? `<p><strong>Address:</strong> ${customerInfo.address}</p>` : ''}
      </div>
    </div>
    ` : ''}

    <div class="equipment-section">
      <h2>Scanned Equipment (${scans.length} ${scans.length === 1 ? 'Unit' : 'Units'})</h2>
      ${scans.map((scan, index) => generateEquipmentRow(scan, index)).join('')}
    </div>

    <div class="cta-section">
      <h3>Need Service or a Replacement Quote?</h3>
      <p>Truficient Energy Solutions serves the Dallas-Fort Worth area with expert HVAC installation, repair, and maintenance.</p>
      <div class="cta-phone">${companyInfo.phone}</div>
    </div>

    <div class="disclaimer">
      <strong>Note:</strong> Equipment age is estimated based on serial number decoding and may differ from actual installation date. 
      Specifications are decoded from manufacturer data and should be verified against the physical data plate for critical applications.
      This report is provided for informational purposes only.
    </div>

    <div class="footer">
      <p>Thank you for using the <strong>Truficient Equipment Scanner</strong></p>
      <p>${companyInfo.website}</p>
    </div>
  </div>
</body>
</html>
  `;

  // Open print dialog
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};