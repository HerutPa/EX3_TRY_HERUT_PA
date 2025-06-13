package com.example.wordgame.repository;

import com.example.wordgame.model.WordEntry;
import org.springframework.stereotype.Repository;

import java.io.*;
import java.util.*;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.stream.Collectors;

/**
 * Repository for handling the words.ser file
 * Handles all operations on the word pool in a thread-safe manner
 * Uses ObjectStreams for saving in binary format
 */
@Repository
public class WordRepository {

    private static final String WORDS_FILE = "words.ser";

    // Locking to handle race conditions - allows concurrent reads but exclusive writes
    private final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();

    /**
     * Loads all words from the file
     * @return List of all words or an empty list if the file does not exist
     * @throws IOException if there is a problem reading the file
     */
    public List<WordEntry> getAllWords() throws IOException {
        // Read Lock - Allows parallel reads
        lock.readLock().lock();
        try {
            File file = new File(WORDS_FILE);
            if (!file.exists()) {
                // if the file dose not exists, an empty list is returned
                return new ArrayList<>();
            }

            // Reading the binary file
            try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(file))) {
                Object obj = ois.readObject();
                if (obj instanceof List<?>) {
                    // Checking that it is really a WordEntry list
                    List<?> list = (List<?>) obj;
                    if (list.isEmpty() || list.get(0) instanceof WordEntry) {
                        return (List<WordEntry>) list;
                    }
                }
                // If the data is invalid, an empty list is returned.
                return new ArrayList<>();
            } catch (ClassNotFoundException e) {
                throw new IOException("The lyrics file is corrupted - cannot be read.", e);
            }
        } finally {
            lock.readLock().unlock();
        }
    }

    /**
     * Saves all words to a file
     * @param words List of words to save
     * @throws IOException if there is a problem writing the file
     */
    public void saveAllWords(List<WordEntry> words) throws IOException {
        // Write lock - completely exclusive
        lock.writeLock().lock();
        try {
            // Writing the binary file
            try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(WORDS_FILE))) {
                oos.writeObject(words);
                oos.flush(); // Verifying that the data has been written to the disk
            }
        } finally {
            lock.writeLock().unlock();
        }
    }

    /**
     * Returns a list of all unique categories
     * @return an alphabetically ordered list of categories
     * @throws IOException if there is a problem reading the file
     */
    public List<String> getAllCategories() throws IOException {
        List<WordEntry> words = getAllWords();
        return words.stream()
                .map(WordEntry::getCategory)
                .filter(Objects::nonNull) // filter null values
                .distinct() // Only unique values
                .sorted() // Alphabetical order
                .collect(Collectors.toList());
    }

    /**
     * Returns all words from a specific category
     * @param category The requested category
     * @return List of words from the category
     * @throws IOException if there is a problem reading the file
     */
    public List<WordEntry> getWordsByCategory(String category) throws IOException {
        if (category == null) {
            return new ArrayList<>();
        }

        List<WordEntry> words = getAllWords();
        return words.stream()
                .filter(word -> category.equalsIgnoreCase(word.getCategory()))
                .collect(Collectors.toList());
    }

    /**
     * Returns a random word from a specific category
     * @param category The requested category
     * @return A random word or null if the category is empty
     * @throws IOException if there is a problem reading the file
     */
    public WordEntry getRandomWordByCategory(String category) throws IOException {
        List<WordEntry> categoryWords = getWordsByCategory(category);

        if (categoryWords.isEmpty()) {
            return null; // There are no words in this category.
        }

        // random word choice
        Random random = new Random();
        int randomIndex = random.nextInt(categoryWords.size());
        return categoryWords.get(randomIndex);
    }

    /**
     * Adds a new word to the database
     * @param wordEntry the word to add
     * @throws IOException if there is a problem saving the file
     * @throws IllegalArgumentException if the word is invalid or already exists
     */
    public void addWord(WordEntry wordEntry) throws IOException {
        if (wordEntry == null || !wordEntry.isValid()) {
            throw new IllegalArgumentException("The word is incorrect.");
        }

        List<WordEntry> words = getAllWords();

        // Check that the word does not already exist
        boolean exists = words.stream()
                .anyMatch(existing -> existing.getCategory().equalsIgnoreCase(wordEntry.getCategory()) &&
                        existing.getWord().equalsIgnoreCase(wordEntry.getWord()));

        if (exists) {
            throw new IllegalArgumentException("The word already exists in the database.");
        }

        words.add(wordEntry);
        saveAllWords(words);
    }

    /**
     * Updates an existing word
     * @param oldWord the old word (to be identified)
     * @param newWord the new word
     * @throws IOException if there is a problem saving the file
     * @throws IllegalArgumentException if the word is not found or is invalid
     */
    public void updateWord(WordEntry oldWord, WordEntry newWord) throws IOException {
        if (oldWord == null || newWord == null || !newWord.isValid()) {
            throw new IllegalArgumentException("Invalid data");
        }

        List<WordEntry> words = getAllWords();

        // The old word search
        int index = -1;
        for (int i = 0; i < words.size(); i++) {
            WordEntry word = words.get(i);
            if (word.getCategory().equalsIgnoreCase(oldWord.getCategory()) &&
                    word.getWord().equalsIgnoreCase(oldWord.getWord())) {
                index = i;
                break;
            }
        }

        if (index == -1) {
            throw new IllegalArgumentException("The word was not found in the database.");
        }

        // Check that the new word does not already exist (unless it is the same word)
        if (!oldWord.equals(newWord)) {
            boolean exists = words.stream()
                    .anyMatch(existing -> existing.getCategory().equalsIgnoreCase(newWord.getCategory()) &&
                            existing.getWord().equalsIgnoreCase(newWord.getWord()));
            if (exists) {
                throw new IllegalArgumentException("The new word already exists in the database.");
            }
        }

        words.set(index, newWord);
        saveAllWords(words);
    }

    /**
     * Deletes a word from the database
     * @param wordEntry the word to delete
     * @throws IOException if there is a problem saving the file
     * @throws IllegalArgumentException if the word is not found
     */
    public void deleteWord(WordEntry wordEntry) throws IOException {
        if (wordEntry == null) {
            throw new IllegalArgumentException("The word cannot be null.");
        }

        List<WordEntry> words = getAllWords();

        // חיפוש והסרת המילה
        boolean removed = words.removeIf(word ->
                word.getCategory().equalsIgnoreCase(wordEntry.getCategory()) &&
                        word.getWord().equalsIgnoreCase(wordEntry.getWord()));

        if (!removed) {
            throw new IllegalArgumentException("The word was not found in the database.");
        }

        saveAllWords(words);
    }

    /**
     * Checks if the word file exists and is valid
     * @return true if the file exists and is valid
     */
    public boolean isWordsFileExists() {
        try {
            File file = new File(WORDS_FILE);
            if (!file.exists()) {
                return false;
            }
            // Attempt to read the file to make sure it is valid
            getAllWords();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Returns statistical information about the word pool
     * @return information about the number of words and categories
     * @throws IOException if there is a problem reading the file
     */
    public Map<String, Integer> getWordsStatistics() throws IOException {
        List<WordEntry> words = getAllWords();
        List<String> categories = getAllCategories();

        Map<String, Integer> stats = new HashMap<>();
        stats.put("totalWords", words.size());
        stats.put("totalCategories", categories.size());

        // Count by category
        for (String category : categories) {
            long count = words.stream()
                    .filter(word -> category.equalsIgnoreCase(word.getCategory()))
                    .count();
            stats.put("category_" + category, (int) count);
        }

        return stats;
    }
}