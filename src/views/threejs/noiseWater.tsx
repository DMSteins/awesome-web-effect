import React, { useRef, useEffect } from "react";
import * as THREE from 'three';

export default ()=>{
    const scene = useRef<THREE.Scene>()
	const camera = useRef<THREE.PerspectiveCamera>()
	const renderer = useRef<THREE.WebGLRenderer>()
	const clock = useRef<THREE.Clock>()
	const material = useRef<THREE.ShaderMaterial>()
	const sphere = useRef<THREE.Points>()

	const renderBoxRef = useRef<HTMLDivElement>(null)
	const render = () => {
		if(!scene.current) return
		const time = clock.current!.getElapsedTime();
		material.current!.uniforms.uTime.value = time
		sphere.current!.rotation.y = time * 0.01;
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
		
		const geo = new THREE.SphereGeometry(10)
		const material = new THREE.ShaderMaterial({
			wireframe: true
		})
		const mesh = new THREE.Mesh(geo, material)
		_scene.add(mesh)

		const _render = new THREE.WebGLRenderer()
		_render.setPixelRatio(window.devicePixelRatio);
		_render.setSize(w, h);
		_render.setClearColor(0x0a0a0f, 1);
		_render.render(_scene, _camera)

		renderBoxRef.current.appendChild(_render.domElement)

		scene.current = _scene
		camera.current = _camera
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