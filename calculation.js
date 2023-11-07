let training;
let traincount;


function Activation(input) {
  return 1 / (1 + (Math.E ** (-1 * input)))
}

function DerivativeActivation(input) {
  return Activation(input) * (1 - Activation(input))
}

function ManualFF() {
  for (let i=0; i<structure[0]; i++) {
    neurons[0][i] = document.getElementById("input " + i).value
  }
  FeedForward()
}

function FeedForward() {
  let sum;
  for (let i=0; i<layers; i++) {
    for (let j=0; j<structure[i+1]; j++) {
      sum = 0
      for (let k=0; k<structure[i]; k++) {
        sum += weights[i+1][j][k] * neurons[i][k]
      }
      sum += biases[i+1][j]
      neurons[i+1][j] = Activation(sum)
    }
  }
}

function SetTarget() {
  for (let i=0; i<structure[layers-1]; i++) {
    targets[i] = (Math.Round(neurons[0][1]) + Math.Round(neurons[0][0])) / 2
  }
}

function NeuronCost(i,j) {
  if (i == layers-1) {
    return 2 * (targets[j] - neurons[i][j])
  }
  let sum = 0;
  for (let k=0; k<structure[i+1]; k++) {
    sum += weights[i+1] * DerivativeActivation(neurons2[i+1][j]) * NeuronCost(i+1,j)
  }
  return sum
}

function WeightCost(i,j,k) {
  return neurons[i-1][k] * DerivativeActivation(neurons2[i][j]) * NeuronCost(i,j)
}

function BiasCost(i,j) {
  return DerivativeActivation(neurons2[i][j]) * NeuronCost(i,j)
}

function Backprop() {
  RandomizeInput()
  FeedForward()
  SetTarget()
  for (let i=0; i<layers; i++) {
    for (let j=0; j<structure[i+1]; j++) {
      biases[i+1][j] -= learnrate * BiasCost(i+1,j)
      biases[i+1][j] = Math.min(1, Math.max(-1, biases[i+1][j]))
      for (let k=0; k<structure[i]; k++) {
        weights[i+1][j][k] -= learnrate * WeightCost(i+1,j,k)
        weights[i+1][j][k] = Math.min(1, Math.max(-1, weights[i+1][j][k]))
      }
    }
  }
  UpdateColor()
  traincount += 1
  document.getElementById("trainingcount").innerHTML = traincount
}

function ToggleTraining() {
  if (training) {
    document.getElementById("training").innerHTML = "Start training"
    clearInterval(training);
    training = undefined;
  } else {
    document.getElementById("training").innerHTML = "Stop training"
    training = setInterval(Backprop, 200);
  }
}

function Train100() {
  for (let i=0; i<100; i++) {
    Backprop()
  }
}
