import Billing from "../models/Billing.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";


// =====================================================
// HELPERS
// =====================================================

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "";

const fmt = (n) => `Rs.${Number(n || 0).toLocaleString("en-IN")}`;

const getDateRange = (type, from, to) => {
  const now = new Date();
  if (type === "daily") {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end   = new Date(); end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  if (type === "weekly") {
    const start = new Date(); start.setDate(start.getDate() - 7); start.setHours(0, 0, 0, 0);
    return { start, end: now };
  }
  if (type === "monthly") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end   = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return { start, end };
  }
  if (type === "yearly") {
    const start = new Date(now.getFullYear(), 0, 1);
    const end   = new Date(now.getFullYear() + 1, 0, 1);
    return { start, end };
  }
  if (type === "custom" && from && to) {
    const start = new Date(from); start.setHours(0, 0, 0, 0);
    const end   = new Date(to);   end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  return null;
};

// Build filter from query — financialYear & companyLocation required for search
const buildFilter = (range, query = {}) => {
  const filter = { createdAt: { $gte: range.start, $lte: range.end } };
  if (query.financialYear)   filter.financialYear   = query.financialYear;
  if (query.companyLocation) filter.companyLocation = query.companyLocation;
  return filter;
};

const getReportData = async (type, from, to, query = {}) => {
  const range = getDateRange(type, from, to);
  if (!range) return null;
  return Billing.find(buildFilter(range, query)).sort({ createdAt: -1 });
};

const reportTitle = (type, from, to) => {
  if (type === "custom") return `Custom Report: ${from} to ${to}`;
  return `${type.charAt(0).toUpperCase() + type.slice(1)} Billing Report`;
};


// =====================================================
// EXCEL — CLIENT FARE (only clientFare column)
// =====================================================

const generateClientFareExcel = async (res, data, fileName) => {
  try {
    const workbook  = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Client Fare Report");

    worksheet.columns = [
      { header: "Client Name",    key: "clientName",    width: 20 },
      { header: "Company Name",   key: "companyName",   width: 20 },
      { header: "Phone Number",   key: "phoneNumber",   width: 15 },
      { header: "Vehicle Number", key: "vehicleNumber", width: 15 },
      { header: "Challan Number", key: "challanNumber", width: 15 },
      { header: "From Location",  key: "fromLocation",  width: 15 },
      { header: "To Location",    key: "toLocation",    width: 15 },
      { header: "Load Type",      key: "loadType",      width: 15 },
      { header: "Billing Basis",  key: "billingBasis",  width: 15 },
      { header: "Unit Value",     key: "unitValue",     width: 12 },
      { header: "Client Fare",    key: "clientFare",    width: 15 },
      { header: "Created By",     key: "createdBy",     width: 15 },
      { header: "Date",           key: "date",          width: 20 },
    ];

    let grandTotal = 0;
    data.forEach(item => {
      worksheet.addRow({
        clientName:    item.clientName    || "",
        companyName:   item.companyName   || "",
        phoneNumber:   item.phoneNumber   || "",
        vehicleNumber: item.vehicleNumber || "",
        challanNumber: item.challanNumber || "",
        fromLocation:  item.fromLocation  || "",
        toLocation:    item.toLocation    || "",
        loadType:      item.loadType      || "",
        billingBasis:  item.billingBasis  || "",
        unitValue:     item.unitValue     || "",
        clientFare:    Number(item.clientFare || 0),
        createdBy:     item.createdBy     || "",
        date:          formatDate(item.date || item.createdAt),
      });
      grandTotal += Number(item.clientFare || 0);
    });

    worksheet.addRow([]);
    const totalRow = worksheet.addRow(["GRAND TOTAL", "", "", "", "", "", "", "", "", "", grandTotal]);
    totalRow.font = { bold: true, size: 13 };

    const buffer = await workbook.xlsx.writeBuffer();
    res.set({
      "Content-Type":        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length":      buffer.length
    });
    return res.end(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Excel generation failed" });
  }
};


// =====================================================
// EXCEL — COMPANY FARE (only companyFare column)
// =====================================================

const generateCompanyFareExcel = async (res, data, fileName) => {
  try {
    const workbook  = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Company Fare Report");

    worksheet.columns = [
      { header: "Client Name",    key: "clientName",    width: 20 },
      { header: "Company Name",   key: "companyName",   width: 20 },
      { header: "Phone Number",   key: "phoneNumber",   width: 15 },
      { header: "Vehicle Number", key: "vehicleNumber", width: 15 },
      { header: "Challan Number", key: "challanNumber", width: 15 },
      { header: "From Location",  key: "fromLocation",  width: 15 },
      { header: "To Location",    key: "toLocation",    width: 15 },
      { header: "Load Type",      key: "loadType",      width: 15 },
      { header: "Billing Basis",  key: "billingBasis",  width: 15 },
      { header: "Unit Value",     key: "unitValue",     width: 12 },
      { header: "Company Fare",   key: "companyFare",   width: 15 },
      { header: "Created By",     key: "createdBy",     width: 15 },
      { header: "Date",           key: "date",          width: 20 },
    ];

    let grandTotal = 0;
    data.forEach(item => {
      worksheet.addRow({
        clientName:    item.clientName    || "",
        companyName:   item.companyName   || "",
        phoneNumber:   item.phoneNumber   || "",
        vehicleNumber: item.vehicleNumber || "",
        challanNumber: item.challanNumber || "",
        fromLocation:  item.fromLocation  || "",
        toLocation:    item.toLocation    || "",
        loadType:      item.loadType      || "",
        billingBasis:  item.billingBasis  || "",
        unitValue:     item.unitValue     || "",
        companyFare:   Number(item.companyFare || 0),
        createdBy:     item.createdBy     || "",
        date:          formatDate(item.date || item.createdAt),
      });
      grandTotal += Number(item.companyFare || 0);
    });

    worksheet.addRow([]);
    const totalRow = worksheet.addRow(["GRAND TOTAL", "", "", "", "", "", "", "", "", "", grandTotal]);
    totalRow.font = { bold: true, size: 13 };

    const buffer = await workbook.xlsx.writeBuffer();
    res.set({
      "Content-Type":        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length":      buffer.length
    });
    return res.end(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Excel generation failed" });
  }
};


// =====================================================
// CSV — CLIENT FARE
// =====================================================

const generateClientFareCsv = (res, data, fileName) => {
  try {
    const headers = [
      "Client Name", "Company Name", "Phone Number", "Vehicle Number",
      "Challan Number", "From Location", "To Location", "Load Type",
      "Billing Basis", "Unit Value", "Client Fare", "Created By", "Date"
    ];

    const escape = (val) => {
      const str = String(val ?? "").replace(/"/g, '""');
      return str.includes(",") || str.includes('"') || str.includes("\n") ? `"${str}"` : str;
    };

    const rows = data.map(item => [
      item.clientName, item.companyName, item.phoneNumber,
      item.vehicleNumber, item.challanNumber, item.fromLocation,
      item.toLocation, item.loadType, item.billingBasis, item.unitValue,
      Number(item.clientFare || 0), item.createdBy,
      formatDate(item.date || item.createdAt)
    ].map(escape).join(","));

    const grandTotal = data.reduce((s, i) => s + Number(i.clientFare || 0), 0);
    rows.push(`GRAND TOTAL,,,,,,,,,,${grandTotal},,`);

    const csv = [headers.join(","), ...rows].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(csv);
  } catch (error) {
    console.error("CSV generation error:", error);
    res.status(500).json({ message: "CSV generation failed" });
  }
};


// =====================================================
// CSV — COMPANY FARE
// =====================================================

const generateCompanyFareCsv = (res, data, fileName) => {
  try {
    const headers = [
      "Client Name", "Company Name", "Phone Number", "Vehicle Number",
      "Challan Number", "From Location", "To Location", "Load Type",
      "Billing Basis", "Unit Value", "Company Fare", "Created By", "Date"
    ];

    const escape = (val) => {
      const str = String(val ?? "").replace(/"/g, '""');
      return str.includes(",") || str.includes('"') || str.includes("\n") ? `"${str}"` : str;
    };

    const rows = data.map(item => [
      item.clientName, item.companyName, item.phoneNumber,
      item.vehicleNumber, item.challanNumber, item.fromLocation,
      item.toLocation, item.loadType, item.billingBasis, item.unitValue,
      Number(item.companyFare || 0), item.createdBy,
      formatDate(item.date || item.createdAt)
    ].map(escape).join(","));

    const grandTotal = data.reduce((s, i) => s + Number(i.companyFare || 0), 0);
    rows.push(`GRAND TOTAL,,,,,,,,,,${grandTotal},,`);

    const csv = [headers.join(","), ...rows].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(csv);
  } catch (error) {
    console.error("CSV generation error:", error);
    res.status(500).json({ message: "CSV generation failed" });
  }
};


// =====================================================
// PDF — CLIENT FARE ONLY
// =====================================================

const generateClientFarePdf = (res, data, title, fileName) => {
  try {
    const doc = new PDFDocument({ margin: 30, size: "A4", layout: "landscape" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    doc.pipe(res);

    doc.fontSize(16).font("Helvetica-Bold").text("ELIPHAS Billing — Client Fare", { align: "center" });
    doc.fontSize(11).font("Helvetica").text(title, { align: "center" });
    doc.fontSize(9).text(`Generated: ${new Date().toLocaleString("en-IN")}`, { align: "center" });
    doc.moveDown(0.8);

    const cols = [
      { label: "Client",    key: "clientName",    w: 90 },
      { label: "Company",   key: "companyName",   w: 90 },
      { label: "Phone",     key: "phoneNumber",   w: 75 },
      { label: "Vehicle",   key: "vehicleNumber", w: 75 },
      { label: "Challan",   key: "challanNumber", w: 70 },
      { label: "From",      key: "fromLocation",  w: 70 },
      { label: "To",        key: "toLocation",    w: 70 },
      { label: "Basis",     key: "billingBasis",  w: 60 },
      { label: "Unit Val",  key: "unitValue",     w: 50 },
      { label: "Cl.Fare",   key: "clientFare",    w: 70, align: "right" },
      { label: "Date",      key: "date",          w: 65 },
    ];

    const startX    = 20;
    const rowHeight = 20;
    let   y         = doc.y;

    doc.rect(startX, y, cols.reduce((s, c) => s + c.w, 0), rowHeight).fill("#1a1a2e");
    let x = startX;
    cols.forEach(col => {
      doc.fillColor("#ffffff").fontSize(7.5).font("Helvetica-Bold")
        .text(col.label, x + 3, y + 5, { width: col.w - 6, align: col.align || "left" });
      x += col.w;
    });
    y += rowHeight;

    let grandClientFare = 0;

    data.forEach((item, i) => {
      if (y > 530) { doc.addPage(); y = 30; }
      const bg = i % 2 === 0 ? "#ffffff" : "#f5f5f5";
      doc.rect(startX, y, cols.reduce((s, c) => s + c.w, 0), rowHeight).fill(bg);

      x = startX;
      cols.forEach(col => {
        let val = item[col.key] || "";
        if (col.key === "clientFare") val = fmt(item[col.key]);
        if (col.key === "date") val = formatDate(item.date || item.createdAt);
        doc.fillColor("#333333").fontSize(7.5).font("Helvetica")
          .text(String(val), x + 3, y + 6, { width: col.w - 6, align: col.align || "left", ellipsis: true });
        x += col.w;
      });

      grandClientFare += Number(item.clientFare || 0);
      y += rowHeight;
    });

    if (y > 530) { doc.addPage(); y = 30; }
    const totalW = cols.reduce((s, c) => s + c.w, 0);
    doc.rect(startX, y, totalW, rowHeight).fill("#1a1a2e");
    const labelW = cols.slice(0, 9).reduce((s, c) => s + c.w, 0);
    doc.fillColor("#ffffff").fontSize(8).font("Helvetica-Bold")
      .text(`GRAND TOTAL  (${data.length} records)`, startX + 4, y + 5, { width: labelW - 8 });
    const clFareX = startX + labelW;
    doc.text(fmt(grandClientFare), clFareX + 3, y + 5, { width: cols[9].w - 6, align: "right" });

    doc.end();
  } catch (error) {
    console.error("Client Fare PDF generation error:", error);
    if (!res.headersSent) res.status(500).json({ message: "Client Fare PDF generation failed" });
  }
};


// =====================================================
// PDF — COMPANY FARE ONLY
// =====================================================

const generateCompanyFarePdf = (res, data, title, fileName) => {
  try {
    const doc = new PDFDocument({ margin: 30, size: "A4", layout: "landscape" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    doc.pipe(res);

    doc.fontSize(16).font("Helvetica-Bold").text("ELIPHAS Billing — Company Fare", { align: "center" });
    doc.fontSize(11).font("Helvetica").text(title, { align: "center" });
    doc.fontSize(9).text(`Generated: ${new Date().toLocaleString("en-IN")}`, { align: "center" });
    doc.moveDown(0.8);

    const cols = [
      { label: "Client",    key: "clientName",    w: 90 },
      { label: "Company",   key: "companyName",   w: 90 },
      { label: "Phone",     key: "phoneNumber",   w: 75 },
      { label: "Vehicle",   key: "vehicleNumber", w: 75 },
      { label: "Challan",   key: "challanNumber", w: 70 },
      { label: "From",      key: "fromLocation",  w: 70 },
      { label: "To",        key: "toLocation",    w: 70 },
      { label: "Basis",     key: "billingBasis",  w: 60 },
      { label: "Unit Val",  key: "unitValue",     w: 50 },
      { label: "Co.Fare",   key: "companyFare",   w: 70, align: "right" },
      { label: "Date",      key: "date",          w: 65 },
    ];

    const startX    = 20;
    const rowHeight = 20;
    let   y         = doc.y;

    doc.rect(startX, y, cols.reduce((s, c) => s + c.w, 0), rowHeight).fill("#1a1a2e");
    let x = startX;
    cols.forEach(col => {
      doc.fillColor("#ffffff").fontSize(7.5).font("Helvetica-Bold")
        .text(col.label, x + 3, y + 5, { width: col.w - 6, align: col.align || "left" });
      x += col.w;
    });
    y += rowHeight;

    let grandCompanyFare = 0;

    data.forEach((item, i) => {
      if (y > 530) { doc.addPage(); y = 30; }
      const bg = i % 2 === 0 ? "#ffffff" : "#f5f5f5";
      doc.rect(startX, y, cols.reduce((s, c) => s + c.w, 0), rowHeight).fill(bg);

      x = startX;
      cols.forEach(col => {
        let val = item[col.key] || "";
        if (col.key === "companyFare") val = fmt(item[col.key]);
        if (col.key === "date") val = formatDate(item.date || item.createdAt);
        doc.fillColor("#333333").fontSize(7.5).font("Helvetica")
          .text(String(val), x + 3, y + 6, { width: col.w - 6, align: col.align || "left", ellipsis: true });
        x += col.w;
      });

      grandCompanyFare += Number(item.companyFare || 0);
      y += rowHeight;
    });

    if (y > 530) { doc.addPage(); y = 30; }
    const totalW = cols.reduce((s, c) => s + c.w, 0);
    doc.rect(startX, y, totalW, rowHeight).fill("#1a1a2e");
    const labelW = cols.slice(0, 9).reduce((s, c) => s + c.w, 0);
    doc.fillColor("#ffffff").fontSize(8).font("Helvetica-Bold")
      .text(`GRAND TOTAL  (${data.length} records)`, startX + 4, y + 5, { width: labelW - 8 });
    const coFareX = startX + labelW;
    doc.text(fmt(grandCompanyFare), coFareX + 3, y + 5, { width: cols[9].w - 6, align: "right" });

    doc.end();
  } catch (error) {
    console.error("Company Fare PDF generation error:", error);
    if (!res.headersSent) res.status(500).json({ message: "Company Fare PDF generation failed" });
  }
};

const generatePdf = (res, data, title, fileName) => {
  try {
    const doc = new PDFDocument({ margin: 30, size: "A4", layout: "landscape" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    doc.pipe(res);

    doc.fontSize(16).font("Helvetica-Bold").text("ELIPHAS Billing", { align: "center" });
    doc.fontSize(11).font("Helvetica").text(title, { align: "center" });
    doc.fontSize(9).text(`Generated: ${new Date().toLocaleString("en-IN")}`, { align: "center" });
    doc.moveDown(0.8);

    const cols = [
      { label: "Client",    key: "clientName",    w: 80 },
      { label: "Company",   key: "companyName",   w: 80 },
      { label: "Vehicle",   key: "vehicleNumber", w: 65 },
      { label: "Challan",   key: "challanNumber", w: 65 },
      { label: "From",      key: "fromLocation",  w: 65 },
      { label: "To",        key: "toLocation",    w: 65 },
      { label: "Basis",     key: "billingBasis",  w: 55 },
      { label: "Co.Fare",   key: "companyFare",   w: 65, align: "right" },
      { label: "Cl.Fare",   key: "clientFare",    w: 65, align: "right" },
      { label: "Date",      key: "date",          w: 65 },
    ];

    const startX    = 20;
    const rowHeight = 20;
    let   y         = doc.y;

    doc.rect(startX, y, cols.reduce((s, c) => s + c.w, 0), rowHeight).fill("#1a1a2e");
    let x = startX;
    cols.forEach(col => {
      doc.fillColor("#ffffff").fontSize(7.5).font("Helvetica-Bold")
        .text(col.label, x + 3, y + 5, { width: col.w - 6, align: col.align || "left" });
      x += col.w;
    });
    y += rowHeight;

    let grandCompanyFare = 0;
    let grandClientFare  = 0;

    data.forEach((item, i) => {
      if (y > 530) { doc.addPage(); y = 30; }
      const bg = i % 2 === 0 ? "#ffffff" : "#f5f5f5";
      doc.rect(startX, y, cols.reduce((s, c) => s + c.w, 0), rowHeight).fill(bg);

      x = startX;
      cols.forEach(col => {
        let val = item[col.key] || "";
        if (col.key === "companyFare" || col.key === "clientFare") val = fmt(item[col.key]);
        if (col.key === "date") val = formatDate(item.date || item.createdAt);
        doc.fillColor("#333333").fontSize(7.5).font("Helvetica")
          .text(String(val), x + 3, y + 6, { width: col.w - 6, align: col.align || "left", ellipsis: true });
        x += col.w;
      });

      grandCompanyFare += Number(item.companyFare || 0);
      grandClientFare  += Number(item.clientFare  || 0);
      y += rowHeight;
    });

    if (y > 530) { doc.addPage(); y = 30; }
    const totalW  = cols.reduce((s, c) => s + c.w, 0);
    doc.rect(startX, y, totalW, rowHeight).fill("#1a1a2e");
    doc.fillColor("#ffffff").fontSize(8).font("Helvetica-Bold")
      .text(`GRAND TOTAL  (${data.length} records)`, startX + 4, y + 5,
        { width: cols.slice(0, 7).reduce((s, c) => s + c.w, 0) - 8 });
    const coFareX = startX + cols.slice(0, 7).reduce((s, c) => s + c.w, 0);
    doc.text(fmt(grandCompanyFare), coFareX + 3, y + 5, { width: cols[7].w - 6, align: "right" });
    doc.text(fmt(grandClientFare),  coFareX + cols[7].w + 3, y + 5, { width: cols[8].w - 6, align: "right" });

    doc.end();
  } catch (error) {
    console.error("PDF generation error:", error);
    if (!res.headersSent) res.status(500).json({ message: "PDF generation failed" });
  }
};


// =====================================================
// DIESEL DAILY REPORT — per vehicle per day
// =====================================================

const generateDieselExcel = async (res, data, fileName) => {
  try {
    const workbook  = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Diesel Report");

    worksheet.columns = [
      { header: "Date",                  key: "date",               width: 18 },
      { header: "Vehicle Number",        key: "vehicleNumber",      width: 16 },
      { header: "Diesel (Litres)",       key: "dieselQuantity",     width: 16 },
      { header: "Price per Litre (Rs)",  key: "dieselPricePerLitre",width: 18 },
      { header: "Total Diesel Cost",     key: "totalCost",          width: 18 },
      { header: "From",                  key: "fromLocation",       width: 14 },
      { header: "To",                    key: "toLocation",         width: 14 },
      { header: "Created By",            key: "createdBy",          width: 15 },
    ];

    let grandTotal = 0;
    data.forEach(item => {
      const qty   = Number(item.dieselQuantity      || 0);
      const price = Number(item.dieselPricePerLitre || 0);
      const cost  = qty * price;
      grandTotal += cost;
      worksheet.addRow({
        date:               formatDate(item.date || item.createdAt),
        vehicleNumber:      item.vehicleNumber      || "",
        dieselQuantity:     qty,
        dieselPricePerLitre:price,
        totalCost:          cost,
        fromLocation:       item.fromLocation       || "",
        toLocation:         item.toLocation         || "",
        createdBy:          item.createdBy          || "",
      });
    });

    worksheet.addRow([]);
    const totalRow = worksheet.addRow(["GRAND TOTAL", "", "", "", grandTotal]);
    totalRow.font = { bold: true, size: 13 };

    const buffer = await workbook.xlsx.writeBuffer();
    res.set({
      "Content-Type":        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length":      buffer.length
    });
    return res.end(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Diesel Excel generation failed" });
  }
};

const generateDieselPdf = (res, data, title, fileName) => {
  try {
    const doc = new PDFDocument({ margin: 30, size: "A4", layout: "landscape" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    doc.pipe(res);

    doc.fontSize(16).font("Helvetica-Bold").text("ELIPHAS — Diesel Report", { align: "center" });
    doc.fontSize(11).font("Helvetica").text(title, { align: "center" });
    doc.fontSize(9).text(`Generated: ${new Date().toLocaleString("en-IN")}`, { align: "center" });
    doc.moveDown(0.8);

    const cols = [
      { label: "Date",               key: "date",               w: 80 },
      { label: "Vehicle",            key: "vehicleNumber",      w: 90 },
      { label: "Litres",             key: "dieselQuantity",     w: 60, align: "right" },
      { label: "Price/Litre",        key: "dieselPricePerLitre",w: 70, align: "right" },
      { label: "Total Cost",         key: "totalCost",          w: 80, align: "right" },
      { label: "From",               key: "fromLocation",       w: 80 },
      { label: "To",                 key: "toLocation",         w: 80 },
      { label: "Created By",         key: "createdBy",          w: 80 },
    ];

    const startX    = 30;
    const rowHeight = 20;
    let   y         = doc.y;

    doc.rect(startX, y, cols.reduce((s, c) => s + c.w, 0), rowHeight).fill("#1a1a2e");
    let x = startX;
    cols.forEach(col => {
      doc.fillColor("#ffffff").fontSize(7.5).font("Helvetica-Bold")
        .text(col.label, x + 3, y + 5, { width: col.w - 6, align: col.align || "left" });
      x += col.w;
    });
    y += rowHeight;

    let grandTotal = 0;
    data.forEach((item, i) => {
      if (y > 530) { doc.addPage(); y = 30; }
      const bg = i % 2 === 0 ? "#ffffff" : "#f5f5f5";
      doc.rect(startX, y, cols.reduce((s, c) => s + c.w, 0), rowHeight).fill(bg);

      const qty   = Number(item.dieselQuantity      || 0);
      const price = Number(item.dieselPricePerLitre || 0);
      const cost  = qty * price;
      grandTotal += cost;

      const rowData = {
        date:               formatDate(item.date || item.createdAt),
        vehicleNumber:      item.vehicleNumber      || "",
        dieselQuantity:     qty,
        dieselPricePerLitre:price,
        totalCost:          fmt(cost),
        fromLocation:       item.fromLocation       || "",
        toLocation:         item.toLocation         || "",
        createdBy:          item.createdBy          || "",
      };

      x = startX;
      cols.forEach(col => {
        doc.fillColor("#333333").fontSize(7.5).font("Helvetica")
          .text(String(rowData[col.key] ?? ""), x + 3, y + 6,
            { width: col.w - 6, align: col.align || "left", ellipsis: true });
        x += col.w;
      });
      y += rowHeight;
    });

    if (y > 530) { doc.addPage(); y = 30; }
    const totalW = cols.reduce((s, c) => s + c.w, 0);
    doc.rect(startX, y, totalW, rowHeight).fill("#1a1a2e");
    doc.fillColor("#ffffff").fontSize(8).font("Helvetica-Bold")
      .text(`GRAND TOTAL  (${data.length} records)`, startX + 4, y + 5,
        { width: cols.slice(0, 4).reduce((s, c) => s + c.w, 0) - 8 });
    const costX = startX + cols.slice(0, 4).reduce((s, c) => s + c.w, 0);
    doc.text(fmt(grandTotal), costX + 3, y + 5, { width: cols[4].w - 6, align: "right" });

    doc.end();
  } catch (error) {
    console.error("Diesel PDF error:", error);
    if (!res.headersSent) res.status(500).json({ message: "Diesel PDF generation failed" });
  }
};


// =====================================================
// REPORT VIEW — JSON data for UI
// =====================================================

const handleReport = async (res, type, from, to, query = {}) => {
  const range = getDateRange(type, from, to);
  if (!range) return res.status(400).json({ message: "Invalid date range" });

  const data = await Billing.find(buildFilter(range, query)).sort({ createdAt: -1 });
  const totalCompanyFare = data.reduce((s, i) => s + Number(i.companyFare || 0), 0);
  const totalClientFare  = data.reduce((s, i) => s + Number(i.clientFare  || 0), 0);
  res.json({ success: true, totalCompanyFare, totalClientFare, count: data.length, data });
};

export const dailyReport   = (req, res) => handleReport(res, "daily",   undefined, undefined, req.query).catch(e => res.status(500).json({ message: e.message }));
export const weeklyReport  = (req, res) => handleReport(res, "weekly",  undefined, undefined, req.query).catch(e => res.status(500).json({ message: e.message }));
export const monthlyReport = (req, res) => handleReport(res, "monthly", undefined, undefined, req.query).catch(e => res.status(500).json({ message: e.message }));
export const yearlyReport  = (req, res) => handleReport(res, "yearly",  undefined, undefined, req.query).catch(e => res.status(500).json({ message: e.message }));

export const customReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ message: "from and to date required" });
    await handleReport(res, "custom", from, to, req.query);
  } catch (error) { res.status(500).json({ message: error.message }); }
};


// =====================================================
// CLIENT FARE EXCEL EXPORTS
// =====================================================

export const exportDailyClientExcel   = async (req, res) => { const d = await getReportData("daily",   undefined, undefined, req.query); await generateClientFareExcel(res, d, "client_fare_daily.xlsx"); };
export const exportWeeklyClientExcel  = async (req, res) => { const d = await getReportData("weekly",  undefined, undefined, req.query); await generateClientFareExcel(res, d, "client_fare_weekly.xlsx"); };
export const exportMonthlyClientExcel = async (req, res) => { const d = await getReportData("monthly", undefined, undefined, req.query); await generateClientFareExcel(res, d, "client_fare_monthly.xlsx"); };
export const exportYearlyClientExcel  = async (req, res) => { const d = await getReportData("yearly",  undefined, undefined, req.query); await generateClientFareExcel(res, d, "client_fare_yearly.xlsx"); };
export const exportCustomClientExcel  = async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ message: "from and to required" });
    const d = await getReportData("custom", from, to, req.query);
    await generateClientFareExcel(res, d, `client_fare_custom_${from}_to_${to}.xlsx`);
  } catch (error) { res.status(500).json({ message: error.message }); }
};


// =====================================================
// COMPANY FARE EXCEL EXPORTS
// =====================================================

export const exportDailyCompanyExcel   = async (req, res) => { const d = await getReportData("daily",   undefined, undefined, req.query); await generateCompanyFareExcel(res, d, "company_fare_daily.xlsx"); };
export const exportWeeklyCompanyExcel  = async (req, res) => { const d = await getReportData("weekly",  undefined, undefined, req.query); await generateCompanyFareExcel(res, d, "company_fare_weekly.xlsx"); };
export const exportMonthlyCompanyExcel = async (req, res) => { const d = await getReportData("monthly", undefined, undefined, req.query); await generateCompanyFareExcel(res, d, "company_fare_monthly.xlsx"); };
export const exportYearlyCompanyExcel  = async (req, res) => { const d = await getReportData("yearly",  undefined, undefined, req.query); await generateCompanyFareExcel(res, d, "company_fare_yearly.xlsx"); };
export const exportCustomCompanyExcel  = async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ message: "from and to required" });
    const d = await getReportData("custom", from, to, req.query);
    await generateCompanyFareExcel(res, d, `company_fare_custom_${from}_to_${to}.xlsx`);
  } catch (error) { res.status(500).json({ message: error.message }); }
};


// =====================================================
// PDF EXPORTS (both fares, all roles)
// =====================================================

export const exportDailyPdf   = async (req, res) => { const d = await getReportData("daily",   undefined, undefined, req.query); generatePdf(res, d, reportTitle("daily"),   "billing_daily.pdf"); };
export const exportWeeklyPdf  = async (req, res) => { const d = await getReportData("weekly",  undefined, undefined, req.query); generatePdf(res, d, reportTitle("weekly"),  "billing_weekly.pdf"); };
export const exportMonthlyPdf = async (req, res) => { const d = await getReportData("monthly", undefined, undefined, req.query); generatePdf(res, d, reportTitle("monthly"), "billing_monthly.pdf"); };
export const exportYearlyPdf  = async (req, res) => { const d = await getReportData("yearly",  undefined, undefined, req.query); generatePdf(res, d, reportTitle("yearly"),  "billing_yearly.pdf"); };
export const exportCustomPdf  = async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ message: "from and to required" });
    const d = await getReportData("custom", from, to, req.query);
    generatePdf(res, d, reportTitle("custom", from, to), `billing_custom_${from}_to_${to}.pdf`);
  } catch (error) { res.status(500).json({ message: error.message }); }
};


// =====================================================
// CLIENT FARE CSV EXPORTS
// =====================================================

export const exportDailyClientCsv   = async (req, res) => { const d = await getReportData("daily",   undefined, undefined, req.query); generateClientFareCsv(res, d, "client_fare_daily.csv"); };
export const exportWeeklyClientCsv  = async (req, res) => { const d = await getReportData("weekly",  undefined, undefined, req.query); generateClientFareCsv(res, d, "client_fare_weekly.csv"); };
export const exportMonthlyClientCsv = async (req, res) => { const d = await getReportData("monthly", undefined, undefined, req.query); generateClientFareCsv(res, d, "client_fare_monthly.csv"); };
export const exportYearlyClientCsv  = async (req, res) => { const d = await getReportData("yearly",  undefined, undefined, req.query); generateClientFareCsv(res, d, "client_fare_yearly.csv"); };
export const exportCustomClientCsv  = async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ message: "from and to required" });
    const d = await getReportData("custom", from, to, req.query);
    generateClientFareCsv(res, d, `client_fare_custom_${from}_to_${to}.csv`);
  } catch (error) { res.status(500).json({ message: error.message }); }
};


// =====================================================
// COMPANY FARE CSV EXPORTS
// =====================================================

export const exportDailyCompanyCsv   = async (req, res) => { const d = await getReportData("daily",   undefined, undefined, req.query); generateCompanyFareCsv(res, d, "company_fare_daily.csv"); };
export const exportWeeklyCompanyCsv  = async (req, res) => { const d = await getReportData("weekly",  undefined, undefined, req.query); generateCompanyFareCsv(res, d, "company_fare_weekly.csv"); };
export const exportMonthlyCompanyCsv = async (req, res) => { const d = await getReportData("monthly", undefined, undefined, req.query); generateCompanyFareCsv(res, d, "company_fare_monthly.csv"); };
export const exportYearlyCompanyCsv  = async (req, res) => { const d = await getReportData("yearly",  undefined, undefined, req.query); generateCompanyFareCsv(res, d, "company_fare_yearly.csv"); };
export const exportCustomCompanyCsv  = async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ message: "from and to required" });
    const d = await getReportData("custom", from, to, req.query);
    generateCompanyFareCsv(res, d, `company_fare_custom_${from}_to_${to}.csv`);
  } catch (error) { res.status(500).json({ message: error.message }); }
};


// =====================================================
// DIESEL REPORT EXPORTS
// =====================================================

export const exportDailyDieselExcel   = async (req, res) => { const d = await getReportData("daily",   undefined, undefined, req.query); await generateDieselExcel(res, d, "diesel_daily.xlsx"); };
export const exportWeeklyDieselExcel  = async (req, res) => { const d = await getReportData("weekly",  undefined, undefined, req.query); await generateDieselExcel(res, d, "diesel_weekly.xlsx"); };
export const exportMonthlyDieselExcel = async (req, res) => { const d = await getReportData("monthly", undefined, undefined, req.query); await generateDieselExcel(res, d, "diesel_monthly.xlsx"); };
export const exportYearlyDieselExcel  = async (req, res) => { const d = await getReportData("yearly",  undefined, undefined, req.query); await generateDieselExcel(res, d, "diesel_yearly.xlsx"); };
export const exportCustomDieselExcel  = async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ message: "from and to required" });
    const d = await getReportData("custom", from, to, req.query);
    await generateDieselExcel(res, d, `diesel_custom_${from}_to_${to}.xlsx`);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const exportDailyDieselPdf   = async (req, res) => { const d = await getReportData("daily",   undefined, undefined, req.query); generateDieselPdf(res, d, reportTitle("daily"),   "diesel_daily.pdf"); };
export const exportWeeklyDieselPdf  = async (req, res) => { const d = await getReportData("weekly",  undefined, undefined, req.query); generateDieselPdf(res, d, reportTitle("weekly"),  "diesel_weekly.pdf"); };
export const exportMonthlyDieselPdf = async (req, res) => { const d = await getReportData("monthly", undefined, undefined, req.query); generateDieselPdf(res, d, reportTitle("monthly"), "diesel_monthly.pdf"); };
export const exportYearlyDieselPdf  = async (req, res) => { const d = await getReportData("yearly",  undefined, undefined, req.query); generateDieselPdf(res, d, reportTitle("yearly"),  "diesel_yearly.pdf"); };
export const exportCustomDieselPdf  = async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ message: "from and to required" });
    const d = await getReportData("custom", from, to, req.query);
    generateDieselPdf(res, d, reportTitle("custom", from, to), `diesel_custom_${from}_to_${to}.pdf`);
  } catch (error) { res.status(500).json({ message: error.message }); }
};


// =====================================================
// CLIENT FARE PDF EXPORTS (separate PDF, admin only)
// =====================================================

export const exportDailyClientPdf   = async (req, res) => { const d = await getReportData("daily",   undefined, undefined, req.query); generateClientFarePdf(res, d, reportTitle("daily"),   "client_fare_daily.pdf"); };
export const exportWeeklyClientPdf  = async (req, res) => { const d = await getReportData("weekly",  undefined, undefined, req.query); generateClientFarePdf(res, d, reportTitle("weekly"),  "client_fare_weekly.pdf"); };
export const exportMonthlyClientPdf = async (req, res) => { const d = await getReportData("monthly", undefined, undefined, req.query); generateClientFarePdf(res, d, reportTitle("monthly"), "client_fare_monthly.pdf"); };
export const exportYearlyClientPdf  = async (req, res) => { const d = await getReportData("yearly",  undefined, undefined, req.query); generateClientFarePdf(res, d, reportTitle("yearly"),  "client_fare_yearly.pdf"); };
export const exportCustomClientPdf  = async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ message: "from and to required" });
    const d = await getReportData("custom", from, to, req.query);
    generateClientFarePdf(res, d, reportTitle("custom", from, to), `client_fare_custom_${from}_to_${to}.pdf`);
  } catch (error) { res.status(500).json({ message: error.message }); }
};


// =====================================================
// COMPANY FARE PDF EXPORTS (separate PDF, admin only)
// =====================================================

export const exportDailyCompanyPdf   = async (req, res) => { const d = await getReportData("daily",   undefined, undefined, req.query); generateCompanyFarePdf(res, d, reportTitle("daily"),   "company_fare_daily.pdf"); };
export const exportWeeklyCompanyPdf  = async (req, res) => { const d = await getReportData("weekly",  undefined, undefined, req.query); generateCompanyFarePdf(res, d, reportTitle("weekly"),  "company_fare_weekly.pdf"); };
export const exportMonthlyCompanyPdf = async (req, res) => { const d = await getReportData("monthly", undefined, undefined, req.query); generateCompanyFarePdf(res, d, reportTitle("monthly"), "company_fare_monthly.pdf"); };
export const exportYearlyCompanyPdf  = async (req, res) => { const d = await getReportData("yearly",  undefined, undefined, req.query); generateCompanyFarePdf(res, d, reportTitle("yearly"),  "company_fare_yearly.pdf"); };
export const exportCustomCompanyPdf  = async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ message: "from and to required" });
    const d = await getReportData("custom", from, to, req.query);
    generateCompanyFarePdf(res, d, reportTitle("custom", from, to), `company_fare_custom_${from}_to_${to}.pdf`);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
