"use client";

import { useState, useCallback, useEffect } from "react";
import {
  EditeccDocument,
  emptyDoc,
  getAllDocuments,
  saveAllDocuments,
  getCurrentId,
  setCurrentId,
  exportDoc,
  importDoc,
  migrateLegacy,
} from "@/lib/document";

export function useDocuments() {
  const [docs, setDocs] = useState<EditeccDocument[]>([]);
  const [currentId, setCurrentIdState] = useState<string | null>(null);

  // Initialize: migrate legacy data, load docs
  useEffect(() => {
    let existing = getAllDocuments();

    if (existing.length === 0) {
      const legacy = migrateLegacy();
      if (legacy) {
        existing = [legacy];
        saveAllDocuments(existing);
        setCurrentId(legacy.id);
        setCurrentIdState(legacy.id);
        setDocs(existing);
        // Clean up legacy keys
        localStorage.removeItem("editecc-v0.2");
        localStorage.removeItem("editecc-v0.1.1");
        localStorage.removeItem("editecc-refs");
        return;
      }
    }

    const savedId = getCurrentId();
    if (existing.length === 0) {
      const first = emptyDoc();
      existing = [first];
      saveAllDocuments(existing);
      setCurrentId(first.id);
      setCurrentIdState(first.id);
    } else if (savedId && existing.find(d => d.id === savedId)) {
      setCurrentIdState(savedId);
    } else {
      setCurrentId(existing[0].id);
      setCurrentIdState(existing[0].id);
    }
    setDocs(existing);
  }, []);

  const currentDoc = docs.find(d => d.id === currentId) || null;

  const updateCurrentDoc = useCallback((updates: Partial<EditeccDocument>) => {
    setDocs(prev => {
      const idx = prev.findIndex(d => d.id === currentId);
      if (idx === -1) return prev;
      const updated = {
        ...prev[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      const next = [...prev];
      next[idx] = updated;
      saveAllDocuments(next);
      return next;
    });
  }, [currentId]);

  const switchDoc = useCallback((id: string) => {
    setCurrentId(id);
    setCurrentIdState(id);
  }, []);

  const addDoc = useCallback((title?: string) => {
    const doc = emptyDoc(title);
    setDocs(prev => {
      const next = [...prev, doc];
      saveAllDocuments(next);
      return next;
    });
    setCurrentId(doc.id);
    setCurrentIdState(doc.id);
    return doc;
  }, []);

  const deleteDoc = useCallback((id: string) => {
    setDocs(prev => {
      const next = prev.filter(d => d.id !== id);
      if (next.length === 0) {
        const first = emptyDoc();
        next.push(first);
        setCurrentId(first.id);
        setCurrentIdState(first.id);
      } else if (id === currentId) {
        setCurrentId(next[0].id);
        setCurrentIdState(next[0].id);
      }
      saveAllDocuments(next);
      return next;
    });
  }, [currentId]);

  const renameDoc = useCallback((id: string, title: string) => {
    updateCurrentDoc({ title });
  }, [updateCurrentDoc]);

  const handleExport = useCallback(() => {
    if (currentDoc) exportDoc(currentDoc);
  }, [currentDoc]);

  const handleImport = useCallback(async (file: File) => {
    try {
      const doc = await importDoc(file);
      setDocs(prev => {
        const next = [...prev, doc];
        saveAllDocuments(next);
        return next;
      });
      setCurrentId(doc.id);
      setCurrentIdState(doc.id);
      return doc;
    } catch (err) {
      throw err;
    }
  }, []);

  return {
    docs,
    currentDoc,
    currentId,
    updateCurrentDoc,
    switchDoc,
    addDoc,
    deleteDoc,
    renameDoc,
    handleExport,
    handleImport,
  };
}
