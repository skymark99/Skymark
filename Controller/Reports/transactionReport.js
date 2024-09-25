const PDFDocument = require("pdfkit");
const transactionFields = ["Particulars", "Date", "Type", "Bank", "Amount"];

const downloadReport = (filteredTransaction, res, startDate, endDate) => {
  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="transaction-report.pdf"'
  );

  // Pipe PDF document to response directly
  doc.pipe(res);

  // Constants
  const TRANSACTIONS_PER_PAGE = 24;
  const pageWidth = doc.page.width;
  const margin = 50;
  const contentWidth = pageWidth - 2 * margin;
  const columnWidths = [150, 100, 80, 80, 100];
  const tableLeft = (pageWidth - columnWidths.reduce((a, b) => a + b)) / 2;
  const rowHeight = 20;
  const headerColor = "#e6f2ff"; // Light blue color for header

  let overallTotalCredit = 0;
  let overallTotalDebit = 0;

  // Function to add a page with headers
  const addPageWithHeaders = (isFirstPage = false) => {
    if (!isFirstPage) {
      doc.addPage();
    }

    // Add title
    doc.fontSize(20).text("Transaction Report", { align: "center" });
    doc.moveDown();

    // Add date range on the first page
    if (isFirstPage) {
      doc
        .fontSize(12)
        .text(`Date Range: ${startDate} to ${endDate}`, { align: "center" });
      doc.moveDown();
    }

    // Add table header with background color
    doc.fontSize(12);
    let headerLeft = tableLeft;
    let headerTop = 150;

    // Draw colored rectangle for header background
    doc
      .save()
      .fill(headerColor)
      .rect(tableLeft, headerTop, contentWidth, rowHeight)
      .fill()
      .restore();

    // Add header text
    transactionFields.forEach((field, index) => {
      doc.text(field, headerLeft, headerTop + 4, {
        width: columnWidths[index],
        align: "left",
      });
      headerLeft += columnWidths[index];
    });

    // Add a horizontal line below header
    doc
      .moveTo(tableLeft, headerTop + rowHeight)
      .lineTo(tableLeft + contentWidth, headerTop + rowHeight)
      .stroke();

    return headerTop + rowHeight + 10; // Return the Y position to start adding transactions
  };

  // Function to add a single transaction row
  const addTransactionRow = (transaction, yPosition) => {
    doc.fontSize(10);
    let xPosition = tableLeft;
    [
      transaction.particular,
      transaction.formattedDate,
      transaction.type,
      transaction.bank,
      transaction.amount.toString(),
    ].forEach((value, index) => {
      doc.text(value, xPosition, yPosition, {
        width: columnWidths[index],
        align: "left",
      });
      xPosition += columnWidths[index];
    });
  };

  // Function to add page totals
  const addPageTotals = (pageCredit, pageDebit, yPosition) => {
    const totalsYPosition = yPosition + 30; // Move totals down by 30 points
    doc.fontSize(12).font("Helvetica-Bold");
    doc.text(
      `Page Credit Total: ${pageCredit.toFixed(2)}`,
      tableLeft,
      totalsYPosition,
      { align: "left" }
    );
    doc.text(
      `Page Debit Total: ${pageDebit.toFixed(2)}`,
      tableLeft + contentWidth / 2,
      totalsYPosition,
      { align: "left" }
    );
    doc.font("Helvetica");
  };

  let currentPageHeight = addPageWithHeaders(true); // Start with the first page
  let transactionCount = 0;
  let pageCredit = 0;
  let pageDebit = 0;

  // Iterate through transactions
  filteredTransaction.forEach((transaction, index) => {
    if (transactionCount === TRANSACTIONS_PER_PAGE) {
      addPageTotals(pageCredit, pageDebit, currentPageHeight);
      currentPageHeight = addPageWithHeaders();
      transactionCount = 0;
      pageCredit = 0;
      pageDebit = 0;
    }

    addTransactionRow(transaction, currentPageHeight);
    currentPageHeight += rowHeight;
    transactionCount++;

    if (transaction.type === "Credit") {
      pageCredit += transaction.amount;
      overallTotalCredit += transaction.amount;
    } else {
      pageDebit += transaction.amount;
      overallTotalDebit += transaction.amount;
    }

    // Add page totals on the last page if it's not full
    if (index === filteredTransaction.length - 1) {
      addPageTotals(pageCredit, pageDebit, currentPageHeight + 10);
    }
  });

  // Add overall total amounts at the bottom of the last page
  // Only add a new page if there's not enough space on the current page
  if (doc.y > doc.page.height - 150) {
    doc.addPage();
  }
  doc.moveDown(4);
  doc.fontSize(14).font("Helvetica-Bold");
  doc.text("Overall Totals", margin, doc.y, {
    align: "center",
    width: contentWidth,
  });
  doc.moveDown();
  doc.fontSize(12);
  doc.text(`Total Credit: ${overallTotalCredit.toFixed(2)}`, {
    align: "center",
  });
  doc.moveDown(0.5);

  doc.text(`Total Debit: ${overallTotalDebit.toFixed(2)}`, { align: "center" });
  doc.moveDown(0.5);
  doc.text(`Date Range: ${startDate} to ${endDate}`, { align: "center" });

  // Close the PDF
  doc.end();
};

module.exports = { downloadReport };
