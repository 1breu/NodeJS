//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

const itemSchema = {
  name: String,
  date: String
};
const listSchema = {
  name: String,
  items: [itemSchema]
};

let options = {
  weekday: 'long',
  day: 'numeric',
  month: 'long'
};
let options2 = {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric'
};

const titleDate = new Date().toLocaleString("en-US", options);
const itemDate = new Date().toLocaleString("en-US", options2);


const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Initialized new list",
  date: itemDate
});
const item2 = new Item({
  name: "Add new items below",
  date: itemDate
});
const item3 = new Item({
  name: "Check items off List",
  date: itemDate
});
const defaultItems = [item1, item2, item3];

mongoose.connect("mongodb://127.0.0.1:27017/simpleLists");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// Route for main landing page
app.get("/", function(req, res) {
  const getItems = Item.find({}, function(err, foundItems) {
    if (err) {
      console.log(err);
    } else {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, function(err) {
          if (err) {
            console.log(err);
          } else
            console.log("Default items inserted.");
        });
        res.redirect("/");
      } else {
        res.render("index", {
          listTitle: "Home",
          newListItems: foundItems,
          theDate: titleDate
        });
      }
    }
  })
});

// Handles dynamic routing for custom lists
app.get("/:customListName", function(req, res) {
  const customList = req.params.customListName.toLowerCase();
  if (customList === "Home" || customList === "home") {
    res.redirect("/");
  } else {
    List.findOne({
      name: customList
    }, function(err, foundItem) {
      if (err) {
        console.log(err);
      } else {
        if (!foundItem) {
          const newList = new List({
            name: customList,
            items: defaultItems
          });
          newList.save();
          res.redirect("/" + customList);
        } else {
          const listName = foundItem.name[0].toUpperCase() +
            foundItem.name.substring(1);
          res.render("index", {
            listTitle: listName,
            newListItems: foundItem.items,
            theDate: titleDate
          });
        }
      }
    });
  }
});

// Hanldes route for posting new items to lists
app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const thisDate = new Date().toLocaleString("en-US", options2);
  const listTitle = req.body.button.toLowerCase();
  const newItem = new Item({
    name: itemName,
    date: thisDate
  });

  if (listTitle === "Home" || listTitle === "home") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listTitle
    }, function(err, foundList) {
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listTitle);
    });
  }
});

// Handles routes for deleting items from lists
app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName.toLowerCase();

  if (listName === "Home" || listName === "home") {
    Item.findByIdAndRemove(checkedItemId, function(err, item) {
      if (err) {
        console.log(err);
      } else
        console.log("From List: " + listName + ", Item: " + item._id
        + " successfully deleted.");
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }, function(err, foundList) {
      if (!err) {
        console.log("From List: " + listName + ", Item: "
        + checkedItemId + " successfully deleted.");
        res.redirect("/" + listName);
      }
    });
  }
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
