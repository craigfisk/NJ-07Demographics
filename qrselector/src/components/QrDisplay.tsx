import { QRCodeSVG } from 'qrcode.react';

export const QrDisplay = ({ url }: { url: string }) => {
  return (
    <div className="flex justify-center items-center p-4 bg-white rounded-lg shadow-md">
      {url ? (
        <QRCodeSVG value={url} size={256} />
      ) : (
        <div className="w-64 h-64 flex items-center justify-center bg-gray-100 text-gray-500">No URL selected</div>
      )}
    </div>
  );
};
