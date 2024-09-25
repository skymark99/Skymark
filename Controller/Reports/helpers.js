const PAGE_MARGIN = 50;
const HEADER_COLOR = "#e6f2ff"; // Light blue color for header
const ROW_HEIGHT = 20;
const COLUMN_WIDTHS = [150, 100, 80, 80, 100]; // Adjust as needed

const addPageWithHeaders = (
  doc,
  transactionFields,
  isFirstPage = false,
  startDate,
  endDate
) => {
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

  // Calculate table dimensions
  const pageWidth = doc.page.width;
  const contentWidth = pageWidth - 2 * PAGE_MARGIN;
  const tableLeft = (pageWidth - COLUMN_WIDTHS.reduce((a, b) => a + b)) / 2;

  // Draw colored rectangle for header background
  doc
    .save()
    .fill(HEADER_COLOR)
    .rect(tableLeft, 150, contentWidth, ROW_HEIGHT)
    .fill()
    .restore();

  // Add header text
  let headerLeft = tableLeft;
  doc.fontSize(12);
  transactionFields.forEach((field, index) => {
    doc.text(field, headerLeft, 154, {
      width: COLUMN_WIDTHS[index],
      align: "left",
    });
    headerLeft += COLUMN_WIDTHS[index];
  });

  // Add a horizontal line below header
  doc
    .moveTo(tableLeft, 170)
    .lineTo(tableLeft + contentWidth, 170)
    .stroke();

  return 180; // Return the Y position to start adding transactions
};
module.exports = { addPageWithHeaders };
