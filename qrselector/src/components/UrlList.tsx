export const UrlList = ({ urls, onSelect }: { urls: string[], onSelect: (url: string) => void }) => {
    return (
        <ul className="mt-4 space-y-2">
            {urls.map((url) => (
                <li key={url} className="p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-100" onClick={() => onSelect(url)}>
                    {url}
                </li>
            ))}
        </ul>
    );
};
