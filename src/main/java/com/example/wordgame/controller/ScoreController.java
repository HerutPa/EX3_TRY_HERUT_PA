package com.example.wordgame.controller;

import com.example.wordgame.model.ScoreEntry;
import com.example.wordgame.service.ScoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for managing scores and leaderboards
 * Provides API endpoints for all operations related to game results:
 * Saving results, displaying leaderboards, statistics and player history
 * Handles automatic score calculation and manages the scores.ser file
 */
@RestController
@RequestMapping("/api/scores")
@CrossOrigin(origins = "http://localhost:3000") // Enables calls from React in development
public class ScoreController {

    private final ScoreService scoreService;

    /**
     * Constructor with Dependency Injection
     * @param scoreService The service for managing scores
     */
    @Autowired
    public ScoreController(ScoreService scoreService) {
        this.scoreService = scoreService;
    }

    /**
     * Saves a new game result in the system
     * Called at the end of each game to save the result in the leaderboard
     * Automatically calculates the final score according to the formula
     *
     * @param gameResult Game information (JSON in the request body)
     * Should contain: nickname, gameTimeSeconds, attemptCount,
     * usedHint, category, wordGuessed, won
     * @return ResponseEntity with the saved result including the calculated score
     * 201 Created - The result was saved successfully
     * 400 Bad Request - Invalid data
     * 500 Internal Server Error - Problem saving
     */
    @PostMapping
    public ResponseEntity<ScoreEntry> saveGameResult(@RequestBody Map<String, Object> gameResult) {
        try {
            // Extracting the data from the JSON
            String nickname = (String) gameResult.get("nickname");
            Long gameTimeSeconds = ((Number) gameResult.get("gameTimeSeconds")).longValue();
            Integer attemptCount = ((Number) gameResult.get("attemptCount")).intValue();
            Boolean usedHint = (Boolean) gameResult.get("usedHint");
            String category = (String) gameResult.get("category");
            String wordGuessed = (String) gameResult.get("wordGuessed");
            Boolean won = (Boolean) gameResult.get("won");

            // saving the result
            ScoreEntry savedScore = scoreService.saveGameResult(
                    nickname, gameTimeSeconds, attemptCount,
                    usedHint, category, wordGuessed, won
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(savedScore);

        } catch (IllegalArgumentException e) {
            // Invalid data
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            // problem saving
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            // General error (like casting or missing fields)
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Returns the top scoreboard
     * Called on the leaderboard page and at the end of a game
     *
     * @param limit Maximum number of results (query parameter, optional)
     * Default: top 10 results
     * @return ResponseEntity with the list of scores sorted by score
     * 200 OK - Everything is fine (even if the list is empty)
     * 500 Internal Server Error - Problem reading the data
     */
    @GetMapping("/leaderboard")
    public ResponseEntity<List<ScoreEntry>> getLeaderboard(
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<ScoreEntry> leaderboard = scoreService.getTopScores(limit);
            return ResponseEntity.ok(leaderboard);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Returns the full score table (unlimited)
     * Useful for the admin page or advanced statistics
     *
     * @return ResponseEntity with the list of all scores
     * 200 OK - Everything is OK
     * 500 Internal Server Error - Problem reading
     */
    @GetMapping("/all")
    public ResponseEntity<List<ScoreEntry>> getFullLeaderboard() {
        try {
            List<ScoreEntry> fullLeaderboard = scoreService.getFullLeaderboard();
            return ResponseEntity.ok(fullLeaderboard);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Returns the highest score of a specific player
     * Useful for displaying the player's personal best
     *
     * @param nickname Player's name (path variable)
     * @return ResponseEntity with the highest score
     * 200 OK - The score is found (or 0 if the player does not exist)
     * 400 Bad Request - The player's name is invalid
     * 500 Internal Server Error - There was a problem reading
     */
    @GetMapping("/player/{nickname}/best")
    public ResponseEntity<Map<String, Integer>> getPlayerBestScore(@PathVariable String nickname) {
        try {
            int bestScore = scoreService.getPlayerBestScore(nickname);

            Map<String, Integer> response = new HashMap<>();
            response.put("bestScore", bestScore);

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Returns all results for a specific player
     * Useful for displaying the player's game history
     *
     * @param nickname Player name (path variable)
     * @return ResponseEntity with the list of player results
     * 200 OK - The list was found (even if empty)
     * 400 Bad Request - The player's name is invalid
     * 500 Internal Server Error - Problem reading
     */
    @GetMapping("/player/{nickname}/history")
    public ResponseEntity<List<ScoreEntry>> getPlayerHistory(@PathVariable String nickname) {
        try {
            List<ScoreEntry> history = scoreService.getPlayerHistory(nickname);
            return ResponseEntity.ok(history);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Checks if the scoring system is ready to use
     * Called before saving results to verify that the system is healthy
     *
     * @return ResponseEntity with the system status
     * 200 OK - The system is ready
     * 503 Service Unavailable - The system is not ready
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> checkHealth() {
        Map<String, String> response = new HashMap<>();

        if (scoreService.isScoreSystemReady()) {
            response.put("status", "ready");
            response.put("message", "");
            return ResponseEntity.ok(response);
        } else {
            response.put("status", "not ready");
            response.put("message", "The grading system is not ready - a problem with the grading file");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
        }
    }
}