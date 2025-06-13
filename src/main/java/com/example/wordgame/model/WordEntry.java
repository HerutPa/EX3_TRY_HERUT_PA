package com.example.wordgame.model;

import java.io.Serializable;
import java.util.Objects;

/**
 * Model of a word in the game
 * Contains a category, a word, and a clue
 * Implements Serializable to save to a binary file
 */
public class WordEntry implements Serializable {
    // Serialization version - important so the system knows how to read old files
    private static final long serialVersionUID = 1L;
    // Word category - only letters a-z (required)
    private String category;
    // The word itself - only letters a-z (required)
    private String word;
    // Word hint - can contain any text (required)
    private String hint;

    /**
     * Full constructor
     * @param category Category of the word (only letters a-z)
     * @param word Word (only letters a-z)
     * @param hint Hint for the word (any text)
     */
    public WordEntry(String category, String word, String hint) {
        this.category = category != null ? category.toLowerCase() : null;
        this.word = word != null ? word.toLowerCase() : null;
        this.hint = hint;
    }

    // Getters and Setters
    /**
     * Returns the category
     * @return word category
     */
    public String getCategory() {
        return category;
    }

    /**
     * Defines a category - automatically lowercases
     * @param category new category
     */
    public void setCategory(String category) {
        this.category = category != null ? category.toLowerCase() : null;
    }

    /**
     * Returns the word
     * @return the word
     */
    public String getWord() {
        return word;
    }

    /**
     * Defines a word - automatically lowercases
     * @param word new word
     */
    public void setWord(String word) {
        this.word = word != null ? word.toLowerCase() : null;
    }

    /**
     * Returns the hint
     * @return the hint
     */
    public String getHint() {
        return hint;
    }

    /**
     * Defines a hint
     * @param hint new hint
     */
    public void setHint(String hint) {
        this.hint = hint;
    }

    /**
     * Checks if the word is valid - only letters a-z
     * @return true if the word is valid
     */
    public boolean isValidWord() {
        return word != null && word.matches("^[a-z]+$");
    }

    /**
     * Checks if the category is valid - only letters a-z
     * @return true if the category is valid
     */
    public boolean isValidCategory() {
        return category != null && category.matches("^[a-z]+$");
    }

    /**
     * Checks if all data is correct
     * @return true if everything is correct
     */
    public boolean isValid() {
        return isValidWord() && isValidCategory() &&
                hint != null && !hint.trim().isEmpty();
    }

    /**
     * Word comparison - by category and word (not a hint)
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        WordEntry wordEntry = (WordEntry) obj;
        return Objects.equals(category, wordEntry.category) &&
                Objects.equals(word, wordEntry.word);
    }

    /**
     * Returns a hash code value for the object based on its 'category' and 'word' fields.
     * @return
     */
    @Override
    public int hashCode() {
        return Objects.hash(category, word);
    }

    /**
     * Returns a textual representation of the word
     */
    @Override
    public String toString() {
        return "WordEntry{" +
                "category='" + category + '\'' +
                ", word='" + word + '\'' +
                ", hint='" + hint + '\'' +
                '}';
    }
}