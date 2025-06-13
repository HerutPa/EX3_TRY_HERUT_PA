package com.example.wordgame.repository;

import com.example.wordgame.model.ScoreEntry;
import org.springframework.stereotype.Repository;

import java.io.*;
import java.util.*;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.stream.Collectors;

/**
 * Repository for handling the scores.ser file (leaderboard)
 * Handles all operations on the leaderboard in a thread-safe manner
 * The file name is defined as final static as required by the assignment
 */
@Repository
public class ScoreRepository {

    // file name
    private static final String SCORES_FILE = "scores.ser";

    // Locking to handle race conditions
    private final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();

    /**
     * Loads all results from the file
     * @return List of all results or an empty list if the file does not exist
     * @throws IOException if there is a problem reading the file
     */
    public List<ScoreEntry> getAllScores() throws IOException {
        lock.readLock().lock();
        try {
            File file = new File(SCORES_FILE);
            if (!file.exists()) {
                return new ArrayList<>();
            }

            try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(file))) {
                Object obj = ois.readObject();
                if (obj instanceof List<?>) {
                    List<?> list = (List<?>) obj;
                    if (list.isEmpty() || list.get(0) instanceof ScoreEntry) {
                        return (List<ScoreEntry>) list;
                    }
                }
                return new ArrayList<>();
            } catch (ClassNotFoundException e) {
                throw new IOException("The record file is corrupt - cannot be read.", e);
            }
        } finally {
            lock.readLock().unlock();
        }
    }

    /**
     * Saves all results to a file
     * @param scores List of results to save
     * @throws IOException if there is a problem writing the file
     */
    public void saveAllScores(List<ScoreEntry> scores) throws IOException {
        lock.writeLock().lock();
        try {
            try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(SCORES_FILE))) {
                oos.writeObject(scores);
                oos.flush();
            }
        } finally {
            lock.writeLock().unlock();
        }
    }

    /**
     * Adds a new score to the highscore table
     * @param scoreEntry the new score
     * @throws IOException if there is a problem saving the file
     * @throws IllegalArgumentException if the result is invalid
     */
    public void addScore(ScoreEntry scoreEntry) throws IOException {
        if (scoreEntry == null || scoreEntry.getNickname() == null ||
                scoreEntry.getNickname().trim().isEmpty()) {
            throw new IllegalArgumentException("The result is incorrect.");
        }

        List<ScoreEntry> scores = getAllScores();
        scores.add(scoreEntry);
        saveAllScores(scores);
    }

    /**
     * Returns the table of records sorted by score (highest to lowest)
     * @param limit Maximum number of results (0 = unlimited)
     * @return The sorted list of records
     * @throws IOException if there is a problem reading the file
     */
    public List<ScoreEntry> getLeaderboard(int limit) throws IOException {
        List<ScoreEntry> scores = getAllScores();

        // Filter only won games and sort by score
        List<ScoreEntry> leaderboard = scores.stream()
                .filter(ScoreEntry::isWon) // only won games
                .sorted((s1, s2) -> {
                    // sort by score (High to low)
                    int scoreCompare = Integer.compare(s2.getFinalScore(), s1.getFinalScore());
                    if (scoreCompare != 0) {
                        return scoreCompare;
                    }
                    // If the score is the same, by time (faster first)
                    int timeCompare = Long.compare(s1.getGameTimeSeconds(), s2.getGameTimeSeconds());
                    if (timeCompare != 0) {
                        return timeCompare;
                    }
                    // If the time is also the same, by date (newer first)
                    return s2.getGameDate().compareTo(s1.getGameDate());
                })
                .collect(Collectors.toList());

        // Limit the number of results if required
        if (limit > 0 && leaderboard.size() > limit) {
            return leaderboard.subList(0, limit);
        }

        return leaderboard;
    }

    /**
     * Returns the highest score of a specific player
     * @param nickname The player's name
     * @return The highest score or 0 if the player does not exist
     * @throws IOException if there is a problem reading the file
     */
    public int getPlayerBestScore(String nickname) throws IOException {
        if (nickname == null || nickname.trim().isEmpty()) {
            return 0;
        }

        List<ScoreEntry> scores = getAllScores();
        return scores.stream()
                .filter(score -> nickname.equalsIgnoreCase(score.getNickname()) && score.isWon())
                .mapToInt(ScoreEntry::getFinalScore)
                .max()
                .orElse(0);
    }

    /**
     * Returns all results for a specific player
     * @param nickname Player name
     * @return List of player results sorted by date (newest to oldest)
     * @throws IOException if there is a problem reading the file
     */
    public List<ScoreEntry> getPlayerScores(String nickname) throws IOException {
        if (nickname == null || nickname.trim().isEmpty()) {
            return new ArrayList<>();
        }

        List<ScoreEntry> scores = getAllScores();
        return scores.stream()
                .filter(score -> nickname.equalsIgnoreCase(score.getNickname()))
                .sorted((s1, s2) -> s2.getGameDate().compareTo(s1.getGameDate())) // new to old
                .collect(Collectors.toList());
    }
}