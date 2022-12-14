//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://SabaTodoList:todolist123@cluster0.fiqehdy.mongodb.net/todolistDB",{useNewUrlParser : true});

const itemsSchema = mongoose.Schema({
  name :  String
});

const Item = mongoose.model("Item",itemsSchema);

const buy = new Item({
  name : "Buy Food"
});
const cook = new Item({
  name : "Cook Food"
});
const eat = new Item({
  name : "Eat Food"
});

const defaultItems = [buy,cook,eat];

const listsSchema = mongoose.Schema({
  name : String,
  items : [itemsSchema]
});

const List = mongoose.model("List",listsSchema)

app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }
        else {
          console.log("success");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems : foundItems});
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name : itemName
  });

    if(listName === "Today"){
      newItem.save();
      res.redirect("/");
    }
    else{
      List.findOne({name : listName},function(err,foundList){
        foundList.items.push(newItem);
        foundList.save();
        res.redirect("/"+listName);
      });
    }

});



app.post("/delete",function(req,res){
  const checkedInputId = req.body.checkbox;
  const listName = req.body.list;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedInputId,function(err){
      if(err){
        console.log(err);
      }
      else{
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name : listName},{$pull : {items :{_id : checkedInputId}}},function(err,results){
      res.redirect("/"+listName);
    })
  }
});



// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });
app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name : customListName},function(err,foundList){
    if(foundList){
      res.render("list",{listTitle: foundList.name, newListItems : foundList.items});
    }
    else{
        const list = new List({
        name : customListName,
        items : defaultItems
      });
      list.save();
      res.redirect("/"+customListName);
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
