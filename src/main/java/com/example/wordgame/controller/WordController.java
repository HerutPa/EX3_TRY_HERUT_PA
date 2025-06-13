package com.example.wordgame.controller;

import com.example.wordgame.model.WordEntry;
import com.example.wordgame.service.WordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/words")
@CrossOrigin(origins = "http://localhost:3000")
public class WordController {

    private final WordService wordService;

    @Autowired
    public WordController(WordService wordService) {
        this.wordService = wordService;
    }

    /**
     * Get all categories
     * GET /api/words/categories
     */
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        try {
            List<String> categories = wordService.getAllCategories();
            return ResponseEntity.ok(categories);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get random word from category
     * GET /api/words/random/{category}
     */
    @GetMapping("/random/{category}")
    public ResponseEntity<WordEntry> getRandomWord(@PathVariable String category) {
        try {
            WordEntry randomWord = wordService.getRandomWordByCategory(category);
            return ResponseEntity.ok(randomWord);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get all words
     * GET /api/words
     */
    @GetMapping
    public ResponseEntity<List<WordEntry>> getAllWords() {
        try {
            List<WordEntry> words = wordService.getAllWords();
            return ResponseEntity.ok(words);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get specific word
     * GET /api/words/{category}/{word}
     */
    @GetMapping("/{category}/{word}")
    public ResponseEntity<WordEntry> getSpecificWord(
            @PathVariable String category,
            @PathVariable String word) {
        try {
            WordEntry wordEntry = wordService.getWordByCategoryAndWord(category, word);
            return ResponseEntity.ok(wordEntry);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get words by category
     * GET /api/words/category/{category}
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<WordEntry>> getWordsByCategory(@PathVariable String category) {
        try {
            List<WordEntry> words = wordService.getWordsByCategory(category);
            return ResponseEntity.ok(words);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Add new word
     * POST /api/words
     */
    @PostMapping
    public ResponseEntity<Map<String, String>> addWord(@RequestBody WordEntry wordEntry) {
        try {
            wordService.addWord(wordEntry);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Word added successfully");
            response.put("category", wordEntry.getCategory());
            response.put("word", wordEntry.getWord());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error saving word");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Update existing word - RESTful way
     * PUT /api/words/{category}/{word}
     */
    @PutMapping("/{category}/{word}")
    public ResponseEntity<Map<String, String>> updateWord(
            @PathVariable String category,
            @PathVariable String word,
            @RequestBody WordEntry updatedWordEntry) {
        try {
            // Create old word entry for identification
            WordEntry oldWordEntry = new WordEntry(category, word, "");

            wordService.updateWord(oldWordEntry, updatedWordEntry);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Word updated successfully");
            response.put("oldCategory", category);
            response.put("oldWord", word);
            response.put("newCategory", updatedWordEntry.getCategory());
            response.put("newWord", updatedWordEntry.getWord());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());

            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(error);

        } catch (IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error updating word");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Delete word - RESTful way
     * DELETE /api/words/{category}/{word}
     */
    @DeleteMapping("/{category}/{word}")
    public ResponseEntity<Map<String, String>> deleteWord(
            @PathVariable String category,
            @PathVariable String word) {
        try {
            WordEntry wordToDelete = new WordEntry(category, word, "");
            wordService.deleteWord(wordToDelete);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Word deleted successfully");
            response.put("category", category);
            response.put("word", word);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());

            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(error);

        } catch (IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error deleting word");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Health check
     * GET /api/words/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> checkHealth() {
        Map<String, String> response = new HashMap<>();

        if (wordService.isSystemReady()) {
            response.put("status", "ready");
            response.put("message", "Word system is operational");
            return ResponseEntity.ok(response);
        } else {
            response.put("status", "not ready");
            response.put("message", "Word system is not ready - no words or file issue");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
        }
    }
}