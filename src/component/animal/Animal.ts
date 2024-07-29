import {UpdatableComponent} from "../Component";
import {AnimationAction} from "three/src/animation/AnimationAction";
import {AnimalState, AnimalStateMachine} from "./behavior/AnimalStateMachine";
import {AreaComponent, GlobalProps, LoadedModel, UnRegisterEvent} from "../../type";
import * as THREE from "three";
import {AnimationClip} from "three";
import {Behaviour} from "./behavior/Behaviour";
import {WalkBehaviour} from "./behavior/WalkBehaviour";
import {JumpBehaviour} from "./behavior/JumpBehaviour";
import {AnimalEvents} from "./AnimalEvents";

type Actions = {
    jump: AnimationClip,
    walk: AnimationClip
}

export abstract class Animal extends UpdatableComponent implements AreaComponent, UnRegisterEvent  {
    protected mixer: THREE.AnimationMixer
    protected jumpAction: AnimationAction
    protected walkAction: AnimationAction
    protected currentAction: AnimationAction

    protected stateMachine = new AnimalStateMachine()
    protected behaviour!: Behaviour

    private fieldBorder = {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
    }

    // handler
    private onChangeBehaviourHandler: (e: Event) => void

    protected constructor(
         props: GlobalProps,
         model: LoadedModel,
        id: string,
         protected fieldPos: { x: number, z: number },
        private actions: Actions
    ) {
        super(id, model, props);

        this.onChangeBehaviourHandler = this.onChangeBehaviour.bind(this)

        this.fieldBorder = {
            left: this.fieldPos.x - 26,
            top: this.fieldPos.z - 26,
            right: this.fieldPos.x + 26,
            bottom: this.fieldPos.z + 26
        }

        this.mixer = new THREE.AnimationMixer(this.model.scene);

        this.walkAction = this.prepareAction(actions.walk)
        this.jumpAction = this.prepareAction(actions.jump)

        this.currentAction = this.walkAction
        this.currentAction.play()

        this.behaviour = new WalkBehaviour(this.model.scene)

        this.registerEventListeners()
    }

    public canBeWithMultipleComponentsInArea(): boolean {
        return true
    }

    public isObstacle(): boolean {
        return false;
    }

    public update(clock: THREE.Clock, deltaTime: number): void {
        this.stateMachine.update(clock)
        this.mixer.update(deltaTime)
        this.behaviour.update()

        if(
            this.model.scene.position.x < this.fieldBorder.left ||
            this.model.scene.position.z < this.fieldBorder.top ||
            this.model.scene.position.x > this.fieldBorder.right ||
            this.model.scene.position.z > this.fieldBorder.bottom
        ) {
            this.rotateToCenterField()
        }

    }

    public unRegisterEventListeners() {
        this.stateMachine.removeEventListener(AnimalEvents.Names.BehaviourChange, this.onChangeBehaviourHandler)
    }

    protected prepareAction(clip: AnimationClip): AnimationAction {
        const action = this.mixer.clipAction(clip);
        action.loop = THREE.LoopOnce
        action.clampWhenFinished = true;

        return action
    }

    private registerEventListeners(): void {
        this.stateMachine.addEventListener(AnimalEvents.Names.BehaviourChange, this.onChangeBehaviourHandler)
    }

    private playAnimation(id: AnimalState): void {
        if(id === AnimalState.Walk) {
            if(!this.behaviour || this.behaviour.getStateId() !== id) {
                this.behaviour = new WalkBehaviour(this.model.scene)
            } else {
                this.behaviour.chooseRandomDirection()
            }

            this.transitionToWalk()
        } else if (id === AnimalState.Jump) {
            if(!this.behaviour || this.behaviour.getStateId() !== id) {
                this.behaviour = new JumpBehaviour(this.model.scene)
            } else {
                this.behaviour.chooseRandomDirection()
            }

            this.transitionToJump()
        }
    }

    private transitionToWalk(): void {
        this.currentAction.crossFadeTo(this.walkAction, 0.5, true)
        this.walkAction.loop = THREE.LoopRepeat
        this.walkAction.reset().play()
    }

    private transitionToJump(): void {
        this.currentAction.crossFadeTo(this.jumpAction, 0.5, true)
        this.walkAction.clampWhenFinished = true
        this.walkAction.loop = THREE.LoopOnce
        this.jumpAction.reset().play()

        this.mixer.addEventListener('finished', (event) => {
            this.transitionToWalk();
        });
    }

    private rotateToCenterField(): void {
        const direction = new THREE.Vector3(
            this.fieldPos.x - this.model.scene.position.x,
            0,
            this.fieldPos.z - this.model.scene.position.z
        );
        direction.normalize();

        this.behaviour.setNewTargetRotation(Math.atan2(direction.x, direction.z))
    }

    private onChangeBehaviour(e: Event): void {
        if(e instanceof AnimalEvents.BehaviorEvent) {
            this.playAnimation(e.state)
        }
    }
}