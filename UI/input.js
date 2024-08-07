var mode = "edit";
var createready = false;
var parametersready = false;
var structureready = false;
var showstatus = true;
var showcontainer = true;
var showimage = true;
var parametererror = false;
var parameterscomplete = 0;
var previousstructure = [];
var previousdataset;
var initialization = "Random";
var initializationparameter;
var currenthelpdiv;
var currenttab;

function Confirm(id,func,text,para,modes=true) {
  let button = document.getElementById(id);
  if (button.classList.contains("clicked")) {
    button.innerHTML = text;
    func(para);
  } else {
    button.innerHTML = "Confirm?";
    button.classList.add("clicked");
    setTimeout(function() {
      if (modes == true || mode == modes) button.innerHTML = text;
      button.classList.remove("clicked");
    }, 1000);
  }
}

function HandleImport() {
  DeleteNN();
  while (structure[layers-1] == 0) {
    structure.pop();
    layers--;
  }
  document.getElementById("structurecount").innerHTML = "Structure: " + JSON.stringify(structure);
  structure.push(0);
  InitializeValues(true);
  DrawNN();
  document.getElementById("learnratedisplay").innerHTML = "Learning rate: " + learnrate;
  document.getElementById("weightrangedisplay").innerHTML = "Weight range: " + weightrange;
  document.getElementById("biasrangedisplay").innerHTML = "Bias range: " + biasrange;
  createready = true;
}

function Quickset() {
  DeleteNN();
  structure = [784,16,16,10];
  layers = 4;
  document.getElementById("structurecount").innerHTML = "Structure: [784,16,16,10]";
  structure.push(0);
  InitializeValues();
  DrawNN();
  learnrate = 0.1;
  weightrange = 1;
  biasrange = 1;
  document.getElementById("learnratedisplay").innerHTML = "Learning rate: 0.1";
  document.getElementById("weightrangedisplay").innerHTML = "Weight range: 1";
  document.getElementById("biasrangedisplay").innerHTML = "Bias range: 1";
  dataset = "Average"
  hiddenactivation = "Sigmoid";
  outputactivation = "Sigmoid";
  currentlayer = "hidden";
  SetAct(hiddenactivation,window[hiddenactivation],window["Dx" + hiddenactivation]);
  currentlayer = "output";
  SetAct(outputactivation,window[outputactivation],window["Dx" + outputactivation]);
  createready = true;
}

function Create(quickset=false,imp=false) {
  let createbutton = document.getElementById("createbutton");
  let editbuttons = document.getElementById("editbuttons");
  let createdbuttons = document.getElementById("createdbuttons");
  let editdisplay = document.getElementById("editdisplay");
  let createddisplay = document.getElementById("createddisplay");
  let trainbutton = document.getElementById("training");
  let drawcontainer = document.getElementById('drawingdiv');
  let trainstatus = document.getElementById("trainingstatus");
  if (imp) {
    mode = "edit";
    HandleImport();
  }
  if (mode == "edit") {
    if (quickset) {
      Quickset();
    } else if (!imp) {
      SetInputs();
    } 
    if (createready) {
      if (currenttab !== undefined) {
        document.getElementById(currenttab).style.display = "none";
        currenttab = undefined;
      }
      FillColor("White");
      createbutton.innerHTML = "Edit";
      createbutton.style.borderColor = "White";
      createbutton.style.color = "White";
      editbuttons.style.display = "none";
      createdbuttons.style.display = "inline";
      editdisplay.style.display = "none";
      if (showstatus) createddisplay.style.display = "flex";
      if (dataset == "MNIST") {
        if (images == undefined || labels == undefined) {
          trainingstatus.style.color = "Red"
          trainingstatus.innerHTML = "Wait for Dataset";
          LoadMNIST();
          if (!showimage) Toggle2('imagedisplay','imagetoggle','Image');
          CreatePixels();
          CreateDrawPixels();
        }
        drawcontainer.style.display = "flex";
      } else {
        drawcontainer.style.display = "none";
      }
      document.getElementById("graphtab").style.display = "none";
      clearGraph();
      mode = "created";
    } else {
      Warn("createbutton","Create","Not Ready",false);
    }
  } else {
    Confirm("createbutton",ToggleEdit,"Edit",undefined,"created");
  }
}

function ToggleEdit() {
  let createbutton = document.getElementById("createbutton");
  let editbuttons = document.getElementById("editbuttons");
  let createdbuttons = document.getElementById("createdbuttons");
  let editdisplay = document.getElementById("editdisplay");
  let createddisplay = document.getElementById("createddisplay");
  let trainbutton = document.getElementById("training");
  let drawcontainer = document.getElementById('drawingdiv');
  createbutton.innerHTML = "Create";
  createbutton.style.borderColor = "White";
  createbutton.style.color = "White";
  editbuttons.style.display = "inline";
  createdbuttons.style.display = "none";
  if (showstatus) editdisplay.style.display = "flex";
  createddisplay.style.display = "none";
  trainbutton.innerHTML = "Start Train";
  trainbutton.style.borderColor = "White";
  trainbutton.style.color = "White";
  drawcontainer.style.display = "none";
  document.getElementById("initialbiases").innerHTML = "Biases: ";
  document.getElementById("initialweights").innerHTML = "Weights: ";
  SetInputs();
  mode = "edit";
}


function ChangeStructure(update=true) {
  SetStructure();
  InitializeValues();
  if (structureready) {
    structure.push(0);
    if (structure != previousstructure) {
      DeleteNN();
      DrawNN();
      previousstructure = structure;
    }
  }
  if (update) UpdateStatus();
}

function SetParameter(inputid,id,text,update=true) {
  let input = document.getElementById(inputid).value;
  let display = document.getElementById(id);
  if (input !== undefined && input.trim() !== "") {
    display.innerHTML = text + ": " + input;
    if (input > 0) {
      parameterscomplete++;
      switch (inputid) {
        case "learnrate":
          learnrate = Number(input);
          break;
        case "neuronrange":
          neuronrange = Number(input);
          break;
        case "weightrange":
          weightrange = Number(input);
          break;
        case "biasrange":
          biasrange = Number(input);
          break;
        default:
          break;
      }
      display.style.color = "White";
    } else {
      display.style.color = "Red";
      parametererror = true;
    }
  }
  if (update) UpdateStatus();
}

function UpdateStatus() {
  let createbutton = document.getElementById("createbutton");
  let display = document.getElementById("parameterstatus");
  let display2 = document.getElementById("structurestatus");
  let display3 = document.getElementById("readystatus");
  if (parametererror) {
    display.innerHTML = "ERROR: Invalid Parameters";
    display.style.color = "Red";
  } else {
    switch (parameterscomplete) {
      case 0:
        display.innerHTML = "Missing Parameters";
        display.style.color = "Red";
        break;
      case 4:
        display.innerHTML = "Parameters OK";
        display.style.color = "Lime";
        parametersready = true;
        break;
      default:
        display.innerHTML = "Incomplete Parameters (" + parameterscomplete + "/4)";
        display.style.color = "Yellow";
        break;
    }
  }
  display3.innerHTML = "";
  createbutton.style.borderColor = "White";
  createbutton.style.color = "White";
  if (structureready) {
    if (parametersready) {
      createready = true;
      FillColor("Lime");
      display3.innerHTML = "Ready for Creation";
      display3.style.color = "Lime";
      createbutton.style.borderColor = "Lime";
      createbutton.style.color = "Lime";
    } else {
      FillColor("Red");
    }
  }
}

function SetInputs() {
  if (istraining) {
    clearInterval(training);
    clearInterval(updategraph);
    updategraph = undefined;
    training = undefined;
    istraining = false;
  }
  traincount = 0;
  createready = false;
  parametersready = false;
  structureready = false;
  ChangeStructure(false);
  parameterscomplete = 0;
  parametererror = false;
  SetParameter("learnrate","learnratedisplay","Learning Rate",false);
  SetParameter("neuronrange","neuronrangedisplay","Neuron Range",false);
  SetParameter("weightrange","weightrangedisplay","Weight Range",false);
  SetParameter("biasrange","biasrangedisplay","Bias Range",false);
  UpdateStatus();
//  l1strength = document.getElementById("L1strength").value;
//  l2strength = document.getElementById("L2strength").value;

}

function InitializeValues(imp=false) {
  neuroncount = 0;
  weightcount = 0;
  structure2 = [0];
  structure2b = [0];
  structure3 = [0];
  hideneurons = [];

  for (let i=0; i<layers; i++) {
    neuroncount += structure[i];
    structure2.push(neuroncount);
    if (i!=0) structure2b.push(neuroncount-structure[0]);
    if (structure[i]>12) {
      hideneurons.push(true);
    } else {
      hideneurons.push(false);
    }
    if (i>0) { 
      weightcount += structure[i] * structure[i-1];
      structure3.push(weightcount);
    }
  }
  hideneurons.push(hideneurons[layers-1]);
  structure2.push(neuroncount+1);
  structure2b.push(neuroncount-structure[0]+1);
  structure3.push(weightcount+1);

  neurons = new Float32Array(neuroncount).fill(0);
  neurons2 = new Float32Array(neuroncount-structure[0]+1).fill(0);
  if (!imp) {
    weights = new Float32Array(weightcount+1).fill(0);
    biases = new Float32Array(neuroncount-structure[0]+1).fill(0);
  }
  targets = new Float32Array(structure[layers-1]).fill(0);
  costcache = new Float32Array(neuroncount-structure[0]+1).fill(0);
  activationcache = new Float32Array(neuroncount-structure[0]+1).fill(0);

  document.getElementById("neuroncount").innerHTML = "Neurons: " + neuroncount;
  document.getElementById("weightcount").innerHTML = "Weights: " + weightcount;
  document.getElementById("layercount").innerHTML = "Layers: " + layers;
}

function Toggle(id,c="Tab",type="inline",input=false) {
  if (input) SetInputs();
  if (currenttab !== id) {
    let tabs = document.getElementsByClassName(c);
    let i2 = tabs.length;
    for (let i = 0; i < i2; i++) {
      let tab = tabs[i];
      if (tab.id === id) {
        tab.style.display = type;
      } else {
        tab.style.display = "none";
      }
      if (id == "structure" && tab.id == "graphtab") tab.style.display = type;
    }
    currenttab = id;
  } else {
    document.getElementById(id).style.display = "none";
    currenttab = undefined;
  }
}

function Toggle2(id,buttonid,text) {
  let button = document.getElementById(buttonid);
  if (id == "MainDisplay") {
    if (mode == "edit") {
      id = "editdisplay";
    } else {
      id = "createddisplay";
    }
    let maindisp = document.getElementById(id);
    if (showstatus) {
      maindisp.style.display = "none";
      button.innerHTML = "S " + text;
      button.style.borderColor = "Red";
      button.style.color = "Red";
      showstatus = false;
    } else {
      maindisp.style.display = "flex";
      button.innerHTML = "H " + text;
      button.style.borderColor = "Lime";
      button.style.color = "Lime";
      showstatus = true;
    }
  } else {
    let element = document.getElementById(id);
    let boolean = true;
    if (element.style.display == "none") {
      boolean = true;
      element.style.display = "flex";
      button.innerHTML = "H " + text;
      button.style.borderColor = "Lime";
      button.style.color = "Lime";
    } else {
      boolean = false;
      element.style.display = "none";
      button.innerHTML = "S " + text;
      button.style.borderColor = "Red";
      button.style.color = "Red";
    }
    switch (id) {
      case "container":
        showcontainer = boolean;
        break;
      case "image":
        showimage = boolean;
        break;
      default:
        break;
    }
  }
}

function SetStructure() {
  let structureinput = document.getElementById("structureinput").value;
  let display = document.getElementById("structurestatus");
  let display2 = document.getElementById("structurecount");
  display2.style.color = "White";
  if (structureinput === undefined || structureinput.trim() === "") {
    display.innerHTML = "Missing Structure";
    display.style.color = "Red";
  } else {
    structure = structureinput.replace(/[{}]/g, '').split(',').map(item => parseInt(item));
    layers = structure.length;
    document.getElementById("structurecount").innerHTML = "Structure: " + JSON.stringify(structure);
    if (layers > 1) {
      display.innerHTML = "Structure OK";
      display.style.color = "Lime";
      structureready = true;
    } else {
      display.innerHTML = "ERROR: Malformed Structure";
      display.style.color = "Red";
      display2.style.color = "Red";
    }
  }
}

function Warn(id,text,text2,bypassmode=true) {
  let element = document.getElementById(id);
  element.innerHTML = text2;
  element.style.borderColor = "Red";
  element.style.color = "Red";
  setTimeout(() => {
    if (mode == "edit" || bypassmode) {
      element.innerHTML = text;
      element.style.borderColor = "White";
      element.style.color = "White";
    }
  },800)
}

function SubmitInputData() {
  if (!istraining) {
    let inputdata = document.getElementById("inputdata").value.replace(/[{}]/g, '').split(',').map(item => parseFloat(item));
    if (inputdata.length == structure[0]) {
      for (let i=0; i<structure[0]; i++) {
        neurons[i] = inputdata[i];
      }
      FeedForward();
      UpdateColor();
    } else {
      Warn("submitinputdata","Input","ERROR");
    }
  } else {
    Warn("submitinputdata","Input","TRAIN");
  }
}


function SubmitInitialization(input) {
  initialization = input;
}

function SubmitInitializationParameter() {
  let input = document.getElementById("initializationinput").value;
  initializationparameter = input;
}

function SetInitialization(parameter) {
  let func = window[initialization]
  if (parameter == "Biases") {
    document.getElementById("initialbiases").innerHTML = "Biases: "+initialization;
    biases = func(neuroncount-structure[0]+1,initializationparameter);
  }
  if (parameter == "Weights") {
    document.getElementById("initialweights").innerHTML = "Weights: "+initialization;
    weights = func(weightcount+1,initializationparameter);
  }
}

function SelectDataset(data,buttonid) {
  let button = document.getElementById(buttonid);
  if (data == "MNIST" && (structure[0] != 784 || structure[layers-1] != 10)) {
    ToggleHelp("mnisthelp");
    return;
  }
  if (data == "MNIST") {
    document.getElementById("imagetoggle").style.display = "block";
  } else {
    document.getElementById("imagetoggle").style.display = "none";
  }
  dataset = data
  button.style.color = "Lime";
  button.style.borderColor = "Lime";
  if (previousdataset && previousdataset != buttonid) {
    let previousbutton = document.getElementById(previousdataset);
    previousbutton.style.color = "White";
    previousbutton.style.borderColor = "White";
  }
  previousdataset = buttonid;
}

function ToggleHelp(id) {
  if (currenthelpdiv !== id && currenthelpdiv === undefined) {
    let helpdiv = document.getElementById(id);
    currenthelpdiv = id;
    helpdiv.style.display = "flex";
    setTimeout(() => document.addEventListener("click", HideHelp), 1)
  }
}

function HideHelp(event) {
  let helpdiv = document.getElementById(currenthelpdiv);
  if (!helpdiv.contains(event.target)) {
    helpdiv.style.display = "none";
    document.removeEventListener("click", HideHelp);
    currenthelpdiv = undefined;
  }
}


