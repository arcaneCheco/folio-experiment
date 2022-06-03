import * as CANNON from "cannon";

export default class Physics {
  constructor() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, 0, -9.82); // m/s²
    let radius = 1; // m
    this.sphereBody = new CANNON.Body({
      mass: 5, // kg
      position: new CANNON.Vec3(0, 0, 10), // m
      shape: new CANNON.Sphere(radius),
    });
    this.world.addBody(this.sphereBody);
  }
}

// // Setup our world
// var world = new CANNON.World();
// world.gravity.set(0, 0, -9.82); // m/s²

// // Create a sphere
// var radius = 1; // m
// var sphereBody = new CANNON.Body({
//    mass: 5, // kg
//    position: new CANNON.Vec3(0, 0, 10), // m
//    shape: new CANNON.Sphere(radius)
// });
// world.addBody(sphereBody);

// // Create a plane
// var groundBody = new CANNON.Body({
//     mass: 0 // mass == 0 makes the body static
// });
// var groundShape = new CANNON.Plane();
// groundBody.addShape(groundShape);
// world.addBody(groundBody);

// var fixedTimeStep = 1.0 / 60.0; // seconds
// var maxSubSteps = 3;

// // Start the simulation loop
// var lastTime;
// (function simloop(time){
//   requestAnimationFrame(simloop);
//   if(lastTime !== undefined){
//      var dt = (time - lastTime) / 1000;
//      world.step(fixedTimeStep, dt, maxSubSteps);
//   }
//   console.log("Sphere z position: " + sphereBody.position.z);
//   lastTime = time;
// })();
