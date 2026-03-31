import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";
import SocialMedia3D from "./SocialMedia3D";

const ARScene = () => {
  const containerRef = useRef();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [targetFound, setTargetFound] = useState(false);
  const [trackingSession, setTrackingSession] = useState(0);
  // AR Context: holds references to anchor, renderer, scene, camera for 3D social logos
  const arContextRef = useRef({
    anchor: null,
    renderer: null,
    scene: null,
    camera: null
  });
  
  // AR mode only
  const timeoutRef = useRef(null);
  const mindarThreeRef = useRef(null);
  const animationIdRef = useRef(null);
  const loaderRef = useRef(null);
  const initStartedRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization
    if (initStartedRef.current) {
      console.log("Initialization already started, skipping...");
      return;
    }
    initStartedRef.current = true;
    let isLoading = true;

    // Clean up all previous resources
    const cleanup = () => {
      console.log("Performing full cleanup...");
      
      // Cancel animation frame
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }

      // Stop MindAR
      if (mindarThreeRef.current) {
        mindarThreeRef.current.stop?.();
        mindarThreeRef.current = null;
      }

      // Clear loaders
      if (loaderRef.current) {
        loaderRef.current = null;
      }

      // Remove all canvases
      if (containerRef.current) {
        const canvases = containerRef.current.querySelectorAll("canvas");
        canvases.forEach(canvas => canvas.remove());
      }
    };

    const start = async () => {
      try {
        console.log("Starting AR mode initialization...");
        await initARMode();
        isLoading = false;
        setLoading(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      } catch (err) {
        console.error("Initialization Error:", err);
        setError(err.message || "Failed to initialize. Check console for details.");
        isLoading = false;
        setLoading(false);
        cleanup();
      }
    };

    // Set a timeout in case initialization hangs
    timeoutRef.current = setTimeout(() => {
      if (isLoading) {
        setError(
          "AR initialization timeout. Make sure you have a .mind marker file."
        );
        isLoading = false;
        setLoading(false);
        cleanup();
      }
    }, 20000);

    start();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      cleanup();
    };
  }, []);



  const initARMode = async () => {
    console.log("Initializing AR mode...");

    // Check if running on HTTPS or localhost
    const isSecure =
      window.location.protocol === "https:" ||
      window.location.hostname === "localhost";
    if (!isSecure) {
      throw new Error(
        `⚠️ HTTPS Required!\nYou're on HTTP: ${window.location.protocol}//\n\nMobile browsers require HTTPS for camera access.\n\nFor testing:\n- Use localhost on PC\n- Use ngrok or tunneling service for mobile\n- Deploy to HTTPS server`
      );
    }

    // Check if mediaDevices API is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
        `Camera API not supported on this browser.\n\nTry:\n- Chrome/Edge (latest)\n- Firefox (latest)\n- Safari 14.1+\n\nOr use Demo Mode instead.`
      );
    }

    // Request camera permissions with timeout
    try {
      console.log("Requesting camera permissions...");
      const cameras = await Promise.race([
        navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Camera permission timeout")), 5000)
        ),
      ]);
      cameras.getTracks().forEach((track) => track.stop());
      console.log("Camera permission granted");
    } catch (err) {
      console.warn("Camera permission issue:", err.message);
      throw new Error(
        `Camera access denied or unavailable.\n\nError: ${err.message}\n\nMake sure:\n- You granted camera permissions\n- Your device has a camera\n- No other app is using it`
      );
    }

    // Check if .mind file exists
    try {
      console.log("Checking for /targets/card.mind...");
      const response = await Promise.race([
        fetch("/targets/card.mind", { method: "HEAD" }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("File check timeout")), 5000)
        ),
      ]);
      if (!response.ok) {
        throw new Error(
          `Status ${response.status}. Target file not found at /targets/card.mind`
        );
      }
      console.log("Target file found");
    } catch (err) {
      throw new Error(
        `Target file error: ${err.message}\n\nTo create a marker:\n1. Go to: https://hiukim.github.io/mind-ar-js/tools/compile\n2. Upload a marker image\n3. Download the .mind file\n4. Save as public/targets/card.mind`
      );
    }

    // Initialize MindAR with better error handling
    try {
      console.log("Creating MindAR instance...");

      // Ensure container is ready
      if (!containerRef.current) {
        throw new Error("Container element not found");
      }

      const mindarThree = new MindARThree({
        container: containerRef.current,
        imageTargetSrc: "/targets/card.mind",
        maxTrack: 1,
        uiLoading: "yes",
        uiScanning: "no",
        uiError: "yes",
        filterMinCF: 0.0001, // Highly sensitive to small movements for maximum sharpness
        filterBeta: 0.001,    // Reduces lag/jitter that creates motion blur
        warmupTolerance: 5,
        missTolerance: 5,
      });

      console.log("MindAR instance created");

      // Store MindAR instance for cleanup
      mindarThreeRef.current = mindarThree;

      const { renderer, scene, camera } = mindarThree;

      // Ensure high-quality rendering without blurring
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.antialias = true;

      if (!renderer || !scene || !camera) {
        throw new Error("MindAR failed to create renderer/scene/camera");
      }

      // MindAR creates a second CSS canvas on top of the WebGL canvas.
      // Disable its pointer events so taps reach the 3D meshes below.
      if (mindarThree.cssRenderer?.domElement) {
        mindarThree.cssRenderer.domElement.style.pointerEvents = "none";
        mindarThree.cssRenderer.domElement.style.zIndex = "1";
      }

      renderer.domElement.style.pointerEvents = "auto";
      renderer.domElement.style.zIndex = "2";

      // Add light
      const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
      scene.add(light);

      // Create anchor
      const anchor = mindarThree.addAnchor(0);
      console.log("Anchor created:", anchor);

      // Store AR context for social media logos
      arContextRef.current = { anchor, renderer, scene, camera };
      console.log("AR context stored, should trigger SocialMedia3D render");

      // Load GLB model ONCE
      let modelLoaded = false;
      const loader = new GLTFLoader();
      loaderRef.current = loader;
      console.log("Starting GLB model load from /cameraman_walking.glb");
      
      // Animation mixer for walking animation
      let mixer = null;
      let walkingModel = null;
      
      // Walking path configuration (corner to corner - upper area of card)
      const startPos = { x: 0.4, y: 0.15, z: -0.4 };    // Start corner (upper)
      const endPos = { x: -0.4, y: 0.15, z: -0.3 };    // End corner (upper)
      let walkProgress = 0;
      let walkDirection = 1; // 1 = forward, -1 = backward
      const walkSpeed = 0.3; // Speed of walking (units per second)
      
      loader.load(
        "/cameraman_walking.glb",
        (gltf) => {
          // Skip if model already loaded
          if (modelLoaded) {
            console.log("Model already loaded, skipping duplicate load");
            return;
          }
          modelLoaded = true;
          console.log("GLB model loaded, processing...");

          const model = gltf.scene;
          walkingModel = model;
          model.scale.set(0.15, 0.15, 0.15); 
          model.position.set(startPos.x, startPos.y, startPos.z); 
          
          // Face the walking direction initially (add PI to flip 180° since model faces backward)
          model.rotation.y = Math.atan2(endPos.x - startPos.x, endPos.z - startPos.z) + Math.PI;
          
          anchor.group.add(model);
          console.log("Cameraman GLB Model added to anchor group successfully");
          
          // Set up animation mixer for walking animation
          if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            const walkAction = mixer.clipAction(gltf.animations[0]);
            walkAction.play();
            console.log("Walking animation started, found", gltf.animations.length, "animations");
          } else {
            console.log("No animations found in GLB");
          }
        },
        (progress) => {
          console.log("Model loading progress:", Math.round((progress.loaded / progress.total) * 100) + "%");
        },
        (error) => {
          console.error("Error loading model in AR:", error);
        }
      );

      // Animation loop
      const clock = new THREE.Clock();
      let frameCount = 0;

      // Track target found events to trigger UI state
      anchor.onTargetFound = () => {
        console.log("MARKER DETECTED!");
        setTargetFound(true);
        setTrackingSession((value) => value + 1);
      };
      
      anchor.onTargetLost = () => {
        console.log("MARKER LOST!");
        setTargetFound(false);
      };

      console.log("Starting MindAR...");
      await Promise.race([
        mindarThree.start(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("MindAR start took too long (>10s)")),
            10000
          )
        ),
      ]);
      console.log("MindAR started successfully - marker detection active");

      // Set up animation loop
      const animate = () => {
        try {
          frameCount++;
          const delta = clock.getDelta();
          
          if (frameCount % 60 === 0) {
            console.log("Main render loop running, frame:", frameCount);
          }
          
          // Update animation mixer (for walking animation)
          if (mixer) {
            mixer.update(delta);
          }
          
          // Update walking position (back and forth between corners)
          if (walkingModel) {
            walkProgress += walkDirection * walkSpeed * delta;
            
            // Reverse direction at endpoints
            if (walkProgress >= 1) {
              walkProgress = 1;
              walkDirection = -1;
              // Turn around to face the start (add PI offset)
              walkingModel.rotation.y = Math.atan2(startPos.x - endPos.x, startPos.z - endPos.z) + Math.PI;
            } else if (walkProgress <= 0) {
              walkProgress = 0;
              walkDirection = 1;
              // Turn around to face the end (add PI offset)
              walkingModel.rotation.y = Math.atan2(endPos.x - startPos.x, endPos.z - startPos.z) + Math.PI;
            }
            
            // Lerp position between start and end
            walkingModel.position.x = startPos.x + (endPos.x - startPos.x) * walkProgress;
            walkingModel.position.y = startPos.y; // Keep at upper position
            walkingModel.position.z = startPos.z + (endPos.z - startPos.z) * walkProgress;
          }
          
          renderer.render(scene, camera);
          animationIdRef.current = requestAnimationFrame(animate);
        } catch (err) {
          console.error("Animation loop error:", err);
          if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
        }
      };
      animate();
    } catch (err) {
      console.error("AR initialization error:", err);
      throw err;
    }
  };



  return (
    <div ref={containerRef} style={{ width: "100vw", height: "100vh" }}>
      {/* 3D Social Media Logos (AR Mode - After Marker Tracking) */}
      {console.log("Render check - loading:", loading, "error:", error, "anchor:", arContextRef.current.anchor ? "YES" : "NO")}
      {!loading && !error && arContextRef.current.anchor && targetFound && (
        <>
          {console.log("RENDERING SocialMedia3D component!")}
          <SocialMedia3D
            key={trackingSession}
            anchor={arContextRef.current.anchor}
            renderer={arContextRef.current.renderer}
            scene={arContextRef.current.scene}
            camera={arContextRef.current.camera}
          />
        </>
      )}
      {loading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "white",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            padding: "30px",
            borderRadius: "10px",
            textAlign: "center",
            zIndex: 1000,
            maxWidth: "300px",
          }}
        >
          <p style={{ fontSize: "18px", marginBottom: "15px" }}>
            Loading AR Mode...</p>
          <div
            style={{
              border: "3px solid #fff",
              borderTop: "3px solid #ff9800",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              animation: "spin 1s linear infinite",
              margin: "0 auto 15px",
            }}
          />
          <p style={{ fontSize: "12px", marginTop: "10px", color: "#ccc" }}>
            🎯 Initializing camera...
            <br />
            Get ready to scan your marker image!
          </p>
        </div>
      )}

      {error && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "#ff6b6b",
            backgroundColor: "rgba(0, 0, 0, 0.98)",
            padding: "25px",
            borderRadius: "10px",
            textAlign: "center",
            zIndex: 1000,
            minWidth: "280px",
            maxWidth: "450px",
            border: "2px solid #ff6b6b",
            overflowY: "auto",
            maxHeight: "85vh",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <p style={{ fontSize: "18px", marginBottom: "15px", marginTop: 0 }}>
            ❌ Error
          </p>
          <p
            style={{
              fontSize: "13px",
              marginBottom: "20px",
              whiteSpace: "pre-wrap",
              textAlign: "left",
              backgroundColor: "rgba(255, 107, 107, 0.1)",
              padding: "12px",
              borderRadius: "5px",
              lineHeight: "1.5",
              fontFamily: "'Courier New', monospace",
            }}
          >
            {error}
          </p>

          {error.includes("Target file") && (
            <a
              href="/SETUP_MARKER.html"
              target="_blank"
              style={{
                display: "inline-block",
                padding: "10px 15px",
                marginRight: "10px",
                marginBottom: "10px",
                backgroundColor: "#4fc3f7",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "12px",
                textDecoration: "none",
              }}
            >
              📖 Setup Guide
            </a>
          )}

          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 15px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            🔄 Refresh
          </button>
        </div>
      )}



      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default ARScene;