import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
}

/**
 * 공통 로딩 컴포넌트
 */
export default function Loading({ message = '로딩 중...', size = 'md' }: LoadingProps) {
    const sizeMap = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    const textSizeMap = {
        sm: 'text-sm',
        md: 'text-xl',
        lg: 'text-2xl',
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className={`${sizeMap[size]} animate-spin text-indigo-400`} />
                <span className={textSizeMap[size]}>{message}</span>
            </div>
        </div>
    );
}
