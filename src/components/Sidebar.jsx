// Side bar component
const FolderList = window.FolderList;
const MemoList = window.MemoList;

window.Sidebar = function Sidebar({
    user,
    folders,
    notes,
    activeNoteId,
    viewMode,
    editingId,
    setEditingId,
    setActiveNoteId,
    setViewMode,
    toggleFolder,
    renameFolder,
    addFolder,
    addNote,
    updateNote,
    deleteFolder,
    deleteNote
}) {
    const handleLogout = async () => {
        if (confirm('로그아웃 하시겠습니까?')) {
            try {
                await auth.signOut();
            } catch (error) {
                console.error('Logout error:', error);
                alert('로그아웃 중 오류가 발생했습니다.');
            }
        }
    };

    return (
        <aside className="sidebar w-64 flex flex-col shrink-0">
            {/* Header */}
            <div className="p-5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div
                        onClick={handleLogout}
                        className="w-9 h-9 rounded-xl overflow-hidden cursor-pointer transition-all duration-500 shadow-sm border-2 grayscale-0 opacity-100 border-indigo-100 flex items-center justify-center bg-white"
                        title="로그아웃"
                    >
                        <img
                            src="https://api.iconify.design/fluent-emoji:cat-face.svg"
                            className="w-7 h-7"
                            alt="Cute Cat"
                        />
                    </div>
                    <h1
                        onClick={() => setViewMode('dashboard')}
                        className="text-lg font-bold text-slate-800 cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                        KeepMore
                    </h1>
                </div>
            </div>

            {/* New Folder Button */}
            <div className="px-5 mb-2">
                <button
                    onClick={addFolder}
                    className="w-full bg-indigo-50 text-indigo-600 py-2.5 px-4 rounded-xl font-semibold text-sm hover:bg-indigo-100 transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm"
                >
                    <i className="bi bi-folder-plus"></i>
                    <span>새 폴더</span>
                </button>
            </div>

            {/* Folder List with Memo Lists */}
            <window.FolderList
                user={user}
                folders={folders}
                editingId={editingId}
                setEditingId={setEditingId}
                toggleFolder={toggleFolder}
                renameFolder={renameFolder}
                addNote={addNote}
                deleteFolder={deleteFolder}
                setViewMode={setViewMode}
            >
                {(folder) => (
                    <window.MemoList
                        key={folder.id}
                        user={user}
                        folder={folder}
                        notes={notes}
                        activeNoteId={activeNoteId}
                        viewMode={viewMode}
                        editingId={editingId}
                        setEditingId={setEditingId}
                        setActiveNoteId={setActiveNoteId}
                        setViewMode={setViewMode}
                        updateNote={updateNote}
                        deleteNote={deleteNote}
                    />
                )}
            </window.FolderList>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-[#fdfdfe]">
                <div className="flex items-center space-x-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                        <i className="bi bi-person-fill text-indigo-500"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate">
                            {user?.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="text-xs text-slate-400">KeepMore</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};
