module.exports.getDate = getDate;

function getDate() {
  let today = new Date();
  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
  };
  let day = today.toLocaleDateString("en-US", options);
  return day;
}

module.exports.dated = dated;
function dated(req) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let monthChoosen = req.body.month;
  let month = months[monthChoosen];
  let dateChoosen = req.body.date;
  let year = new Date().getFullYear();

  const dayOfweeks = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Calculate day of the week based on month and date
  let day = dayOfweeks[new Date(year, monthChoosen, dateChoosen).getDay()];
  let dated = `${day}, ${dateChoosen} ${month}`;
  return dated;
}
