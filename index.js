'use strict';

const $  = require( 'jquery' );

const dt = require( 'datatables.net' )( window, $ );
require('datatables.net-select' )( window, $ );
require('datatables.net-autofill')( window, $ );
require('datatables.net-keytable')( window, $ );

  var currentFocus;

//Testdata  template and fieldwork
let template =  [
    "matrix",
    "project",
    "species",
    "species_identification",
    "label_name",
    "comment",
    "my_own_field",
    "my_own_field2",
    "event_date",
    "id"
];

let fieldwork = [{
  "id":"4568140a7f01462edc029e42ab040f01",
  "matrix":"feather",
  "project": "Kongsfjorden northern fulmar",
  "species": "fulmarus glacialis",
  "species_identification": "77",
  "label_name": "6745232",
  "my_own_field": "test",
  "my_own_field2": "test2",
  "event_date":"2019-02-01",
  "comment": "dead"
},
{
  "id":"4568140a7f01462edc029e42ab056e41",
  "matrix":"feather",
  "project": "Kongsfjorden northern fulmar",
  "species": "fulmarus glacialis",
  "species_identification": "78",
  "label_name": "6745211",
  "my_own_field": "test",
  "my_own_field2": "test2",
  "event_date":"2019-09-01",
  "comment": "Juvenile"
},
{
  "id":"4568140a7f01462edc029e42ab056e41",
  "matrix":"egg",
  "project": "Kongsfjorden northern fulmar",
  "species": "fulmarus glacialis",
  "species_identification": "79",
  "label_name": "4566432",
  "my_own_field": "test",
  "my_own_field2": "test2",
  "event_date":"2019-01-01",
  "comment": ""
}];


let species_list = ["ursus maritimus", "vulpes lagopus",
      "boreogadus saida","salvelinus alpinus","mallotus villosus",
      "strongylocentrotus droebachiensis","hyas araneus","buccinum undatum",
      "buccinum glaciale", "mya truncata",
      "gymnacanthus tricuspis","myoxocephalus scorpius",
      "phoca vitulina","pagophilus groenlandicus",
      "cystophora cristata","pusa hispida",
      "odobenus rosmarus","leptonychotes weddellii",
      "orcinus orca","delphinapterus leucas", "monodon monoceros",
      "bubo scandiacus","larus hyperboreus","uria lomvia","uria aalge","rissa tridactyla",
      "somateria mollissima","fratercula arctica","phalacrocorax aristotelis",
      "larus argentatus", "morus bassanus", "fulmarus glacialis", "alle alle"];

let matrix_list = ["egg","milk","whole blood","blood cell",
      "plasma","serum","abdominal fat","subcutaneous fat",
      "blubber","hair","feather","muscle","liver","brain",
      "adrenal","whole animal","gonad",
      "whole animal except lower part of foot",
      "whole animal except closing muscle and siphon",
      "digestive gland"];

//Input object
let obj = { "fieldwork":fieldwork,
            "template":template,
            "selectlist": {"species":species_list, "matrix":matrix_list},
            "autocompletes":["my_own_field","my_own_field2"],
            "datefields":["event_date"]};



let dataSet=[];
let rowArr;
//This counter holds max row_number
let index_count = 0;
function increment_index_count(){
    index_count++;
}

//Create select elements
var implement_select = (id,count,text) => {
  //Find the select options from the input object named obj
  let arr = obj.selectlist[id];
  if (arr != undefined) {
       let returnstring = '';

        for (let i in arr) {
            if (arr[i] === text) {
              returnstring += "<option value='" + arr[i] + "'selected>" + arr[i] + "</option>";
            } else {
              returnstring += "<option value='" + arr[i] + "'>" + arr[i] + "</option>";
            }
        }
    return '<td id ="'+ id +'_'+ count.toString()+'"><select id="'+ id +'_'+ count.toString()+'" class="target">' + returnstring + '</select></td>';
   }
}



//Return input or select element
var checkHtmlComponent = (text,k) => {
  let id = obj.template[k];

  //if this is a select element, call implement_select to get the select component
  if (obj.selectlist.hasOwnProperty(k)) {
      return implement_select(k,index_count,text);
  } else if (obj.datefields.includes(k)) {
      return '<td id="'+ k +'_'+(index_count).toString()+'"><input type="date" id="'+ k +'_'+(index_count).toString()+'" class="dateelement" name="'+ k +'_'+(index_count).toString() +'" value="'+ text+'"></td>';
  } else if (obj.autocompletes.includes(k)){
      return '<td id="'+ k +'_'+(index_count).toString()+'"><div class="autocomplete"><input type="text" id="'+ k +'_'+(index_count).toString()+'" name="'+ k +'_'+(index_count).toString() +'" value="'+ text+'"></div></td>';
  } else {
      //This is an input element
      return '<td id="'+ k +'_'+(index_count).toString()+'"><input type="text" id="'+ k +'_'+(index_count).toString()+'" name="'+ k +'_'+(index_count).toString() +'" value="'+ text+'"></td>';
  }
}


//sort
for (let j of fieldwork) {
  rowArr = [""];
  for (let k of template) {
     let text = (j[k] == '') ? '&nbsp;' : j[k];
       rowArr.push(checkHtmlComponent(text,k));
  }
  //Id is the last entry, push directly without editable or id
  rowArr[rowArr.length-1] = j['id'];
  dataSet.push(rowArr);
  increment_index_count();
}

  //Create table headings
  let columnsArr = [{ 'title': 'index' }];
  for (let value of template) {
    columnsArr.push({ 'title': value });
  }





    let table;
    $(document).ready(function() {
      $('#table1').on( 'init.dt', function () {
            table = $('#table1').DataTable();
          } ).DataTable( {

            stateSave: true,
            data: dataSet,
            columns: columnsArr,
            autoFill: {
            columns: ':not(:last-child)'
            },
            select:'single',
            keys: true,  //connected events key-blur
            "ordering": true
        } );

    //Provide index
    table.on( 'order.dt search.dt', function () {
           table.column(0, {search:'applied', order:'applied'}).nodes().each( function (cell, i) {
               cell.innerHTML = i+1;
           } );
       } ).draw();


  //Add id to the <td> html element
  function add_id () {
    table.cells().nodes()[0]['id'] = "undefined_0";
    for  (let b=1;b<table.cells().nodes().length;b++){
        let temp_ = table.cells().nodes()[b]['_DT_CellIndex'];
        table.cells().nodes()[b]['id'] = template[temp_.column-1] + "_" + temp_.row.toString();
    }
    return false;
  }


       //Get the number of new or copied row we want
       //If null, return 1 for one row added
       var get_rows = () => {
           let num_input = document.getElementById('addRows').value;
           //Set value back to empty
           document.getElementById('addRows').value = '';
           let num_rows = num_input.match(/[0-9]+/);
           if (num_rows !== null){
             return num_rows[0];
           } else {
             return 1;
           }
       }


    table.on( 'key', function ( e, datatable, key, cell, originalEvent ) {
            //Check if field use autocomplete
            let id_col = cell.index().column;
            let id = obj.template[id_col-1] + "_" + cell.index().row;
            if ((obj.autocompletes).includes(obj.template[id_col-1])){
               //Remove old list
               console.log("autocomplete " + id);
              // console.log(originalEvent.originalEvent.keyCode);
               let input_field = document.getElementById(obj.template[id_col-1]+"_"+cell.index().row);
               var a, b, i, val = input_field.value;
               let arr = template;
    /*close any already open lists of autocompleted values*/
    //closeAllLists(cell);

    if (!val) { return false;}
    currentFocus = -1;
    /*create a DIV element that will contain the items (values):*/
    a = document.createElement("DIV");
    a.setAttribute("id", input_field.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    console.log(a);
    /*append the DIV element as a child of the autocomplete container:*/
    input_field.parentNode.appendChild(a);
    /*for each item in the array...*/
    for (i = 0; i < arr.length; i++) {
      /*check if the item starts with the same letters as the text field value:*/
      if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        /*create a DIV element for each matching element:*/
        b = document.createElement("DIV");
        /*make the matching letters bold:*/
        b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
        b.innerHTML += arr[i].substr(val.length);
        /*insert a input field that will hold the current array item's value:*/
        b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
        /*execute a function when someone clicks on the item value (DIV element):*/
           b.addEventListener("click", function(e) {
           /*insert the value for the autocomplete text field:*/
           input_field.value = this.getElementsByTagName("input")[0].value;
           /*close the list of autocompleted values,
           (or any other open lists of autocompleted values:*/
           closeAllLists(cell);
       });
       a.appendChild(b);
     }
   }


             }
    } );



      //On leave - update data
      table.on( 'key-blur', function ( e, datatable, cell ) {
        console.log('key-blur');
        //Close all open lists
        closeAllLists(cell);
        //Get column header (id_col)
        let id_col = parseInt(cell.index().column) -1;

        //if this is a select element, call implement_select to get the select component
        if (obj.selectlist.hasOwnProperty(obj.template[id_col])) {
              //Get the element id index
              let id = obj.template[id_col] + "_" + cell.index().row;
              let select_option_index = table.$('select#'+id)[0].selectedIndex;
              //Get selected element value
              let text = table.$('select#'+id)[0][select_option_index].value;
              //Insert into array
              let sel_row = table.row(cell.index().row).data();
              //Update cell with changed select menu
              sel_row[id_col+1] = implement_select(obj.template[id_col],cell.index().row,text);
              let rowNode = table.row(cell.index().row).data(sel_row).draw(false);
        } else if (table.$('input')){
              //Get cell id
              let temp = template[parseInt(cell.index().column) - 1] + "_" + cell.index().row;
              let text = table.$('input#'+temp)[0].value;
              //Get old row data from input
              let rowData = datatable.row( cell.index().row ).data();
              //Create new data and update table
              rowData[cell[0][0].column]='<td id="'+ temp +'"><input type="text" id="'+ temp +'"value="'+ text+'"></td>';
              let rowNode = table.row(cell.index().row).data(rowData).draw(false);
        }
      });

      let index = 0;
      let old_index = 0;
      //Autocomplete for predesignated fields
       var autocomplete = (id) => {
         if (document.getElementById(id) !== null) {
            console.log("autocomplete");
            let sel_col = [];
            //Get the name of the column
            let name = id.slice(0, (id.lastIndexOf("_")) );
            //Use the  column name to find the column index
            let col_num = Object.keys(template).find(key => template[key] === name);
            //Get all column data
            let col = table.column(parseInt(col_num)+1).select().data();

            for (var index = 0; index < col.length; index++) {
                //Extract the values and add them to sel_col array
                sel_col.push(col[index].replace(/<\/*div[^>]*>/g,""));
            }


            //Extract all values from the selected column and try autocomplete

         }
       }



       $('#copyBtn').click( function() {

           //Get updated text
           if (!table.row({ selected: true }).node()) {
               alert("Please select at least one row");
           } else {
               //Get hold of the content
               let sel_row = table.row({ selected: true }).data();

               //Get number of selected column
               let num_rows = get_rows();
               let rowArr, rowNode;

               //Go through all selected rows to be copied
               for (let j=0;j<(num_rows);j++){
                 rowArr = [""];

                 for (let i=0;i<obj.template.length;i++){
                    rowArr.push(sel_row[i+1].replace(/_[0-9]+\"/g, "_"+index_count+'"'));
                 };
               //Id should not have id or be editable
                rowArr[rowArr.length-1] = '';
                rowNode = table.row.add( rowArr ).draw().node();
                rowNode.id = "row_"+index_count;
                increment_index_count();
               };
               add_id();

               }
               return false;
       } );

       //Update the last row edited
       var update_last_row = (dt, old_index) => {
         //Get new values
         let row_content = dt.row( old_index ).node().innerHTML;

         //Change a long text string HTML style into an div array
         //Only with node() we can get the updated value.
         let row_content2 = row_content.replace(/<\/td>/g,"</td>,").split(",");
         row_content2.splice(-1,1);

         //Draw (publish) array
         let rowNode = table.row(old_index).data(row_content2).draw(false);
       }

       $('#saveBtn').click( function() {

      //   remove_select_menu("sel");
      //    let sel_row = table.row({ selected: true }).nodes();
      //    console.log(sel_row);
      //    update_last_row(sel_row, sel_row.index);
      //     var data = table.$('input, select').serialize();

            var data = table.$('input, select').serialize();
          //let data = table.data();
          //console.log(data);
          var nodes = table.nodes();
          console.log(nodes);
          return false;
       } );


       $('#newBtn').click( function() {
               let num_rows = get_rows();
               let rowArr;

               //Get number of rows
               for (let j=0;j<(num_rows);j++){
                 rowArr = [""];

                 template.forEach(function (i){
                   rowArr.push(checkHtmlComponent('',i));
                 });
               //Id should not be editable
                rowArr[rowArr.length-1] = '';
                let rowNode = table.row.add( rowArr ).draw().node();
                //Add row id to TR element
                rowNode.id = "row_"+index_count;
                increment_index_count();
                add_id();
               };
               return false;
       });

       $('#delBtn').click( function() {
             let sel_row = table.row({ selected: true });
             //Check that a row has been selected
             if (sel_row[0].length === 0) {
                 alert("Please select at least one row");
             } else {
              var rowNode = table.row('.selected').remove().draw();
             }
              return false;
           });

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
           /*a function to remove the "active" class from all autocomplete items:*/
           for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
           }
           }

           function closeAllLists(cell,elmnt) {
             console.log(elmnt);
           /*close all autocomplete lists in the document,
           except the one passed as an argument:*/
           let input_field = document.getElementById(obj.template[cell.index().column-1]+"_"+cell.index().row);
           var x = document.getElementsByClassName("autocomplete-items");
           for (var i = 0; i < x.length; i++) {
              console.log(input_field);
              if (elmnt != x[i] && elmnt != input_field) {
              x[i].parentNode.removeChild(x[i]);
            }
           }
           }
});
