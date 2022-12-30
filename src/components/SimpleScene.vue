<template>
    <div>
        <div class="q-pa-md q-gutter-sm absolute result-acces" id="result-btns-wrapper">
            <q-page-sticky position="bottom-right" :offset="[18, 18]">
            <q-fab
              icon="content_paste"
              direction="up"
              color="primary"
              size="20px"
            >
                <q-fab-action @click="displayResult('SCORE_BACK')" id="score_back" color="primary" icon="hiking" />
                <q-fab-action @click="displayResult('SCORE_ELBOW_RIGHT')" id="score_elbow_right" color="primary" icon="turn_slight_right" />
                <q-fab-action @click="displayResult('SCORE_ELBOW_LEFT')" id="score_elbow_left" color="primary" icon="turn_slight_left" />
                <q-fab-action @click="displayResult('SCORE_NECK')" id="score_neck" color="primary" icon="person_outline" />
                <q-fab-action @click="displayResult('SCORE_SHOULDER_RIGHT')" id="score_shoulder_right" color="primary" icon="group_add" />
                <q-fab-action @click="displayResult('SCORE_SHOULDER_LEFT')" id="score_shoulder_left" color="primary" icon="person_add" />
                <q-fab-action @click="displayResult('SCORE_WRIST_LEFT')" id="score_wrist_left" color="primary" icon="front_hand" />
                <q-fab-action @click="displayResult('SCORE_WRIST_RIGHT')" id="score_wrist_right" color="primary" icon="back_hand" />
                <q-fab-action @click="displayResult('ALL')" id="all" color="primary" icon="accessibility" />
            </q-fab>
          </q-page-sticky>
        </div>
        <div id="container"></div>
        <div id="video" class="video-wrapper hidden">
            <video controls width="90%" height="50%">
                <source 
                        type="video/webm">
                <source id="analyse-video" 
                        type="video/mp4">
                Download the
                <a href="#">WEBM</a>
                or
                <a href="#">MP4</a>
                video.
            </video>
            <p style="text-align:center;">Video Title</p>
        </div>
        <div class="q-pa-m absolute q-gutter-sm video-acces">
            <q-btn round sticky position="bottom-right" color="primary" size="20px" icon="play_arrow"  id="videoAccess"/>
            <q-btn round  position="bottom-right" color="primary" size="20px" icon="content_paste" class="hidden" id="resultAccess"/>
        </div>
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
    const titleRule = {
            size:0.1, 
            height:0.05,
            pathToFont:'fonts/helvetiker_regular.typeface.json',
            curveSegments:12
        }

    const globalScoreText = {
        size:0.1, 
        height:0.05,
        pathToFont:'fonts/helvetiker_regular.typeface.json',
        curveSegments:12
    }

    const scoreText = {
        size:0.19, 
        height:0.05,
        pathToFont:'fonts/helvetiker_regular.typeface.json',
        curveSegments:12
    }

    let speed = 0.6;
    interface resultDataPositionType {
        bodyPart:string,
        position:[number, number, number],
        isActivated:boolean
    }
    let resultDataPosition:resultDataPositionType[] = [
        {
            "bodyPart" : "SCORE_NECK",
            "position" : [-0.15, 1.5, 0.1],
            "isActivated":false
        },
        {
            "bodyPart" : "SCORE_SHOULDER_LEFT",
            "position" : [-0.5, 1.3, -0.1],
            "isActivated":false
        },
        {
            "bodyPart" : "SCORE_SHOULDER_RIGHT",
            "position" : [0.29, 1.3, -0.1],
            "isActivated":false
        },
        {
            "bodyPart" : "SCORE_BACK",
            "position" : [0, 1, 0.1],
            "isActivated":false
        },
        {
            "bodyPart" : "SCORE_ELBOW_LEFT",
            "position" : [-0.6, 1, -0.1],
            "isActivated":false
        },
        {
            "bodyPart" : "SCORE_ELBOW_RIGHT",
            "position" : [0.4, 1, -0.1],
            "isActivated":false
        },
        {
            "bodyPart" : "SCORE_WRIST_LEFT",
            "position" : [-0.5, 0.7, -0.1],
            "isActivated":false
        },
        {
            "bodyPart" : "SCORE_WRIST_RIGHT",
            "position" : [0.35, 0.7, -0.1],
            "isActivated":false
        },
    ];
        
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
        },
        {
            analysisId: 1744,
            bodyPartName: "SCORE_GLOBAL_SCORE",
            grid: "RULA",
            gridValue: 2.8
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

    function getBtnData(index:number):string {
        if(resultDataPosition[index].isActivated) {
            return "secondary";
        }else{
            return "#2A4154";
        }
        
    }

    function displayResult(bodyPart:string) {
        let scoreRula:string,
            position:[number, number, number],
            elementIndex:number;
        
        if(bodyPart !== "ALL") {
            resultDataPosition.forEach((element, index) => {
                if(element.bodyPart === bodyPart) {
                    position = element.position;
                    elementIndex = index;
                }
            });
            if(resultDataPosition[elementIndex].isActivated) {
                //remove
                removeResultNumber(scene, bodyPart);
                resultDataPosition[elementIndex].isActivated = false;
            }else{
                //recuperer le score
                fakeData.forEach(element => {
                    if(element.bodyPartName === bodyPart) scoreRula = element.gridValue.toString();
                });
                addText3D(position, scene, scoreRula, scoreText, true, bodyPart);
                resultDataPosition[elementIndex].isActivated = true;
            }
        }else{
            //display tous les résultats
            resultDataPosition.forEach(element => {
                if(element.isActivated) {
                    removeResultNumber(scene, element.bodyPart);
                    element.isActivated = false;
                }else{
                    fakeData.forEach(data=> {
                        if(data.bodyPartName !== "SCORE_GLOBAL_SCORE") {
                            if(data.bodyPartName === element.bodyPart) scoreRula = data.gridValue.toString();
                        }
                    });
                    addText3D(element.position, scene, scoreRula, scoreText, true, element.bodyPart);
                }
            });
        }
        
        
        //toggle 3d model text
            //cacher les résultats
            
               
                
            

        
                
            
            
    }

    // declare a ref to hold the element reference
    // the name must match template ref value
    onMounted(() => {
        initBtns();
        init();
    });

    async function initBtns() {
        const videBtn = document.getElementById('videoAccess');
        const resultBtn = document.getElementById('resultAccess');
        const videoContainer = document.getElementById('video');
        const canvas = document.getElementById('container');
        const resultButtons = document.getElementById('result-btns-wrapper');
        videBtn.addEventListener('click',  () => openVideoInterface(videoContainer, canvas, resultButtons, videBtn, resultBtn));

        resultBtn.addEventListener('click',  () => closeVideoInterface(videoContainer, canvas, resultButtons, videBtn, resultBtn));
    }

    /**
     * open the video interface and close the  3d model
     */
    function openVideoInterface(
            videoContainer:HTMLElement, 
            canvas:HTMLElement, 
            resultButtons:HTMLElement, 
            videoBtn:HTMLElement,
            resultBtn: HTMLElement
        ):void {
        videoContainer.classList.remove('hidden');
        videoContainer.classList.add('active');
        canvas.style.display = 'none';
        resultButtons.style.display = 'none';
        videoBtn.classList.add('hidden');
        resultBtn.classList.remove('hidden');
    }

    /**
     * close video interface and open the  3d model
     */
     function closeVideoInterface(
        videoContainer:HTMLElement, 
        canvas:HTMLElement, 
        resultButtons:HTMLElement, 
        videoBtn:HTMLElement,
        resultBtn: HTMLElement
    ):void {
        videoContainer.classList.remove('active');
        videoContainer.classList.add('hidden');
        canvas.style.display = 'block';
        resultButtons.style.display = 'block';
        videoBtn.classList.remove('hidden');
        resultBtn.classList.add('hidden');
    }

    /**
     * return a font to use into Text geometry
     * @param path to font file
     */
    async function loadFont(path:string) {
        const loader = new FontLoader();

        loader.load( path, function ( font ) {
            return font;
        });
    }

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

    // -----------------------------------------------------------------------------------
    // 3D Model---------------------------------------------------------------------------
     // -----------------------------------------------------------------------------------
    function init() {
        const container = document.getElementById('container');
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

            //******************    per mesh  *************************************************
            fakeData.forEach(analyse => {
                let bodyPartName = analyse.bodyPartName;
                if(bodyPartName !== "SCORE_GLOBAL_SCORE") {
                    let index = indexAnalyseMap.indexOf(bodyPartName);
                    let color = getColor(analyse.gridValue);
                    model.children[0].children[1].children[index].material.color = new THREE.Color(	color );
                }else{
                    //title : RULA
                    addText3D([-0.5, 2.4, -0.1], scene, 'RULA', titleRule);
                    //text : Global
                    addText3D([-0.5, 2.2, -0.1], scene, 'Global :', globalScoreText);
                    //score
                    addText3D([0.01, 2.2, -0.1], scene, analyse.gridValue.toString(), globalScoreText, true);
                }
            });

            
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
        //taille à ajuster !
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

        //renderer.domElement.addEventListener('click', onClick, false);

    
    
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

    // function addResultSphere(position:[number, number, number], color:string, scene:any) {
    //     const geometry = new THREE.IcosahedronGeometry( 0.1, 3 );
	// 	const material = new THREE.MeshPhongMaterial( { color: color } );
    //     const sphere = new THREE.Mesh( geometry, material );
    //     sphere.position.set(x, y, z);
    //     scene.add( sphere );
    // }

    function removeResultNumber(scene:any, bodyPart:string) {
        console.log('remove !');
      //  document.getElementById(bodyPart.toLowerCase()).setAttribute("color", "primary");
        scene.children.forEach(mesh => {
            if(mesh['userData']['bodyPart'] && mesh.userData.bodyPart === bodyPart) {
                const index = scene.children.indexOf(mesh);

                scene.children.splice(index, 1);
            }
            
        })
    }



    // function addResultNumber(position:[number, number, number], score:string, scene, textToDisplay?:string) {
    //     const loader = new FontLoader();
    //     let text = score;
    //     if(textToDisplay) {
    //         text = `${textToDisplay} : ${text}`;
    //     }
    //     const color = getColor(score);

    //     loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {

    //     const geometry = new TextGeometry( text, {
    //         font: font,
    //         size: 0.2,
    //         height: 0.05,
    //         curveSegments: 12,
    //         bevelEnabled: true,
    //         bevelThickness: 0.02,
    //         bevelSize: 0.01,
    //         bevelOffset: 0,
    //         bevelSegments: 5,
    //     } );

    //     const material = new THREE.MeshStandardMaterial( {
    //         color: color
    //     } );

    //     const textMesh = new THREE.Mesh( geometry, material );
    //     textMesh.position.set(position[0],position[1],position[2]);
    //     textMesh.userData.result = 'result';
    //     scene.add( textMesh );

    //     } );
    // }

    /**
     * Add TextGeometry to a scene
     * @param position x, y, z
     * @param scene three.scene object
     * @param textToDisplay 
     */
    async function addText3D(
        position:[number, number, number], 
        scene,
        textToDisplay:string, 
        textObjectData : {
            size:number, 
            height:number,
            pathToFont:string,
            curveSegments:number
        },
        scoreOnly:boolean=false,
        bodyPart?:string,
    ) {
        let color = '#2A4154'; //default
        //apply score color
        if(scoreOnly) {
            if(bodyPart) document.getElementById(bodyPart.toLowerCase()).style.background = "#F2B705";
            color = getColor(+textToDisplay);
        }
        console.log('data : ', textObjectData);
        
        const loader = new FontLoader();

        loader.load( textObjectData.pathToFont, function ( myFont ) {

            const geometry = new TextGeometry( textToDisplay, {
                font: myFont,
                size: textObjectData.size,
                height: textObjectData.height,
                curveSegments: textObjectData.curveSegments,
                bevelEnabled: true,
                bevelThickness: 0.02,
                bevelSize: 0.01,
                bevelOffset: 0,
                bevelSegments: 5,
            } );

            const material = new THREE.MeshStandardMaterial( {
                color: color
            } );

            const textMesh = new THREE.Mesh( geometry, material );
            textMesh.position.set(position[0],position[1],position[2]);
            textMesh.userData.bodyPart = bodyPart;
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

    .video-acces {
        bottom: 6%;
        left:1%;
    }

    .result-acces {
        top: 5%;
    }



    .video-wrapper {
        height: 100vh;
        width: 100vw;
    }

    video {
        margin-top: 4em;
    }
</style>
