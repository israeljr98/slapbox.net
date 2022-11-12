import './style.css'
import * as THREE from 'three';

import { AmbientLight } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
// import { LoadingManager } from 'three/examples/jsm/loaders/LoadingManager.js';


// SOUNDCLOUD CODE
var coverArt = "";
window.onload = function () {
  var firstSlapRetrieved = false;
  var myPlayer = {};
  myPlayer.playlistInfo;
  var iframeElement = document.querySelector(".sc-test");
  let flag = false;

  myPlayer.player = SC.Widget(iframeElement);
  function tryGetSounds() {
    myPlayer.player.getSounds(function (ret) {
      var notComplete = false;
      for (var i = 0, len = ret.length; i < len; i++) {
        if (ret[i].title === undefined) {
          notComplete = true;
          break;
        }
      }
      if (notComplete) {
        console.log("Not complete. Try again in 500ms ...");
        setTimeout(function () {
          tryGetSounds();
        }, 500);
      } else {
        console.log("Complete!");
        flag = true;
        myPlayer.playlistInfo = ret;
        console.log(myPlayer.playlistInfo);
      }
    });
  }
  myPlayer.player.bind(SC.Widget.Events.READY, function () {
    tryGetSounds();
  });

  myPlayer.player.bind(SC.Widget.Events.FINISH, function () {
    getSlap();
  });



  function getSlap() {
    if (flag) {
      let songListLength = myPlayer.playlistInfo.length;
      let songIndex = Math.floor(Math.random() * songListLength);
      let chosenSong = myPlayer.playlistInfo[songIndex];
      let songTitle = chosenSong.title;
      coverArt = chosenSong.artwork_url;
	  document.getElementById("songTitle").style.color = "#fafafb";
	  document.getElementById("songTitle").style.display = "block";
      document.getElementById("songTitle").innerHTML = songTitle;
      let artistName = chosenSong.publisher_metadata.artist;
	  document.getElementById("artistName").style.color = "#fafafb";
	  document.getElementById("artistName").style.display = "block";
	  
      if (artistName === undefined || artistName === "") {
        let userName = chosenSong.user.username;
        document.getElementById("artistName").innerHTML = userName;
      } else {
        document.getElementById("artistName").innerHTML = artistName;
      }
      
      loadTexture(coverArt, plane3);
	  
	  firstSlapRetrieved = true;
	  meshClicked = false;
      myPlayer.player.skip(songIndex);
      prevSong();
      myPlayer.player.play();
	 
	  // document.getElementById("get-slap").disabled = true;
	  document.getElementById("get-slap").style.visibility = "hidden";
	  setTimeout(function() {
		  // document.getElementById("get-slap").disabled = false;
		  document.getElementById("get-slap").style.visibility = "visible";
		  
	  }, 12000);
      
	  return myPlayer.playlistInfo;
    } else {
      console.log("flag not changed, wait 1500ms");
      setTimeout(function () {
        getSlap();
      }, 1500);
    }
  }

  function playSong() {
    myPlayer.player.toggle();
  }

  function prevSong() {
    myPlayer.player.seekTo(0);
    // myPlayer.player.prev();
  }

  const bangerButton = document.getElementById("get-slap");
  const playButton = document.getElementById("play");
  const prevButton = document.getElementById("prev");

  bangerButton.addEventListener("click", getSlap);
  playButton.addEventListener("click", playSong);
  document.addEventListener('keydown', event => {
    if (event.code === 'Space' || event.code == 119) {
      playSong();
    }
  })
  prevButton.addEventListener("click", prevSong);



// THREE JS CODE




const scene = new THREE.Scene();

// const axesHelper = new THREE.AxesHelper( 45 );
// scene.add( axesHelper );

// Draws a 2-Dimensional grid along the scene
// const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(lightHelper, gridHelper);


const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const clock = new THREE.Clock();

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
  antialias: true,
  
});

// Make renderer background transparent
// renderer.setClearColor(0x000000, 0);

renderer.setPixelRatio(window.devicePixelRatio);

// sets renderer size to match the window's dimensions
renderer.setSize(window.innerWidth, window.innerHeight);

// Moves the camera's position away from the middle of the scene along the Z-axis
camera.position.setZ(20);

// Creates a projector object that will help with making the meshes clickable.
const projector = new THREE.Raycaster();


const geometry = new RoundedBoxGeometry(10, 10, 10, 6, 2);




const loadingManager = new THREE.LoadingManager();
loadingManager.onLoad = () => {
	var loadingScreen = document.getElementById( 'loading-screen' );
	loadingScreen.classList.add( 'fade-out' );
	
	// optional: remove loader from DOM via event listener
	loadingScreen.addEventListener( 'transitionend', onTransitionEnd );
};

function onTransitionEnd( event ) {

	const element = event.target;
	element.remove();
	
}


// Loads the reflective glass texture on the cube
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();
const hdrEquirect = new RGBELoader(loadingManager).load(
  "empty_warehouse_01_4k.hdr",  
  () => { 
    hdrEquirect.mapping = THREE.EquirectangularReflectionMapping; 
	
	
  }
);

// var hdrFile = "empty_warehouse_01_4k.hdr";
// var loader = new RGBELoader();
// let em;
// loader.setDataType(THREE.UnsignedByteType);
// loader.load(hdrFile, function(texture) {

//     console.log("i'am here!!!!!");

//     em = pmremGenerator.fromEquirectangular(texture).texture;

    // scene.background = envMap; 
    // scene.environment = envMap;

//     texture.dispose();
//     pmremGenerator.dispose();

// });

const material = new THREE.MeshPhysicalMaterial({  
  roughness: 0.07,  
  transmission: 1, // Add transparency
  thickness: 1.5,
  envMap: hdrEquirect,
});


const slapbox = new THREE.Mesh(geometry, material);


const planeGeo3 = new THREE.PlaneGeometry(7, 7);
var texture = new THREE.TextureLoader().load( 'Musicnote.JPG' );

const material3 = new THREE.MeshBasicMaterial( { 
  map: texture, 
  side: THREE.DoubleSide,
  alphaTest: 0.5,
  color: 0xf6f7f9,
} );

const plane3 = new THREE.Mesh(planeGeo3, material3);
plane3.position.z -= 0;




const cubeWithPic = new THREE.Group();
cubeWithPic.add(slapbox);
cubeWithPic.add(plane3);
scene.add(cubeWithPic);

cubeWithPic.position.y += 4;


// Instantiates a three.js TextureLoader
const textureLoad = new THREE.TextureLoader();

// Applies cover art of song to plane as a texture
function loadTexture(path, object) {
  textureLoad.load(path, function(texture) {
    object.traverse(function(child) {

      if (child instanceof THREE.Mesh) {

        child.material.map = texture;
        child.material.needsUpdate = true;

      }

    });
  });
}





// Lighting that focuses on a specific point of an object
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(20, 20, 20);

// Shows the position of a point light
// const lightHelper = new THREE.PointLightHelper(pointLight);


// The domElement is there to listen to DOM events on the mouse
const controls = new OrbitControls(camera, renderer.domElement);


// Array(200).fill().forEach(addStar);


// Makes clicking on a mesh result in opening a page
function onMeshClick(event) {
  event.preventDefault();
  var vector = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  projector.setFromCamera(vector, camera);
  var intersects = projector.intersectObjects(scene.children);
  if (intersects.length > 0) {
	  if (firstSlapRetrieved) {
	  	playSong();
		meshClicked = !meshClicked;
	  }
  } else {
	  let title = document.getElementById("pageTitle");
	  let controls = document.getElementById("portrait-mode");
	  if (displayTitle) {
		  title.style.display = 'none';
		controls.style.display ='none';
		displayTitle = false;
	} else {
		// let sb = document.getElementById("pageTitle");
		title.style.display = 'initial';
		controls.style.display = 'initial';
		displayTitle = true;
	}
  }
}

var meshClicked = false;
var displayTitle = false;
document.getElementById('bg').addEventListener("click", onMeshClick, true);
// document.body.addEventListener("mousedown", onDocumentMouseDown, true);

function showGetSlapButton() {
  document.getElementById("get-slap").style.visibility = "visible";
}
setTimeout(showGetSlapButton, 9000); // after 5 secs

function render() {
  renderer.render(scene, camera);
}
function resizeWindow() {
  // Viewport width
  let vw = Math.max(
  	document.documentElement.clientWidth || 0,
  	window.innerWidth || 0);
	console.log(vw);
  if (vw > 750) {
	  // camera.lookAt(new THREE.Vector3(-5, 7, 21));
	  
	  // original working version 
	  // controls.target.set(-11.318335, 3.4107, 1.990321);
	  
	  // controls.target.set(0.51634, 10.3003, -4.142);
	  
	  // cube as background of text
	  // controls.target.set(-0.1723245, 3.195545, -5.558050);
	  
	  // cube as partial background of text
	  // controls.target.set(-0.54147, 2.60968, -4.23764);
	  // camera.position.set(1.05409, 7.1684, 14.1275);
	  
	  // Cube lies below most songs (long titles vary)
	  controls.target.set(-0.544716, 4.76390, -4.49967);
	  camera.position.set(2.53131, 7.153525, 15.106208);
	  controls.update();
  } else {
	  controls.target.set(0,0,0);
	  camera.position.setZ(20);
	  controls.update();
  }
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  
  
}
window.addEventListener('resize', () => {
  resizeWindow();
})
resizeWindow();

var currTime;







function animate() {
  requestAnimationFrame(animate);
  
  console.log("Controls vector: ")
  console.log(controls.target);
  console.log("Camera position: ");
  console.log(camera.position);
  // slapbox.rotation.x += 0.01;
  // slapbox.rotation.y += 0.001;
  // slapbox.rotation.z += 0.01;

  // Floats the cube around

  const time = clock.getElapsedTime();
  if (!meshClicked) {
	  
	  cubeWithPic.position.x = Math.sin(time) * 0.6;
	  cubeWithPic.rotation.x = Math.sin(time) * 0.2;
	  cubeWithPic.position.y = Math.cos(time) * 0.5 + 4;
	  cubeWithPic.rotation.y = Math.cos(time) * 0.3;
	  cubeWithPic.rotation.z = Math.cos(time) * 0.2;
  } else {
	  currTime = time;
  }

  controls.update();
  

  render();
  
}

animate();

};
