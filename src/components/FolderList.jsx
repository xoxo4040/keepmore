const { useEffect, useRef } = React;

window.FolderList = function FolderList({
    user,
    folders,
    editingId,
    setEditingId,
    toggleFolder,
    renameFolder,
    addNote,
    deleteFolder,
    setViewMode,
    children
}) {
    const sortableInstance = useRef(null);

    useEffect(() => {
        if (!user || !folders || folders.length === 0) return;

        const folderListEl = document.getElementById('folder-list');
        if (!folderListEl) return;

        // Destroy existing instance
        if (sortableInstance.current) {
            sortableInstance.current.destroy();
            sortableInstance.current = null;
        }

        // Create new Sortable instance after a delay to ensure DOM is ready
        const timeoutId = setTimeout(() => {
            sortableInstance.current = Sortable.create(folderListEl, {
                animation: 150,
                ghostClass: 'sortable-ghost',
                forceFallback: true,
                handle: '.folder-header',
                dataIdAttr: 'data-folder-id',

                onEnd: async (evt) => {
                    try {
                        const folderElements = Array.from(folderListEl.querySelectorAll('.folder-wrap'));
                        const batch = db.batch();

                        folderElements.forEach((el, index) => {
                            const folderId = el.getAttribute('data-folder-id');
                            if (folderId) {
                                const folderRef = db.collection('users').doc(user.uid).collection('folders').doc(folderId);
                                batch.update(folderRef, { order: index });
                            }
                        });

                        await batch.commit();
                        console.log('✅ Folder order updated');
                    } catch (error) {
                        console.error('❌ Error updating folder order:', error);
                    }
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
    }, [user, folders.length]);

    if (!Array.isArray(folders)) return null;

    return (
        <div className="flex-1 overflow-y-auto px-4 py-2" id="folder-list">
            {folders.map((folder) => {
                if (!folder || !folder.id) return null;

                return (
                    <div
                        key={folder.id}
                        className="mb-4 folder-wrap"
                        data-folder-id={folder.id}
                    >
                        <div
                            className="folder-header flex items-center px-4 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer group hover:text-slate-600 transition-all duration-200"
                            onClick={() => toggleFolder(folder.id)}
                        >
                            <i className={`bi ${folder.isOpen ? 'bi-caret-down-fill' : 'bi-caret-right-fill'} mr-2 text-[8px]`}></i>
                            {editingId === folder.id ? (
                                <input
                                    autoFocus
                                    className="bg-transparent border-none outline-none text-black w-full"
                                    value={folder.name || ''}
                                    onChange={(e) => renameFolder(folder.id, e.target.value)}
                                    onBlur={() => setEditingId(null)}
                                    onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <span
                                    className="flex-1 truncate"
                                    onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        setEditingId(folder.id);
                                    }}
                                >
                                    {folder.name || 'Untitled Folder'}
                                </span>
                            )}
                            <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-2 ml-2">
                                <i
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        addNote(folder.id);
                                        setViewMode('editor');
                                    }}
                                    className="bi bi-plus-lg hover:text-black"
                                    title="새 메모"
                                ></i>
                                <i
                                    onClick={(e) => deleteFolder(e, folder.id)}
                                    className="bi bi-trash3 hover:text-red-500 text-[10px]"
                                    title="폴더 삭제"
                                ></i>
                            </div>
                        </div>

                        {/* Children will be MemoList components */}
                        {folder.isOpen && children && children(folder)}
                    </div>
                );
            })}
        </div>
    );
};
