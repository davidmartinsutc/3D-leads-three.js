
	var timeCounter = 0, deltaTime = 0;
	var modelStrArray = ["Walk", "Turn", "Talk", "Hello"];
	var status = "", deltaDistance = 0, totalDistance = 0, startDistance = 40;
	var loaded = false, appear = false;
	var selectedModelNum = -1;
	var audioplayer = document.getElementById("talkSound");
	var talkingStr = ["My name is XXX. I'm XXXxxxxxxx",
					  "I can help you for any requirement.",
					  "If you tell me your requirement,",
					  "then I'll talk correct method soon."];
	var talkingNum = 0, talkingTime = -1, talkingPartTime = 250, talkingLetterTime = 5, talkingLetter = 0;
	var talkingLength = talkingStr[0].length, talkingSentence = talkingStr[0];
	init();
	animate();

	jQuery("#appear").hide();
	jQuery("#hello").hide();
	jQuery("#outline").hide();

	jQuery("#hello").attr("disabled", "disabled");
	jQuery("#hello").addClass("disabled");
	jQuery("#appear").removeAttr("disabled");
	jQuery("#appear").removeClass("disabled");

	jQuery("#appear").on("click", function(){
		if (!appear){
			appear = true;
			jQuery("#appear").attr("disabled", "disabled");
			jQuery("#appear").addClass("disabled");
			jQuery("#hello").removeAttr("disabled");
			jQuery("#hello").removeClass("disabled");
		}
	});
	jQuery("#hello").on("click", function(){
		if (appear){
			appear = false;
			jQuery("#hello").attr("disabled", "disabled");
			jQuery("#hello").addClass("disabled");
			// jQuery("#appear").removeAttr("disabled");
			// jQuery("#appear").removeClass("disabled");
		}
	});

	function init(){
		containerWidth = jQuery("#animationArea").width();
		containerHeight = jQuery("#animationArea").height();
		container = document.getElementById('animationArea');
		scene = new THREE.Scene();
		scene.add(new THREE.AmbientLight(0x888888, 1));

		var light1 = new THREE.DirectionalLight(0xffffff, 0.7);	light1.position.set(500, 100, 500);		scene.add(light1);
		var light2 = new THREE.DirectionalLight(0xffffff, 0.7);	light2.position.set(-500, 100, 500);	scene.add(light2);

		offsetX = jQuery(container).offset().left;
		offsetY = jQuery(container).offset().top;

		renderer = new THREE.WebGLRenderer({ alpha: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(containerWidth, containerHeight);
		renderer.setClearColor(0x000000 , 0 );
		container.appendChild(renderer.domElement);

		camera = new THREE.PerspectiveCamera(45, containerWidth / containerHeight, 1, 400);
		camera.position.set(0, 30, 170);
		scene.add(camera);

		if (!controls)	controls = new THREE.OrbitControls(camera, renderer.domElement);
		controls.enableRotate = false;
		controls.maxDistance = 300;

		ModelLoad(0);

		window.addEventListener('resize', onWindowResize, false);
	}

	function ModelLoad(num){
		var loader = new THREE.FBXLoader();
		loader.load( '../models/fixed_2/Man_' + modelStrArray[num] + '_Fix_2.fbx', function ( object ) {
			object.position.set(0, -30, 0);
			player[num] = new THREE.AnimationMixer( object );
			object.mixer = new THREE.AnimationMixer( object );
			mixers[num] = [];
			mixers[num].push( object.mixer );

			models[num] = object;
			var action = player[num].clipAction( object.animations[ 0 ] );
			action.play();

			onReplaceTexture(object);
			object.traverse( function ( child ) {
				if ( child.isMesh ) {
					child.castShadow = true;
					child.receiveShadow = true;
				}
			});
			models[num].visible = false;
			scene.add( models[num] );
			if (num < 3) ModelLoad(num+1);
			else {console.log("loaded"); loaded = true; return true;}
		});
	}

	function onReplaceTexture(object) {
	    var textureLoader = new THREE.TextureLoader();
	    textureLoader.setCrossOrigin("anonymous");
	    textureLoader.load("https://unsplash.it/256", function (texture) {

		    object.traverse(function (child) {
		        if (child instanceof THREE.Mesh) {
		            // apply texture part
		            // when select woman, doesn't apply correct material 
		            child.material.map = texture;
		            child.material.needsUpdate = true;
		        }
		    });
	    });
	}

	function animate(){
		if (controls) controls.update();
		if (camera)  renderer.render(scene, camera);

		if (loaded == true){// && appear == true
			var deltaTime = clock.getDelta();
			if (jQuery("#appear").is(":hidden") || jQuery("#hello").is(":hidden")){
				jQuery("#appear").show();
				jQuery("#hello").show();
			}
			if (status == "" && appear == true){
				console.log("start");
				timeCounter = 0;
				status = "Walk";
				selectedModelNum = 0;
				deltaDistance = deltaTime * -50;// -0.5
			}
			else if (timeCounter > 1.2 && status == "Walk"){
				status = "Turn";
				selectedModelNum = 1;
				deltaDistance = deltaTime * -40; //-0.4;
			}
			else if (status == "Turn"){
				if (timeCounter > 2.2 && timeCounter <= 2.4){
					deltaDistance = deltaTime * -10; // -0.1;
				}
				else if (timeCounter > 2.4 && timeCounter <= 2.6){
					deltaDistance = 0;
				}
				else if (timeCounter > 2.6){
					status = "Talk";
					selectedModelNum = 2;
					audioplayer.play();
					talkingTime = 0;
					console.log(totalDistance);
				}
			}
			else if (status == "Talk"){
				if (jQuery("#string").html() == ""){
					jQuery("#outline").css("left", 250 + totalDistance * 3.5 + "px");
					jQuery("#outline").show();
					jQuery("#string").html(talkingStr[0]);
				}
				if (talkingNum < Math.floor(talkingTime++/talkingPartTime)){
					talkingNum = Math.floor(talkingTime/talkingPartTime);
					talkingLetter = 0;
					talkingSentence = talkingStr[talkingNum % talkingStr.length];
					talkingLength = talkingSentence.length;
					jQuery("#string").html("");
					// jQuery("#string").html(talkingStr[talkingNum % talkingStr.length]);
				}
				else {
					if (talkingTime % talkingLetterTime == 0){
						if (talkingLetter < talkingLength - 1){
							talkingLetter++;
							jQuery("#string").html(talkingSentence.substring(0, talkingLetter));
						}
					}
				}
				if (appear == false){
					status = "Hello";
					selectedModelNum = 3;
					timeCounter = 1000;
					audioplayer.pause();
				}
			}
			else if (status == "Hello"){
				if (jQuery("#string").html() != ""){
					jQuery("#outline").hide();
					jQuery("#string").html("");
				}
				
				if (timeCounter > 1001.5 && timeCounter < 1001.8){
					models[3].scale.x -= 0.05;
					models[3].scale.y -= 0.05;
					models[3].scale.z -= 0.05;
				}
				else if (timeCounter > 1001.8){
					models[3].scale.set(1, 1, 1);
					models[3].visible = false;
					selectedModelNum = -1;
					status = "";
					appear = false;
					totalDistance = 0;
					timeCounter = -1;
				}
			}
			if (timeCounter > -1 && selectedModelNum > -1 && models[selectedModelNum]) {
				totalDistance += deltaDistance;
				ModelSetting();
				models[selectedModelNum].position.x = startDistance + totalDistance;
				timeCounter += deltaTime;
				for ( var i = 0; i < mixers[selectedModelNum].length; i ++ ) {
					player[selectedModelNum].update( deltaTime ); 
					mixers[selectedModelNum][i].update( deltaTime );
				}
			}
		}
		requestAnimationFrame(animate);
	}

	function ModelSetting(){
		for (var i = 0; i < models.length; i++) {
			models[i].visible = false;
		}
		if (selectedModelNum > -1)
			models[selectedModelNum].visible = true;
	}
	function onWindowResize(){
		if (camera){
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		}
		renderer.setSize(window.innerWidth, window.innerHeight);
	}
