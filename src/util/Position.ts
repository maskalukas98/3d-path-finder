import * as THREE from "three";
import {Group, Mesh, Vector3} from "three";
import {Quaternion} from "three/src/math/Quaternion";
import {tan} from "three/examples/jsm/nodes/math/MathNode";

export class Position {
    public static readonly floorY = 5.9

    public static distanceSquared(x1: number, z1: number, x2: number, z2: number): number {
        const dx = x2 - x1;
        const dz = z2 - z1;
        return dx * dx + dz * dz;
    }

    public static rotate(targetAngle: number, tiltAngle: number, rotationSpeed: number, model: Group): Quaternion {
        const currentQuaternion = model.quaternion;
        const targetQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, targetAngle + 1.5, tiltAngle));
        const factor = Math.min(1, rotationSpeed / currentQuaternion.angleTo(targetQuaternion));
        currentQuaternion.slerp(targetQuaternion, factor);

        model.setRotationFromQuaternion(currentQuaternion);

        return currentQuaternion
    }



    // TODO: rename moveXY
    public static move(movingModel: Group, targetPosition: Vector3, speed: number): THREE.Vector3 {
        const currentPosition = movingModel.position.clone();

        const direction = new THREE.Vector3().subVectors(targetPosition, currentPosition);
        direction.normalize();


        const nextPosition = currentPosition.add(direction.multiplyScalar(speed));
        nextPosition.y = movingModel.position.y
        movingModel.position.set(nextPosition.x, movingModel.position.y, nextPosition.z);

        return nextPosition
    }

    public static moveRealPos(movingModel: Group, targetPosition: Vector3, speed: number, parentMesh: Mesh): THREE.Vector3 {
        const realPos = new Vector3()
        movingModel.getWorldPosition(realPos)
        const currentPosition = realPos

        const direction = new THREE.Vector3().subVectors(targetPosition, currentPosition);
        direction.normalize();


        const nextPosition = currentPosition.add(direction.multiplyScalar(speed));
        nextPosition.y = movingModel.position.y

        const localPosition = new THREE.Vector3();
        parentMesh.worldToLocal(localPosition.copy(nextPosition));

        movingModel.position.set(nextPosition.x, movingModel.position.y, nextPosition.z);

        return nextPosition
    }

    public static moveXYZ(movingModel: Group, targetPosition: Vector3, speed: number): THREE.Vector3 {
        const currentPosition = movingModel.position.clone();

        const direction = new THREE.Vector3().subVectors(targetPosition, currentPosition);
        direction.normalize();


        const nextPosition = currentPosition.add(direction.multiplyScalar(speed));
        movingModel.position.set(nextPosition.x, nextPosition.y, nextPosition.z);

        return nextPosition
    }

    public static getTargetAngle(startPosition: Vector3, targetPosition: Vector3): number {
        const direction = new THREE.Vector3(
            targetPosition.x - startPosition.x,
            0,
            targetPosition.z - startPosition.z
        );
        direction.normalize();
        return Math.atan2(direction.x, direction.z)
    }
}