import {Group, Mesh} from "three";

type Obj = Mesh | Group

export class ThreejsObject {
    public static disposeNodeAndChildren(node: Obj) {
        for (let i = node.children.length - 1; i >= 0; i--) {
            ThreejsObject.disposeNodeAndChildren(node.children[i] as Obj);
            node.remove(node.children[i]);
        }

        if (node instanceof Mesh) {
            if (node.geometry) {
                node.geometry.dispose();
            }
            if (node.material) {
                if (Array.isArray(node.material)) {
                    node.material.forEach(material => material.dispose());
                } else {
                    node.material.dispose();
                }
            }
        }
    }

}