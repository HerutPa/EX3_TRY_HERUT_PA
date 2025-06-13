package com.example.wordgame.service;

import com.example.wordgame.model.ScoreEntry;
import com.example.wordgame.repository.ScoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

/**
 * Service for handling the business logic of the scores and leaderboard
 * Contains all calculations and validations related to the game results
 */
@Service
public class ScoreService {

    private final ScoreRepository scoreRepository;

    /**
     * Constructor with Dependency Injection
     * @param scoreRepository The Repository for handling scores
     */
    @Autowired
    public ScoreService(ScoreRepository scoreRepository) {
        this.scoreRepository = scoreRepository;
    }


    /**
     * Saves a new game result
     * Automatically calculates the final score according to the formula
     * @param nickname Player name
     * @param gameTimeSeconds Game time in seconds
     * @param attemptCount Number of attempts
     * @param usedHint Did you use a hint
     * @param category The category you played in
     * @param wordGuessed The word you guessed
     * @param won Did you win the game
     * @return The saved result including the calculated score
     * @throws IllegalArgumentException if the data is invalid
     * @throws IllegalStateException if there is a problem saving
     */
    public ScoreEntry saveGameResult(String nickname, long gameTimeSeconds,
                                     int attemptCount, boolean usedHint,
                                     String category, String wordGuessed, boolean won) {

        if (nickname == null || nickname.trim().isEmpty()) {
            throw new IllegalArgumentException("Player name cannot be empty.");
        }

        if (nickname.length() > 20) {
            throw new IllegalArgumentException("Player name cannot be longer than 20 characters.");
        }

        if (gameTimeSeconds < 0) {
            throw new IllegalArgumentException("Game time cannot be negative.");
        }

        if (attemptCount < 0) {
            throw new IllegalArgumentException("Number of attempts cannot be negative.");
        }

        if (category == null || category.trim().isEmpty()) {
            throw new IllegalArgumentException("Category cannot be empty.");
        }

        if (wordGuessed == null || wordGuessed.trim().isEmpty()) {
            throw new IllegalArgumentException("The word guessed cannot be empty.");
        }

        int finalScore = ScoreEntry.calculateScore(gameTimeSeconds, attemptCount, usedHint, won);
        String cleanNickname = nickname.trim();
        String cleanCategory = category.toLowerCase();
        String cleanWord = wordGuessed.toLowerCase();

        try {
            List<ScoreEntry> allScores = scoreRepository.getAllScores();

            // חיפוש שחקן קיים לפי nickname
            Optional<ScoreEntry> existingEntryOpt = allScores.stream()
                    .filter(score -> cleanNickname.equalsIgnoreCase(score.getNickname()))
                    .findFirst();

            if (existingEntryOpt.isPresent()) {
                ScoreEntry existing = existingEntryOpt.get();
                if (finalScore <= existing.getFinalScore()) {
                    return existing; // אם הציון לא טוב יותר - לא לעדכן
                }

                // עדכון הציון
                existing.setFinalScore(finalScore);
                existing.setGameTimeSeconds(gameTimeSeconds);
                existing.setAttemptCount(attemptCount);
                existing.setUsedHint(usedHint);
                existing.setCategory(cleanCategory);
                existing.setWordGuessed(cleanWord);
                existing.setWon(won);

                scoreRepository.saveAllScores(allScores);
                return existing;
            }

            // תוצאה חדשה
            ScoreEntry newEntry = new ScoreEntry(
                    cleanNickname, finalScore, gameTimeSeconds, attemptCount,
                    usedHint, cleanCategory, cleanWord, won
            );

            allScores.add(newEntry);
            scoreRepository.saveAllScores(allScores);
            return newEntry;

        } catch (IOException e) {
            throw new IllegalStateException("Failed to save game result", e);
        }
    }


    /**
     * Returns the top record table
     * @param topN Maximum number of results (default: 10)
     * @return The list of records sorted by score
     * @throws IllegalStateException if there is a problem reading the data
     */
    public List<ScoreEntry> getTopScores(int topN) {
        if (topN <= 0) {
            topN = 10; // default
        }

        try {
            return scoreRepository.getLeaderboard(topN);
        } catch (IOException e) {
            throw new IllegalStateException("Error reading the record table: " + e.getMessage(), e);
        }
    }

    /**
     * Returns the full record table (unlimited)
     * @return List of all records sorted
     */
    public List<ScoreEntry> getFullLeaderboard() {
        return getTopScores(0);
    }

    /**
     * Returns the highest score of a specific player
     * @param nickname The player's name
     * @return The highest score or 0 if the player does not exist
     * @throws IllegalArgumentException if the name is invalid
     * @throws IllegalStateException if there is a problem reading
     */
    public int getPlayerBestScore(String nickname) {
        if (nickname == null || nickname.trim().isEmpty()) {
            throw new IllegalArgumentException("Player name cannot be empty.");
        }

        try {
            return scoreRepository.getPlayerBestScore(nickname.trim());
        } catch (IOException e) {
            throw new IllegalStateException("Error reading player score:" + e.getMessage(), e);
        }
    }

    /**
     * Returns all results for a specific player
     * @param nickname The player's name
     * @return The list of results for the player
     * @throws IllegalArgumentException if the name is invalid
     * @throws IllegalStateException if there is a problem reading
     */
    public List<ScoreEntry> getPlayerHistory(String nickname) {
        if (nickname == null || nickname.trim().isEmpty()) {
            throw new IllegalArgumentException("Player name cannot be empty.");
        }

        try {
            return scoreRepository.getPlayerScores(nickname.trim());
        } catch (IOException e) {
            throw new IllegalStateException("Error reading player history:" + e.getMessage(), e);
        }
    }

    /**
     * Checks if the grading system is available
     * @return true if the system is ready to use
     */
    public boolean isScoreSystemReady() {
        try {
            // Attempt to read the file
            scoreRepository.getAllScores();
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}