<template>
    <div>
      <div id="container"></div>
      <div id="info">
          <a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - Skeletal Additive Animation Blending
          (model from <a href="https://www.mixamo.com/" target="_blank" rel="noopener">mixamo.com</a>)<br/>
      </div>
    </div>
</template>

<script lang="ts" setup>
/* eslint-disable */
    import { onMounted } from 'vue';
    import * as THREE from 'three';
    import Stats from 'three/examples/jsm/libs/stats.module.js';
    import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
    import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

    let scene, renderer, camera, stats;
    let model, skeleton, mixer, clock;

    const crossFadeControls = [];

    let currentBaseAction = 'idle';
    const allActions = [];
    const baseActions = {
        idle: { weight: 1 },
        walk: { weight: 0 },
        run: { weight: 0 }
    };
    const additiveActions = {
        sneak_pose: { weight: 0 },
        sad_pose: { weight: 0 },
        agree: { weight: 0 },
        headShake: { weight: 0 }
    };
    let panelSettings, numAnimations;

    onMounted(() => {
        init();
    });

	

    function init() {

        const container = document.getElementById('container');

        clock = new THREE.Clock();
        scene = new THREE.Scene();

        
        scene.background = new THREE.Color(	'#9ADFF8' );
        scene.fog = new THREE.Fog( '#F0FFFF', 20, 100);



        // ground
        const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100 ), new THREE.MeshPhongMaterial( { color: '#1A1A1A', depthWrite: false } ) );
        mesh.rotation.x = - Math.PI / 2;
        mesh.receiveShadow = true;
        scene.add( mesh );


     

        //LUMIERE

        const hemiLight = new THREE.HemisphereLight( 0xffffff, "#f2b705");
        hemiLight.position.set( 0, 20, 0 );
        scene.add( hemiLight );

        const dirLight = new THREE.DirectionalLight( 0xffffff );
        dirLight.position.set( 20, 10, 10 );
        dirLight.castShadow = true;
        dirLight.shadow.camera.top = 7;
        dirLight.shadow.camera.bottom = - 2;
        dirLight.shadow.camera.left = - 4;
        dirLight.shadow.camera.right = 2;
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 40;
        scene.add( dirLight );

        
   


        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.shadowMap.enabled = true;
        container.appendChild( renderer.domElement );

        // camera
        camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 100 );
        camera.position.set( - 1, 2, 3 );

        const controls = new OrbitControls( camera, renderer.domElement );
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.target.set( 0, 1, 0 );
        controls.update();

        stats = Stats();
        container.appendChild( stats.dom );

        window.addEventListener( 'resize', onWindowResize );
    }


    function synchronizeCrossFade( startAction, endAction, duration ) {
        mixer.addEventListener( 'loop', onLoopFinished );
        function onLoopFinished( event ) {
            if ( event.action === startAction ) {
                mixer.removeEventListener( 'loop', onLoopFinished );
                executeCrossFade( startAction, endAction, duration );
            }
        }
    }

    function executeCrossFade( startAction, endAction, duration ) {
        // Not only the start action, but also the end action must get a weight of 1 before fading
        // (concerning the start action this is already guaranteed in this place)
        if ( endAction ) {
            setWeight( endAction, 1 );
            endAction.time = 0;
            if ( startAction ) {
                // Crossfade with warping
                startAction.crossFadeTo( endAction, duration, true );
            } else {
                // Fade in
                endAction.fadeIn( duration );
            }
        } else {
            // Fade out
            startAction.fadeOut( duration );
        }
    }

			// This function is needed, since animationAction.crossFadeTo() disables its start action and sets
			// the start action's timeScale to ((start animation's duration) / (end animation's duration))

			function setWeight( action, weight ) {

				action.enabled = true;
				action.setEffectiveTimeScale( 1 );
				action.setEffectiveWeight( weight );

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function animate() {

				// Render loop

				requestAnimationFrame( animate );

				for ( let i = 0; i !== numAnimations; ++ i ) {

					const action = allActions[ i ];
					const clip = action.getClip();
					const settings = baseActions[ clip.name ] || additiveActions[ clip.name ];
					settings.weight = action.getEffectiveWeight();

				}

				// Get the time elapsed since the last frame, used for mixer update

				const mixerUpdateDelta = clock.getDelta();

				// Update the animation mixer, the stats panel, and render this frame

				mixer.update( mixerUpdateDelta );

				stats.update();

				renderer.render( scene, camera );

			}

</script>




<style>
</style>
