import { useState, useEffect, useCallback } from 'react';

/**
 * Custom Hook לניהול טיימר במשחק
 * מטפל בספירת זמן, הקפאה והפעלה של הטיימר
 */
function useGameTimer(isActive = false, startTime = null) {
    const [gameTime, setGameTime] = useState(0);
    const [actualStartTime] = useState(startTime || Date.now());

    /**
     * עוצר את הטיימר ומחזיר את הזמן הנוכחי
     */
    const stopTimer = useCallback(() => {
        const finalTime = Math.floor((Date.now() - actualStartTime) / 1000);
        setGameTime(finalTime);
        return finalTime;
    }, [actualStartTime]);

    /**
     * מאפס את הטיימר לזמן התחלה חדש
     */
    const resetTimer = useCallback(() => {
        setGameTime(0);
    }, []);

    /**
     * מחזיר את הזמן בפורמט MM:SS
     */
    const formatTime = useCallback((timeInSeconds = gameTime) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, [gameTime]);

    /**
     * מחזיר את הזמן בפורמט טקסטואלי (לדוגמה: "2 minutes and 30 seconds")
     */
    const formatTimeText = useCallback((timeInSeconds = gameTime) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;

        if (minutes === 0) {
            return `${seconds} seconds`;
        } else if (seconds === 0) {
            return `${minutes} minute${minutes > 1 ? 's' : ''}`;
        } else {
            return `${minutes} minute${minutes > 1 ? 's' : ''} and ${seconds} second${seconds > 1 ? 's' : ''}`;
        }
    }, [gameTime]);

    /**
     * בודק האם הזמן עבר מגבול מסוים (למשל לצורך קנסות בניקוד)
     */
    const isTimeExceeded = useCallback((thresholdSeconds) => {
        return gameTime > thresholdSeconds;
    }, [gameTime]);

    /**
     * מחשב קנס נקודות על בסיס זמן
     */
    const calculateTimePenalty = useCallback((baseTime = 30, penaltyPerSecond = 10) => {
        if (gameTime <= baseTime) return 0;
        return (gameTime - baseTime) * penaltyPerSecond;
    }, [gameTime]);

    // Effect לעדכון הטיימר כל שנייה
    useEffect(() => {
        if (!isActive) return;

        const timer = setInterval(() => {
            const currentTime = Math.floor((Date.now() - actualStartTime) / 1000);
            setGameTime(currentTime);
        }, 1000);

        return () => clearInterval(timer);
    }, [isActive, actualStartTime]);

    return {
        gameTime,
        formatTime,
        formatTimeText,
        stopTimer,
        resetTimer,
        isTimeExceeded,
        calculateTimePenalty,
        startTime: actualStartTime
    };
}

export default useGameTimer;