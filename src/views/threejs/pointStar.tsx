import React, { useRef, useEffect } from "react";
import * as THREE from 'three';
import { OrbitControls } from "three/addons";
import { div } from "three/webgpu";

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
		const time = clock.current!.getElapsedTime();
		sphereMaterial.current!.uniforms.uTime.value = time
		sphere.current!.rotation.y = time * 0.01;
		renderer.current!.render(scene.current!, camera.current!);
		requestAnimationFrame(render);
	}
	const init = () => {
		let w = window.innerWidth;
		let h = window.innerHeight;

		scene.current = new THREE.Scene();

		camera.current = new THREE.PerspectiveCamera(75, w / h, 0.01, 1000);
		camera.current.position.set(0, 3, 24);
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
  attribute float aSize;
  attribute vec4 aShift;

  const float PI = 3.1415925;

  void main() {

    // vUv = uv;

	vec3 color1 = vec3(227., 155., 0.);
  	vec3 color2 = vec3(100., 50., 255.);

	float d = position.y / 10.0 * 0.5 + 0.5;
	vColor = mix(color1, color2, d) / 255.0;

	vec3 transformed = position;
	float theta = mod(aShift.x + aShift.z * uTime, PI * 2.);
	float phi = mod(aShift.y + aShift.z * uTime, PI * 2.);
	transformed += vec3(sin(phi) * cos(theta), cos(phi), sin(phi) * sin(theta)) * aShift.w;
    
    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
	// gl_PointSize = 10.0;
    gl_PointSize = aSize * 60.0 / -mvPosition.z;
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
			transparent: true,
			blending: THREE.AdditiveBlending,  //粒子重叠后的颜色会变白发亮
    		depthTest: false,
		});
		// sphere.current = new THREE.Mesh(sphereGeometry, sphereMaterial.current);
		// const sphereGeometry = new THREE.IcosahedronGeometry(10, 6);
		const pos = []
		const sizes = [];
		const shifts = [];
		for (let i = 0; i < 20000; i++) {
			const rad = 9.5 + 0.5 * Math.random()
			const theta = Math.random() * Math.PI * 2;
			// const angle = Math.PI * 2 * Math.random() // 两极密集
  			let angle = Math.acos(Math.random() * 2 - 1); // 分布更均匀
			// const x = rad * Math.sin(angle) * Math.cos(theta)
			// const y = rad * Math.cos(angle)
			// const z = rad * Math.sin(angle) * Math.sin(theta)
			// pos.push(x, y, z)

			

			const smallAngle = (Math.random() * 0.9 + 0.1) * Math.PI * 0.1;
			const strength = Math.random() * 0.9 + 0.1; // 0.1-1
			shifts.push(theta, angle, smallAngle, strength);

			let size = Math.random() * 1.5 + 0.5; // 0.5-2.0
			sizes.push(size);

			if(i < 10000){
				let { x, y, z } = new THREE.Vector3()
				.randomDirection()
				.multiplyScalar(rad);
				pos.push(x, y, z);
				
			}else{
				// 圆盘粒子
				let r = 10;
				let R = 40;
				let rand = Math.pow(Math.random(), 1.5);
				let radius = Math.sqrt(R * R * rand + (1 - rand) * r * r);
				let { x, y, z } = new THREE.Vector3().setFromCylindricalCoords(
				  radius,
				  Math.random() * 2 * Math.PI,
				  (Math.random() - 0.5) * 2
				);
				pos.push(x, y, z);
			}
			
		}
		const sphereGeometry = new THREE.BufferGeometry()
		sphereGeometry.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3))
		sphereGeometry.setAttribute("aSize", new THREE.Float32BufferAttribute(sizes, 1))
		sphereGeometry.setAttribute("aShift", new THREE.Float32BufferAttribute(shifts, 4))
		sphere.current = new THREE.Points(sphereGeometry, sphereMaterial.current)
		sphere.current.rotation.order = "ZYX";
		sphere.current.rotation.z = 0.2;
		scene.current.add(sphere.current);

		clock.current = new THREE.Clock();
		render()

	}
	useEffect(() => {
		if(scene.current) return
		init()
	}, [])

	return (
		<div>
			<div ref={renderBoxRef} className="absolute left-0 top-0 right-0 h-full"></div>
			<div className="absolute z-10 right-2 bottom-2 text-xs">来源 <a className="underline" href="https://juejin.cn/post/7358704808525971475" target="__blank">古柳大佬</a></div>
		</div>
		
	)
}
