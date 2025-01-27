import * as THREE from 'three';

export function setupBallMovement(ball, paddleLeft, paddleRight, updateScore) {
    const originalSpeed = new THREE.Vector3(0.08, 0, 0.08);
    let ballSpeed = originalSpeed.clone();

    function collisionDetect(paddle, ball) {
        const paddleBox = new THREE.Box3().setFromObject(paddle);
        const ballBox = new THREE.Box3().setFromObject(ball);
        return paddleBox.intersectsBox(ballBox);
    }

    function moveBall() {
        ball.position.x += ballSpeed.x;
        ball.position.z += ballSpeed.z;

        if (ball.position.z >= 8.35 || ball.position.z <= -8.35) {
            ballSpeed.z = -ballSpeed.z;
        }

        if (collisionDetect(paddleLeft, ball) || collisionDetect(paddleRight, ball)) {
            ballSpeed.x = -ballSpeed.x;
            increaseBallSpeed();
        }

        if (ball.position.x > 17) {
            updateScore('left'); // Score for the left player
            resetBall();
        } else if (ball.position.x < -17) {
            updateScore('right'); // Score for the right player
            resetBall();
        }
    }

    function increaseBallSpeed() {
        const speedMultiplier = 1.10;
        ballSpeed.multiplyScalar(speedMultiplier);
    }

    function resetBall() {
        ball.position.set(0, 0, 0);
        ballSpeed.copy(originalSpeed);
    }

    return moveBall;
}
