import React, { useRef, useEffect } from "react";
import * as THREE from 'three';
import { OrbitControls, EffectComposer, RenderPass, BloomPass, OutputPass } from "three/addons";
import CloudImg from '@/assets/texture/cloud.png'
import LavaImg from '@/assets/texture/lavatile.jpg'

// 星球
export default () => {
	const scene = useRef<THREE.Scene>()
	const camera = useRef<THREE.PerspectiveCamera>()
	const renderer = useRef<THREE.WebGLRenderer>()
	const controls = useRef<OrbitControls>()
	const clock = useRef<THREE.Clock>()
	const shaderMaterial = useRef<THREE.ShaderMaterial>()
    const composer = useRef<EffectComposer>()

	const renderBoxRef = useRef<HTMLDivElement>(null)
	const render = () => {
		if(!scene.current) return
		const time = clock.current!.getElapsedTime();
		shaderMaterial.current!.uniforms.uTime.value = time
		renderer.current!.render(scene.current!, camera.current!);
		requestAnimationFrame(render);
	}
	const init = () => {
		let w = window.innerWidth;
		let h = window.innerHeight;

		const _scene = new THREE.Scene();
        scene.current = _scene

		const _camera = new THREE.PerspectiveCamera(35, w / h, 1, 3000);
		_camera.position.z = 4;
		_camera.lookAt(new THREE.Vector3());

        camera.current = _camera

		const _renderer = new THREE.WebGLRenderer({
			// antialias: true,
			// alpha: true,
		});
        renderer.current = _renderer
		_renderer.setPixelRatio(window.devicePixelRatio);
		_renderer.setSize(w, h);
		// _renderer.setClearColor(0x0a0a0f, 1);
        _renderer.setAnimationLoop(animate)
        _renderer.autoClear = false
		renderBoxRef.current?.appendChild(_renderer.domElement);

        const renderModel = new RenderPass(_scene, _camera);
        const effectBloom = new BloomPass( 1.25 );
        const outputPass = new OutputPass();
        const _composer = new EffectComposer(_renderer);
        composer.current = _composer
        _composer.addPass( renderModel );
        _composer.addPass( effectBloom );
        _composer.addPass( outputPass );

		controls.current = new OrbitControls(camera.current, renderer.current.domElement);

		const _plane = new THREE.PlaneGeometry(2, 2, 100, 100)

		const vertexShader = /* GLSL */ `
    uniform vec2 uvScale;
    varying vec2 vUv;

    void main()
    {

        vUv = uvScale * uv;
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        gl_Position = projectionMatrix * mvPosition;

    }
`;

		const fragmentShader = /* GLSL */ `
    uniform float time;

    uniform float fogDensity;
    uniform vec3 fogColor;

    uniform sampler2D texture1;
    uniform sampler2D texture2;

    varying vec2 vUv;

    void main( void ) {

        vec2 position = - 1.0 + 2.0 * vUv;

        vec4 noise = texture2D( texture1, vUv );
        vec2 T1 = vUv + vec2( 1.5, - 1.5 ) * time * 0.02;
        vec2 T2 = vUv + vec2( - 0.5, 2.0 ) * time * 0.01;

        T1.x += noise.x * 2.0;
        T1.y += noise.y * 2.0;
        T2.x -= noise.y * 0.2;
        T2.y += noise.z * 0.2;

        float p = texture2D( texture1, T1 * 2.0 ).a;

        vec4 color = texture2D( texture2, T2 * 2.0 );
        vec4 temp = color * ( vec4( p, p, p, p ) * 2.0 ) + ( color * color - 0.1 );

        if( temp.r > 1.0 ) { temp.bg += clamp( temp.r - 2.0, 0.0, 100.0 ); }
        if( temp.g > 1.0 ) { temp.rb += temp.g - 1.0; }
        if( temp.b > 1.0 ) { temp.rg += temp.b - 1.0; }

        gl_FragColor = temp;

        float depth = gl_FragCoord.z / gl_FragCoord.w;
        const float LOG2 = 1.442695;
        float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );
        fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );

        gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );

    }
`;
        const textureLoader = new THREE.TextureLoader();
        const cloudTexture = textureLoader.load(CloudImg);
        const lavaTexture = textureLoader.load(LavaImg);
        lavaTexture.colorSpace = THREE.SRGBColorSpace;
        cloudTexture.wrapS = cloudTexture.wrapT = THREE.RepeatWrapping;
        lavaTexture.wrapS = lavaTexture.wrapT = THREE.RepeatWrapping;
		const _shaderMaterial = new THREE.ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms: {
                'fogDensity': { value: 0.45 },
                'fogColor': { value: new THREE.Vector3( 0, 0, 0 ) },
                'time': { value: 1.0 },
                'uvScale': { value: new THREE.Vector2( 3.0, 1.0 ) },
                'texture1': { value: cloudTexture },
                'texture2': { value: lavaTexture }
			},
			// wireframe: true,
			// transparent: true,
			// blending: THREE.AdditiveBlending,  //粒子重叠后的颜色会变白发亮
    		// depthTest: false,
		});
        shaderMaterial.current = _shaderMaterial
		
        const mesh = new THREE.Mesh(new THREE.TorusGeometry( 0.65, 0.3, 30, 30 ), _shaderMaterial)

		scene.current.add(mesh);

		clock.current = new THREE.Clock();
		// render()

	}
    const animate = ()=>{
        if(!scene.current) return
        const delta = 5 * clock.current!.getDelta();
        shaderMaterial.current!.uniforms.time.value += 0.2 * delta;

        // mesh.rotation.y += 0.0125 * delta;
        // mesh.rotation.x += 0.05 * delta;

        renderer.current!.clear();
        composer.current!.render( 0.01 );
    }
	useEffect(() => {
		if(scene.current) return
		init()
	}, [])

	return (
		<div>
			<div ref={renderBoxRef} className="absolute left-0 top-0 right-0 h-full"></div>
		</div>
		
	)
}
