import {Mesh, MeshBasicMaterial} from "three";
import * as dat from 'lil-gui'



export class Debug {
    private static min = -100
    private static max = 100
    private static scaleMax = 30

    public static startMeshDebug(mesh: Mesh): void {
        const gui = new dat.GUI();

        const positionFolder = gui.addFolder('Mesh Position');
        positionFolder.add(mesh.position, 'x', Debug.min, Debug.max);
        positionFolder.add(mesh.position, 'y', Debug.min, Debug.max);
        positionFolder.add(mesh.position, 'z', Debug.min, Debug.max);

        const rotationFolder = gui.addFolder("Mesh Rotation");
        rotationFolder.add(mesh.rotation, 'x', Debug.min, Debug.max);
        rotationFolder.add(mesh.rotation, 'y', Debug.min, Debug.max);
        rotationFolder.add(mesh.rotation, 'z', Debug.min, Debug.max);

        const scaleFolder =  gui.addFolder("Mesh Scale");
        scaleFolder.add(mesh.scale, 'x', 0, Debug.scaleMax);
        scaleFolder.add(mesh.scale, 'y', 0, Debug.scaleMax);
        scaleFolder.add(mesh.scale, 'z', 0, Debug.scaleMax);

        if(mesh.material instanceof MeshBasicMaterial) {
            const colorFolder = gui.addFolder("Mesh color")
            colorFolder.add(mesh.material.color, 'r', 0, 1);
            colorFolder.add(mesh.material.color, 'g', 0, 1);
            colorFolder.add(mesh.material.color, 'b', 0, 1);
            colorFolder.close()
            //colorFolder.hide()
        }


        positionFolder.open();
        rotationFolder.open()
    }
}