const { useEffect, useRef } = React;

window.Editor = function Editor({ user, activeNote, updateNote }) {
    const editorRef = useRef(null);
    const quillInstance = useRef(null);

    useEffect(() => {
        if (!editorRef.current || quillInstance.current) return;

        // Use global Quill
        quillInstance.current = new Quill(editorRef.current, {
            theme: 'snow',
            placeholder: '여기에 메모를 작성하세요...',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    [{ 'color': [] }, { 'background': [] }],
                    ['link', 'image'],
                    ['clean']
                ]
            }
        });

        quillInstance.current.on('text-change', () => {
            if (activeNote) {
                const content = quillInstance.current.root.innerHTML;
                updateNote(activeNote.id, 'content', content);
            }
        });

        return () => {
            // Clean up Quill instance if needed, though Quill 1.x doesn't have a destroy method like Sortable
            // We can just nullify references
            if (quillInstance.current) {
                // quillInstance.current = null; // Keeping instance for effect dependencies
            }
        };
    }, []);

    useEffect(() => {
        if (quillInstance.current && activeNote) {
            const currentContent = quillInstance.current.root.innerHTML;
            if (currentContent !== activeNote.content) {
                quillInstance.current.root.innerHTML = activeNote.content || '';
            }
        }
    }, [activeNote?.id]);

    if (!activeNote) {
        return (
            <div className="flex-1 flex items-center justify-center text-slate-400">
                <div className="text-center">
                    <i className="bi bi-sticky text-6xl mb-4 opacity-20"></i>
                    <p className="text-lg">메모를 선택하세요</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-white">
            <div className="p-6 border-b border-slate-100">
                <input
                    type="text"
                    value={activeNote.title || ''}
                    onChange={(e) => updateNote(activeNote.id, 'title', e.target.value)}
                    className="text-3xl font-bold outline-none w-full bg-transparent"
                    placeholder="제목 없음"
                />
                <p className="text-xs text-slate-400 mt-2">
                    {activeNote.updatedAt?.toDate?.().toLocaleString('ko-KR') || ''}
                </p>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
                <div ref={editorRef} style={{ minHeight: '400px' }}></div>
            </div>
        </div>
    );
};
