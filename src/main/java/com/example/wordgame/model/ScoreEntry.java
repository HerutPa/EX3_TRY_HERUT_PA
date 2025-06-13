package com.example.wordgame.model;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Game result model
 * Saved in leaderboard (scores.ser)
 * Contains all the details needed to calculate the score
 */
public class ScoreEntry implements Serializable {

    // Serialization version
    // private static final long serialVersionUID = 1L;

    // Player name (nickname) - must be unique
    private String nickname;
    // The final score calculated
    private int finalScore;
    // Game time in seconds
    private long gameTimeSeconds;
    // Number of attempts made by the player
    private int attemptCount;
    // Did you use the hint?
    private boolean usedHint;
    // The category in which he played
    private String category;
    // The word guessed (for statistics)
    private String wordGuessed;
    // Date and time of the game
    private LocalDateTime gameDate;
    // Did he win the game
    private boolean won;

    /**
     * Full constructor
     * @param nickname Player name
     * @param finalScore Final score
     * @param gameTimeSeconds Game time in seconds
     * @param attemptCount Number of attempts
     * @param usedHint Did you use a hint
     * @param category Category
     * @param wordGuessed Word guessed
     * @param won Did you win
     */
    public ScoreEntry(String nickname, int finalScore, long gameTimeSeconds,
                      int attemptCount, boolean usedHint, String category,
                      String wordGuessed, boolean won) {
        this.nickname = nickname;
        this.finalScore = finalScore;
        this.gameTimeSeconds = gameTimeSeconds;
        this.attemptCount = attemptCount;
        this.usedHint = usedHint;
        this.category = category;
        this.wordGuessed = wordGuessed;
        this.won = won;
        this.gameDate = LocalDateTime.now();
    }

    /**
     * Automatic score calculation by formula
     * Base score: 1000 points
     * Time penalty: -10 points for every second over 30 seconds
     * Attempt penalty: -50 points for every attempt over 3
     * Hint penalty: -100 points
     * Minimum score: 50 points
     *
     * @param gameTimeSeconds Game time in seconds
     * @param attemptCount Number of attempts
     * @param usedHint Did you use the hint
     * @param won Did you win
     * @return Calculated score
     */
    public static int calculateScore(long gameTimeSeconds, int attemptCount,
                                     boolean usedHint, boolean won) {
        // If not won - score 0
        if (!won) {
            return 0;
        }
        int baseScore = 1000;
        // Time penalty - 10 points for every second over 30
        if (gameTimeSeconds > 30) {
            baseScore -= (int)(gameTimeSeconds - 30) * 10;
        }
        // Attempt penalty - 50 points for each attempt over 3
        if (attemptCount > 3) {
            baseScore -= (attemptCount - 3) * 50;
        }
        // Hint penalty - 100 points
        if (usedHint) {
            baseScore -= 100;
        }
        // Minimum score 50
        return Math.max(baseScore, 50);
    }

    // Getters and Setters
    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public int getFinalScore() {
        return finalScore;
    }

    public void setFinalScore(int finalScore) {
        this.finalScore = finalScore;
    }

    public long getGameTimeSeconds() {
        return gameTimeSeconds;
    }

    public void setGameTimeSeconds(long gameTimeSeconds) {
        this.gameTimeSeconds = gameTimeSeconds;
    }

    public int getAttemptCount() {
        return attemptCount;
    }

    public void setAttemptCount(int attemptCount) {
        this.attemptCount = attemptCount;
    }

    public boolean isUsedHint() {
        return usedHint;
    }

    public void setUsedHint(boolean usedHint) {
        this.usedHint = usedHint;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getWordGuessed() {
        return wordGuessed;
    }

    public void setWordGuessed(String wordGuessed) {
        this.wordGuessed = wordGuessed;
    }

    public LocalDateTime getGameDate() {
        return gameDate;
    }

    public void setGameDate(LocalDateTime gameDate) {
        this.gameDate = gameDate;
    }

    public boolean isWon() {
        return won;
    }

    public void setWon(boolean won) {
        this.won = won;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        ScoreEntry that = (ScoreEntry) obj;
        return Objects.equals(nickname, that.nickname) &&
                Objects.equals(gameDate, that.gameDate);
    }

    @Override
    public int hashCode() {
        return Objects.hash(nickname, gameDate);
    }

    @Override
    public String toString() {
        return "ScoreEntry{" +
                "nickname='" + nickname + '\'' +
                ", finalScore=" + finalScore +
                ", gameTimeSeconds=" + gameTimeSeconds +
                ", attemptCount=" + attemptCount +
                ", usedHint=" + usedHint +
                ", category='" + category + '\'' +
                ", wordGuessed='" + wordGuessed + '\'' +
                ", gameDate=" + gameDate +
                ", won=" + won +
                '}';
    }
}