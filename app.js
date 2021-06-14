const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser:true, useUnifiedTopology:true});

const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name:"welcome to your todolist!"
});

const item2 = new Item({
  name:"hit the ➕  button to add items"
});

const item3 = new Item({
  name:"check the checkbox✅ to remove item"
});

const defaultItems = [item1, item2, item3];


////////////////////////////////custom list schema//////////
const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("List", listSchema);
//////////////////////////////////////////////////////



////////////////////////get req to actual or custom list////////////////////////////////
app.get("/", function(req, res) {

     Item.find({}, function(err, foundItems){

       if(foundItems.length === 0){
         Item.insertMany(defaultItems, function(err){
              console.log("Successfully added");
         });
         res.redirect("/");
       }else{
         res.render("list", {listTitle: "Today", newListItems: foundItems});
       }
     })
});

////////////////////////////////post req to actual or custom list////////////////////
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});

/////////////////////////////delete custom or actual list item//////////////////////////
app.post("/delete", function(req, res){
    const checkedItemID = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
      Item.findByIdAndRemove(checkedItemID, function(err){
        if(!err){
          console.log("deleted");
          res.redirect("/");
        }
      });
    }else{
      List.findOneAndUpdate({name: listName},{$pull : {items: {_id: checkedItemID}}}, function(err, foundList){
        if(!err){
          res.redirect("/" + listName);
        }
      });
    }

});


////////////////////custom list get request//////////
app.get("/:customList", function(req, res){
   const customList= req.params.customList;

   List.findOne({name: customList}, function(err, foundList){
     if(!err){
       if(!foundList){
         //create new list
         const list = new List({
           name: customList,
           items:defaultItems
         });
         list.save();
         res.redirect("/" + customList);
       }else{
         //add in existing list
         res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
       }
     }
   });
});



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
