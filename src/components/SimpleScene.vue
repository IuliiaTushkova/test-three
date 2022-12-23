<template>
    <div>
      <div id="container"></div>
    </div>
</template>

<script lang="ts" setup>
    /* eslint-disable */
    import { onMounted } from 'vue';
    import * as THREE from 'three';
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
    import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
    import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
     import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

    let scene, renderer, camera;
    let model, skeleton, mixer, clock;
    let resultDisplayed = false;

    let speed = 0.6;

    const fakeData = [ 
                {
                    analysisId: 1744,
                    bodyPartName: "SCORE_WRIST_LEFT",
                    grid:"RULA",
                    gridValue:1
                },
                {
                    analysisId: 1744,
                    bodyPartName: "SCORE_ELBOW_RIGHT",
                    grid:"RULA",
                    gridValue:1.8
                },
                {
                    analysisId: 1744,
                    bodyPartName: "SCORE_ELBOW_LEFT",
                    grid:"RULA",
                    gridValue:2,
                },
                {
                    analysisId: 1744,
                    bodyPartName: "SCORE_SHOULDER_RIGHT",
                    grid:"RULA",
                    gridValue:1.3
                },
                {
                    analysisId: 1744,
                    bodyPartName: 'SCORE_SHOULDER_LEFT',
                    grid:"RULA",
                    gridValue:8
                },
                {
                    analysisId: 1744,
                    bodyPartName: 'SCORE_BACK',
                    grid:"RULA",
                    gridValue:4
                },
                {
                    analysisId: 1744,
                    bodyPartName: 'SCORE_NECK',
                    grid:"RULA",
                    gridValue:1.3
                },
                {
                    analysisId: 1744,
                    bodyPartName:'SCORE_WRIST_RIGHT',
                    grid:"RULA",
                    gridValue:7
                }
            ];

    const indexAnalyseMap = [
        'noAnalysedPart',
        'SCORE_NECK',
        'SCORE_SHOULDER_LEFT',
        'SCORE_SHOULDER_RIGHT',
        'SCORE_BACK',
        'SCORE_ELBOW_LEFT',
        'SCORE_ELBOW_RIGHT',
        'SCORE_WRIST_LEFT',
        'SCORE_WRIST_RIGHT'
    ];

    // declare a ref to hold the element reference
    // the name must match template ref value
    onMounted(() => {
        init();
    });

    function init() {
        const container = document.getElementById('container');
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        container.innerHTML = "";
        clock = new THREE.Clock();
        scene = new THREE.Scene();
        
        scene.background = new THREE.Color(	'white' );
        scene.fog = new THREE.Fog( '#F0FFFF', 20, 100);

        // ground
        const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100 ), new THREE.MeshPhongMaterial( { color: 'white', depthWrite: false } ) );
        mesh.rotation.x = - Math.PI / 2;
        mesh.receiveShadow = true;
        scene.add( mesh );

        // LUMIERE
        const hemiLight = new THREE.HemisphereLight( '#9ADFF8', "white", 0.2);
        hemiLight.position.set( 0, 20, 0 );
        scene.add( hemiLight );

        const dirLight = new THREE.DirectionalLight( 0xffffff );
        dirLight.position.set( 20, 10, 10 );
        dirLight.castShadow = true;
        scene.add( dirLight );
        
        // MODEL
        const loader = new GLTFLoader();

        loader.load( 'models/gltf/skeleton4.gltf', function ( gltf ) {
            model = gltf.scene;
            console.log('jointures : ', model.children[0].children[1].children[0].material.color);

            //******************    per mesh  *************************************************
            fakeData.forEach(analyse => {
                let bodyPartName = analyse.bodyPartName;
                let index = indexAnalyseMap.indexOf(bodyPartName);
                let color = getColor(analyse.gridValue)
                model.children[0].children[1].children[index].material.color = new THREE.Color(	color );

                //add listener ici sur chaque élément

            });

            function getColor(coef:number | string):string {
                let color = "";
                const threshold = [
                    [1,3, "#00BB87"],
                    [3,5, "#F2B705"],
                    [5,7, "#EE7404"],
                    [7, "#FF686B"],
                ];
                try {
                    threshold.forEach((element,index) => {
                    if(index != 3) {
                        if(coef >= element[0] && coef < element[1]) color = element[2].toString();
                    }else{
                        //> 7
                        if(coef >= 7) color = element[1].toString();
                    }
                    });
                    return color;
                } catch (error) {
                    throw Error('Error in applyColor');
                }
            }
            //model.addEventListener('click', addResultNumber(-0.5,1.5,-0.1, '#00BB87', scene));
            scene.add( model );
            

            model.traverse( function ( object ) {
                if ( object.isMesh ) object.castShadow = true;
            } );

            skeleton = new THREE.SkeletonHelper( model );
            
            skeleton.visible = false;
            scene.add( skeleton );
            

            //addResultSphere(-0.5,2,0, '#00BB87', scene);
            


            //---------------------------------------------------------
            // animation
            //---------------------------------------------------------
            mixer = new THREE.AnimationMixer( model );

            const action = mixer.clipAction( gltf.animations[6] );
            action.play();
            //vitesse de l'animation
            mixer.timeScale = speed;

            animate();
        } );

        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.shadowMap.enabled = true;
        container.appendChild( renderer.domElement );

        // camera
        camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 100 );
        camera.position.set( 1, 2, 4 );

        const controls = new OrbitControls( camera, renderer.domElement );
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.target.set( 0, 1, 0 );
        controls.update();

        window.addEventListener( 'resize', onWindowResize );

        renderer.domElement.addEventListener('click', onClick, false);

        /** add or remove */
        function onClick(event) {
            event.preventDefault();
            //cacher les résultats
            if(resultDisplayed) {
                removeResultNumber(scene);
                resultDisplayed = !resultDisplayed;
            }else{
            //afficher les résultats
            resultDisplayed = !resultDisplayed;
            let x = -0.5, y = 1.5, z = -0.1;
            fakeData.forEach(element => {
                x = x+0.2;
                y = y+0.2;
                z = z+0.2;
                addResultNumber(x,y,z, '#00BB87', scene);
            });
            }

            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);

            // var intersects = raycaster.intersectObjects(scene.children);
            // console.log(intersects);
            
            

        }
    
    }

    
    /**
     * 
     * @param element 
     * TODO
     */
    function handleDataPosition(element):number[] {
        let x, y, z;

        return [x, y, z];
    }

    function addResultSphere(x, y, z, color, scene) {
        const geometry = new THREE.IcosahedronGeometry( 0.1, 3 );
		const material = new THREE.MeshPhongMaterial( { color: color } );
        const sphere = new THREE.Mesh( geometry, material );
        sphere.position.set(x, y, z);
        scene.add( sphere );
    }

    function removeResultNumber(scene) {
        scene.children.forEach(mesh => {
            console.log('boucle')
            if(mesh['userData']['result'] && mesh.userData.result === "result") {
                console.log('text geom ! ')
                const index = scene.children.indexOf(mesh);

                scene.children.splice(index, 1);
            }
            
        })
        console.log('scene : ', scene);
    }

    function addResultNumber(x, y, z, color, scene) {
        const loader = new FontLoader();
        const text = '5'

        loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {

        const geometry = new TextGeometry( text, {
            font: font,
            size: 0.2,
            height: 0.05,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.02,
            bevelSize: 0.01,
            bevelOffset: 0,
            bevelSegments: 5,
        } );

        const material = new THREE.MeshStandardMaterial( {
            color: 0x99ffff
        } );

        const textMesh = new THREE.Mesh( geometry, material );
        textMesh.position.set(x,y,z);
        textMesh.userData.result = 'result';
        scene.add( textMesh );

        } );

         
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

        // Get the time elapsed since the last frame, used for mixer update

        const mixerUpdateDelta = clock.getDelta();

        // Update the animation mixer and render this frame

        mixer.update( mixerUpdateDelta );
        renderer.render( scene, camera );
    }

</script>




<style>

    .character-switch-container {
        position: absolute;
        left: 15%;
    }
</style>
