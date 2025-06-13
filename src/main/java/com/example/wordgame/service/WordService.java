package com.example.wordgame.service;

import com.example.wordgame.model.WordEntry;
import com.example.wordgame.repository.WordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Service for handling the business logic of the words
 * The middle layer between Controller and Repository
 * Contains all validations and calculations related to words
 */
@Service
public class WordService {

    private final WordRepository wordRepository;

    /**
     * Constructor with Dependency Injection
     * @param wordRepository The Repository for handling files
     */
    @Autowired
    public WordService(WordRepository wordRepository) {
        this.wordRepository = wordRepository;
    }

    /**
     * Returns all available categories in the system
     * Used to populate the dropdown on the home page
     * @return Alphabetically ordered list of categories
     * @throws IllegalStateException if there are no words in the system or there is a reading problem
     */
    public List<String> getAllCategories() {
        try {
            if (!wordRepository.isWordsFileExists()) {
                throw new IllegalStateException("The words file does not exist or is corrupt.");
            }

            List<String> categories = wordRepository.getAllCategories();
            if (categories.isEmpty()) {
                throw new IllegalStateException("There are no words in the system");
            }

            return categories;
        } catch (IOException e) {
            throw new IllegalStateException("Error reading the words file: " + e.getMessage(), e);
        }
    }

    /**
     * Generates a random word from a specific category
     * Main function to start the game
     * @param category The category to choose the word
     * @return A random word from the category
     * @throws IllegalArgumentException if the category is invalid
     * @throws IllegalStateException if there are no words in the category or there is a problem reading
     */
    public WordEntry getRandomWordByCategory(String category) {
        if (category == null || category.trim().isEmpty()) {
            throw new IllegalArgumentException("Category cannot be empty.");
        }
        // Make sure the category contains only letters
        if (!category.matches("^[a-zA-Z]+$")) {
            throw new IllegalArgumentException("Category must contain only letters.");
        }

        try {
            // Checking that the category exists
            List<String> availableCategories = wordRepository.getAllCategories();
            boolean categoryExists = availableCategories.stream()
                    .anyMatch(cat -> cat.equalsIgnoreCase(category));

            if (!categoryExists) {
                throw new IllegalArgumentException("The category " + category + "dose not exist.");
            }

            // word lottery
            WordEntry randomWord = wordRepository.getRandomWordByCategory(category);

            if (randomWord == null) {
                throw new IllegalStateException("The category" + category + "is empty.");
            }

            return randomWord;

        } catch (IOException e) {
            throw new IllegalStateException("Word draw error: " + e.getMessage(), e);
        }
    }

    /**
     * Returns all words in the system (to the admin page)
     * @return List of all words
     * @throws IllegalStateException if there is a problem reading the file
     */
    public List<WordEntry> getAllWords() {
        try {
            return wordRepository.getAllWords();
        } catch (IOException e) {
            throw new IllegalStateException("Error reading word list:" + e.getMessage(), e);
        }
    }

    /**
     * Adds a new word to the system
     * Includes full validations
     * @param wordEntry The word to add
     * @throws IllegalArgumentException if the word is invalid or already exists
     * @throws IllegalStateException if there is a problem saving
     */
    public void addWord(WordEntry wordEntry) {
        // ולידציה בסיסית
        if (wordEntry == null) {
            throw new IllegalArgumentException("The word cannot be null");
        }

        // וידוא שכל השדות מלאים
        if (wordEntry.getCategory() == null || wordEntry.getCategory().trim().isEmpty()) {
            throw new IllegalArgumentException("Category is a required field.");
        }

        if (wordEntry.getWord() == null || wordEntry.getWord().trim().isEmpty()) {
            throw new IllegalArgumentException("Word is a required field.");
        }

        if (wordEntry.getHint() == null || wordEntry.getHint().trim().isEmpty()) {
            throw new IllegalArgumentException("Hint is a required field.");
        }

        // Validation that the word and category contain only letters
        if (!wordEntry.isValid()) {
            throw new IllegalArgumentException("Word and category must contain only letters a-z");
        }

        try {
            wordRepository.addWord(wordEntry);
        } catch (IOException e) {
            throw new IllegalStateException("error saving word: " + e.getMessage(), e);
        } catch (IllegalArgumentException e) {
            // Passing errors from the Repository (like a word already exists)
            throw e;
        }
    }

    /**
     * Get specific word by category and word
     * @param category The category name
     * @param word The word name
     * @return The word entry
     * @throws IllegalArgumentException if word not found
     */
    public WordEntry getWordByCategoryAndWord(String category, String word) {
        if (category == null || category.trim().isEmpty() ||
                word == null || word.trim().isEmpty()) {
            throw new IllegalArgumentException("Category and word cannot be empty");
        }

        try {
            List<WordEntry> words = wordRepository.getAllWords();

            return words.stream()
                    .filter(w -> category.equalsIgnoreCase(w.getCategory()) &&
                            word.equalsIgnoreCase(w.getWord()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException(
                            String.format("Word '%s' not found in category '%s'", word, category)
                    ));

        } catch (IOException e) {
            throw new IllegalStateException("Error reading words: " + e.getMessage(), e);
        }
    }

    /**
     * Updates an existing word in the system
     * @param oldWord the old word (to be identified)
     * @param newWord the new word
     * @throws IllegalArgumentException if the data is invalid
     * @throws IllegalStateException if there is a problem saving
     */
    public void updateWord(WordEntry oldWord, WordEntry newWord) {
        if (oldWord == null || newWord == null) {
            throw new IllegalArgumentException("Cannot update null word");
        }

        if (!newWord.isValid()) {
            throw new IllegalArgumentException("The new word is incorrect.");
        }

        try {
            wordRepository.updateWord(oldWord, newWord);
        } catch (IOException e) {
            throw new IllegalStateException("Error updating word: " + e.getMessage(), e);
        } catch (IllegalArgumentException e) {
            throw e;
        }
    }

    /**
     * Deletes a word from the system
     * @param wordEntry The word to delete
     * @throws IllegalArgumentException if the word is invalid or not found
     * @throws IllegalStateException if there is a problem saving
     */
    public void deleteWord(WordEntry wordEntry) {
        if (wordEntry == null) {
            throw new IllegalArgumentException("Cannot delete a null word");
        }

        try {
            wordRepository.deleteWord(wordEntry);
        } catch (IOException e) {
            throw new IllegalStateException("Error deleting word: " + e.getMessage(), e);
        } catch (IllegalArgumentException e) {
            throw e;
        }
    }

    /**
     * Returns words by a specific category
     * @param category The requested category
     * @return List of words from the category
     * @throws IllegalArgumentException if the category is invalid
     * @throws IllegalStateException if there is a problem reading
     */
    public List<WordEntry> getWordsByCategory(String category) {
        if (category == null || category.trim().isEmpty()) {
            throw new IllegalArgumentException("Category cannot be empty.");
        }

        try {
            return wordRepository.getWordsByCategory(category);
        } catch (IOException e) {
            throw new IllegalStateException("Error reading words by category: " + e.getMessage(), e);
        }
    }

    /**
     * Checks if the word system is available and ready to use
     * Called before starting a game to make sure everything is OK
     * @return true if the system is ready
     */
    public boolean isSystemReady() {
        try {
            // Checking that the file exists and is correct
            if (!wordRepository.isWordsFileExists()) {
                return false;
            }

            // Checking that there is at least one category
            List<String> categories = wordRepository.getAllCategories();
            return !categories.isEmpty();

        } catch (Exception e) {
            return false;
        }
    }
}