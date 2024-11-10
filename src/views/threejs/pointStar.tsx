import React, { useRef, useEffect } from "react";
import * as THREE from 'three';
import { OrbitControls } from "three/addons";

// 星球
export default () => {
	const scene = useRef<THREE.Scene>()
	const camera = useRef<THREE.PerspectiveCamera>()
	const renderer = useRef<THREE.WebGLRenderer>()
	const controls = useRef<OrbitControls>()
	const clock = useRef<THREE.Clock>()
	const sphereMaterial = useRef<THREE.ShaderMaterial>()
	const sphere = useRef<THREE.Points>()

	const renderBoxRef = useRef<HTMLDivElement>(null)
	const render = () => {
		if(!scene.current) return
		const time = clock.current!.getElapsedTime() * 0.3;
		sphereMaterial.current!.uniforms.uTime.value = time
		sphere.current!.rotation.y = time;
		renderer.current!.render(scene.current!, camera.current!);
		requestAnimationFrame(render);
	}
	const init = () => {
		let w = window.innerWidth;
		let h = window.innerHeight;

		scene.current = new THREE.Scene();

		camera.current = new THREE.PerspectiveCamera(75, w / h, 0.01, 1000);
		camera.current.position.set(0, 0, 24);
		camera.current.lookAt(new THREE.Vector3());

		renderer.current = new THREE.WebGLRenderer({
			antialias: true,
			// alpha: true,
		});
		renderer.current.setPixelRatio(window.devicePixelRatio);
		renderer.current.setSize(w, h);
		renderer.current.setClearColor(0x0a0a0f, 1);
		renderBoxRef.current?.appendChild(renderer.current.domElement);

		controls.current = new OrbitControls(camera.current, renderer.current.domElement);

		

		const vertexShader = /* GLSL */ `
  uniform float uTime;
//   varying vec2 vUv;
  varying vec3 vColor;

  void main() {

    // vUv = uv;

	vec3 color1 = vec3(227., 155., 0.);
  	vec3 color2 = vec3(100., 50., 255.);

	float d = position.y / 10.0 * 0.5 + 0.5;
	vColor = mix(color1, color2, d) / 255.0;
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
	// gl_PointSize = 10.0;
    gl_PointSize = 60.0 / -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

		const fragmentShader = /* GLSL */ `
//   varying vec2 vUv;
   varying vec3 vColor;
  void main() {
    // float color = step(0.5, vUv.x);
    // gl_FragColor = vec4(fract(vUv.x * 3.0), 0.0, 0.0, 1.0);
	float mask = step(length(gl_PointCoord - 0.5), 0.5);
  	if(mask < 0.5) discard;
	gl_FragColor = vec4(vColor, 1.);
  }
`;

		sphereMaterial.current = new THREE.ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms: {
				uTime: { value: 0 },
			},
			// wireframe: true,
		});
		// sphere.current = new THREE.Mesh(sphereGeometry, sphereMaterial.current);
		// const sphereGeometry = new THREE.IcosahedronGeometry(10, 6);
		const pos = []
		for (let i = 0; i < 10000; i++) {
			const rad = 9.5 + 0.5 * Math.random()
			const theta = Math.random() * Math.PI * 2;
			const angle = Math.PI * 2 * Math.random()
			const x = rad * Math.sin(angle) * Math.cos(theta)
			const y = rad * Math.cos(angle)
			const z = rad * Math.sin(angle) * Math.sin(theta)
			pos.push(x, y, z)
		}
		const sphereGeometry = new THREE.BufferGeometry()
		sphereGeometry.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3))
		sphere.current = new THREE.Points(sphereGeometry, sphereMaterial.current)
		scene.current.add(sphere.current);

		clock.current = new THREE.Clock();
		render()

	}
	useEffect(() => {
		if(scene.current) return
		init()
	}, [])

	return (
		<div ref={renderBoxRef} className="absolute left-0 top-0 right-0 h-full">

		</div>
	)
}
