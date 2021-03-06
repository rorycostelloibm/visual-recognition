// Watson Visual Recognition Tool
// Rory Costello - rory.costello@au1.ibm.com
// V1 - 2 Mar 2018

var fs = require('fs');
var spawn = require('child_process');
var exec = require('child_process').exec;
var inquirer = require('inquirer');

console.log('Watson Visual Recognition - image splitter, classifier, and assembler');

var questions = [
  {
    type: 'input',
    name: 'fname',
    message: 'Filename of source graphic image'
  },
  {
    type: 'input',
    name: 'cols',
    message: 'Number of columns to split the image into'
  },
  {
    type: 'input',
    name: 'rows',
    message: 'Number of rows to split the image into'
  },
  {
    type: 'input',
    name: 'colour1',
    message: 'Colour to shade the first classifier',
    default: 'yellow'
  },
  {
    type: 'input',
    name: 'colour2',
    message: 'Colour to shade the second classifier',
    default: 'green'
  },
  {
    type: 'confirm',
    name: 'showraw',
    message: 'Display raw output from Watson classifier? (JSON)',
    default: false
  }
  
];

inquirer.prompt(questions).then(function (answers) {
  console.log('\nSummary of input variables:');
  console.log(JSON.stringify(answers, null, '  '));

  // Clean up splitting percentages

  var px, py, zz; // zz is just a temp variable to calculate how many image fragments we will get

  px = 100 / answers.cols;
  if (!Number.isInteger(px))
  {
    px = (Number.parseInt(px*100)/100.0)*1.05;// + 0.01;
    zz = 100 / px;
    if (!Number.isInteger(zz)) {
      answers.cols = Number.parseInt(zz) + 1;
    } else {
      answers.cols = zz;
    }
  }
  py = 100 / answers.rows;
  if (!Number.isInteger(py)) 
  { 
    py = (Number.parseInt(py*100)/100.0)*1.05;// + 0.01;
    zz = 100 / py;
    if (!Number.isInteger(zz)) {
      answers.rows = Number.parseInt(zz) + 1;
    } else {
      answers.rows = zz;
    }   
  }

  // Perform file system operations - these are for Windows environment
  console.log("Deleting working image fragments");
  if (!fs.existsSync("./tmp")) {
    var cp = spawn.spawnSync(process.env.comspec, ['/c', 'mkdir tmp']);  
  }
  var cp = spawn.spawnSync(process.env.comspec, ['/c', 'del ./tmp/xx*.*']);
  var cp = spawn.spawnSync(process.env.comspec, ['/c', 'del ./tmp/zzxx*.*']);
  console.log("Splitting image "+answers.fname+ " into "+px+"% cols, and "+py+"% rows");

  var child = spawn.spawnSync(process.env.comspec, ['/c', 'c:\\ImageMagick\\convert.exe '+answers.fname+' -crop '+px+'%x'+py+'% +repage ./tmp/xx%03d_'+answers.fname]);

  // Write out the variables

  fs.writeFile("./tmp/.vars", 

  answers.fname+','+
  answers.cols+","+
  answers.rows+","+
  answers.colour1+','+
  answers.colour2+','+
  answers.showraw
  , function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The image has been submitted for splitting and variables stored in a temporary file, .vars.");
    console.log("To preserve final image orientation in the event of any classification errors, please run 'sh predupe.sh'");
    console.log("To submit the fragments for processing, please type 'node classify'");
    console.log("Once that has completed, the final image can be merged with 'node merge'");
    console.log(" ");
    console.log(" ");
    console.log(" SUMMARY:");
    console.log(" ");
    console.log(" sh predupe.sh");
    console.log(" node classify");
    console.log(" node merge");
    console.log(" ");
    
}); 
});
