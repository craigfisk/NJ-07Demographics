import { useState } from 'react';

export const UrlInput = ({ onAdd }: { onAdd: (url: string) => void }) => {
    const [input, setInput] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            onAdd(input.trim());
            setInput('');
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                className="flex-grow p-2 border border-gray-300 rounded"
                placeholder="Enter URL"
            />
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Add</button>
        </form>
    );
};
