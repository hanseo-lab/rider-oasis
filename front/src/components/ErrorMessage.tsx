import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorMessageProps {
    message: string;
    onRetry?: () => void;
}

/**
 * 공통 에러 메시지 컴포넌트
 */
export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-gray-800 rounded-xl p-8 text-center">
                <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">문제가 발생했습니다</h2>
                <p className="text-gray-300 mb-6">{message}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors font-semibold"
                    >
                        다시 시도
                    </button>
                )}
            </div>
        </div>
    );
}
