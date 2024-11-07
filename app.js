const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.json());

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemSchema = {
  name: String,
  date: String,
};

const Item = mongoose.model("Item", itemSchema);
const intro = new Item({
  name: "This is a to-do list",
  date: "Friday, 9th November",
});

const owner = new Item({
  name: "This to-do list is created by Aman",
  date: "Friday, 9th November",
});
const defaultItems = [intro, owner];
// let items = [];
app.get("/", (req, res) => {
  Item.find()
    .then((items) => {
      if (items.length === 0) {
        Item.insertMany(defaultItems)
          .then(() => {
            console.log("Data inserted successfully");
          })
          .catch((error) => {
            console.log("Error is : ", error);
          });
        res.redirect("/");
      } else {
        res.render("list", {
          kindOfDay: date.getDate(),
          newList: items,
        });
      }
    })
    .catch((error) => {
      console.log("Error got : ", error);
    });
});

app.get("/:anything", (req, res) => {
  let anything = req.params.anything;
  console.log(anything);
});

app.post("/", (req, res) => {
  var newItem = req.body.newItem;
  var dated = date.dated(req);
  let object = new Item({
    name: newItem,
    date: dated,
  });
  object.save();
  console.log("Item saved", object._id);
  res.redirect("/");
});

app.post("/delete", (req, res) => {
  const index = new mongoose.Types.ObjectId(String(req.body.index));
  console.log(index);
  Item.deleteOne({ _id: index })
    .then(() => {
      res.redirect("/");
    })
    .catch((error) => {
      console.log("Error is : ", error);
    });
});

app.post("/update", async (req, res) => {
  try {
    const index = new mongoose.Types.ObjectId(String(req.body.index));
    console.log(index);
    const newItem = req.body.newItem;
    await Item.updateOne({ _id: index }, { name: newItem });
    console.log("Item updated successfully");
    res.redirect("/");
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).send("Error updating item");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
