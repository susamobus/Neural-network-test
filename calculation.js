
function Activation(input) {
  return 1 / (1 + (Math.E ** (-1 * input)))
}

function DerivativeActivation(input) {
  return Activation(input) * (1 - Activation(input))
}

function ForwardPass() {
  let sum;
  for (let i=0; i<layers; i++) {
    for (let j=0; j<structure[i+1]; j++) {
      sum = 0
      for (let k=0; k<structure[i]; k++) {
        sum += weights[i+1][j][k] * neurons[i][k]
      }
      sum += biases[i+1][j]
      document.getElementById("layers").innerHTML = "broken"
      neurons[i+1][j] = Activation(sum)
    }
  }
  UpdateColor()
}

function NeuronCost(i,j) {
  if (i == layers-1) {
    return 2* (targets[j] - neurons[i][j])
  }
  let sum = 0;
  for (k=0; k<structure[i+1]; k++) {
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
}

