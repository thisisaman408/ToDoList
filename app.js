const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.json());
let items = [];
app.get("/", (req, res) => {
  let today = new Date();
  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
  };
  let day = today.toLocaleDateString("en-US", options);
  res.render("list", { kindOfDay: day, newList: items });
});

app.post("/", (req, res) => {
  console.log(req.body); // Check what data is being received
  let newItem = req.body.newItem;
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

  // Store the new item with the formatted date
  items.push({ name: newItem, date: dated });
  res.redirect("/");
});

app.post("/delete", (req, res) => {
  let index = Number(req.body.index);
  items.splice(index, 1);
  res.redirect("/");
});

app.post("/update", (req, res) => {
  const index = parseInt(req.body.index, 10);
  const newItem = req.body.newItem;
  if (index >= 0 && index < items.length) {
    items[index].name = newItem;
    res.status(200).json({ success: true, message: "Item updated" });
  } else {
    console.error("Invalid index");
    return res.status(400).json({ success: false, message: "Invalid index!" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
