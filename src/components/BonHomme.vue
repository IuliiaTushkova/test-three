<template>
    <div>
        <div class="character-switch-container">
            <q-btn-toggle
            v-model="character"
            @click="changeCharacter"
            toggle-color="primary"
            :options="[
                {label: 'Skeletton', value: 'skeletton'},
                {label: 'Fille', value: 'girl'},
                {label: 'Dancer', value: 'dancer'},
            ]"
            />
        </div>
    
      <div id="container"></div>
    </div>
</template>

<script lang="ts" setup>
    /* eslint-disable */
    import { onMounted, ref } from 'vue';
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

    function getModelPath() {
        let format = 'glb';
        return `models/gltf/${character.value}.${format}`;
    }

    // declare a ref to hold the element reference
    // the name must match template ref value
    const character = ref('skeletton');
    onMounted(() => {
        init( getModelPath() );
    });

    function changeCharacter() {
        init( getModelPath() );
    }

    


    function init(character:string) {
        console.log('------------------ init ---------------------------');
        const container = document.getElementById('container');
        container.innerHTML = "";
        clock = new THREE.Clock();
        scene = new THREE.Scene();
        
        scene.background = new THREE.Color(	'#9ADFF8' );
        scene.fog = new THREE.Fog( '#F0FFFF', 20, 100);


    //GROUND texture 
    //     const gt = new THREE.TextureLoader().load( 'textures/grass-1.jpg' );
    //     const gg = new THREE.PlaneGeometry( 16000, 16000 );
    //     const gm = new THREE.MeshPhongMaterial( { color: 0xffffff, map: gt } );

    //     const ground = new THREE.Mesh( gg, gm ); 
    //     ground.rotation.x = - Math.PI / 2;
    //     ground.material.map.repeat.set( 64, 64 );
    //     ground.material.map.wrapS = THREE.RepeatWrapping;
    //     ground.material.map.wrapT = THREE.RepeatWrapping;
    //     ground.material.map.encoding = THREE.sRGBEncoding;
    //    // note that because the ground does not cast a shadow, .castShadow is left false
    //     ground.receiveShadow = true;

    //     scene.add( ground );


        //GROUND unicolor
        // let groundMesh;
        // const groundGeometry = new THREE.BoxGeometry( 30, 0.01, 40 );
        // const groundMaterial = new THREE.MeshLambertMaterial( { color: 'red' } );
        // groundMesh = new THREE.Mesh( groundGeometry, groundMaterial );
        // groundMesh.position.y = 0.0; //this value must be slightly lower than the planeConstant (0.01) parameter above
        // scene.add( groundMesh );

        // ground
        const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 5, 100 ), new THREE.MeshPhongMaterial( { color: '#1A1A1A', depthWrite: false } ) );
        mesh.rotation.x = - Math.PI / 2;
        mesh.receiveShadow = true;
        scene.add( mesh );


        //middle line

        const meshMiddleLine = new THREE.Mesh( new THREE.PlaneGeometry( 0.1, 100 ), new THREE.MeshPhongMaterial( { color: '#FFFFFF', depthWrite: false } ) );
        meshMiddleLine.rotation.x = - Math.PI / 2;
        meshMiddleLine.receiveShadow = true;
        scene.add( meshMiddleLine );

        //left line

        const meshLeftLine = new THREE.Mesh( new THREE.PlaneGeometry( 0.1, 100 ), new THREE.MeshPhongMaterial( { color: '#FFFFFF', depthWrite: false } ) );
        meshLeftLine.rotation.x = - Math.PI / 2;
        meshLeftLine.receiveShadow = true;
        meshLeftLine.position.x = -2.5;
        scene.add( meshLeftLine );

        //right line

        const meshRightLine = new THREE.Mesh( new THREE.PlaneGeometry( 0.1, 100 ), new THREE.MeshPhongMaterial( { color: '#FFFFFF', depthWrite: false } ) );
        meshRightLine.rotation.x = - Math.PI / 2;
        meshRightLine.receiveShadow = true;
        meshRightLine.position.x = 2.5;
        scene.add( meshRightLine );

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
        
        //----------- MODEL ------------------------------------
        const loader = new GLTFLoader();

        loader.load( character, function ( gltf ) {
            model = gltf.scene;
            scene.add( model );

            model.traverse( function ( object ) {

                if ( object.isMesh ) object.castShadow = true;

            } );

            skeleton = new THREE.SkeletonHelper( model );
            skeleton.visible = false;
            scene.add( skeleton );
            const animations = gltf.animations;
            mixer = new THREE.AnimationMixer( model );

            numAnimations = animations.length;

            for ( let i = 0; i !== numAnimations; ++ i ) {
                let clip = gltf.animations[ i ];
                const name = clip.name;
                if(character !== "models/gltf/skeletton.glb") {
                    console.log('pas skeletton');
                    const action = mixer.clipAction( clip );
                    activateAction( action );
                    allActions.push( action );
                }
                if ( baseActions[ name ] ) {
                    const action = mixer.clipAction( clip );
                    activateActionSkeletton( action );
                    baseActions[ name ].action = action;
                    allActions.push( action );
                } else if ( additiveActions[ name ] ) {
                    // Make the clip additive and remove the reference frame
                    THREE.AnimationUtils.makeClipAdditive( clip );

                    if ( clip.name.endsWith( '_pose' ) )  clip = THREE.AnimationUtils.subclip( clip, clip.name, 2, 3, 30 );
                    
                    const action = mixer.clipAction( clip );
                    activateActionSkeletton( action );
                    additiveActions[ name ].action = action;
                    allActions.push( action );
                }
            }
            if(character === "models/gltf/skeletton.glb") createPanel();
            animate(character);
        } );

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

    function createPanel() {

        const panel = new GUI( { width: 310 } );
        const folder1 = panel.addFolder( 'Base Actions' );
        const folder2 = panel.addFolder( 'Additive Action Weights' );
        const folder3 = panel.addFolder( 'General Speed' );

        panelSettings = {
            'modify time scale': 1.0
        };

        const baseNames = [ 'None', ...Object.keys( baseActions ) ];

        for ( let i = 0, l = baseNames.length; i !== l; ++ i ) {
            const name = baseNames[ i ];
            const settings = baseActions[ name ];
            panelSettings[ name ] = function () {
                const currentSettings = baseActions[ currentBaseAction ];
                const currentAction = currentSettings ? currentSettings.action : null;
                const action = settings ? settings.action : null;
                if ( currentAction !== action ) prepareCrossFade( currentAction, action, 0.35 );
            };
            crossFadeControls.push( folder1.add( panelSettings, name ) );
        }

        for ( const name of Object.keys( additiveActions ) ) {
            const settings = additiveActions[ name ];
            panelSettings[ name ] = settings.weight;
            folder2.add( panelSettings, name, 0.0, 1.0, 0.01 ).listen().onChange( function ( weight ) {
                setWeight( settings.action, weight );
                settings.weight = weight;
            } );
        }

        folder3.add( panelSettings, 'modify time scale', 0.0, 1.5, 0.01 ).onChange( modifyTimeScale );
        folder1.open();
        folder2.open();
        folder3.open();

        crossFadeControls.forEach( function ( control ) {
            control.setInactive = function () {
                control.domElement.classList.add( 'control-inactive' );
            };
            control.setActive = function () {
                control.domElement.classList.remove( 'control-inactive' );
            };
            const settings = baseActions[ control.property ];
            if ( ! settings || ! settings.weight ) {
                control.setInactive();
            }
        } );
    }

    function activateAction( action ) {
        const clip = action.getClip();
        const settings = baseActions[ clip.name ] || additiveActions[ clip.name ];
        action.play();
    }

    function activateActionSkeletton( action ) {
        const clip = action.getClip();
        const settings = baseActions[ clip.name ] || additiveActions[ clip.name ];
        setWeight( action, settings.weight );
        action.play();
    }

    function modifyTimeScale( speed ) {
        mixer.timeScale = speed;
    }

    function prepareCrossFade( startAction, endAction, duration ) {
        // If the current action is 'idle', execute the crossfade immediately;
        // else wait until the current action has finished its current loop
        if ( currentBaseAction === 'idle' || ! startAction || ! endAction ) {
            executeCrossFade( startAction, endAction, duration );
        } else {
            synchronizeCrossFade( startAction, endAction, duration );
        }
        // Update control colors
        if ( endAction ) {
            const clip = endAction.getClip();
            currentBaseAction = clip.name;
        } else {
            currentBaseAction = 'None';
        }
        crossFadeControls.forEach( function ( control ) {
            const name = control.property;
            if ( name === currentBaseAction ) {
                control.setActive();
            } else {
                control.setInactive();
            }
        } );
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

    function animate(character) {

        // Render loop

        requestAnimationFrame( animate );
        
        if(allActions.length > 0) {
            for ( let i = 0; i !== numAnimations; ++ i ) {

                const action = allActions[ i ];
                const clip = action.getClip();
                if(character === 'models/gltf/skeletton.glb') {
                    const settings = baseActions[ clip.name ] || additiveActions[ clip.name ];
                    settings.weight = action.getEffectiveWeight();
                }
            }
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

    .character-switch-container {
        position: absolute;
        left: 15%;
    }
</style>
