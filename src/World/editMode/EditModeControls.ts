import {ControlsBar} from "../../ControlsBar";
import {GlobalProps} from "../../type";
import {c} from "vite/dist/node/types.d-aGj9QkWt";
import {GameEvents} from "../../event/GameEvents";

export class EditModeControls {
    private selectedComponent?: string

    private elements = {
        editModeRemoveBtn: ControlsBar.getElementById("edit-mode-remove-btn"),
    }

    private readonly buttons: NodeListOf<Element>
    private readonly editModeSectionElement: HTMLElement
    // handlers
    private readonly onClickAddComponentHandler: (e: Event) => void

    constructor(
        private props: GlobalProps
    ) {
        this.onClickAddComponentHandler = this.onClickAddComponent.bind(this)

        this.editModeSectionElement = ControlsBar.getElementById("edit-mode-section")
        this.buttons = this.editModeSectionElement.querySelectorAll(".add-component-btn")

        this.buttons.forEach(button => {
            button.addEventListener("click", this.onClickAddComponentHandler)
        })

        this.elements.editModeRemoveBtn.addEventListener("click", () => {
            this.props.editMode.removeComponentsFromArea()
        })
    }

    private onClickAddComponent(e: Event): void {
        e.stopPropagation()
        const target = e.target as HTMLSpanElement
        const componentType = target.getAttribute("data-component")
        this.props.editMode.addComponent(componentType as string)
    }

    public clear(): void {
        this.props.eventEmitter.dispatchEvent(new Event(GameEvents.Names.NormalModeActivated))

        document.querySelectorAll(".bar-section").forEach((element) => {
            const htmlElement = element as HTMLElement

            if(htmlElement.id !== "edit-mode-section") {
                htmlElement.style.display = "flex"
            } else {
                htmlElement.style.display = "none"
            }
        })
    }

    public enterEditMode(): void {
        this.editModeSectionElement.style.display = "flex"

        document.querySelectorAll(".bar-section").forEach((element) => {
            const htmlElement = element as HTMLElement

            if(htmlElement.id !== "base-section" && htmlElement.id !== "edit-mode-section" ) {
                htmlElement.style.display = "none"
            }
        })

        this.props.eventEmitter.dispatchEvent(new Event(GameEvents.Names.EditModeActivated))
    }

    public setEditModeVisibility(): void {
        const editMode = this.props.editMode.active
        const enter = ControlsBar.getElementById("edit-mode-enter-btn")
        const left = ControlsBar.getElementById("edit-mode-left-btn")

        if(!editMode) {
            enter.style.display = "block"
            left.style.display = "none";

        } else {
            enter.style.display = "none"
            left.style.display = "block";
        }

        if(this.props.editMode.active) {
            this.enterEditMode()
        } else {
            this.clear()
        }
    }
}