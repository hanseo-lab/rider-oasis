import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../api/auth';
import { ArrowLeft, User, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';

export default function FindAccountPage() {
    const [activeTab, setActiveTab] = useState<'findEmail' | 'resetPw'>('findEmail');

    // Find Email States
    const [nickname, setNickname] = useState('');
    const [foundEmail, setFoundEmail] = useState('');
    const [findEmailError, setFindEmailError] = useState('');
    const [findEmailLoading, setFindEmailLoading] = useState(false);

    // Reset Password States
    const [email, setEmail] = useState('');
    const [tempPassword, setTempPassword] = useState('');
    const [resetPwError, setResetPwError] = useState('');
    const [resetPwLoading, setResetPwLoading] = useState(false);

    const handleFindEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setFindEmailError('');
        setFoundEmail('');
        setFindEmailLoading(true);

        try {
            const result = await authAPI.findEmail(nickname);
            setFoundEmail(result);
        } catch (err: any) {
            setFindEmailError(err.response?.data?.message || '이메일을 찾을 수 없습니다.');
        } finally {
            setFindEmailLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setResetPwError('');
        setTempPassword('');
        setResetPwLoading(true);

        try {
            const result = await authAPI.resetPassword(email);
            setTempPassword(result);
        } catch (err: any) {
            setResetPwError(err.response?.data?.message || '비밀번호 재설정에 실패했습니다.');
        } finally {
            setResetPwLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black z-0" />
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[100px] animate-pulse delay-700" />

            <div className="z-10 w-full max-w-md mx-auto p-4 flex flex-col justify-center min-h-screen">
                <Link to="/login" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 w-fit">
                    <ArrowLeft className="w-5 h-5" />
                    <span>로그인으로 돌아가기</span>
                </Link>

                <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6 shadow-2xl">
                    <div className="flex mb-6 bg-gray-900/50 p-1 rounded-lg">
                        <button
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'findEmail'
                                    ? 'bg-gray-700 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-gray-200'
                                }`}
                            onClick={() => setActiveTab('findEmail')}
                        >
                            이메일 찾기
                        </button>
                        <button
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'resetPw'
                                    ? 'bg-gray-700 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-gray-200'
                                }`}
                            onClick={() => setActiveTab('resetPw')}
                        >
                            비밀번호 찾기
                        </button>
                    </div>

                    {activeTab === 'findEmail' ? (
                        <form onSubmit={handleFindEmail} className="space-y-4">
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Mail className="w-6 h-6 text-blue-400" />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-1">이메일 찾기</h2>
                                <p className="text-sm text-gray-400">가입 시 등록한 닉네임을 입력해주세요.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">닉네임</label>
                                <input
                                    type="text"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                    placeholder="닉네임 입력"
                                    required
                                />
                            </div>

                            {findEmailError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {findEmailError}
                                </div>
                            )}

                            {foundEmail && (
                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                                    <p className="text-sm text-gray-400 mb-1">회원님의 이메일입니다.</p>
                                    <p className="text-lg font-bold text-green-400">{foundEmail}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={findEmailLoading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
                            >
                                {findEmailLoading ? '찾는 중...' : '이메일 찾기'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Lock className="w-6 h-6 text-orange-400" />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-1">비밀번호 찾기</h2>
                                <p className="text-sm text-gray-400">가입하신 이메일을 입력하시면 임시 비밀번호를 발급해드립니다.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">이메일</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                                    placeholder="이메일 입력"
                                    required
                                />
                            </div>

                            {resetPwError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {resetPwError}
                                </div>
                            )}

                            {tempPassword && (
                                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2 text-green-400 text-sm font-medium">
                                        <CheckCircle className="w-4 h-4" />
                                        임시 비밀번호가 발급되었습니다.
                                    </div>
                                    <p className="text-xs text-gray-400 mb-2">
                                        (실제 서비스에서는 이메일로 발송됩니다. 테스트를 위해 여기에 표시합니다.)
                                    </p>
                                    <div className="bg-black/30 p-3 rounded text-center font-mono text-xl text-orange-400 tracking-wider select-all cursor-pointer" onClick={() => navigator.clipboard.writeText(tempPassword)}>
                                        {tempPassword}
                                    </div>
                                    <p className="text-center text-xs text-gray-500 mt-2">클릭하여 복사</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={resetPwLoading}
                                className="w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-900/20"
                            >
                                {resetPwLoading ? '발급 중...' : '임시 비밀번호 발급'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
