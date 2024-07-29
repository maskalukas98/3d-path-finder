import {Group} from "three";
import * as THREE from "three";

export class Fire {
    public positionMoveSpeed = 0.1
    public positionLimit = -2

    private particles!: THREE.BufferGeometry
    private points!: THREE.Points
    private processing = false

    constructor(
        private scene: Group
    ) {}

    public createFire(): void {
        const particleCount = 15;
        this.particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 2;
            positions[i * 3 + 1] = Math.random() * 2;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 2;

            colors[i * 3] = 1;
            colors[i * 3 + 1] = Math.random();
            colors[i * 3 + 2] = 0;

            sizes[i] = Math.random() * 5 + 1;
        }

        this.particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const particleMaterial = new THREE.ShaderMaterial({
            uniforms: {},
            vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
            fragmentShader: `
            varying vec3 vColor;
            void main() {
                gl_FragColor = vec4(vColor, 1.0);
            }
        `,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true
        });

        this.points = new THREE.Points(this.particles, particleMaterial);
        this.scene.add(this.points);
        this.processing = true
    }

    public update(): void {
        if(!this.processing) {
            return
        }

        const positions = this.particles.attributes.position.array;

        /*
          positions[i] -= 0.1;
            if (positions[i] < -2) {
                positions[i] = 0;
            }
         */
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] -= this.positionMoveSpeed;
            if (positions[i] < this.positionLimit) {
                positions[i] = 0;
            }
        }
        this.particles.attributes.position.needsUpdate = true;
    }

    public increaseSizes(): void {
        const sizes = this.particles.attributes.size.array;

        for (let i = 0; i < sizes.length; i++) {
            sizes[i] += 20
        }

        this.particles.attributes.size.needsUpdate = true;


        const positions = this.particles.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i * 3] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 1] = Math.random() * 10;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }

        this.particles.attributes.position.needsUpdate = true
    }

    public stop(): void {
        this.processing = false

        if (this.particles) {
            this.particles.dispose();
            this.particles = undefined as unknown as THREE.BufferGeometry;
        }

        if (this.points) {
            this.scene.remove(this.points);
            this.points.geometry.dispose();
            this.points.material.dispose();
            this.points = undefined as unknown as THREE.Points;
        }
    }
}