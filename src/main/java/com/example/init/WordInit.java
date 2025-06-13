package com.example.init;

import com.example.wordgame.model.WordEntry;

import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.util.ArrayList;
import java.util.List;

/**
 * A helper program to create an initial word file
 * Creates a words.ser file with at least 10 words as required by the assignment
 * To run: Run the main method separately from the main application
 * This will create the words.ser file at the root level of the project
 */
public class WordInit {

    // File name - same as the one used by the Repository
    private static final String WORDS_FILE = "words.ser";

    /**
     * Main function to create word file
     * Creates an initial word list and saves it in binary format
     *
     * @param args not used
     */
    public static void main(String[] args) {
        System.out.println("WordInit - Creates a starting word file");
        System.out.println("===========================================");

        try {
            // Create the initial word list
            List<WordEntry> initialWords = createInitialWords();
            // Save to binary file
            saveWordsToFile(initialWords);

            System.out.println("The file" + WORDS_FILE + "was created successfully");
            System.out.println("Words" + initialWords.size() + "created");

            // Display the category summary
            printCategorySummary(initialWords);

            System.out.println("   http://localhost:8080/api/words/health");
            System.out.println("   http://localhost:8080/api/words/categories");

        } catch (IOException e) {
            System.err.println("Error creating file: " + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            System.err.println("General error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Creates a starting word list with words from different categories
     * Contains at least 10 words as required by the assignment
     *
     * @return WordEntry list with starting words
     */
    private static List<WordEntry> createInitialWords() {
        List<WordEntry> words = new ArrayList<>();

        // Animal Category - 5 words
        words.add(new WordEntry("animals", "dog", "A loyal animal that barks"));
        words.add(new WordEntry("animals", "cat", "A soft animal that meows"));
        words.add(new WordEntry("animals", "lion", "The king of the jungle"));
        words.add(new WordEntry("animals", "elephant", "A large animal with a trunk"));
        words.add(new WordEntry("animals", "bird", "A creature that can fly in the sky"));

        // Color Category - 4 words
        words.add(new WordEntry("colors", "red", "Color of blood and fire"));
        words.add(new WordEntry("colors", "blue", "Color of the sky and the sea"));
        words.add(new WordEntry("colors", "green", "Color of grass and nature"));
        words.add(new WordEntry("colors", "yellow", "Color of the sun and gold"));

        // Food Category - 4 words
        words.add(new WordEntry("food", "apple", "A round red or green fruit"));
        words.add(new WordEntry("food", "bread", "A basic food made from flour"));
        words.add(new WordEntry("food", "pizza", "A round Italian dish with sauce"));
        words.add(new WordEntry("food", "banana", "A yellow curved fruit"));

        // Human Body Category - 3 words
        words.add(new WordEntry("body", "hand", "A limb at the end of the arm"));
        words.add(new WordEntry("body", "eye", "An organ used for seeing"));
        words.add(new WordEntry("body", "heart", "An organ that pumps blood"));

        // Nature Category - 3 words
        words.add(new WordEntry("nature", "tree", "A tall plant with leaves"));
        words.add(new WordEntry("nature", "flower", "A colorful part of a plant"));
        words.add(new WordEntry("nature", "mountain", "A very tall hill"));

        return words;
    }

    /**
     * Saves a list of words to a file in binary format
     * Uses ObjectOutputStream as required in the assignment
     *
     * @param words The list of words to save
     * @throws IOException if there is a problem writing the file
     */
    private static void saveWordsToFile(List<WordEntry> words) throws IOException {
        System.out.println("Saving" + words.size() + "words to the file" + WORDS_FILE + "...");

        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(WORDS_FILE))) {
            oos.writeObject(words);
            oos.flush(); // Verify that the data has been written to disk
        }

        System.out.println("The save was completed successfully.");
    }

    /**
     * Prints a summary of the categories created
     * Displays how many words are in each category
     *
     * @param words the list of words
     */
    private static void printCategorySummary(List<WordEntry> words) {
        System.out.println("Summary of categories:");

        // Count by category
        words.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        WordEntry::getCategory,
                        java.util.stream.Collectors.counting()
                ))
                .entrySet()
                .stream()
                .sorted(java.util.Map.Entry.<String, Long>comparingByValue().reversed())
                .forEach(entry ->
                        System.out.println("   " + entry.getKey() + ": " + entry.getValue() + " words")
                );

        System.out.println("   ─────────────────────");
        System.out.println("total: " + words.size() + " words");
    }
}
