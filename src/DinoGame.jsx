import React, { useEffect, useRef, useState } from 'react';
import './dino.css';

const BASE_OBSTACLE_SPEED = 6;
const JUMP_HEIGHT = 120;
const GRAVITY = 4;
const OBSTACLE_INTERVAL = 1400;
const MAX_LIVES = 3;
const SPEED_INCREASE_INTERVAL = 100;
const SECRET = "42111142"; // 🔒 пароль для доступа к чекпоинтам


export default function DinoGame({ finishScore = 3000, finishImageUrl = '/finish.png' }) {
    const [showImage, setShowImage] = useState(false);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(MAX_LIVES);
    const [isJumping, setIsJumping] = useState(false);
    const [jumpCount, setJumpCount] = useState(0);
    const [dinoBottom, setDinoBottom] = useState(0);
    const [obstacles, setObstacles] = useState([]);
    const [gameOver, setGameOver] = useState(false);
    const [gameWin, setGameWin] = useState(false);
    const [checkpoints, setCheckpoints] = useState([]);
    const [showCheckpointMenu, setShowCheckpointMenu] = useState(false);
    const [password, setPassword] = useState('');
    const [authPassed, setAuthPassed] = useState(false);

    const gameContainerRef = useRef();

    // Jump effect
    useEffect(() => {
        let gravityInterval;
        if (isJumping) {
            gravityInterval = setInterval(() => {
                setDinoBottom(prev => {
                    if (prev + GRAVITY >= JUMP_HEIGHT) {
                        setIsJumping(false);
                        return JUMP_HEIGHT;
                    }
                    return prev + GRAVITY;
                });
            }, 20);
        } else {
            gravityInterval = setInterval(() => {
                setDinoBottom(prev => (prev > 0 ? prev - GRAVITY : 0));
            }, 20);
        }
        return () => clearInterval(gravityInterval);
    }, [isJumping]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space' && !gameOver && !gameWin) {
                if (jumpCount < 2) {
                    setIsJumping(true);
                    setJumpCount(j => j + 1);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [jumpCount, gameOver, gameWin]);

    useEffect(() => {
        if (dinoBottom <= 0) setJumpCount(0);
    }, [dinoBottom]);

    // Generate obstacles
    useEffect(() => {
        if (gameOver || gameWin) return;
        const interval = setInterval(() => {
            const isFlying = Math.random() < 0.3;
            const height = isFlying ? 60 : 0;
            const type = isFlying ? 'bird' : 'cactus';
            setObstacles(prev => [...prev, { id: Date.now(), left: 600, bottom: height, type }]);
        }, OBSTACLE_INTERVAL);
        return () => clearInterval(interval);
    }, [gameOver, gameWin]);

    // Move obstacles, update score
    useEffect(() => {
        if (gameOver || gameWin) return;
        const speed = BASE_OBSTACLE_SPEED + Math.floor(score / SPEED_INCREASE_INTERVAL);
        const interval = setInterval(() => {
            setObstacles(prev =>
                prev.map(ob => ({ ...ob, left: ob.left - speed })).filter(ob => ob.left > -40)
            );
            setScore(prev => {
                const newScore = prev + 1;
                if (newScore % 1000 === 0 && !checkpoints.includes(newScore)) {
                    setCheckpoints(cp => [...cp, newScore]);
                }
                return newScore;
            });
        }, 20);
        return () => clearInterval(interval);
    }, [score, gameOver, gameWin]);

    // Collision & win
    useEffect(() => {
        obstacles.forEach(ob => {
            if (ob.left < 60 && ob.left > 20 && Math.abs(ob.bottom - dinoBottom) < 40) {
                setObstacles(prev => prev.filter(o => o.id !== ob.id));
                setLives(prev => {
                    const newLives = prev - 1;
                    if (newLives <= 0) setGameOver(true);
                    return newLives;
                });
            }
        });
        if (score >= finishScore && !gameOver) {
            setGameWin(true);
        }
    }, [obstacles, dinoBottom, score, finishScore, gameOver]);

    // Restart from checkpoint
    const restartFromCheckpoint = (cp) => {
        setScore(cp);
        setLives(MAX_LIVES);
        setGameOver(false);
        setObstacles([]);
        setGameWin(false);
        setShowCheckpointMenu(false);
        setAuthPassed(false);
        setPassword('');
    };

    // Game end screen
    if (gameOver) {
        return (
            <div className="game-end">
                <div>💥 лох</div>
                <button onClick={() => setShowCheckpointMenu(true)}>🔓 Checkpoints</button>

                {showCheckpointMenu && (
                    <div className="checkpoint-menu">
                        {!authPassed ? (
                            <>
                                <p>Пароль:</p>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                                <button onClick={() => setAuthPassed(password === SECRET)}>
                                    Подтвердить
                                </button>
                            </>
                        ) : (
                            <>
                                <p>Доступные чекпоинты:</p>
                                {checkpoints.map(cp => (
                                    <button key={cp} onClick={() => restartFromCheckpoint(cp)}>
                                        Начать с {cp}
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>
        );
    }

    if (gameWin) {
        return (
            <div className="game-end win">
                <button onClick={() => setShowImage(true)}>Показать последний спойлер</button>

                {showImage && (
                    <img src={finishImageUrl} alt="Finish" />
                )}
            </div>
        );
    }

    return (
        <div ref={gameContainerRef} className="game-container">
            <div className="dino" style={{ bottom: `${dinoBottom}px` }} />
            {obstacles.map(ob => (
                <div
                    key={ob.id}
                    className={`obstacle ${ob.type}`}
                    style={{ left: `${ob.left}px`, bottom: `${ob.bottom}px` }}
                />
            ))}
            <div className="score">Очки: {score}</div>
            <div className="lives">❤️ {lives}</div>
        </div>
    );
}
