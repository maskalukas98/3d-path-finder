import * as THREE from 'three';
import {Application} from "./src/Application";
import {EventType} from "./src/Event";


/*
import * as dat from 'lil-gui'

const gui = new dat.GUI();
        const cubeFolder = gui.addFolder('Cube Position');
        cubeFolder.add(cube.position, 'x', -10, 10);
        cubeFolder.add(cube.position, 'y', -10, 10);
        cubeFolder.add(cube.position, 'z', -10, 10);

        const rotationFolder = gui.addFolder("Rotation");
        rotationFolder.add(cube.rotation, 'x', -10, 10);
        rotationFolder.add(cube.rotation, 'y', -10, 10);
        rotationFolder.add(cube.rotation, 'z', -10, 10);

        cubeFolder.open();
        rotationFolder.open()
 */





const app = new Application()
app.start()



