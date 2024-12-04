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
    seqX: string;
    seqY: string;
    seqZ: string;
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
    seqX,
    seqY,
    seqZ,
}: Matrix3DVizProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const cameraPositionRef = useRef<THREE.Vector3 | null>(null);
    const controlsTargetRef = useRef<THREE.Vector3 | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Setup scene
        const scene = new THREE.Scene();

        // Create or reuse camera
        if (!cameraRef.current) {
            cameraRef.current = new THREE.PerspectiveCamera(
                50,
                width / height,
                0.1,
                1000,
            );
            // Set initial camera position
            const maxX = matrix[0][0].length - 1;
            const maxY = matrix[0].length - 1;
            const maxZ = matrix.length - 1;

            const centerX = (maxX * CELL_SPACING) / 2;
            const centerY = (maxY * CELL_SPACING) / 2;
            const centerZ = (maxZ * CELL_SPACING) / 2;

            cameraRef.current.position.set(
                centerX,
                centerY,
                maxZ * CELL_SPACING + 20,
            );
            cameraPositionRef.current = cameraRef.current.position.clone();
            controlsTargetRef.current = new THREE.Vector3(
                centerX,
                centerY,
                centerZ,
            );
        } else if (cameraPositionRef.current) {
            // Restore camera position
            cameraRef.current.position.copy(cameraPositionRef.current);
        }
        const camera = cameraRef.current;

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true, // Enable transparency
        });

        renderer.setClearColor(0x000000, 0); // Set background to transparent
        renderer.setSize(width, height);
        containerRef.current.appendChild(renderer.domElement);

        // Always create new controls but restore previous state
        const controls = new OrbitControls(camera, renderer.domElement);

        controls.enableDamping = true;
        if (controlsTargetRef.current) {
            controls.target.copy(controlsTargetRef.current);
        }
        controls.update();

        // Store controls state before cleanup
        const saveControlsState = () => {
            cameraPositionRef.current = camera.position.clone();
            controlsTargetRef.current = controls.target.clone();
        };

        // Add event listener to save state when user interacts
        controls.addEventListener("change", saveControlsState);

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

        // Add axis labels
        const addText = (text: string, position: THREE.Vector3) => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;

            canvas.width = 64;
            canvas.height = 64;

            context.fillStyle = "#888888";
            context.font = "48px Arial";
            context.fillText(text, 10, 48);

            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(material);

            sprite.position.copy(position);
            sprite.scale.set(1.2, 1.2, 1.2);
            scene.add(sprite);

            return sprite;
        };

        // Add sequence letters
        const addSequenceLabels = () => {
            // X-axis sequence (along width)
            seqX.split("").forEach((char, i) => {
                addText(char, new THREE.Vector3(i * CELL_SPACING, -1, -1));
            });

            // Y-axis sequence (along height)
            seqY.split("").forEach((char, i) => {
                addText(
                    char,
                    new THREE.Vector3(
                        -1,
                        (matrix[0].length - 1 - i) * CELL_SPACING,
                        -1,
                    ),
                );
            });

            // Z-axis sequence (along depth)
            seqZ.split("").forEach((char, i) => {
                addText(char, new THREE.Vector3(-1, -1, i * CELL_SPACING));
            });
        };

        // Add sequence labels
        addSequenceLabels();

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
        animate();

        // Cleanup
        return () => {
            controls.removeEventListener("change", saveControlsState);
            controls.dispose();
            containerRef.current?.removeChild(renderer.domElement);
            spheres.forEach((sphere) => {
                sphere.geometry.dispose();
                (sphere.material as THREE.Material).dispose();
            });
            // Clean up all materials and textures
            scene.traverse((object) => {
                if (object instanceof THREE.Sprite) {
                    (object.material as THREE.SpriteMaterial).map?.dispose();
                    object.material.dispose();
                }
            });
        };
    }, [matrix, width, height, seqX, seqY, seqZ]);

    return <div ref={containerRef} />;
}
