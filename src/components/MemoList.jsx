const { useEffect, useRef } = React;

window.MemoList = function MemoList({
    user,
    folder,
    notes,
    activeNoteId,
    viewMode,
    editingId,
    setEditingId,
    setActiveNoteId,
    setViewMode,
    updateNote,
    deleteNote
}) {
    const sortableInstance = useRef(null);
    const isDragging = useRef(false);

    // Filter notes for this folder
    const folderNotes = notes.filter(n => n && n.folderId === folder.id);

    useEffect(() => {
        if (!user || isDragging.current) return;

        const noteListEl = document.getElementById(`note-list-${folder.id}`);
        if (!noteListEl) return;

        // Destroy existing instance
        if (sortableInstance.current) {
            sortableInstance.current.destroy();
            sortableInstance.current = null;
        }

        // Create new Sortable instance with delay
        const timeoutId = setTimeout(() => {
            sortableInstance.current = Sortable.create(noteListEl, {
                group: {
                    name: 'notes',
                    pull: true,
                    put: true
                },
                animation: 150,
                ghostClass: 'sortable-ghost',
                forceFallback: true,
                dataIdAttr: 'data-note-id',

                onStart: () => {
                    isDragging.current = true;
                },

                // When note is added to this folder from another
                onAdd: async (evt) => {
                    const noteId = evt.item.getAttribute('data-note-id');
                    const toFolderId = evt.to.getAttribute('data-folder-id');

                    console.log(`📥 onAdd: ${noteId} to folder ${toFolderId}`);

                    try {
                        const noteElements = Array.from(evt.to.querySelectorAll('.note-item'));
                        const batch = db.batch();

                        noteElements.forEach((el, index) => {
                            const nId = el.getAttribute('data-note-id');
                            if (nId) {
                                const noteRef = db.collection('users').doc(user.uid).collection('notes').doc(nId);
                                const updateData = { order: index };
                                if (nId === noteId) {
                                    updateData.folderId = toFolderId;
                                }
                                batch.update(noteRef, updateData);
                            }
                        });

                        await batch.commit();
                        console.log('✅ onAdd saved');
                    } catch (error) {
                        console.error('❌ onAdd error:', error);
                    } finally {
                        setTimeout(() => {
                            isDragging.current = false;
                        }, 150);
                    }
                },

                // When note is removed from this folder to another
                onRemove: async (evt) => {
                    const fromFolderId = evt.from.getAttribute('data-folder-id');

                    console.log(`📤 onRemove: from folder ${fromFolderId}`);

                    try {
                        const noteElements = Array.from(evt.from.querySelectorAll('.note-item'));
                        const batch = db.batch();

                        noteElements.forEach((el, index) => {
                            const nId = el.getAttribute('data-note-id');
                            if (nId) {
                                const noteRef = db.collection('users').doc(user.uid).collection('notes').doc(nId);
                                batch.update(noteRef, { order: index });
                            }
                        });

                        await batch.commit();
                        console.log('✅ onRemove saved');
                    } catch (error) {
                        console.error('❌ onRemove error:', error);
                    } finally {
                        setTimeout(() => {
                            isDragging.current = false;
                        }, 150);
                    }
                },

                // When note is reordered within the same folder
                onUpdate: async (evt) => {
                    const folderId = evt.from.getAttribute('data-folder-id');

                    console.log(`🔄 onUpdate: reorder in folder ${folderId}`);

                    try {
                        const noteElements = Array.from(evt.from.querySelectorAll('.note-item'));
                        const batch = db.batch();

                        noteElements.forEach((el, index) => {
                            const nId = el.getAttribute('data-note-id');
                            if (nId) {
                                const noteRef = db.collection('users').doc(user.uid).collection('notes').doc(nId);
                                batch.update(noteRef, { order: index });
                            }
                        });

                        await batch.commit();
                        console.log('✅ onUpdate saved');
                    } catch (error) {
                        console.error('❌ onUpdate error:', error);
                    } finally {
                        setTimeout(() => {
                            isDragging.current = false;
                        }, 150);
                    }
                },

                onEnd: () => {
                    setTimeout(() => {
                        isDragging.current = false;
                    }, 150);
                }
            });
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            if (sortableInstance.current) {
                sortableInstance.current.destroy();
                sortableInstance.current = null;
            }
        };
    }, [user, folder.id, folderNotes.length]);

    if (!Array.isArray(notes)) return null;

    return (
        <div
            className="mt-1 min-h-[5px]"
            id={`note-list-${folder.id}`}
            data-folder-id={folder.id}
        >
            {folderNotes.map(note => {
                if (!note || !note.id) return null;

                return (
                    <div
                        key={`${note.id}-${note.folderId}`}
                        data-note-id={note.id}
                        onClick={() => {
                            setActiveNoteId(note.id);
                            setViewMode('editor');
                            // Using Compat SDK (fire and forget)
                            db.collection('users').doc(user.uid).update({ activeNoteId: note.id }).catch(err =>
                                console.error('Error updating activeNoteId:', err)
                            );
                        }}
                        className={`note-item flex items-center px-4 py-2 text-sm cursor-pointer group ${activeNoteId === note.id && viewMode === 'editor' ? 'active' : 'text-gray-600'
                            }`}
                    >
                        <i className="bi bi-sticky mr-3 text-gray-400"></i>
                        {editingId === note.id ? (
                            <input
                                autoFocus
                                className="bg-transparent border-none outline-none text-black w-full"
                                value={note.title || ''}
                                onChange={(e) => updateNote(note.id, 'title', e.target.value)}
                                onBlur={() => setEditingId(null)}
                                onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <span
                                className="flex-1 truncate"
                                onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    setEditingId(note.id);
                                }}
                            >
                                {note.title || 'Untitled'}
                            </span>
                        )}
                        <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-2">
                            <i
                                onClick={(e) => {
                                    e.stopPropagation();
                                    updateNote(note.id, 'pinned', !note.pinned);
                                }}
                                className={`bi ${note.pinned
                                        ? 'bi-pin-angle-fill text-indigo-500'
                                        : 'bi-pin-angle text-slate-300 hover:text-indigo-400'
                                    } text-xs`}
                            ></i>
                            <i
                                onClick={(e) => deleteNote(e, note.id)}
                                className="bi bi-trash3 hover:text-red-500 text-xs"
                            ></i>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
