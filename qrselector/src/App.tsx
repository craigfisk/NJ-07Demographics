import { useUrlDatabase } from './hooks/useUrlDatabase';
import { QrDisplay } from './components/QrDisplay';
import { UrlInput } from './components/UrlInput';
import { UrlList } from './components/UrlList';

function App() {
  const { urls, currentUrl, addUrl, selectUrl } = useUrlDatabase();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">QR URL Selector</h1>
      <QrDisplay url={currentUrl} />
      <div className="mt-6">
        <UrlInput onAdd={addUrl} />
        <UrlList urls={urls} onSelect={selectUrl} />
      </div>
    </div>
  );
}

export default App;
