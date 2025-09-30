import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import toast from "react-hot-toast";

export function useNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Load notes
  const refresh = useCallback(async () => {
    setError("");
    try {
      const data = await api.listNotes();
      setNotes(data);
    } catch (e) {
      const errorMsg = e.message || "Failed to load notes";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Create note
  const handleCreate = useCallback(async (payload) => {
    try {
      await api.createNote(payload);
      await refresh();
      toast.success("Note created successfully!");
    } catch (e) {
      const errorMsg = e.message || "Failed to create note";
      toast.error(errorMsg);
      throw e;
    }
  }, [refresh]);

  // Update note
  const handleUpdate = useCallback(async (id, payload) => {
    try {
      await api.updateNote(id, payload);
      await refresh();
      toast.success("Note updated!");
    } catch (e) {
      const errorMsg = e.message || "Failed to update note";
      toast.error(errorMsg);
      throw e;
    }
  }, [refresh]);

  // Delete note
  const handleDelete = useCallback(async (id) => {
    try {
      await api.deleteNote(id);
      await refresh();
      toast.success("Note deleted");
    } catch (e) {
      const errorMsg = e.message || "Failed to delete note";
      toast.error(errorMsg);
      throw e;
    }
  }, [refresh]);

  // Filter notes based on search term
  const filteredNotes = searchTerm
    ? notes.filter(
        (note) =>
          note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : notes;

  return {
    notes: filteredNotes,
    totalNotes: notes.length,  // Add total count of unfiltered notes
    loading,
    error,
    searchTerm,
    setSearchTerm,
    refresh,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}
