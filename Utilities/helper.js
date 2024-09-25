const moment = require("moment-timezone");

const getMonth = (monthBack) => {
  const startOfMonth = new Date(new Date().setDate(1));
  const startOfNextMonth = new Date(
    new Date().setMonth(new Date().getMonth() + monthBack, 1)
  );
  return [startOfMonth, startOfNextMonth];
};
const currentDateFormatter = (date) => {
  // If no date is passed, use the current date in IST
  if (!date) {
    date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  }

  // Parse the date
  const parsedDate = new Date(date);

  // Extract day, month, and year with leading zeros for day and month
  const day = String(parsedDate.getDate()).padStart(2, "0");
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const year = String(parsedDate.getFullYear());

  // Return as an object
  return { day, month, year };
};

function combineDateWithCurrentTime(date) {
  const frontendDate = moment(date);
  const currentIndianTime = moment().tz("Asia/Kolkata");

  return moment.tz(
    {
      year: frontendDate.year(),
      month: frontendDate.month(),
      date: frontendDate.date(),
      hour: currentIndianTime.hour(),
      minute: currentIndianTime.minute(),
      second: currentIndianTime.second(),
      millisecond: currentIndianTime.millisecond(),
    },
    "Asia/Kolkata"
  );
}

module.exports = { getMonth, currentDateFormatter, combineDateWithCurrentTime };
