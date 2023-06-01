// Options
const particleCount = 10000;	
const particleSize = .3;
const defaultAnimationSpeed = 1, morphAnimationSpeed = 18, color = '#FFFFFF';
let texts = [];

//screen options
const triggers = document.getElementsByTagName('span');
const canvas = document.getElementById('topBar');

let renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize( canvas.offsetWidth, canvas.offsetHeight);
canvas.appendChild( renderer.domElement );

function fullScreen () {
	console.log(window.devicePixelRatio);
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( canvas.offsetWidth, canvas.offsetHeight);
}
window.addEventListener('resize', fullScreen, false)

//Create 3js scene
let scene = new THREE.Scene();

//create camera
let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 100;

let controls = new THREE.OrbitControls( camera );
controls.update();
let particles = new THREE.Geometry();
let pMaterial = new THREE.PointCloudMaterial({size: particleSize});

// Texts
let loader = new THREE.FontLoader();
let typeface = 'https://dl.dropboxusercontent.com/s/bkqic142ik0zjed/swiss_black_cond.json?';
let activeItem = 0;

loader.load( typeface, ( font ) => {
	Array.from(triggers).forEach((trigger, idx) => {
		texts[idx] = {};
		
		texts[idx].geometry = new THREE.TextGeometry( trigger.textContent, {
			font: font,
			size: window.innerWidth * 0.02,
			height: 4,
			curveSegments: 10,
		});
		
		THREE.GeometryUtils.center( texts[idx].geometry )
		texts[idx].particles = new THREE.Geometry();
		texts[idx].points = THREE.GeometryUtils.randomPointsInGeometry(texts[idx].geometry, particleCount);
		createVertices(texts[idx].particles, texts[idx].points)
		if (idx == 0) {
			morphTo(texts[idx].particles, trigger.dataset.color);
		}
	});
});

// Particles
for (let p = 0; p < particleCount; p++) {
	let vertex = new THREE.Vector3();
			vertex.x = 0;
			vertex.y = 0;
			vertex.z = 0;
	particles.vertices.push(vertex);
}

let particleSystem = new THREE.PointCloud(particles, pMaterial);
particleSystem.sortParticles = true;
scene.add(particleSystem);

// Animate
const normalSpeed = (defaultAnimationSpeed/100),fullSpeed = (morphAnimationSpeed/100)
let animationVars = {speed: normalSpeed, color: color, rotation: 0}

function createVertices (emptyArray, points) {
	for (let p = 0; p < particleCount; p++) {
		let vertex = new THREE.Vector3();
				vertex.x = points[p]['x'];
				vertex.y = points[p]['y'];
				vertex.z = points[p]['z'];
		emptyArray.vertices.push(vertex);
	}
}

function morphTo (newParticles, color = '#FFFFFF') {
	//word
	TweenMax.to(animationVars, 1, {ease: Power4.easeIn, speed: fullSpeed, onComplete: slowDown});
	//color
	TweenMax.to(animationVars, 5, {ease: Linear.easeNone, color: color});
	
	for (let i = 0; i < particles.vertices.length; i++){
		TweenMax.to(particles.vertices[i], 5, {
			ease: Elastic.easeOut.config( 0.1, .3), 
			x: newParticles.vertices[i].x,
			y: newParticles.vertices[i].y, 
			z: newParticles.vertices[i].z
		})
	}
	TweenMax.to(animationVars, 2, {ease: Elastic.easeOut.config( 0.1, .3), rotation: animationVars.rotation})
}
function slowDown () {
	TweenMax.to(animationVars, 0.3, {ease: Power2.easeOut, speed: normalSpeed, delay: 0.2});
}

function goNext(){
	activeItem++;
	if (activeItem >= texts.length) {
		activeItem = 0;
	}
	morphTo(texts[activeItem].particles, generateRandomBrightColor());
}

function generateRandomBrightColor(){
	let r = Math.floor(Math.random() * 255);
	let g = Math.floor(Math.random() * 255);
	let b = Math.floor(Math.random() * 255);
	
	let color = `rgb(${r}, ${g}, ${b})`;
	return color;
}

//run
function run() {
	particleSystem.rotation.y += animationVars.speed;
	particles.verticesNeedUpdate = true; 
	camera.lookAt( scene.position );
	
	particleSystem.material.color = new THREE.Color( animationVars.color );
	
	window.requestAnimationFrame( run );
	renderer.render( scene, camera );
}

run();