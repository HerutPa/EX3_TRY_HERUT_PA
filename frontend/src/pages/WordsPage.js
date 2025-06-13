import React, { useState, useEffect } from 'react';
import ConfirmModal from '../components/modals/ConfirmModal';
import SuccessModal from '../components/modals/SuccessModal';

function WordsPage({ showError }) {
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingWord, setEditingWord] = useState(null);
    const [formData, setFormData] = useState({ category: '', word: '', hint: '' });
    const [submitting, setSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [categories, setCategories] = useState([]);
    const [wordToDelete, setWordToDelete] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const loadWords = async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);
            else setRefreshing(true);

            const response = await fetch('http://localhost:8080/api/words');
            if (!response.ok) throw new Error('Unable to load word list.');
            const data = await response.json();
            setWords(data);
            const uniqueCategories = [...new Set(data.map(word => word.category))];
            setCategories(uniqueCategories.sort());
        } catch (error) {
            console.error('Error loading words:', error);
            showError('Unable to load word list. Please check the connection to the server.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { loadWords(); }, []);

    const validateForm = () => {
        const errors = {};
        if (!formData.category.trim()) errors.category = 'Category is required.';
        else if (!/^[a-zA-Z]+$/.test(formData.category.trim())) errors.category = 'Only English letters allowed.';
        if (!formData.word.trim()) errors.word = 'Word is required.';
        else if (!/^[a-zA-Z]+$/.test(formData.word.trim())) errors.word = 'Only English letters allowed.';
        if (!formData.hint.trim()) errors.hint = 'Hint is required.';
        else if (formData.hint.trim().length < 3) errors.hint = 'Hint must be at least 3 characters.';

        const existingWord = words.find(w => w.category.toLowerCase() === formData.category.toLowerCase() && w.word.toLowerCase() === formData.word.toLowerCase());
        if (existingWord && (!editingWord || existingWord.category !== editingWord.category || existingWord.word !== editingWord.word)) {
            errors.word = 'The word already exists in the database.';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const resetForm = () => {
        setFormData({ category: '', word: '', hint: '' });
        setFormErrors({});
        setEditingWord(null);
        setShowAddForm(false);
    };

    // Helper function for showing success messages
    const showSuccessMessage = (message) => {
        setSuccessMessage(message);
        setShowSuccessModal(true);
    };

    const handleAddWord = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        try {
            setSubmitting(true);
            const response = await fetch('http://localhost:8080/api/words', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error((await response.json()).error || 'The word cannot be added.');
            await loadWords(false);
            setSuccessMessage('The word was added successfully!');
            setShowSuccessModal(true);
            resetForm();
        } catch (error) {
            console.error('Error adding word:', error);
            showError(`The word cannot be added: ${error.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    /**
     * Edit an existing word
     */
    const handleEditWord = async (e) => {
        e.preventDefault();
        if (!validateForm() || !editingWord) return;
        try {
            setSubmitting(true);
            const response = await fetch(
                `http://localhost:8080/api/words/${editingWord.category}/${editingWord.word}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                }
            );
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'The word cannot be updated.');
            }
            await loadWords(false);
            resetForm();
            showSuccessMessage('The word has been updated successfully!');
        } catch (error) {
            console.error('Error updating word:', error);
            showError(`The word cannot be updated: ${error.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteWord = (word) => {
        setWordToDelete(word);
    };

    /**
     * Delete a word
     */
    const confirmDeleteWord = async () => {
        if (!wordToDelete) return;
        try {

            const response = await fetch(
                `http://localhost:8080/api/words/${wordToDelete.category}/${wordToDelete.word}`,
                {
                    method: 'DELETE',
                }
            );
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'The word cannot be deleted.');
            }
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

    const startEditing = (word) => {
        setEditingWord(word);
        setFormData({ category: word.category, word: word.word, hint: word.hint });
        setFormErrors({});
        setShowAddForm(true);
    };

    const filteredWords = words.filter(word => {
        const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase()) || word.hint.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || word.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="container py-4">

            {/* title */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center flex-wrap">
                        <h1 className="display-5 fw-bold text-primary">
                            <i className="bi bi-gear me-3"></i>
                            word management
                        </h1>

                        <div className="btn-group" role="group">
                            <button
                                type="button"
                                className="btn btn-success"
                                onClick={() => setShowAddForm(!showAddForm)}
                            >
                                <i className="bi bi-plus-circle me-2"></i>
                                {showAddForm ? 'cancellation' : 'add word'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card shadow">
                            <div className="card-header bg-success text-white">
                                <h5 className="card-title mb-0">
                                    <i className="bi bi-plus-circle me-2"></i>
                                    {editingWord ? 'Editing a word' : 'Added a new word'}
                                </h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={editingWord ? handleEditWord : handleAddWord}>
                                    <div className="row g-3">

                                        {/* category */}
                                        <div className="col-md-4">
                                            <label className="form-label fw-bold">
                                                <i className="bi bi-tag me-2"></i>
                                                Category:
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-control ${formErrors.category ? 'is-invalid' : ''}`}
                                                value={formData.category}
                                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                                placeholder="animals, colors, food..."
                                                style={{direction: 'ltr'}}
                                                disabled={submitting}
                                            />
                                            {formErrors.category && (
                                                <div className="invalid-feedback">{formErrors.category}</div>
                                            )}
                                            <div className="form-text">Only English letters (a-z)</div>
                                        </div>

                                        {/* word */}
                                        <div className="col-md-4">
                                            <label className="form-label fw-bold">
                                                <i className="bi bi-chat-quote me-2"></i>
                                                Word:
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-control ${formErrors.word ? 'is-invalid' : ''}`}
                                                value={formData.word}
                                                onChange={(e) => setFormData({...formData, word: e.target.value})}
                                                placeholder="dog, cat, red..."
                                                style={{direction: 'ltr'}}
                                                disabled={submitting}
                                            />
                                            {formErrors.word && (
                                                <div className="invalid-feedback">{formErrors.word}</div>
                                            )}
                                            <div className="form-text">Only English letters (a-z)</div>
                                        </div>

                                        {/* Hint */}
                                        <div className="col-md-4">
                                            <label className="form-label fw-bold">
                                                <i className="bi bi-lightbulb me-2"></i>
                                                Hint:
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-control ${formErrors.hint ? 'is-invalid' : ''}`}
                                                value={formData.hint}
                                                onChange={(e) => setFormData({...formData, hint: e.target.value})}
                                                placeholder="A loyal animal that barks..."
                                                disabled={submitting}
                                            />
                                            {formErrors.hint && (
                                                <div className="invalid-feedback">{formErrors.hint}</div>
                                            )}
                                            <div className="form-text">Any text (at least 3 characters)</div>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="row mt-4">
                                        <div className="col-12">
                                            <div className="btn-group" role="group">
                                                <button
                                                    type="submit"
                                                    className={`btn ${editingWord ? 'btn-warning' : 'btn-success'}`}
                                                    disabled={submitting}
                                                >
                                                    {submitting ? (
                                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                    ) : (
                                                        <i className={`bi ${editingWord ? 'bi-pencil' : 'bi-check-lg'} me-2`}></i>
                                                    )}
                                                    {editingWord ? 'Update a word' : 'Add a word'}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn btn-secondary"
                                                    onClick={resetForm}
                                                    disabled={submitting}
                                                >
                                                    <i className="bi bi-x-lg me-2"></i>
                                                    cancellation
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

            {/* Filter panel */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <div className="row g-3 align-items-center">

                                {/* Search */}
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Search for a word or clue:</label>
                                    <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-search"></i>
                    </span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter a word or search hint..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Category */}
                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Filter by category:</label>
                                    <select
                                        className="form-select"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        <option value="all">All categories</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Words List */}
            <div className="row">
                <div className="col-12">
                    {loading ? (
                        // loading screen
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}} role="status">
                                <span className="visually-hidden">טוען...</span>
                            </div>
                            <h5>Loading words...</h5>
                        </div>
                    ) : filteredWords.length === 0 ? (
                        // No results
                        <div className="text-center py-5">
                            <i className="bi bi-emoji-frown display-1 text-muted mb-3"></i>
                            <h4 className="text-muted">There are no words for the show.</h4>
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
                        // words list
                        <div className="card shadow">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="table-primary">
                                    <tr>
                                        <th scope="col">
                                            <i className="bi bi-tag me-2"></i>
                                            Category
                                        </th>
                                        <th scope="col">
                                            <i className="bi bi-chat-quote me-2"></i>
                                            Word
                                        </th>
                                        <th scope="col">
                                            <i className="bi bi-lightbulb me-2"></i>
                                            Hint
                                        </th>
                                        <th scope="col" className="text-center" style={{width: '150px'}}>
                                            <i className="bi bi-gear me-2"></i>
                                            Operations
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredWords.map((word, index) => (
                                        <tr key={`${word.category}-${word.word}`}>

                                            {/* category */}
                                            <td>
                          <span className="badge bg-secondary fs-6">
                            {word.category}
                          </span>
                                            </td>

                                            {/* word */}
                                            <td>
                          <span className="fw-bold text-primary fs-5" style={{direction: 'ltr'}}>
                            {word.word}
                          </span>
                                            </td>

                                            {/* hint */}
                                            <td>
                          <span className="text-muted">
                            {word.hint}
                          </span>
                                            </td>

                                            {/* Operations */}
                                            <td className="text-center">
                                                <div className="btn-group btn-group-sm" role="group">
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-warning"
                                                        onClick={() => startEditing(word)}
                                                        title="Edit"
                                                    >
                                                        <i className="bi bi-pencil"></i>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger"
                                                        onClick={() => handleDeleteWord(word)}
                                                        title="Delete"
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
                        </div>
                    )}
                </div>

                {wordToDelete && (
                    <ConfirmModal
                        message={`Are you sure you want to delete the word "${wordToDelete.word}" from the category "${wordToDelete.category}"?`}
                        onConfirm={confirmDeleteWord}
                        onCancel={cancelDeleteWord}
                    />
                )}

                <SuccessModal
                    show={showSuccessModal}
                    onClose={() => setShowSuccessModal(false)}
                    message={successMessage}
                />

            </div>
        </div>
    );
}

export default WordsPage;