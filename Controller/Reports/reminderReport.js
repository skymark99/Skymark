const PDFDocument = require("pdfkit");
const reminderFields = ["Particulars", "Date", "Branch", "Status", "Amount"];
const moment = require("moment");

const reminderReport = (
  filteredReminders,
  res,
  startDate,
  endDate,
  text = "Reminder"
) => {
  startDate = moment(startDate).format("YYYY-MM-DD");
  endDate = moment(endDate).format("YYYY-MM-DD");

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${text}-report.pdf"`
  );

  doc.pipe(res);

  // Constants
  const REMINDERS_PER_PAGE = 24;
  const pageWidth = doc.page.width;
  const margin = 50;
  const contentWidth = pageWidth - 2 * margin;
  const columnWidths = [150, 100, 80, 80, 100];
  const tableLeft = (pageWidth - columnWidths.reduce((a, b) => a + b)) / 2;
  const rowHeight = 20;
  const headerColor = "#e6f2ff";

  let totalUnpaid = 0;
  let totalPaid = 0;
  let totalPostponed = 0;

  const addPageWithHeaders = (isFirstPage = false) => {
    if (!isFirstPage) {
      doc.addPage();
    }

    doc.fontSize(20).text(text + " Report", { align: "center" });
    doc.moveDown();

    if (isFirstPage) {
      doc
        .fontSize(12)
        .text(`Date Range: ${startDate} to ${endDate}`, { align: "center" });
      doc.moveDown();
    }

    doc.fontSize(12);
    let headerLeft = tableLeft;
    let headerTop = 150;

    doc
      .save()
      .fill(headerColor)
      .rect(tableLeft, headerTop, contentWidth, rowHeight)
      .fill()
      .restore();

    reminderFields.forEach((field, index) => {
      doc.text(field, headerLeft, headerTop + 4, {
        width: columnWidths[index],
        align: "left",
      });
      headerLeft += columnWidths[index];
    });

    doc
      .moveTo(tableLeft, headerTop + rowHeight)
      .lineTo(tableLeft + contentWidth, headerTop + rowHeight)
      .stroke();

    return headerTop + rowHeight + 10;
  };

  const addReminderRow = (reminder, yPosition) => {
    doc.fontSize(10);
    let xPosition = tableLeft;
    [
      reminder.particular,
      reminder.formattedDate,
      reminder.branch,
      reminder.status,
      reminder.amount.toString(),
    ].forEach((value, index) => {
      doc.text(value, xPosition, yPosition, {
        width: columnWidths[index],
        align: "left",
      });
      xPosition += columnWidths[index];
    });
  };

  let currentPageHeight = addPageWithHeaders(true);
  let reminderCount = 0;

  filteredReminders.forEach((reminder) => {
    if (reminderCount === REMINDERS_PER_PAGE) {
      currentPageHeight = addPageWithHeaders();
      reminderCount = 0;
    }

    addReminderRow(reminder, currentPageHeight);
    currentPageHeight += rowHeight;
    reminderCount++;

    // Update totals based on status
    switch (reminder.status) {
      case "Unpaid":
        totalUnpaid += reminder.amount;
        break;
      case "Paid":
        totalPaid += reminder.amount;
        break;
      case "Postponed":
        totalPostponed += reminder.amount;
        break;
    }
  });

  // Add overall totals at the bottom center of the last page
  const totalHeight = 150; // Increased height for the totals section
  if (doc.page.height - doc.y < totalHeight) {
    doc.addPage();
  }

  doc.moveDown(6);
  // Set font style for totals
  doc.fontSize(14);

  // "Overall Totals" Title
  doc.text("Overall Totals", margin, doc.y, {
    align: "center",
    width: contentWidth,
  });
  doc.moveDown();

  // Reset font size for the totals
  doc.fontSize(18).font("Helvetica-Bold");

  // Total Paid
  doc.text(`Total Paid: ${totalPaid.toFixed(2)}`, margin, doc.y, {
    align: "center",
    width: contentWidth,
  });
  doc.moveDown(0.5);

  // Total Postponed
  doc.text(`Total Postponed: ${totalPostponed.toFixed(2)}`, margin, doc.y, {
    align: "center",
    width: contentWidth,
  });

  doc.moveDown(0.5);
  // Total Unpaid
  doc.text(`Total Unpaid: ${totalUnpaid.toFixed(2)}`, margin, doc.y, {
    align: "center",
    width: contentWidth,
  });
  doc.moveDown(0.5);

  doc.moveDown();

  // Date Range
  doc.fontSize(12);
  doc.text(`Date Range: ${startDate} to ${endDate}`, margin, doc.y, {
    align: "center",
    width: contentWidth,
  });

  doc.end();
};

module.exports = { reminderReport };
