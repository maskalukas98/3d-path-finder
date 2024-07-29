import {Group, Mesh, Scene} from "three";
import {Component, UpdatableComponent} from "./component/Component";
import {UpdatableLogic} from "./type";
import {ThreejsObject} from "./util/ThreejsObject";

export class Container {
    private readonly components: Component[] = []
    private updatableComponents: UpdatableComponent[] = []
    public readonly updatableLogics: UpdatableLogic[] = []
    public readonly staticObjects: (Mesh | Group)[] = []

    constructor(
        private scene: Scene
    ) {}

    public addStaticObject(obj: Mesh | Group): void {
        this.staticObjects.push(obj)
    }

    addComponent(component: Component, loadedScene: Group): void {
        this.components.push(component)
        this.scene.add(loadedScene)
    }

    addUpdatableComponent(component: UpdatableComponent, loadedScene: Group): void {
        this.updatableComponents.push(component)
        this.scene.add(loadedScene)
    }

    addUpdatableLogic(obj: UpdatableLogic, unique: boolean = true): void {
        if(unique) {
            this.removeUpdatableLogic(obj)
        }

        this.updatableLogics.push(obj)
    }

    public removeUpdatableLogic(obj: UpdatableLogic): void {
        const storedObj = this.updatableLogics.find(s => s.getId() === obj.getId())

        if(!storedObj) {
            return
        }

        const index = this.updatableLogics.indexOf(storedObj)
        if(index > -1) {
            this.updatableLogics.splice(index, 1)
        }
    }

    public add(component: Component, loadedScene: Group): void {
        if(component instanceof UpdatableComponent) {
            this.addUpdatableComponent(component, loadedScene)
        } else {
            this.addComponent(component, loadedScene)
        }
    }

    public remove(component: Component): void {
        component.remove()

        if(component instanceof UpdatableComponent) {
            const index = this.updatableComponents.indexOf(component)

            if(index > -1) {
                this.updatableComponents.splice(index, 1)
            }
        } else {
            const index = this.components.indexOf(component)

            if(index > -1) {
                this.components.splice(index, 1)
            }
        }
    }

    public removeAll(): void {
        this.components.forEach(component => {
            if("unRegisterEventListeners" in component) {
                // @ts-ignore
                component.unRegisterEventListeners()
            }

            component.remove()
        })

        this.updatableComponents.forEach(component => {
            if("unRegisterEventListeners" in component) {
                // @ts-ignore
                component.unRegisterEventListeners()
            }

            component.remove()
        })

        this.staticObjects.forEach(obj => {
            ThreejsObject.disposeNodeAndChildren(obj)
        })

        this.components.length = 0
        this.updatableComponents.length = 0
        this.updatableLogics.length = 0
        this.staticObjects.length = 0
    }

    public getUpdatable<T>(id: string): T | undefined {
        return this.updatableComponents.find(s => s.getId() === id) as T
    }

    public getUpdatableLogic<T>(id: string): T {
        const component = this.updatableLogics.find(s => s.getId() === id)

        if(!component) {
            throw new Error("Updatable logic with id " + id + " not found.")
        }

        return component as T
    }

    public getUpdatableComponents(): UpdatableComponent[] {
        return this.updatableComponents
    }
}