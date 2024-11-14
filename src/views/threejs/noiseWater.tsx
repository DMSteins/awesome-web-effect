import React, { useRef, useEffect } from "react";
import * as THREE from 'three';
import { OrbitControls } from "three/addons";

export default ()=>{
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