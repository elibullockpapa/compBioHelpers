"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { Cell } from "@/app/global-alignment-3d/page";

export type Matrix3D = Cell[][][];

interface Matrix3DVizProps {
    matrix: Matrix3D;
    width?: number;
    height?: number;
}

// Constants for visualization
const CELL_SPACING = 1.2; // Space between cells
const BASE_SPHERE_RADIUS = 0.5; // Base size of spheres
const MIN_SPHERE_SCALE = 0.1; // Minimum scale for non-alignment spheres
const MAX_SPHERE_SCALE = 1.0; // Maximum scale for non-alignment spheres
const SPHERE_SEGMENTS = 32; // Geometry detail level

// Lighting constants
const AMBIENT_LIGHT_INTENSITY = 0.6;
const DIRECTIONAL_LIGHT_INTENSITY = 0.8;

// Material constants
const ALIGNMENT_COLOR = 0x00ff00; // Green
const DEFAULT_COLOR = 0xcccccc; // Gray
const ALIGNMENT_OPACITY = 0.8;
const BASE_OPACITY = 0.3;

export default function Matrix3DViz({
    matrix,
    width = 800,
    height = 600,
}: Matrix3DVizProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Setup scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75,
            width / height,
            0.1,
            1000,
        );
        const renderer = new THREE.WebGLRenderer({ antialias: true });

        renderer.setSize(width, height);
        containerRef.current.appendChild(renderer.domElement);

        // Add controls
        const controls = new OrbitControls(camera, renderer.domElement);

        controls.enableDamping = true;

        // Add lighting
        const ambientLight = new THREE.AmbientLight(
            0xffffff,
            AMBIENT_LIGHT_INTENSITY,
        );

        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(
            0xffffff,
            DIRECTIONAL_LIGHT_INTENSITY,
        );

        directionalLight.position.set(10, 10, 10);
        scene.add(directionalLight);

        // Visualize matrix
        const spheres: THREE.Mesh[] = [];
        const geometry = new THREE.SphereGeometry(
            BASE_SPHERE_RADIUS,
            SPHERE_SEGMENTS,
            SPHERE_SEGMENTS,
        );

        // Find min/max values for color scaling
        let minVal = Infinity;
        let maxVal = -Infinity;

        matrix.forEach((layer) =>
            layer.forEach((row) =>
                row.forEach((cell) => {
                    minVal = Math.min(minVal, cell.score);
                    maxVal = Math.max(maxVal, cell.score);
                }),
            ),
        );

        // Create spheres for each cell
        matrix.forEach((layer, z) => {
            layer.forEach((row, y) => {
                row.forEach((cell, x) => {
                    const normalizedValue =
                        (cell.score - minVal) / (maxVal - minVal);
                    const material = new THREE.MeshPhongMaterial({
                        color: cell.inAlignment
                            ? ALIGNMENT_COLOR
                            : DEFAULT_COLOR,
                        transparent: true,
                        opacity: cell.inAlignment
                            ? ALIGNMENT_OPACITY
                            : BASE_OPACITY * normalizedValue,
                    });

                    const sphere = new THREE.Mesh(geometry, material);

                    // Scale sphere based on score (unless it's in the alignment)
                    if (!cell.inAlignment) {
                        const scale =
                            MIN_SPHERE_SCALE +
                            Math.pow(normalizedValue, 1.5) *
                                (MAX_SPHERE_SCALE - MIN_SPHERE_SCALE);

                        sphere.scale.set(scale, scale, scale);
                    }

                    sphere.position.set(
                        x * CELL_SPACING,
                        (matrix[0].length - 1 - y) * CELL_SPACING,
                        z * CELL_SPACING,
                    );
                    scene.add(sphere);
                    spheres.push(sphere);
                });
            });
        });

        // Position camera to look at center of matrix
        const maxX = matrix[0][0].length - 1;
        const maxY = matrix[0].length - 1;
        const maxZ = matrix.length - 1;

        // Calculate center point of matrix
        const centerX = (maxX * CELL_SPACING) / 2;
        const centerY = (maxY * CELL_SPACING) / 2;
        const centerZ = (maxZ * CELL_SPACING) / 2;

        // Set camera position and controls target
        camera.position.set(
            centerX,
            centerY,
            maxZ * CELL_SPACING + 13, // Position camera behind matrix
        );

        // Set the orbit controls target to the center of the matrix
        controls.target.set(centerX, centerY, centerZ);
        controls.update(); // Important: must update controls after changing target

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
        animate();

        // Cleanup
        return () => {
            containerRef.current?.removeChild(renderer.domElement);
            spheres.forEach((sphere) => {
                sphere.geometry.dispose();
                (sphere.material as THREE.Material).dispose();
            });
        };
    }, [matrix, width, height]);

    return <div ref={containerRef} />;
}