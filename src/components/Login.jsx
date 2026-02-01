const { useState } = React;

window.Login = function Login() {
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        const id = e.target.id.value.trim();
        const password = e.target.password.value.trim();

        if (!id || !password) {
            alert('아이디와 비밀번호를 입력해주세요.');
            setLoading(false);
            return;
        }

        const email = `${id}@keepmore.app`;

        try {
            await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);

            try {
                await auth.signInWithEmailAndPassword(email, password);
            } catch (signInError) {
                if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
                    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                    const user = userCredential.user;

                    await db.collection('users').doc(user.uid).set({
                        email: user.email,
                        createdAt: new Date(),
                        viewMode: 'dashboard',
                        activeNoteId: null
                    });
                } else {
                    throw signInError;
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('로그인 중 오류가 발생했습니다: ' + error.message);
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex items-center justify-center bg-[#f8fafc] overflow-hidden relative">
            {/* Background Decor */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-60"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-60"></div>

            <div className="auth-card p-10 rounded-[32px] w-full max-w-md text-center z-10">
                <div className="mb-10 text-center">
                    <div className="w-20 h-20 bg-indigo-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-sm ring-1 ring-indigo-100">
                        <img src="https://api.iconify.design/fluent-emoji:cat-face.svg" className="w-12 h-12" alt="Logo" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">KeepMore</h1>
                    <p className="text-slate-500 font-medium">나만의 프리미엄 메모 공간</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5 text-left">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">ID</label>
                        <input
                            name="id"
                            type="text"
                            placeholder="아이디를 입력하세요"
                            className="w-full bg-white border border-slate-200 py-4 px-5 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="space-y-1.5 text-left">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Password</label>
                        <input
                            name="password"
                            type="password"
                            placeholder="비밀번호를 입력하세요"
                            className="w-full bg-white border border-slate-200 py-4 px-5 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                            required
                            disabled={loading}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-[0.98] transition-all duration-300 mt-4 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Login / Start'}
                    </button>
                </form>

                <p className="mt-8 text-xs text-slate-400">아이디가 없으면 자동으로 가입되어 시작됩니다.</p>
            </div>
        </div>
    );
};
