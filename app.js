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
const _ = require("lodash");
require("dotenv").config();
const db = process.env.db;
mongoose.connect(db);

const itemSchema = {
  name: String,
  date: String,
};

const listSchema = {
  name: String,
  items: [itemSchema],
};

const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("List", listSchema);
const intro = new Item({
  name: "This is a to-do list",
  date: "Friday, 9th November",
});

const owner = new Item({
  name: "This to-do list is created by Aman",
  date: "Friday, 9th November",
});
const defaultItems = [intro, owner];
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
  let anything = _.capitalize(req.params.anything);
  List.findOne({ name: anything })
    .then((list) => {
      if (!list) {
        const list = new List({
          name: anything,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + anything);
      } else {
        res.render("list", {
          kindOfDay: list.name,
          newList: list.items,
        });
      }
    })
    .catch((error) => {
      console.log("Error is : ", error);
    });
});

app.post("/", (req, res) => {
  var newItem = req.body.newItem;
  const title = req.body.title;
  var dated = date.dated(req);
  let object = new Item({
    name: newItem,
    date: dated,
  });

  if (title === date.getDate()) {
    object.save();
    res.redirect("/");
  } else {
    List.findOne({ name: title }).then((list) => {
      list.items.push(object);
      list.save();
      res.redirect("/" + title);
    });
  }

  console.log("Item saved", object._id);
});

app.post("/delete", (req, res) => {
  const index = new mongoose.Types.ObjectId(String(req.body.index));
  const listTitle = req.body.title;

  if (listTitle === date.getDate()) {
    Item.deleteOne({ _id: index })
      .then(() => {
        res.redirect("/");
      })
      .catch((error) => {
        console.log("Error is : ", error);
      });
  } else {
    List.findOneAndUpdate(
      { name: listTitle },
      { $pull: { items: { _id: index } } }
    )
      .then(() => {
        res.redirect("/" + listTitle);
      })
      .catch((error) => {
        console.log("Error is : ", error);
      });
  }
});

app.post("/update", async (req, res) => {
  try {
    const index = new mongoose.Types.ObjectId(String(req.body.index));
    const newItem = req.body.newItem;
    const listTitle = req.body.title;

    if (listTitle === date.getDate()) {
      await Item.updateOne({ _id: index }, { name: newItem });
      console.log("Item updated successfully in the main list");
      res.redirect("/");
    } else {
      await List.findOneAndUpdate(
        { name: listTitle, "items._id": index },
        { $set: { "items.$.name": newItem } }
      );
      console.log("Item updated successfully in the custom list");
      res.redirect("/" + listTitle);
    }
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).send("Error updating item");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
