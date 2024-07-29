import * as THREE from "three";
import {GlobalProps} from "./type";
import {Throttler} from "./util/Throttler";
import {Mesh} from "three";
import {Component} from "./component/Component";
import {string} from "three/examples/jsm/nodes/shadernode/ShaderNode";
import {Car} from "./component/car/Car";

type ComponentName = string

export class Input {
    public keyState = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowRight: false,
        ArrowLeft: false
    }
    private raycaster: THREE.Raycaster;
    private mouse = new THREE.Vector2()

    // mouse move
    private static mouseMoveComponents: Set<string> = new Set()
    private previousMouseMoveIntersects: THREE.Intersection[] = []

    // handlers
    private onMouseMoveHandler: (e: MouseEvent) => void
    private executeHandler: () => void
    private onMouseMoveThrottledHandler: Throttler

    constructor(
        private props: GlobalProps
    ) {
        this.onMouseMoveHandler = this.onMouseMove.bind(this)
        this.onMouseMoveThrottledHandler = new Throttler(this.onMouseMoveHandler, 50)
        this.executeHandler = this.onMouseMoveThrottledHandler.execute.bind(this.onMouseMoveThrottledHandler)

        this.raycaster = new THREE.Raycaster()
        this.raycaster.layers.set(1)

        this.keyDown()
        this.keyUp()
        this.mouseClick()

        this.addMouseMoveListener()
    }

    public static registerMouseMoveComponent(componentName: string): void {
        Input.mouseMoveComponents.add(componentName)
    }

    public addMouseMoveListener(): void {
        window.addEventListener("mousemove", this.executeHandler)
    }

    public removeMouseMoveListener(): void {
        window.removeEventListener("mousemove", this.executeHandler)
    }

    private keyDown(): void {
        window.addEventListener("keydown", e => {
            const car = this.props.container.getUpdatable("car") as Car

            if(car && car.autoMove) {
                return
            }

            if (e.key === "ArrowUp") {
                this.keyState.ArrowUp = true;
            } else if (e.key === "ArrowDown") {
                this.keyState.ArrowDown = true;
            } else if (e.key === "ArrowRight") {
                this.keyState.ArrowRight = true;
            } else if (e.key === "ArrowLeft") {
                this.keyState.ArrowLeft = true;
            }
        });
    }

    private keyUp(): void {
        window.addEventListener("keyup", e => {
            if (e.key === "ArrowUp") {
                this.keyState.ArrowUp = false;
            } else if (e.key === "ArrowDown") {
                this.keyState.ArrowDown = false;
            } else if (e.key === "ArrowRight") {
                this. keyState.ArrowRight = false;
            } else if (e.key === "ArrowLeft") {
                this.keyState.ArrowLeft = false;
            }
        });
    }

    private mouseClick(): void {
        const onClick = (event: any) => {
            event.preventDefault();

            this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

            this.raycaster.setFromCamera( this.mouse, this.props.camera.getCamera() );

            const intersects = this.raycaster.intersectObjects( this.props.scene.children, true );

            if ( intersects.length > 0 ) {
                const topMostObject = intersects[0].object
                topMostObject.userData.clicked = true;
            }
        }

        window.addEventListener("click", onClick)
    }

    private onMouseMove = (e: MouseEvent) => {
        e.preventDefault()

        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.props.camera.getCamera());

        const intersects = this.raycaster.intersectObjects(this.props.scene.children, true);

        this.previousMouseMoveIntersects.forEach(previousIntersect => {
            Input.mouseMoveComponents.forEach(componentName => {
                if (previousIntersect.object.name === componentName) {
                    const isStillIntersected = intersects.find(intersect => intersect.object === previousIntersect.object);

                    if (!isStillIntersected) {
                        previousIntersect.object.userData.mouseout = true
                    }
                }
            })
        });

        if (intersects.length > 0) {
            intersects.forEach(intersect => {
                Input.mouseMoveComponents.forEach(componentName => {
                    if (intersect.object.name === componentName) {
                        intersect.object.userData.mouseover = true;
                    }
                })
            });
        }

        this.previousMouseMoveIntersects = intersects
    }
}
