let weights = [0];
let neurons = [];
let neurons2 = [];
let biases = [0];
let structure = [];
let targets = [];
let layers;

let dropout;
let dropoutinput = [];
let dropoutprob;

// Batch normalisation variables
let batch = [];
let batchnormed = [];
let batchbeta = [0];
let batchgamma = [0];
let batchmean = [0];
let batchvar = [0];
let batchmeanmoving = [0];
let batchvarmoving = [0];
let batchsize;
let batchcount;
let batchnorm = false;

// Input variables
let learnrate;
let l1strength;
let l2strength;
let weightrange;
let biasrange;
let batchgammarange;
let batchbetarange;

// Visuals
let showneurons = "all";
let showbiases = true;
let showweights = true;
let weightcount = 0;

// Sub-layers in order: neurons2 (activation) batch (norm) batchnormed (shift) neurons


function DeleteGraph() {
  clearInterval(training);
  training = undefined;
  traincount = 0;
  weights = [0];
  neurons = [];
  neurons2 = [];
  biases = [0];
  structure = [];
  targets = [];
  layers = 0;
  batch = [];
  batchnormed = [];
  batchbeta = [0];
  batchgamma = [0];
  batchmean = [0];
  batchvar = [0];
  batchmeanmoving = [0];
  batchvarmoving = [0];
  batchsize = 0;
  batchcount = 0;
  weightcount = 0;
  let graph = document.getElementById("container");
  while (graph.hasChildNodes()) {
      graph.removeChild(graph.firstChild);
  }
  let field = document.getElementById("inputfield");
  while (field.hasChildNodes()) {
      field.removeChild(field.firstChild);
  }
}

function Color(value,type) {
  let valuerange;
  let red;
  let green;
  let blue;
  switch (type) {
    case "weight":
      valuerange = weightrange
      break;
    case "bias":
      valuerange = biasrange
      break;
    case "batchbeta":
      valuerange = batchbetarange
      break;
    case "batchgamma":
      valuerange = batchgammarange
      break;
  }
  if (type == "batchgamma") {
    if (value == 1) return `rgb(255, 255, 255)`
    let value2 = Math.log(value) / Math.log(valuerange)
    red = value2 > 0 ? 255 : Math.round(255 * (1 + value2));
    green = Math.round(255 * (1 - Math.abs(value2)));
    blue = value2 > 0 ? Math.round(255 * (1 - value2)) : 255;
  } else {
    if (value == 0) return `rgb(255, 255, 255)`
    let value3 = value / valuerange
    red = value > 0 ? 255 : Math.round(255 * (1 + value3));
    green = Math.round(255 * (1 - Math.abs(value3)));
    blue = value > 0 ? Math.round(255 * (1 - value3)) : 255;
  }
  return `rgb(${red}, ${green}, ${blue})`;
}

function Color2(value) {
  let brightness = Math.round(255 * value);
  return `rgb(${brightness}, ${brightness}, ${brightness})`;
}

function UpdateColor() {
  if (showneurons == "output") {
    let i2 = structure[layers-1]
    for (let i=0; i<i2; i++) {
      if (batchnorm) {
        neuronvalue = neurons[layers-1][i][0].toFixed(2) // To be improved
      } else {
        neuronvalue = neurons[layers-1][i].toFixed(2)
      }
      let neuron = document.getElementById("neuron " + (layers-1) + "," + i)
      neuron.style.backgroundColor = Color2(neuronvalue)
      let neuronvaluetext = document.getElementById("neuronvalue " + (layers-1) + "," + i)
      neuronvaluetext.innerHTML = neuronvalue
      if (neuronvalue > 0.5) {
        neuronvaluetext.style.color = `rgb(0,0,0)`
      } else {
        neuronvaluetext.style.color = `rgb(255,255,255)`
      }
    }
  } else {
  for (let i=0; i<layers; i++) {
    let j2 = structure[i]
    for (let j=0; j<j2; j++) {
      let neuronvalue;
      let gammavalue;
      let betavalue;
      if (batchnorm) {
        neuronvalue = neurons[i][j][0].toFixed(2) // To be improved
      } else {
        neuronvalue = neurons[i][j].toFixed(2)
      }
      let neuron = document.getElementById("neuron " + i + "," + j)
      neuron.style.backgroundColor = Color2(neuronvalue)
      let neuronvaluetext = document.getElementById("neuronvalue " + i + "," + j)
      neuronvaluetext.innerHTML = neuronvalue
      if (neuronvalue > 0.5) {
        neuronvaluetext.style.color = `rgb(0,0,0)`
      } else {
        neuronvaluetext.style.color = `rgb(255,255,255)`
      }
      if (batchnorm && i>0) {
        betavalue = batchbeta[i][j].toFixed(2)
        gammavalue = batchgamma[i][j].toFixed(2)
        let betatext = document.getElementById("betatext " + i + "," + j)
        let gammatext = document.getElementById("gammatext " + i + "," + j)
        betatext.style.color = Color(betavalue,"batchbeta")
        gammatext.style.color = Color(gammavalue,"batchgamma")
      } 
    }
    let j3 = structure[i+1]
    for (let j=0; j<j3; j++) { 
      if (showbiases) {
      let biasvalue = biases[i+1][j].toFixed(2)
      let neuron = document.getElementById("neuron " + (i+1) + "," + j)
      neuron.style.borderColor = Color(biasvalue,"bias")
      if (batchnorm) {
        let neuroncontainer = document.getElementById("neuroncontainer " + (i+1) + "," + j)
        neuroncontainer.style.borderColor = Color(biasvalue,"bias")
      }
      }
      if (showweights) {
      for (let k=0; k<j2; k++) {
        let weightvalue = weights[i+1][j][k].toFixed(2)
        let weight = document.getElementById("weight " + (i+1) + "," + j + "," + k)
        weight.style.backgroundColor = Color(weightvalue,"weight")
      }
      }
    }
  }
}
}

function ClearNeurons() {
  for (let i=1; i<layers; i++) {
    let j2 = structure[i]
    for (let j=0; j<j2; j++) {
      if (batchnorm) {
        for (let n=0; n<batchsize; n++) {
          neurons[i][j][n] = 0
        }
      } else {
        neurons[i][j] = 0
      }
    }
  }
}


function RandomizeInput() {
  ClearNeurons()
  let j2 = structure[0]
  for (let j=0; j<j2; j++) {
    if (batchnorm) {
      for (let n=0; n<batchsize; n++) {
        neurons[0][j][n] = Math.random();
      }
    } else {
      neurons[0][j] = Math.random();
    }
  }
}



function Randomize() {
  ClearNeurons()
//  for (let j=0; j<structure[0]; j++) {
   //   neurons[0][j] = Math.random();
//  }
  for (let i=0; i<layers; i++) {
    for (let j=0; j<structure[i+1]; j++) {
      biases[i+1][j] = (Math.random() * 2 - 1) * biasrange;
      if (batchnorm) {
        batchgamma[i+1][j] = Math.pow(batchgammarange,(Math.random() * 2 - 1));
        batchbeta[i+1][j] = (Math.random() * 2 - 1);
      }
      for (let k=0; k<structure[i]; k++) {
        weights[i+1][j][k] = (Math.random() * 2 - 1) * weightrange;
      }
    }
  }
}

function Typeset() {
  let object = document.getElementsByClassName("typeset")
  for (let i=0; i<object.length; i++) {
    MathJax.typeset([object[i]])
  }
}

function SetInputs() {
  let container = document.getElementById("container")
  let structureinput = document.getElementById("structure").value
  structure = structureinput.replace(/[{}]/g, '').split(',').map(item => parseInt(item));
  layers = structure.length
  document.getElementById("structuredisplay").innerHTML = "Structure: " + JSON.stringify(structure)
  structure.push(0)

  learnrate = Number(document.getElementById("learnrate").value)
  weightrange = document.getElementById("weightrange").value
  biasrange = document.getElementById("biasrange").value
  l1strength = document.getElementById("L1strength").value
  l2strength = document.getElementById("L2strength").value

  batchsize = document.getElementById("batchsize").value
  batchbetarange = document.getElementById("batchbetarange").value
  batchgammarange = document.getElementById("batchgammarange").value

  showweights = document.getElementById("showweights").checked
  showbiases = document.getElementById("showbiases").checked

  batchnorm = document.getElementById("batch").checked

  
if (document.getElementById("showneurons").checked == true) {
    showneurons = "all"
  } else {
    showneurons = "output"
  }
  
  hiddenactivation = String(document.getElementById("hiddenactivation").value).trim()
  outputactivation = String(document.getElementById("outputactivation").value).trim()
}

function CreateGraph() {
  DeleteGraph()
  SetInputs()
  SetTestArrays()
  let neuroncount = 0;
  for (let i=0; i<structure[0]; i++) {
    let input = document.createElement("input")
    input.className = "input"
    input.id = "input " + i
    document.getElementById("inputfield").appendChild(input)
  }
  
  for (let i=0; i<structure[layers-1]; i++) {
    if (batchnorm) {
      let subarray = [];
      for (let n=0; n<batchsize; n++) {
        subarray.push(0)
      }
      targets.push(subarray)
    } else {
      targets.push(0)
    }
  }
  
  for (let i=0; i<layers; i++) {
    let betasubarray = [];
    let gammasubarray = [];
    let meansubarray = [];
    let varsubarray = [];
    let movingmeansubarray = [];
    let movingvarsubarray = [];
    let batchsubarray = [];
    let batchnormedsubarray = [];
    let neuronssubarray = [];
    let neurons2subarray = [];
    let batchneuronssubarray = [];
    let batchneurons2subarray = [];
    let column;
    if (showneurons == "all") {
      document.getElementById("layers").innerHTML = "why"
    column = document.createElement("div")
    column.className = "column"
    column.id = "column " + i
    }
    let j2 = structure[i]
    for (let j=0; j<j2; j++) {
      let batchsubsubarray = [];
      let batchnormedsubsubarray = [];
      let neuronssubsubarray = [];
      let neurons2subsubarray = [];
      if (showneurons == "all" || i==layers-1) {
      let neuron = document.createElement("div")
      neuron.className = "neuron"
      neuron.id = "neuron " + i + "," + j
      let neuronvalue = document.createElement("span")
      neuronvalue.className = "neuronvalue"
      neuronvalue.id = "neuronvalue " + i + "," + j
      neuron.appendChild(neuronvalue)
      if (batchnorm && i>0) {
        let neuroncontainer = document.createElement("div")
        neuroncontainer.className = "neuroncontainer"
        neuroncontainer.id = "neuroncontainer " + i + "," + j
        let betatext = document.createElement("span")
        betatext.className = "neurontext"
        betatext.id = "betatext " + i + "," + j
        betatext.innerHTML = "$$ \\beta $$"
        neuroncontainer.appendChild(betatext)
        MathJax.typeset([betatext])
        let neurontext = document.createElement("span")
        neurontext.className = "neurontext"
        neurontext.innerHTML = ","
        neuroncontainer.appendChild(neurontext)
        let gammatext = document.createElement("span")
        gammatext.className = "neurontext"
        gammatext.id = "gammatext " + i + "," + j
        gammatext.innerHTML = "$$ \\gamma $$"
        neuroncontainer.appendChild(gammatext)
        MathJax.typeset([gammatext])
        neuron.appendChild(neuroncontainer)
      }
        if (showneurons == "all") {
          document.getElementById("layers").innerHTML = "is this"
          column.appendChild(neuron)
        } else {
          container.appendChild(neuron)
        }
      }
      if (batchnorm) {
        for (let n=0; n<batchsize; n++) {
          batchsubsubarray.push(0)
          batchnormedsubsubarray.push(0)
          neuronssubsubarray.push(0)
          neurons2subsubarray.push(0)
        }
        batchsubarray.push(batchsubsubarray)
        batchnormedsubarray.push(batchnormedsubsubarray)
        batchneuronssubarray.push(neuronssubsubarray)
        batchneurons2subarray.push(neurons2subsubarray)
      } else {
        neuronssubarray.push(0)
        neurons2subarray.push(0)
      }
      neuroncount += 1
    }
    if (showneurons == "all") {
      document.getElementById("layers").innerHTML = "notworking"
      container.appendChild(column)
    }
    if (batchnorm) {
      if (i < layers-1) {
        let j3 = structure[i+1]
        for (let j=0; j<j3; j++) {
          betasubarray.push(0)
          gammasubarray.push(1)
          meansubarray.push(0)
          varsubarray.push(0)
          movingmeansubarray.push(0)
          movingvarsubarray.push(0)
        }
        batchbeta.push(betasubarray)
        batchgamma.push(gammasubarray)
        batchmean.push(meansubarray)
        batchvar.push(varsubarray)
        batchmeanmoving.push(movingmeansubarray)
        batchvarmoving.push(movingvarsubarray)
      } 
      batch.push(batchsubarray)
      batchnormed.push(batchnormedsubarray)
      neurons.push(batchneuronssubarray)
      neurons2.push(batchneurons2subarray)
    } else {
      neurons.push(neuronssubarray)
      neurons2.push(neurons2subarray)
    }
  }
  
  for (let i=0; i<layers-1; i++) {
    let subarray = [];
    let subarray2 = [];
    let j2 = structure[i+1]
    for (let j=0; j<j2; j++) {
      let subsubarray = [];
      subarray2.push(0)
      let k2 = structure[i]
      for (let k=0; k<k2; k++) {
        if (showweights) {
        let weight = document.createElement("div")
        weight.className = "weight"
        weight.id = "weight " + (i+1) + "," + j + "," + k
        let neuron1 = document.getElementById("neuron " + i + "," + k)
        let neuron2 = document.getElementById("neuron " + (i+1) + "," + j)
        const x1 = neuron1.offsetLeft + neuron1.offsetWidth / 2;
        const y1 = neuron1.offsetTop + neuron1.offsetHeight / 2;
        const x2 = neuron2.offsetLeft + neuron2.offsetWidth / 2;
        const y2 = neuron2.offsetTop + neuron2.offsetHeight / 2;

        const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const centerX = (x1 + x2) / 2;
        const centerY = (y1 + y2) / 2;

        weight.style.width = length + "px";
        weight.style.transform = `rotate(${angle}rad)`;
        weight.style.left = centerX - (length / 2) + "px";
        weight.style.top = centerY + "px";
        document.getElementById("container").appendChild(weight)
        }
        subsubarray.push(0)
        weightcount += 1
      }
      subarray.push(subsubarray)
    }
    weights.push(subarray)
    biases.push(subarray2)
  }
  document.getElementById("neuroncount").innerHTML = "Number of neurons: " + neuroncount
  document.getElementById("weightcount").innerHTML = "Number of weights: " + weightcount
  document.getElementById("layercount").innerHTML = "Number of layers: " + layers
}


