const { useState, useEffect } = React;
// Using global Login, Sidebar, Editor, Dashboard which are loaded in index.html

window.App = function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [folders, setFolders] = useState([]);
    const [notes, setNotes] = useState([]);
    const [viewMode, setViewMode] = useState('dashboard');
    const [activeNoteId, setActiveNoteId] = useState(null);
    const [editingId, setEditingId] = useState(null);

    // Auth listener
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            if (!currentUser) {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    // Firestore listeners
    useEffect(() => {
        if (!user) return;

        const userRef = db.collection('users').doc(user.uid);

        // User doc snapshot
        const unsubUser = userRef.onSnapshot((docSnap) => {
            if (docSnap.exists) {
                const data = docSnap.data();
                setViewMode(data.viewMode || 'dashboard');
                setActiveNoteId(data.activeNoteId || null);
            }
        });

        // Folders snapshot
        const unsubFolders = userRef.collection('folders').orderBy('order').onSnapshot(async (snapshot) => {
            const foldersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (foldersData.length === 0) {
                // Create default folder
                await userRef.collection('folders').add({
                    name: '전체 메모',
                    order: 0,
                    isOpen: true
                });
            } else {
                setFolders(foldersData);
            }
        });

        // Notes snapshot
        const unsubNotes = userRef.collection('notes').orderBy('order').onSnapshot((snapshot) => {
            const notesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNotes(notesData);
            setLoading(false);
        });

        return () => {
            unsubUser();
            unsubFolders();
            unsubNotes();
        };
    }, [user]);

    // Operations using Compat SDK
    const addFolder = async () => {
        if (!user) return;
        try {
            await db.collection('users').doc(user.uid).collection('folders').add({
                name: '새 폴더',
                order: folders.length,
                isOpen: true
            });
        } catch (error) {
            console.error('Error adding folder:', error);
        }
    };

    const toggleFolder = async (folderId) => {
        if (!user) return;
        const folder = folders.find(f => f.id === folderId);
        if (!folder) return;

        try {
            await db.collection('users').doc(user.uid).collection('folders').doc(folderId).update({
                isOpen: !folder.isOpen
            });
        } catch (error) {
            console.error('Error toggling folder:', error);
        }
    };

    const renameFolder = async (folderId, newName) => {
        if (!user) return;
        try {
            await db.collection('users').doc(user.uid).collection('folders').doc(folderId).update({
                name: newName
            });
        } catch (error) {
            console.error('Error renaming folder:', error);
        }
    };

    const deleteFolder = async (e, folderId) => {
        e.stopPropagation();
        if (!user) return;
        if (!confirm('이 폴더와 폴더 안의 모든 메모를 삭제하시겠습니까?')) return;

        try {
            const batch = db.batch();

            const folderNotes = notes.filter(n => n.folderId === folderId);
            folderNotes.forEach(note => {
                batch.delete(db.collection('users').doc(user.uid).collection('notes').doc(note.id));
            });

            batch.delete(db.collection('users').doc(user.uid).collection('folders').doc(folderId));

            await batch.commit();
        } catch (error) {
            console.error('Error deleting folder:', error);
        }
    };

    const addNote = async (folderId) => {
        if (!user) return;
        try {
            const folderNotes = notes.filter(n => n.folderId === folderId);
            const newNoteRef = await db.collection('users').doc(user.uid).collection('notes').add({
                title: '새 메모',
                content: '',
                folderId: folderId,
                order: folderNotes.length,
                pinned: false,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            setActiveNoteId(newNoteRef.id);
            await db.collection('users').doc(user.uid).update({
                activeNoteId: newNoteRef.id,
                viewMode: 'editor'
            });
        } catch (error) {
            console.error('Error adding note:', error);
        }
    };

    const updateNote = async (noteId, field, value) => {
        if (!user) return;
        try {
            await db.collection('users').doc(user.uid).collection('notes').doc(noteId).update({
                [field]: value,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Error updating note:', error);
        }
    };

    const deleteNote = async (e, noteId) => {
        e.stopPropagation();
        if (!user) return;
        if (!confirm('이 메모를 삭제하시겠습니까?')) return;

        try {
            await db.collection('users').doc(user.uid).collection('notes').doc(noteId).delete();
            if (activeNoteId === noteId) {
                setActiveNoteId(null);
                await db.collection('users').doc(user.uid).update({
                    activeNoteId: null
                });
            }
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    const handleSetViewMode = async (mode) => {
        setViewMode(mode);
        if (user) {
            db.collection('users').doc(user.uid).update({ viewMode: mode }).catch(console.error);
        }
    };

    const handleSetActiveNoteId = async (noteId) => {
        setActiveNoteId(noteId);
        if (user) {
            db.collection('users').doc(user.uid).update({ activeNoteId: noteId }).catch(console.error);
        }
    };

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[#f8fafc]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <window.Login />;
    }

    const activeNote = notes.find(n => n.id === activeNoteId);
    const Sidebar = window.Sidebar;
    const Dashboard = window.Dashboard;
    const Editor = window.Editor;

    return (
        <div className="flex h-screen w-full">
            <Sidebar
                user={user}
                folders={folders}
                notes={notes}
                activeNoteId={activeNoteId}
                viewMode={viewMode}
                editingId={editingId}
                setEditingId={setEditingId}
                setActiveNoteId={handleSetActiveNoteId}
                setViewMode={handleSetViewMode}
                toggleFolder={toggleFolder}
                renameFolder={renameFolder}
                addFolder={addFolder}
                addNote={addNote}
                updateNote={updateNote}
                deleteFolder={deleteFolder}
                deleteNote={deleteNote}
            />

            <main className="flex-1 flex flex-col overflow-hidden">
                {viewMode === 'dashboard' ? (
                    <Dashboard
                        notes={notes}
                        setActiveNoteId={handleSetActiveNoteId}
                        setViewMode={handleSetViewMode}
                    />
                ) : (
                    <Editor
                        user={user}
                        activeNote={activeNote}
                        updateNote={updateNote}
                    />
                )}
            </main>
        </div>
    );
};
