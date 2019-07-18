'use strict';

//the rows
let dataRows=   [["A","Alibaba","2019-06-14T12:00:00Z"],["B","Alicante","2019-06-13T12:00:00Z"],
                ["C","Allverdens","2019-06-14T12:00:00Z"],["D","Al Jazeera","2019-07-17T12:00:00Z"]];

//Create object with input parameters
let obj =  {  "dataRows": dataRows,
              "headers": ["project", "subproject", "event_date"],
              "headers_tooltip": ["project acronym","subproject acronym","start work date"],
              "selectlist": {"project":["A","B","C","D"]},
              "autocompletes": ["subproject"],
              "dateFields":["event_date"],
              "id": "exceltable"
};


//Holds the width of the table
let col_length = obj.headers.length + 2;
//This counter holds next row_number
let row_length = 1;
//Holds the array marked for copy
let drag_arr = [];
//The previous selected cell
let prev_selected_cell = '';


function input_element(id_td,id,inputValue,typefield, autocomplete){
  var td = document.createElement("td");
  td.id = id_td;
  //if column has autocomplete attach class
  if (autocomplete){
        td.classList.add("autocomplete");
  };
  //Child element
  var input = document.createElement("input");
  input.type = typefield;
  input.id = id;
  input.value= inputValue;
  td.appendChild(input);
  return td;
}

function select_element(id_td, id_select, header_name, val){
  var td = document.createElement("td");
  td.id = id_td;

  //Find the select options from the input object named obj
  let arr = obj.selectlist[header_name];
  let returnstring = '';
  if (arr != undefined) {
        for (let i in arr) {
            if (arr[i] === val) {
              returnstring += "<option value='" + arr[i] + "'selected>" + arr[i] + "</option>";
            } else {
              returnstring += "<option value='" + arr[i] + "'>" + arr[i] + "</option>";
            }
        }
    }
    var select = document.createElement("select");
    select.id = id_select;
    select.innerHTML = returnstring;
    td.appendChild(select);
    return td;
}


//Create header element
function th_element(id,textContent, textTooltip){
  let th = document.createElement("th");
  th.id = id;
  th.title = textTooltip;
  th.textContent = textContent;
  return th;
}

//Create count and id columns
function new_count_id (id,innerhtml){
    let td0 = document.createElement("td");
    td0.id = id;
    td0.innerHTML = innerhtml;
    return td0;
}

  //1. Create headers:
  let container_header = document.getElementById("header1");

  //a. First column is the count..
  let th0 = th_element("header_0","no",'');
  container_header.appendChild(th0);

  //b. ..the next is the user headings..
  for (let i=0;i<obj.headers.length;i++){
      let th = th_element("header_"+ i,obj.headers[i],obj.headers_tooltip[i]);
      container_header.appendChild(th);
  }

  //c. ..finally the id header
  let th_last = th_element("header_"+obj.headers.length,"id",'');
  container_header.appendChild(th_last);

  //2. Insert values into table body
  let container = document.getElementById("tbody1");

  //This only applies if obj.dataRows (fetched rows) is empty, otherwise omitted
  if (obj.dataRows === undefined || obj.dataRows.length === 0) {
    newRow(1,"");
  } else {
    //The table body
    newRow(obj.dataRows.length,obj.dataRows);
    let autocomplete = document.getElementsByClassName("autocomplete");
  }

  //Fetch all values from the chosen column.
  //Used as selections in the autocomplete list for that column
  function  autocomplete_col_values(col,row) {
         let arr = [];
         for (let i=1;i<row_length;i++){
            if (i === row) {continue};
            let val = document.getElementById("input_"+i+"_"+col);
            arr.push(val.value);
         };

         return [...new Set(arr)];
  }

  //Autocomplete function
  function autocomplete(arr,input_field){
    let currentFocus;

    input_field.addEventListener("input", function(e) {
      let a, b, i, val = this.value;

      //close any already open lists of autocompleted values
      closeAllLists(input_field);

    if (!val) { return false;}
     currentFocus = -1;
     /*create a DIV element that will contain the items (values):*/
     a = document.createElement("div");
     a.setAttribute("id", input_field.id + "autocomplete-list");
     a.setAttribute("class", "autocomplete-items");
     /*append the DIV element as a child of the autocomplete container:*/
     input_field.parentNode.appendChild(a);
     /*for each item in the array...*/
     for (i = 0; i < arr.length; i++) {
       /*check if the item starts with the same letters as the text field value:*/
       if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
         /*create a DIV element for each matching element:*/
         b = document.createElement("div");
         /*make the matching letters bold:*/
         b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
         b.innerHTML += arr[i].substr(val.length);
         /*insert a input field that will hold the current array item's value:*/
         b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
         /*execute a function when someone clicks on the item value (DIV element):*/
             b.addEventListener("click", function(e) {
             /*insert the value for the autocomplete text field:*/
             input_field.value =this.getElementsByTagName("input")[0].value;
             /*close the list of autocompleted values,
        (or any other open lists of autocompleted values:*/
        closeAllLists(input_field);
    });
    a.appendChild(b);
  }
}
})
};


  // This function checks if an arrow key has been pressed
  // If so, it changes focus
  function checkKey(event) {
  event = event || window.event;

  let pos = document.activeElement.id.split("_");
  let row = parseInt(pos[1]);
  let col = parseInt(pos[2]);

  //Check if field use autocomplete
  if ((obj.autocompletes).includes(obj.headers[col-1])) {
    //If yes, fetch values
    let arr = autocomplete_col_values(col,row);
    autocomplete(arr,document.activeElement);
  }

  if (event.keyCode == '9') {
    //Tab
     //console.log(prev_selected_cell);
     //console.log(event.target);
     let prev = document.getElementById(prev_selected_cell);
      prev.classList.remove('selectCell');
  } else if (event.shiftKey && event.keyCode == 9) {
    //Shift+TAB
    document.getElementById(prev_selected_cell).classList.remove('selectCell');
  }
}

//Drag and drop - drag over event
let dragover = function(event){
      let id = event.target.id;
      //Don't copy yet, add id to drag_arr - drag_arr should only contain same values in a row
     if ((id.startsWith('td'))&&(id !== drag_arr[drag_arr.length-1])) {
       //if user have returned back (regretting), skip last cell
       if (id === drag_arr[drag_arr.length-2]) {
         //Remove selected border
         document.getElementById(drag_arr[drag_arr.length-1]).classList.remove('dragCell');
         drag_arr.pop();
       } else {  //No user regrets, continue dragging
         //Set a border so the user can see the cell is selected
         document.getElementById(id).classList.add('dragCell');
         drag_arr.push(id);

       }
     }
 };

 //Drag and drop - end of dragging
let dragend = function(event){
    //If drop_arr last value is equal to first value, skip everything.
    //The user has withdraw the action.
    let drop_value = document.getElementById(event.target.id).childNodes[0].value;
    for (var entry of drag_arr) {
          let elem = document.getElementById(entry);
          elem.classList.remove('dragCell');
          if (drag_arr[drag_arr.length-1] !== event.target.id) {
             elem.childNodes[0].value = drop_value;
          }
    }
    //Reset drag_arr until next drag/drop
    drag_arr = [];
 };

 //Drag and drop - disable drop
let drop = function (event) {
   event.preventDefault();
 };

 //Upon clicking in table
let click = function (event) {
   closeAllLists(event.target);
   if ((event.target.id).startsWith('input') || (event.target.id).startsWith('select')) {
        let doc = document.getElementById(event.target.id);
       let elem = doc.parentElement;
       //Remove borders from the whole table
       if (prev_selected_cell !== '') { document.getElementById(prev_selected_cell).classList.remove('selectCell');};
        //Update this to be the previous selected cell
        prev_selected_cell = elem.id;
       //Mark selected cell
       elem.classList.add("selectCell");
       //Make it draggable
       elem.draggable = "true";
       elem.ondragstart = addEventListener('dragstart', function(event) { event.dataTransfer.setData('text/plain', doc.value); });
 }};


// new button pressed
let newBtn = function (event) {
    console.log('newBtn');
    //Get number of new rows wanted
    let num = addRows();
    newRow(num,"");
};

//Create the next row
function newRow(num,input_text){
//Number of rows
for (let i=0;i<num;i++){
    let tr = document.createElement("tr");
    //Count column
    tr.appendChild(new_count_id('count_'+row_length,row_length));
    //Second to almost last column is user info
    let td;
    for (let j=1;j<obj.headers.length+1;j++){
      //Difference between empty row and row with input
      let inp = (input_text == '') ? '' : (input_text[i][j-1]);

      if (obj.selectlist.hasOwnProperty(obj.headers[j-1])) {  //Select field
         td = select_element('td_'+row_length+'_'+j,'select_'+row_length+'_'+j,obj.headers[j-1],inp);

      } else if (obj.dateFields.includes(obj.headers[j-1])){  //input date field
          let date = (inp == '') ? '' : inp.substring(0,10);
          td = input_element('td_'+row_length+'_'+j,'input_'+row_length+'_'+j,date,'date',false);

      } else {  //ordinary input field
         td = input_element('td_'+row_length+'_'+j,'input_'+row_length+'_'+j,inp,'text',true);
      }
      tr.appendChild(td);

}
//Id columns
tr.appendChild(new_count_id('id_'+row_length,obj.id+'-'+row_length));
row_length++;
container.appendChild(tr);
}
}

// copy button pressed
let copyBtn = function (event) {
    console.log('copyBtn');
    if (prev_selected_cell == '') {
       alert("Please select a row");
    } else {    //Get the selected row
       let tr = (document.getElementById(prev_selected_cell)).parentElement;
       document.getElementById(prev_selected_cell).classList.remove('selectCell');
       console.log(tr);
       //Get number of new rows wanted
       let num = addRows();
       for (let i=0;i<num;i++){
            let cln = tr.cloneNode(true);
            //cln.classList.remove('selectCell');
            container.appendChild(cln);
       }
    }
};

// save button pressed
let delBtn = function (event) {
    console.log('delBtn');
    if (prev_selected_cell == '') {
       alert("Please select a row");
    } else {    //Get the selected row
       let td = (document.getElementById(prev_selected_cell));
       document.getElementById("tbody1").removeChild(td.parentElement);
    }
};

// save button pressed
let saveBtn = function (event) {
    console.log('saveBtn');
    container = document.getElementById("tbody1");
    console.log(container);
};

//Get the number of wanted new/copied/deleted rows
function addRows(){
   let num = document.getElementById("addRows").value;
   console.log(num);
   return (num == "") ? 1 : num;
};

document.getElementById("tbody1").addEventListener("dragover", dragover);
document.getElementById("tbody1").addEventListener("dragend", dragend);
document.getElementById("tbody1").addEventListener("drop", drop);
document.getElementById("tbody1").addEventListener('keydown', checkKey);
document.getElementById("tbody1").addEventListener('click', click);
document.getElementById("newBtn").addEventListener('click', newBtn);
document.getElementById("copyBtn").addEventListener('click', copyBtn);
document.getElementById("delBtn").addEventListener('click', delBtn);
document.getElementById("saveBtn").addEventListener('click', saveBtn);

function addActive(x) {
   /*a function to classify an item as "active":*/
   if (!x) return false;
   /*start by removing the "active" class on all items:*/
   removeActive(x);
   if (currentFocus >= x.length) currentFocus = 0;
   if (currentFocus < 0) currentFocus = (x.length - 1);
   /*add class "autocomplete-active":*/
   x[currentFocus].classList.add("autocomplete-active");
 }

 function removeActive(x) {
   console.log(removeActive);
   /*a function to remove the "active" class from all autocomplete items:*/
   for (var i = 0; i < x.length; i++) {
     x[i].classList.remove("autocomplete-active");
   }
 }
 function closeAllLists(input_field,elmnt) {
   /*close all autocomplete lists in the document,
   except the one passed as an argument:*/
   var x = document.getElementsByClassName("autocomplete-items");
   for (var i = 0; i < x.length; i++) {
     if (elmnt != x[i] && elmnt != input_field) {
     x[i].parentNode.removeChild(x[i]);
   }
 }
}
