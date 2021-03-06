// Code from Eloquent JavaScript

var roads = [
  "Alice's House-Bob's House",   "Alice's House-Cabin",
  "Alice's House-Post Office",   "Bob's House-Town Hall",
  "Daria's House-Ernie's House", "Daria's House-Town Hall",
  "Ernie's House-Grete's House", "Grete's House-Farm",
  "Grete's House-Shop",          "Marketplace-Farm",
  "Marketplace-Post Office",     "Marketplace-Shop",
  "Marketplace-Town Hall",       "Shop-Town Hall"
];

function buildGraph(edges) {
  let graph = Object.create(null);
  function addEdge(from, to) {
    if (graph[from] == null) {
      graph[from] = [to];
    } else {
      graph[from].push(to);
    }
  }
  for (let [from, to] of edges.map(r => r.split("-"))) {
    addEdge(from, to);
    addEdge(to, from);
  }
  return graph;
}

var roadGraph = buildGraph(roads);

var VillageState = class VillageState {
  constructor(place, parcels) {
    this.place = place;
    this.parcels = parcels;
  }

  move(destination) {
    if (!roadGraph[this.place].includes(destination)) {
      return this;
    } else {
      let parcels = this.parcels.map(p => {
        if (p.place != this.place) return p;
        return {place: destination, address: p.address};
      }).filter(p => p.place != p.address);
      return new VillageState(destination, parcels);
    }
  }
}

function randomPick(array) {
  let choice = Math.floor(Math.random() * array.length);
  return array[choice];
}

VillageState.random = function(parcelCount = 5) {
  let parcels = [];
  for (let i = 0; i < parcelCount; i++) {
    let address = randomPick(Object.keys(roadGraph));
    let place;
    do {
      place = randomPick(Object.keys(roadGraph));
    } while (place == address);
    parcels.push({place, address});
  }
  return new VillageState("Post Office", parcels);
};

function findRoute(graph, from, to) {
  let work = [{at: from, route: []}];
  for (let i = 0; i < work.length; i++) {
    let {at, route} = work[i];
    for (let place of graph[at]) {
      if (place == to) return route.concat(place);
      if (!work.some(w => w.at == place)) {
        work.push({at: place, route: route.concat(place)});
      }
    }
  }
}

function goalOrientedRobot({place, parcels}, route) {
  if (route.length == 0) {
    let parcel = parcels[0];
    if (parcel.place != place) {
      route = findRoute(roadGraph, place, parcel.place);
    } else {
      route = findRoute(roadGraph, place, parcel.address);
    }
  }
  return {direction: route[0], memory: route.slice(1)};
}


// Solution to problem

function improvedGoalOrientedRobot({place, parcels}, route) {
  if (route.length == 0) {
    let newRoute;
    for (let parcel of parcels) {
      if (parcel.place != place) {
        newRoute = findRoute(roadGraph, place, parcel.place);
        goPickUp = true;
      } else {
        newRoute = findRoute(roadGraph, place, parcel.address);
        goPickUp = false;
      }
      if (route.length == 0) {
        route = newRoute;
      } else if (newRoute.length < route.length) {
        route = newRoute;
      } else if (newRoute.length == route.length && goPickUp) {
        route = newRoute;
      }
    }
  }
  return {direction: route[0], memory: route.slice(1)};
}

function countRobotSteps(state, robot, memory) {
  for (let step = 0;; step++) {
    if (state.parcels.length == 0) {
      return step;
    }
    let action = robot(state, memory);
    state = state.move(action.direction);
    memory = action.memory;
  }
}

function compareRobots(robot1, memory1, robot2, memory2) {
  let robot1Steps = 0;
  let robot2Steps = 0;
  const turns = 100;

  for (let turn = 0; turn < turns; turn++) {
    let state = VillageState.random();
    robot1Steps += countRobotSteps(state, robot1, memory1);
    robot2Steps += countRobotSteps(state, robot2, memory2);
  }

  console.log(robot1.name + " average steps: " + robot1Steps / turns);
  console.log(robot2.name + " average steps: " + robot2Steps / turns);
}


compareRobots(goalOrientedRobot, [], improvedGoalOrientedRobot, []);
