window.Dashboard = function Dashboard({ notes, setActiveNoteId, setViewMode }) {
    const recentNotes = notes
        .filter(n => n && n.updatedAt)
        // Compat SDK Timestamp has toMillis(). Optional chaining is safe.
        .sort((a, b) => (b.updatedAt?.toMillis?.() || 0) - (a.updatedAt?.toMillis?.() || 0))
        .slice(0, 10);

    const pinnedNotes = notes.filter(n => n && n.pinned);

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-[#fafbfc]">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">대시보드</h2>

            {/* Pinned Notes */}
            {pinnedNotes.length > 0 && (
                <div className="mb-10">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                        <i className="bi bi-pin-angle-fill text-indigo-500 mr-2"></i>
                        고정된 메모
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pinnedNotes.map(note => (
                            <div
                                key={note.id}
                                onClick={() => {
                                    setActiveNoteId(note.id);
                                    setViewMode('editor');
                                }}
                                className="p-5 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-slate-100 hover:border-indigo-200"
                            >
                                <h4 className="font-bold text-slate-900 mb-2 truncate">
                                    {note.title || 'Untitled'}
                                </h4>
                                <p className="text-sm text-slate-500 line-clamp-3">
                                    {note.content?.replace(/<[^>]*>/g, '') || '내용 없음'}
                                </p>
                                <p className="text-xs text-slate-400 mt-3">
                                    {note.updatedAt?.toDate?.().toLocaleDateString('ko-KR') || ''}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Notes */}
            <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                    <i className="bi bi-clock-history mr-2"></i>
                    최근 메모
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentNotes.map(note => (
                        <div
                            key={note.id}
                            onClick={() => {
                                setActiveNoteId(note.id);
                                setViewMode('editor');
                            }}
                            className="p-5 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-slate-100 hover:border-indigo-200"
                        >
                            <h4 className="font-bold text-slate-900 mb-2 truncate">
                                {note.title || 'Untitled'}
                            </h4>
                            <p className="text-sm text-slate-500 line-clamp-3">
                                {note.content?.replace(/<[^>]*>/g, '') || '내용 없음'}
                            </p>
                            <p className="text-xs text-slate-400 mt-3">
                                {note.updatedAt?.toDate?.().toLocaleDateString('ko-KR') || ''}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {recentNotes.length === 0 && pinnedNotes.length === 0 && (
                <div className="flex items-center justify-center h-64 text-slate-400">
                    <div className="text-center">
                        <i className="bi bi-inbox text-6xl mb-4 opacity-20"></i>
                        <p className="text-lg">메모가 없습니다</p>
                        <p className="text-sm">새 메모를 작성해보세요!</p>
                    </div>
                </div>
            )}
        </div>
    );
};
