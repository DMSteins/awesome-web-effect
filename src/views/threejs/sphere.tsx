import React, { useRef, useEffect } from "react";
import * as THREE from 'three';
import { OrbitControls } from "three/addons";


export default () => {
	const scene = useRef<THREE.Scene>()
	const camera = useRef<THREE.PerspectiveCamera>()
	const renderer = useRef<THREE.WebGLRenderer>()
	const controls = useRef<OrbitControls>()
	const clock = useRef<THREE.Clock>()
	const sphereMaterial = useRef<THREE.ShaderMaterial>()
	const sphere = useRef<THREE.Mesh>()

	const renderBoxRef = useRef<HTMLDivElement>(null)
	const render = () => {
		if(!scene.current) return
		const time = clock.current!.getElapsedTime();
		sphereMaterial.current!.uniforms.uTime.value = time;
		sphere.current!.rotation.y = time;
		renderer.current!.render(scene.current!, camera.current!);
		requestAnimationFrame(render);
	}
	const init = () => {
		let w = window.innerWidth;
		let h = window.innerHeight;

		scene.current = new THREE.Scene();

		camera.current = new THREE.PerspectiveCamera(75, w / h, 0.01, 1000);
		camera.current.position.set(0, 0, 4);
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

		const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);

		const vertexShader = /* GLSL */ `
  uniform float uTime;

  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

		const fragmentShader = /* GLSL */ `
  void main() {
    gl_FragColor = vec4(vec3(1.0), 1.0);
  }
`;

		sphereMaterial.current = new THREE.ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms: {
				uTime: { value: 0 },
			},
			wireframe: true,
		});
		sphere.current = new THREE.Mesh(sphereGeometry, sphereMaterial.current);
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
