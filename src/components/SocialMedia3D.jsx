import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SOCIAL_MEDIA_CONFIG } from '../config/SocialMediaConfig';

/**
 * SocialMedia3D Component
 *
 * Creates interactive 3D social media logo boxes in AR space
 * - Positioned in straight line BELOW the cube on X-axis
 * - Static, facing the screen (no rotation)
 * - Pop in with scale animation on tracking detection
 * - Clickable with raycasting for link opening
 * - Stay in place while cube rotates
 */
const SocialMedia3D = ({ anchor, renderer, camera }) => {
  const logoGroupRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const logosRef = useRef([]);
  const animationStateRef = useRef({ animating: false, startTime: null });

  useEffect(() => {
    if (!anchor) {
      console.warn("SocialMedia3D: No anchor provided!");
      return;
    }
    console.log("SocialMedia3D mounted! Anchor:", anchor);
    
    // Create group for all logos
    const logoGroup = new THREE.Group();
    anchor.group.add(logoGroup);
    logoGroupRef.current = logoGroup;

    // Cube dimensions for reference
    const cubeSize = 0.35; // Increased slightly (was 0.3)
    const logoSize = cubeSize * 0.7; // Increased slightly (was 0.6)
    const spacing = 0.32; // Increased spacing to accommodate larger logos (was 0.25)
    const totalLogos = SOCIAL_MEDIA_CONFIG.length;

    // Calculate starting X position (centered)
    const totalWidth = (totalLogos - 1) * spacing;
    const startX = -totalWidth / 2;

    // Create logo boxes in straight line below cube
    SOCIAL_MEDIA_CONFIG.forEach((social, index) => {
      // Position on X-axis, below cube on Z-axis
      const x = startX + (index * spacing);
      const y = -0.4; // Below the cube
      const z = 0;

      // 1. INFLATABLE PILLOW GEOMETRY: Ultra-smooth squircle extrusion
      const shape = new THREE.Shape();
      const s = 1.0; // Draw shape in 1x1 space so UV mapping matches the 0..1 canvas perfectly!
      const r = 0.28; // Roundness of the pillow corners

      shape.moveTo(r, 0);
      shape.lineTo(s - r, 0);
      shape.quadraticCurveTo(s, 0, s, r);
      shape.lineTo(s, s - r);
      shape.quadraticCurveTo(s, s, s - r, s);
      shape.lineTo(r, s);
      shape.quadraticCurveTo(0, s, 0, s - r);
      shape.lineTo(0, r);
      shape.quadraticCurveTo(0, 0, r, 0);

      const extrudeSettings = {
        steps: 1,
        depth: 0.15,          // Thickness of the central seam
        bevelEnabled: true,
        bevelThickness: 0.2,  // Forward/backward puffiness (inflation)
        bevelSize: 0.15,      // Lateral curve wrapping
        bevelSegments: 32     // Ultra-smooth, cinematic edges
      };

      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geometry.center(); // Center the pivots

      // Now scale the whole geometry down physically to match logoSize
      // We do this via `geometry.scale` so the mesh scale inside the animation logic stays at 1!
      // Total width of shape was 1.0 + (bevelSize * 2) = 1.3
      const geometryScaleRatio = logoSize / 1.3; 
      geometry.scale(geometryScaleRatio, geometryScaleRatio, geometryScaleRatio);

      // 2. HIGH-RES CLEAN COLOR TEXTURE
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');

      // Base brand color (solid, pure color)
      ctx.fillStyle = social.color;
      ctx.fillRect(0, 0, 1024, 1024);

      // Clean, crisp icon drawing without shadow clutter
      ctx.fillStyle = 'white';
      ctx.font = 'bold 480px "Inter", "Segoe UI", Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(social.icon, 512, 512);

      const colorTexture = new THREE.CanvasTexture(canvas);
      colorTexture.anisotropy = 16;
      colorTexture.colorSpace = THREE.SRGBColorSpace;
      colorTexture.wrapS = THREE.ClampToEdgeWrapping;
      colorTexture.wrapT = THREE.ClampToEdgeWrapping;

      // 3. STUDIO LIGHTING MATERIAL: Soft Clean App Icon Look
      const frontMaterial = new THREE.MeshPhysicalMaterial({
        map: colorTexture,
        color: '#ffffff',
        metalness: 0.1,
        roughness: 0.4,
        clearcoat: 0.3,
        clearcoatRoughness: 0.3,
      });

      const sideMaterial = new THREE.MeshPhysicalMaterial({
        color: social.color,
        metalness: 0.1,
        roughness: 0.4,
        clearcoat: 0.3,
        clearcoatRoughness: 0.3,
      });

      const mesh = new THREE.Mesh(geometry, [frontMaterial, sideMaterial]);

      const hitGeometry = new THREE.BoxGeometry(logoSize * 1.8, logoSize * 1.8, logoSize * 0.6);
      const hitMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.01,
        depthWrite: false,
        depthTest: false,
      });
      const hitMesh = new THREE.Mesh(hitGeometry, hitMaterial);

      // Position in straight line below cube
      const targetY = y;
      const startY = y + 0.3; // Start 0.3 units on the opposite side so it settles into place correctly
      mesh.position.set(x, startY, z);
      hitMesh.position.set(0, 0, 0);
      mesh.scale.set(0, 0, 0); // Start at zero scale for pop-in animation
      hitMesh.scale.set(0, 0, 0);

      // Store metadata for interaction
      mesh.userData = {
        social: social,
        originalScale: 1,
        targetY: targetY,
        startY: startY,
        isLogo: true
      };

      hitMesh.userData = {
        social: social,
        originalScale: 1,
        isLogo: true
      };

      mesh.add(hitMesh);
      logoGroup.add(mesh);
      logosRef.current.push({
        mesh: mesh,
        hitMesh: hitMesh,
        social: social,
        index: index
      });
    });

    console.log("Logos created! Waiting to trigger animation... Total logos:", logosRef.current.length);

    let timeoutId;
    const animationState = animationStateRef.current;

    const resetAnimation = () => {
      console.log("Resetting animation manually...");
      if (timeoutId) clearTimeout(timeoutId);

      logosRef.current.forEach(({ mesh }) => {
        mesh.scale.set(0, 0, 0);
        mesh.position.y = mesh.userData.startY;
      });

      animationStateRef.current.animating = false;

      if (animationStateRef.current.frameId) {
        cancelAnimationFrame(animationStateRef.current.frameId);
        animationStateRef.current.frameId = null;
      }
    };

    resetAnimation();

    // Start the animation loop definition
    const animatePopIn = () => {
      if (!animationStateRef.current.animating) {
        console.log("Animation stopped");
        return;
      }

      const elapsed = Date.now() - animationStateRef.current.startTime;
      let allComplete = true;

      // Apply scale and translation animation
      logosRef.current.forEach(({ mesh, index }) => {
        const itemStartTime = index * 80; // 80ms stagger between each
        const itemDuration = 800; // each item takes 800ms to pop in
        
        let itemProgress = 0;
        if (elapsed > itemStartTime) {
          itemProgress = Math.min((elapsed - itemStartTime) / itemDuration, 1);
        }

        if (itemProgress < 1) {
          allComplete = false;
        }

        // Easing function: smooth ease-in-out cubic
        let easeProgress;
        if (itemProgress < 0.5) {
          easeProgress = 4 * itemProgress * itemProgress * itemProgress; // Ease-in
        } else {
          easeProgress = 1 - Math.pow(-2 * itemProgress + 2, 3) / 2; // Ease-out
        }

        // Scale component
        const scale = easeProgress * mesh.userData.originalScale;
        mesh.scale.set(scale, scale, scale);

        // Slide up component (Y translation)
        const currentY = mesh.userData.startY + (mesh.userData.targetY - mesh.userData.startY) * easeProgress;
        mesh.position.y = currentY;
      });

      if (!allComplete) {
        animationStateRef.current.frameId = requestAnimationFrame(animatePopIn);
      } else {
        console.log("Animation complete!");
        animationStateRef.current.animating = false;
      }
    };

    // Start the animation after a small delay every time this component mounts.
    timeoutId = setTimeout(() => {
      animationStateRef.current.animating = true;
      animationStateRef.current.startTime = Date.now();
      console.log("Animation triggered! Total logos:", logosRef.current.length);
      animatePopIn();
    }, 1200);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (animationState.frameId) {
        cancelAnimationFrame(animationState.frameId);
      }
      console.log("SocialMedia3D cleanup");
      if (logoGroup.parent) {
        logoGroup.parent.remove(logoGroup);
      }
      logosRef.current.forEach(({ mesh, hitMesh }) => {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(mat => {
            mat.dispose();
            if (mat.map) mat.map.dispose();
          });
        } else {
          mesh.material.dispose();
          if (mesh.material.map) mesh.material.map.dispose();
        }
        hitMesh.geometry.dispose();
        hitMesh.material.dispose();
      });
      logosRef.current = [];
    };
  }, [anchor]);

  const openSocialUrl = (url) => {
    if (!url) return;

    try {
      // Same-tab navigation is more reliable on mobile than popup windows.
      window.location.href = url;
    } catch (error) {
      console.error('Error navigating to link:', error);
    }
  };

  // Handle pointer/touch interactions for logo interaction
  useEffect(() => {
    const getPointerPosition = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();

      const clientX =
        event.clientX ??
        (event.changedTouches && event.changedTouches[0]?.clientX);
      const clientY =
        event.clientY ??
        (event.changedTouches && event.changedTouches[0]?.clientY);

      if (typeof clientX !== 'number' || typeof clientY !== 'number') {
        return null;
      }

      mouseRef.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      return mouseRef.current;
    };

    const handleInteraction = (event) => {
      if (!logosRef.current || logosRef.current.length === 0) {
        console.log('No logos to click');
        return;
      }

      const pointerPosition = getPointerPosition(event);
      if (!pointerPosition) {
        console.log('Unable to determine tap position');
        return;
      }

      // Update the picking ray with the camera and mouse position
      raycasterRef.current.setFromCamera(mouseRef.current, camera);

      // Get all logo meshes
      const logoMeshes = logosRef.current.map(l => l.mesh);

      // Calculate objects intersecting the picking ray
      const intersects = raycasterRef.current.intersectObjects(logoMeshes, true);

      console.log('Click detected - Intersects:', intersects.length);

      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        console.log('Object clicked:', clickedObject.userData);

        const logoData = clickedObject.userData?.social;
        if (logoData?.url) {
          const { url, name } = logoData;
          console.log('Navigating to URL:', url, 'for', name);
          event.preventDefault();
          openSocialUrl(url);
        }
      } else {
        console.log('No logos intersected at click position');
      }
    };

    if (renderer && renderer.domElement) {
      const domElement = renderer.domElement;
      domElement.style.setProperty('touch-action', 'none');
      domElement.addEventListener('click', handleInteraction);
      domElement.addEventListener('pointerup', handleInteraction);
      domElement.addEventListener('touchend', handleInteraction, { passive: false });
      console.log('Interaction listeners attached');

      return () => {
        domElement.removeEventListener('click', handleInteraction);
        domElement.removeEventListener('pointerup', handleInteraction);
        domElement.removeEventListener('touchend', handleInteraction);
        console.log('Interaction listeners removed');
      };
    }
  }, [renderer, camera]);

  return null; // This component doesn't render anything to React, it modifies the Three.js scene
};

export default SocialMedia3D;

