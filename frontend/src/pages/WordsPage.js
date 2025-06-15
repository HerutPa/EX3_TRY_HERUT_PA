import React, { useState, useEffect, useCallback } from 'react';
import ConfirmModal from '../components/modals/ConfirmModal';
import SuccessModal from '../components/modals/SuccessModal';
import useApi from '../hooks/useApi';
import useForm from '../hooks/useForm';

/**
 * Words management page - עם Custom Hooks
 * משתמש ב-useApi לקריאות שרת ו-useForm לניהול טפסים
 */
function WordsPage({ showError }) {
    const api = useApi();

    // State עבור רשימת מילים וקטגוריות
    const [words, setWords] = useState([]);
    const [categories, setCategories] = useState([]);
    const [editingWord, setEditingWord] = useState(null);

    // State עבור UI
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [wordToDelete, setWordToDelete] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // הגדרת חוקי אימות לטופס המילים
    const validationRules = {
        category: {
            required: true,
            requiredMessage: 'Category is required.',
            pattern: /^[a-zA-Z]+$/,
            patternMessage: 'Only English letters allowed.'
        },
        word: {
            required: true,
            requiredMessage: 'Word is required.',
            pattern: /^[a-zA-Z]+$/,
            patternMessage: 'Only English letters allowed.',
            custom: (value, formValues) => {
                // בדיקה שהמילה לא קיימת כבר
                const existingWord = words.find(w =>
                    w.category.toLowerCase() === formValues.category.toLowerCase() &&
                    w.word.toLowerCase() === value.toLowerCase()
                );

                if (existingWord &&
                    (!editingWord ||
                        existingWord.category !== editingWord.category ||
                        existingWord.word !== editingWord.word)) {
                    return 'The word already exists in the database.';
                }
                return null;
            }
        },
        hint: {
            required: true,
            requiredMessage: 'Hint is required.',
            minLength: 3,
            minLengthMessage: 'Hint must be at least 3 characters.'
        }
    };

    // שימוש ב-useForm Custom Hook
    const {
        values: formData,
        errors: formErrors,
        handleChange,
        handleBlur,
        validate,
        reset: resetForm,
        setFormValues,
        isFieldInvalid
    } = useForm({
        category: '',
        word: '',
        hint: ''
    }, validationRules);

    /**
     * טעינת מילים עם useApi
     */
    const loadWords = useCallback(async (showLoader = true) => {
        try {
            const data = await api.get('http://localhost:8080/api/words');
            setWords(data);

            // חילוץ קטגוריות ייחודיות
            const uniqueCategories = [...new Set(data.map(word => word.category))];
            setCategories(uniqueCategories.sort());

        } catch (error) {
            console.error('Error loading words:', error);
            showError('Unable to load word list. Please check the connection to the server.');
        }
    }, [api.get, showError]);

    // טעינה ראשונית
    useEffect(() => {
        loadWords();
    }, [loadWords]);

    /**
     * פונקציה עזר להצגת הודעות הצלחה
     */
    const showSuccessMessage = useCallback((message) => {
        setSuccessMessage(message);
        setShowSuccessModal(true);
    }, []);

    /**
     * איפוס הטופס
     */
    const handleResetForm = () => {
        resetForm();
        setEditingWord(null);
        setShowAddForm(false);
    };

    /**
     * הוספת מילה חדשה
     */
    const handleAddWord = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            await api.post('http://localhost:8080/api/words', formData);
            await loadWords(false);
            showSuccessMessage('The word was added successfully!');
            handleResetForm();
        } catch (error) {
            console.error('Error adding word:', error);
            showError(`The word cannot be added: ${error.message}`);
        }
    };

    /**
     * עריכת מילה קיימת
     */
    const handleEditWord = async (e) => {
        e.preventDefault();

        if (!validate() || !editingWord) return;

        try {
            await api.put(
                `http://localhost:8080/api/words/${editingWord.category}/${editingWord.word}`,
                formData
            );
            await loadWords(false);
            handleResetForm();
            showSuccessMessage('The word has been updated successfully!');
        } catch (error) {
            console.error('Error updating word:', error);
            showError(`The word cannot be updated: ${error.message}`);
        }
    };

    /**
     * מחיקת מילה
     */
    const handleDeleteWord = (word) => {
        setWordToDelete(word);
    };

    const confirmDeleteWord = async () => {
        if (!wordToDelete) return;

        try {
            await api.delete(
                `http://localhost:8080/api/words/${wordToDelete.category}/${wordToDelete.word}`
            );
            await loadWords(false);
            showSuccessMessage('The word was successfully deleted!');
        } catch (error) {
            console.error('Error deleting word:', error);
            showError(`The word cannot be deleted: ${error.message}`);
        } finally {
            setWordToDelete(null);
        }
    };

    const cancelDeleteWord = () => {
        setWordToDelete(null);
    };

    /**
     * תחילת עריכה
     */
    const startEditing = (word) => {
        setEditingWord(word);
        setFormValues({
            category: word.category,
            word: word.word,
            hint: word.hint
        });
        setShowAddForm(true);
    };

    /**
     * סינון מילים
     */
    const filteredWords = words.filter(word => {
        const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
            word.hint.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || word.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="container py-4">

            {/* כותרת */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center flex-wrap">
                        <h1 className="display-5 fw-bold text-primary">
                            <i className="bi bi-gear me-3"></i>
                            Word Management
                        </h1>

                        <div className="btn-group" role="group">
                            <button
                                type="button"
                                className="btn btn-success"
                                onClick={() => setShowAddForm(!showAddForm)}
                            >
                                <i className="bi bi-plus-circle me-2"></i>
                                {showAddForm ? 'Cancel' : 'Add Word'}
                            </button>

                            <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() => {
                                    loadWords(false).catch(error => {
                                        console.error('Error refreshing words:', error);
                                    });
                                }}
                                disabled={api.loading}
                            >
                                {api.loading ? (
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                ) : (
                                    <i className="bi bi-arrow-clockwise me-2"></i>
                                )}
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* טופס הוספה/עריכה */}
            {showAddForm && (
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card shadow">
                            <div className="card-header bg-success text-white">
                                <h5 className="card-title mb-0">
                                    <i className="bi bi-plus-circle me-2"></i>
                                    {editingWord ? 'Edit Word' : 'Add New Word'}
                                </h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={editingWord ? handleEditWord : handleAddWord}>
                                    <div className="row g-3">

                                        {/* קטגוריה */}
                                        <div className="col-md-4">
                                            <label className="form-label fw-bold">
                                                <i className="bi bi-tag me-2"></i>
                                                Category:
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-control ${isFieldInvalid('category') ? 'is-invalid' : ''}`}
                                                value={formData.category}
                                                onChange={(e) => handleChange('category', e.target.value)}
                                                onBlur={() => handleBlur('category')}
                                                placeholder="animals, colors, food..."
                                                style={{direction: 'ltr'}}
                                                disabled={api.loading}
                                            />
                                            {formErrors.category && (
                                                <div className="invalid-feedback">{formErrors.category}</div>
                                            )}
                                            <div className="form-text">Only English letters (a-z)</div>
                                        </div>

                                        {/* מילה */}
                                        <div className="col-md-4">
                                            <label className="form-label fw-bold">
                                                <i className="bi bi-chat-quote me-2"></i>
                                                Word:
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-control ${isFieldInvalid('word') ? 'is-invalid' : ''}`}
                                                value={formData.word}
                                                onChange={(e) => handleChange('word', e.target.value)}
                                                onBlur={() => handleBlur('word')}
                                                placeholder="dog, cat, red..."
                                                style={{direction: 'ltr'}}
                                                disabled={api.loading}
                                            />
                                            {formErrors.word && (
                                                <div className="invalid-feedback">{formErrors.word}</div>
                                            )}
                                            <div className="form-text">Only English letters (a-z)</div>
                                        </div>

                                        {/* רמז */}
                                        <div className="col-md-4">
                                            <label className="form-label fw-bold">
                                                <i className="bi bi-lightbulb me-2"></i>
                                                Hint:
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-control ${isFieldInvalid('hint') ? 'is-invalid' : ''}`}
                                                value={formData.hint}
                                                onChange={(e) => handleChange('hint', e.target.value)}
                                                onBlur={() => handleBlur('hint')}
                                                placeholder="A loyal animal that barks..."
                                                disabled={api.loading}
                                            />
                                            {formErrors.hint && (
                                                <div className="invalid-feedback">{formErrors.hint}</div>
                                            )}
                                            <div className="form-text">Any text (at least 3 characters)</div>
                                        </div>
                                    </div>

                                    {/* כפתורי פעולה */}
                                    <div className="row mt-4">
                                        <div className="col-12">
                                            <div className="btn-group" role="group">
                                                <button
                                                    type="submit"
                                                    className={`btn ${editingWord ? 'btn-warning' : 'btn-success'}`}
                                                    disabled={api.loading}
                                                >
                                                    {api.loading ? (
                                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                    ) : (
                                                        <i className={`bi ${editingWord ? 'bi-pencil' : 'bi-check-lg'} me-2`}></i>
                                                    )}
                                                    {editingWord ? 'Update Word' : 'Add Word'}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn btn-secondary"
                                                    onClick={handleResetForm}
                                                    disabled={api.loading}
                                                >
                                                    <i className="bi bi-x-lg me-2"></i>
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* פאנל סינון */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <div className="row g-3 align-items-center">

                                {/* חיפוש */}
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Search for word or hint:</label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <i className="bi bi-search"></i>
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter word or hint to search..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        {searchTerm && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() => setSearchTerm('')}
                                                title="Clear search"
                                            >
                                                <i className="bi bi-x-lg"></i>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* קטגוריה */}
                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Filter by category:</label>
                                    <select
                                        className="form-select"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        <option value="all">All categories ({categories.length})</option>
                                        {categories.map(category => {
                                            const count = words.filter(w => w.category === category).length;
                                            return (
                                                <option key={category} value={category}>
                                                    {category} ({count})
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                {/* סטטיסטיקות */}
                                <div className="col-md-2">
                                    <label className="form-label fw-bold">Statistics:</label>
                                    <div className="small text-muted">
                                        <div><strong>{words.length}</strong> total words</div>
                                        <div><strong>{filteredWords.length}</strong> showing</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* רשימת מילים */}
            <div className="row">
                <div className="col-12">
                    {api.loading ? (
                        // מסך טעינה
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}} role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <h5>Loading words...</h5>
                        </div>
                    ) : filteredWords.length === 0 ? (
                        // אין תוצאות
                        <div className="text-center py-5">
                            <i className="bi bi-emoji-frown display-1 text-muted mb-3"></i>
                            <h4 className="text-muted">No words to display.</h4>
                            <p className="text-muted">
                                {searchTerm || selectedCategory !== 'all'
                                    ? 'Try changing the filter or search.'
                                    : 'No words have been added to the system yet.'
                                }
                            </p>
                            <button
                                className="btn btn-success"
                                onClick={() => setShowAddForm(true)}
                            >
                                <i className="bi bi-plus-circle me-2"></i>
                                Add first word
                            </button>
                        </div>
                    ) : (
                        // טבלת מילים
                        <div className="card shadow">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="table-primary">
                                    <tr>
                                        <th scope="col" style={{width: '120px'}}>
                                            <i className="bi bi-tag me-2"></i>
                                            Category
                                        </th>
                                        <th scope="col" style={{width: '150px'}}>
                                            <i className="bi bi-chat-quote me-2"></i>
                                            Word
                                        </th>
                                        <th scope="col">
                                            <i className="bi bi-lightbulb me-2"></i>
                                            Hint
                                        </th>
                                        <th scope="col" className="text-center" style={{width: '120px'}}>
                                            <i className="bi bi-gear me-2"></i>
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredWords.map((word, index) => (
                                        <tr key={`${word.category}-${word.word}`}>

                                            {/* קטגוריה */}
                                            <td>
                                                <span className="badge bg-secondary fs-6">
                                                    {word.category}
                                                </span>
                                            </td>

                                            {/* מילה */}
                                            <td>
                                                <span className="fw-bold text-primary fs-5" style={{direction: 'ltr'}}>
                                                    {word.word}
                                                </span>
                                            </td>

                                            {/* רמז */}
                                            <td>
                                                <span className="text-muted">
                                                    {word.hint}
                                                </span>
                                            </td>

                                            {/* פעולות */}
                                            <td className="text-center">
                                                <div className="btn-group btn-group-sm" role="group">
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-warning"
                                                        onClick={() => startEditing(word)}
                                                        title="Edit"
                                                        disabled={api.loading}
                                                    >
                                                        <i className="bi bi-pencil"></i>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger"
                                                        onClick={() => handleDeleteWord(word)}
                                                        title="Delete"
                                                        disabled={api.loading}
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* כותרת תחתונה עם סטטיסטיקות */}
                            <div className="card-footer bg-light">
                                <div className="row text-center">
                                    <div className="col-md-3">
                                        <small className="text-muted">
                                            <i className="bi bi-list-ul me-1"></i>
                                            Total Words: <strong>{words.length}</strong>
                                        </small>
                                    </div>
                                    <div className="col-md-3">
                                        <small className="text-muted">
                                            <i className="bi bi-funnel me-1"></i>
                                            Filtered: <strong>{filteredWords.length}</strong>
                                        </small>
                                    </div>
                                    <div className="col-md-3">
                                        <small className="text-muted">
                                            <i className="bi bi-tags me-1"></i>
                                            Categories: <strong>{categories.length}</strong>
                                        </small>
                                    </div>
                                    <div className="col-md-3">
                                        <small className="text-muted">
                                            <i className="bi bi-percent me-1"></i>
                                            Showing: <strong>{words.length > 0 ? Math.round((filteredWords.length / words.length) * 100) : 0}%</strong>
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal אישור מחיקה */}
            {wordToDelete && (
                <ConfirmModal
                    message={`Are you sure you want to delete the word "${wordToDelete.word}" from the category "${wordToDelete.category}"?`}
                    onConfirm={confirmDeleteWord}
                    onCancel={cancelDeleteWord}
                />
            )}

            {/* Modal הצלחה */}
            <SuccessModal
                show={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                message={successMessage}
            />

        </div>
    );
}

export default WordsPage;