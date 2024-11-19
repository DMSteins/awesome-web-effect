import React, { useRef, useEffect } from "react";
import * as THREE from 'three';
import fragmentShader from './shaders/noiseWater.fs?raw'
import vertexShader from './shaders/noiseWater.vs?raw'

export default ()=>{
    const scene = useRef<THREE.Scene>()
	const camera = useRef<THREE.PerspectiveCamera>()
	const renderer = useRef<THREE.WebGLRenderer>()
	const clock = useRef<THREE.Clock>()
	const material = useRef<THREE.ShaderMaterial>()
	const mesh = useRef<THREE.Mesh>()
	const particleMaterial = useRef<THREE.ShaderMaterial>()
	const fireMaterial = useRef<THREE.ShaderMaterial>()
	const renderBoxRef = useRef<HTMLDivElement>(null)
	const render = () => {
		if(!scene.current) return
		const time = clock.current!.getElapsedTime();
		material.current!.uniforms.uTime.value = time
		particleMaterial.current!.uniforms.uTime.value = time
		fireMaterial.current!.uniforms.uTime.value = time
		mesh.current!.rotation.y = time * 0.3;
		renderer.current!.render(scene.current!, camera.current!);
		requestAnimationFrame(render);
	}
	const init = () => {
		if(!renderBoxRef.current) return
		const w = window.innerWidth
		const h = window.innerHeight
		const _scene = new THREE.Scene()
		const _camera = new THREE.PerspectiveCamera(75, w/h, 0.01, 1000)
		_camera.position.set(0,0,4)
		_camera.lookAt(new THREE.Vector3())
		camera.current = _camera
		
		const _geometry = new THREE.SphereGeometry(1, 200, 200)

		const _material = new THREE.ShaderMaterial({
			// wireframe: true,
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
			uniforms: {
				uTime: {
					value: 0
				}
			}
		})
		const _mesh = new THREE.Mesh(_geometry, _material)
		_scene.add(_mesh)

		const particleGeometry = new THREE.BufferGeometry();

		const N = 4000;
		const positions = new Float32Array(N * 3);
		const inc = Math.PI * (3 - Math.sqrt(5));
		const off = 2 / N;
		const radius = 2;
		for (let i = 0; i < N; i++) {
			const k = i + 0.5;
			const phi = Math.acos(1 - (2 * k) / N);
			const theta = Math.PI * (1 + Math.sqrt(5)) * k;
			const x = Math.cos(theta) * Math.sin(phi) * radius;
			const y = Math.sin(theta) * Math.sin(phi) * radius;
			const z = Math.cos(phi) * radius;
		  
			positions.set([x, y, z], i * 3);
		}

		particleGeometry.setAttribute(
		"position",
		new THREE.BufferAttribute(positions, 3)
		);
		const particleVertex = /* GLSL */ `
		uniform float uTime;

		void main() {
			vec3 newPos = position;
			newPos.y += 0.1 * sin(newPos.y * 6.0 + uTime);
			vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
			gl_PointSize = 6.0 / -mvPosition.z;
			gl_Position = projectionMatrix * mvPosition;
		}
		`;

		const particleFragment = /* GLSL */ `
		void main() {
			// gl_FragColor = vec4(vec3(1.0), 1.0);
			gl_FragColor = vec4(vec3(1.0), 1.0);
		}
		`;
		const _particleMaterial = new THREE.ShaderMaterial({
			wireframe: true,
			vertexShader: particleVertex,
			fragmentShader: particleFragment,
			uniforms: {
				uTime: {
					value: 0
				}
			},
			transparent: true,
			blending: THREE.AdditiveBlending,
		})
		const particleMesh = new THREE.Points(particleGeometry, _particleMaterial)
		_scene.add(particleMesh)
		particleMaterial.current = _particleMaterial

		const firefliesGeometry = new THREE.BufferGeometry();
		const firefliesCount = 300;
		const positions1 = new Float32Array(firefliesCount * 3);
		const sizes = new Float32Array(firefliesCount);

		for (let i = 0; i < firefliesCount; i++) {
			const r = Math.random() * 5 + 5;
			positions1[i * 3 + 0] = (Math.random() - 0.5) * r;
			positions1[i * 3 + 1] = (Math.random() - 0.5) * r;
			positions1[i * 3 + 2] = (Math.random() - 0.5) * r;

			sizes[i] = Math.random() + 0.4;
		}

		firefliesGeometry.setAttribute(
		"position",
		new THREE.BufferAttribute(positions1, 3)
		);
		firefliesGeometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

		const firefliesVertexShader = /* GLSL */ `
			uniform float uTime;
			attribute float aSize;

			void main() {
				vec3 newPos = position;
				newPos.y += sin(uTime * 0.5 + newPos.x * 100.0) * aSize * 0.2;
				newPos.x += sin(uTime * 0.5 + newPos.x * 200.0) * aSize * 0.1;
				vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
				gl_PointSize = 70.0 * aSize / -mvPosition.z;
				gl_Position = projectionMatrix * mvPosition;
			}
		`;

		const firefliesFragmentShader = /* GLSL */ `
			void main() {
			float d = length(gl_PointCoord - vec2(0.5));
			float strength = clamp(0.05 / d - 0.05 * 2.0, 0.0, 1.0);
			gl_FragColor = vec4(vec3(1.0), strength);
		}
		`;
		const _fireMaterial = new THREE.ShaderMaterial({
			vertexShader: firefliesVertexShader,
			fragmentShader: firefliesFragmentShader,
			uniforms: {
				uTime: { value: 0 },
			},
			transparent: true,
			blending: THREE.AdditiveBlending,
			depthWrite: false,
		})
		fireMaterial.current = _fireMaterial
		const fireMesh = new THREE.Points(firefliesGeometry, _fireMaterial)

		_scene.add(fireMesh)

		const _renderer = new THREE.WebGLRenderer()
		_renderer.setPixelRatio(window.devicePixelRatio);
		_renderer.setSize(w, h);
		_renderer.setClearColor(0x0a0a0f, 1);
		_renderer.render(_scene, _camera)

		renderBoxRef.current.appendChild(_renderer.domElement)

		clock.current = new THREE.Clock()
		renderer.current = _renderer
		mesh.current = _mesh
		material.current = _material
		scene.current = _scene
		camera.current = _camera
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