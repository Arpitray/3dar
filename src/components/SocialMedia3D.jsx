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
    if (!anchor) return;

    // Create group for all logos
    const logoGroup = new THREE.Group();
    anchor.group.add(logoGroup);
    logoGroupRef.current = logoGroup;

    // Cube dimensions for reference
    const cubeSize = 0.3;
    const logoSize = cubeSize * 0.6; // 40% smaller = 60% of original size
    const spacing = 0.25; // Space between logos on X-axis
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

      // Create box geometry for logo
      const geometry = new THREE.BoxGeometry(logoSize, logoSize, logoSize * 0.1);

      // Create canvas texture with brand color and icon
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');

      // Fill with brand color
      ctx.fillStyle = social.color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add icon text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 120px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(social.icon, 128, 128);

      // Create texture from canvas
      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        emissive: new THREE.Color(social.color),
        emissiveIntensity: 0.3,
        metalness: 0.4,
        roughness: 0.6
      });

      const mesh = new THREE.Mesh(geometry, material);

      // Larger invisible hit area to make mobile taps easier than the visible logo surface
      const hitGeometry = new THREE.BoxGeometry(logoSize * 1.8, logoSize * 1.8, logoSize * 0.6);
      const hitMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.01,
        depthWrite: false,
        depthTest: false,
      });
      const hitMesh = new THREE.Mesh(hitGeometry, hitMaterial);

      // Position in straight line below cube
      mesh.position.set(x, y, z);
      hitMesh.position.set(0, 0, 0);
      mesh.scale.set(0, 0, 0); // Start at zero scale for pop-in animation
      hitMesh.scale.set(0, 0, 0);

      // Store metadata for interaction
      mesh.userData = {
        social: social,
        originalScale: 1,
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

    // Trigger pop-in animation
    animationStateRef.current.animating = true;
    animationStateRef.current.startTime = Date.now();

    return () => {
      // Cleanup
      if (logoGroup.parent) {
        logoGroup.parent.remove(logoGroup);
      }
      logosRef.current.forEach(({ mesh, hitMesh }) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
        if (mesh.material.map) mesh.material.map.dispose();
        hitMesh.geometry.dispose();
        hitMesh.material.dispose();
      });
      logosRef.current = [];
    };
  }, [anchor]);

  // Animation loop for pop-in effect
  useEffect(() => {
    const animatePopIn = () => {
      if (!animationStateRef.current.animating) return;

      const elapsed = Date.now() - animationStateRef.current.startTime;
      const duration = 600; // 600ms pop-in animation
      const progress = Math.min(elapsed / duration, 1);

      // Easing function: ease-out bounce effect
      let easeProgress = progress;
      if (progress < 0.5) {
        easeProgress = 2 * progress * progress;
      } else {
        easeProgress = 1 - Math.pow(-2 * progress + 2, 2) / 2;
      }

      // Apply scale animation with bounce
      logosRef.current.forEach(({ mesh, index }) => {
        const staggerDelay = (index * 50) / 600; // Stagger effect
        const adjustedProgress = Math.max(0, easeProgress - staggerDelay);

        const scale = adjustedProgress * mesh.userData.originalScale;
        mesh.scale.set(scale, scale, scale);
      });

      if (progress < 1) {
        requestAnimationFrame(animatePopIn);
      } else {
        animationStateRef.current.animating = false;
      }
    };

    if (animationStateRef.current.animating) {
      animatePopIn();
    }
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
      domElement.style.touchAction = 'none';
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

